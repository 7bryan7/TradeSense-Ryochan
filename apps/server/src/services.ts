import { createHash, randomUUID } from "node:crypto";
import { FixtureModelAdapter, FixtureResearchAdapter, GeminiModelAdapter, RyoRestAdapter, type ModelAdapter, type ModelAudit, type ResearchAdapter } from "@tradesense/adapters";
import { centsToUsd, evidencePriceUsd, quantityToString, simulateDecision, type Evidence } from "@tradesense/core";
import { config } from "./config.js";
import { db, transaction } from "./db.js";
import { buildWebSearchQuery, needsWebSearch } from "./chat-routing.js";
import { searchChatWeb } from "./web-search.js";
import { withProviderBudget } from "./limits.js";

export const research: ResearchAdapter = config.DATA_MODE === "live"
  ? new RyoRestAdapter(config.RYO_MCP_URL, config.RYO_MCP_KEY)
  : new FixtureResearchAdapter();
export const model: ModelAdapter = config.LLM_PROVIDER === "gemini"
  ? new GeminiModelAdapter(config.LLM_API_KEY, config.LLM_MODEL)
  : new FixtureModelAdapter();

const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const now = () => new Date().toISOString();
export const DEFAULT_SESSION_ID = "00000000-0000-4000-8000-000000000001";

function sessionPortfolioId(sessionId: string): string {
  return `demo-${config.DATA_MODE}-${sessionId}`;
}

export function touchSession(sessionId: string): void {
  const timestamp = now();
  db.prepare("INSERT INTO sessions (id, created_at, last_seen_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET last_seen_at=excluded.last_seen_at")
    .run(sessionId, timestamp, timestamp);
}

export async function callResearchWithBudget<T extends Awaited<ReturnType<ResearchAdapter["call"]>>>(
  adapter: ResearchAdapter,
  tool: Parameters<ResearchAdapter["call"]>[0],
  args: Parameters<ResearchAdapter["call"]>[1],
  sessionId: string,
  purpose: "decision" | "chat" | "market" | "smoke",
): Promise<T> {
  if (config.DATA_MODE !== "live") return adapter.call(tool, args) as Promise<T>;
  touchSession(sessionId);
  return withProviderBudget("ryo", purpose, sessionId, () => adapter.call(tool, args)) as Promise<T>;
}

async function callModelWithBudget<T>(sessionId: string, purpose: "decision" | "chat", operation: () => Promise<T>): Promise<T> {
  if (config.LLM_PROVIDER !== "gemini") return operation();
  touchSession(sessionId);
  return withProviderBudget("gemini", purpose, sessionId, operation);
}

function ensurePortfolio(sessionId: string): string {
  touchSession(sessionId);
  const id = sessionPortfolioId(sessionId);
  db.prepare("INSERT OR IGNORE INTO portfolios (id, session_id, mode, cash_cents, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(id, sessionId, config.DATA_MODE, Math.round(config.SIM_INITIAL_CASH * 100), now());
  return id;
}

export interface RunDependencies {
  research: ResearchAdapter;
  model: ModelAdapter;
  now?: () => Date;
  beforeApply?: () => void;
}

export interface ChatDependencies {
  research: ResearchAdapter;
  model: ModelAdapter;
  searchWeb: typeof searchChatWeb;
}

interface PolicyInput {
  referencePriceCents: string;
  evidenceAsOf: string;
  portfolioVersion: number;
  portfolio: {
    cashCents: string;
    equityCents: string;
    positionQuantityMicros: string;
    positionValueCents: string;
    positionCostBasisCents: string;
  };
  simulation: {
    feeBps: string;
    slippageBps: string;
    maxBuyEquityBps: string;
    maxTokenExposureBps: string;
    maxPriceAgeSeconds: number;
  };
}

const activeRuns = new Map<string, { inputHash: string; promise: Promise<ReturnType<typeof getRun>> }>();
const activeChats = new Map<string, { inputHash: string; promise: Promise<ReturnType<typeof conversationView>> }>();

function saveModelCall(purpose: "decision" | "chat", audit: ModelAudit, runId?: string, messageId?: string): void {
  db.prepare("INSERT INTO model_calls (id, purpose, run_id, message_id, provider, model, prompt_version, input_hash, request_json, response_json, generation_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(randomUUID(), purpose, runId ?? null, messageId ?? null, audit.provider, audit.model, audit.promptVersion, audit.inputHash, JSON.stringify(audit.request), JSON.stringify(audit.response), JSON.stringify(audit.generation), now());
}

async function executeRun(runId: string, symbol: string, sessionId: string, portfolioId: string, dependencies: RunDependencies) {
  const clock = dependencies.now ?? (() => new Date());
  let stage = "FETCHING";
  try {
    const savedEvidence = db.prepare("SELECT payload_json FROM evidence WHERE run_id=? AND purpose='decision' ORDER BY retrieved_at LIMIT 1").get(runId) as { payload_json: string } | undefined;
    let evidence: Evidence;
    if (savedEvidence) {
      evidence = JSON.parse(savedEvidence.payload_json) as Evidence;
      db.prepare("UPDATE runs SET status='ANALYZING', updated_at=?, completed_at=NULL, failure_stage=NULL, failure_code=NULL, failure_message=NULL WHERE id=?")
        .run(clock().toISOString(), runId);
    } else {
      evidence = await callResearchWithBudget(dependencies.research, "analyze_token", { symbol }, sessionId, "decision");
      transaction(() => {
        db.prepare("INSERT INTO evidence (id, run_id, purpose, tool, symbol, status, mode, as_of, retrieved_at, payload_json) VALUES (?, ?, 'decision', ?, ?, ?, ?, ?, ?, ?)")
          .run(evidence.id, runId, evidence.tool, symbol, evidence.status, evidence.dataMode, evidence.asOf, evidence.retrievedAt, JSON.stringify(evidence));
        db.prepare("UPDATE runs SET status='ANALYZING', updated_at=?, completed_at=NULL, failure_stage=NULL, failure_code=NULL, failure_message=NULL WHERE id=?")
          .run(clock().toISOString(), runId);
      });
    }

    stage = "ANALYZING";
    const price = evidencePriceUsd(evidence);
    if (price === null) throw Object.assign(new Error("Evidence has no valid USD price"), { code: "EVIDENCE_PRICE_MISSING", retryable: false });
    const priceCents = BigInt(Math.round(price * 100));
    const savedDecision = db.prepare("SELECT id, payload_json, policy_input_json FROM decisions WHERE run_id=?").get(runId) as { id: string; payload_json: string; policy_input_json: string | null } | undefined;
    let decisionId: string;
    let decision: Awaited<ReturnType<ModelAdapter["createDecision"]>>["output"];
    let policyInput: PolicyInput;
    if (savedDecision) {
      if (!savedDecision.policy_input_json) throw Object.assign(new Error("Saved decision predates resumable policy inputs"), { code: "LEGACY_RUN_NOT_RESUMABLE", retryable: false });
      decisionId = savedDecision.id;
      decision = JSON.parse(savedDecision.payload_json) as typeof decision;
      policyInput = JSON.parse(savedDecision.policy_input_json) as PolicyInput;
      db.prepare("UPDATE runs SET status='APPLYING', updated_at=?, completed_at=NULL, failure_stage=NULL, failure_code=NULL, failure_message=NULL WHERE id=?")
        .run(clock().toISOString(), runId);
    } else {
      const snapshotPortfolio = db.prepare("SELECT cash_cents, version FROM portfolios WHERE id = ?").get(portfolioId) as { cash_cents: number; version: number };
      const snapshotHolding = db.prepare("SELECT quantity_micros, cost_basis_cents FROM holdings WHERE portfolio_id = ? AND symbol = ?").get(portfolioId, symbol) as { quantity_micros: number; cost_basis_cents: number } | undefined;
      const quantity = BigInt(snapshotHolding?.quantity_micros ?? 0);
      const cash = BigInt(snapshotPortfolio.cash_cents);
      const positionValue = priceCents * quantity / 1_000_000n;
      const invocation = await callModelWithBudget(sessionId, "decision", () => dependencies.model.createDecision({
        symbol,
        evidence: [evidence],
        portfolio: {
          cashUsd: centsToUsd(cash),
          positionQuantity: quantityToString(quantity),
          positionCostBasisUsd: centsToUsd(BigInt(snapshotHolding?.cost_basis_cents ?? 0)),
        },
      }));
      decision = invocation.output;
      decisionId = randomUUID();
      policyInput = {
        referencePriceCents: priceCents.toString(), evidenceAsOf: evidence.asOf, portfolioVersion: snapshotPortfolio.version,
        portfolio: {
          cashCents: cash.toString(), equityCents: (cash + positionValue).toString(), positionQuantityMicros: quantity.toString(),
          positionValueCents: positionValue.toString(), positionCostBasisCents: String(snapshotHolding?.cost_basis_cents ?? 0),
        },
        simulation: {
          feeBps: config.simulation.feeBps.toString(), slippageBps: config.simulation.slippageBps.toString(),
          maxBuyEquityBps: config.simulation.maxBuyEquityBps.toString(), maxTokenExposureBps: config.simulation.maxTokenExposureBps.toString(),
          maxPriceAgeSeconds: config.SIM_MAX_PRICE_AGE_SECONDS,
        },
      };
      transaction(() => {
        db.prepare("INSERT INTO decisions (id, run_id, action, payload_json, policy_input_json, portfolio_version, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
          .run(decisionId, runId, decision.action, JSON.stringify(decision), JSON.stringify(policyInput), policyInput.portfolioVersion, clock().toISOString());
        saveModelCall("decision", invocation.audit, runId);
        db.prepare("UPDATE runs SET status='APPLYING', updated_at=? WHERE id=?").run(clock().toISOString(), runId);
      });
    }

    stage = "APPLYING";
    transaction(() => {
      dependencies.beforeApply?.();
      const existingFill = db.prepare("SELECT id FROM fills WHERE decision_id=?").get(decisionId);
      if (existingFill) {
        db.prepare("UPDATE runs SET status='COMPLETED', updated_at=?, completed_at=?, failure_stage=NULL, failure_code=NULL, failure_message=NULL WHERE id=?")
          .run(clock().toISOString(), clock().toISOString(), runId);
        return;
      }

      const evaluatedAt = clock();
      const referencePriceCents = BigInt(policyInput.referencePriceCents);
      const portfolioState = {
        cashCents: BigInt(policyInput.portfolio.cashCents), equityCents: BigInt(policyInput.portfolio.equityCents),
        positionQuantityMicros: BigInt(policyInput.portfolio.positionQuantityMicros), positionValueCents: BigInt(policyInput.portfolio.positionValueCents),
      };
      const currentPortfolio = db.prepare("SELECT version FROM portfolios WHERE id=?").get(portfolioId) as { version: number };
      const evidenceAgeMs = evaluatedAt.getTime() - Date.parse(policyInput.evidenceAsOf);
      const priceIsStale = !Number.isFinite(evidenceAgeMs) || evidenceAgeMs < -5_000 || evidenceAgeMs > policyInput.simulation.maxPriceAgeSeconds * 1_000;
      const portfolioChanged = currentPortfolio.version !== policyInput.portfolioVersion;
      const savedSimulationConfig = {
        feeBps: BigInt(policyInput.simulation.feeBps), slippageBps: BigInt(policyInput.simulation.slippageBps),
        maxBuyEquityBps: BigInt(policyInput.simulation.maxBuyEquityBps), maxTokenExposureBps: BigInt(policyInput.simulation.maxTokenExposureBps),
      };
      const simulation = decision.action !== "HOLD" && priceIsStale
        ? { outcome: "BLOCKED_STALE_PRICE", action: decision.action, quantityMicros: 0n, fillPriceCents: referencePriceCents, feeCents: 0n, cashDeltaCents: 0n, reason: `Evidence price exceeded the ${policyInput.simulation.maxPriceAgeSeconds}-second execution freshness limit` }
        : decision.action !== "HOLD" && portfolioChanged
          ? { outcome: "BLOCKED_PORTFOLIO_CHANGED", action: decision.action, quantityMicros: 0n, fillPriceCents: referencePriceCents, feeCents: 0n, cashDeltaCents: 0n, reason: "The paper portfolio changed after analysis; start a new run for current sizing" }
          : simulateDecision(decision.action, referencePriceCents, portfolioState, savedSimulationConfig);
      db.prepare("INSERT INTO fills (id, decision_id, symbol, action, outcome, quantity_micros, fill_price_cents, fee_cents, cash_delta_cents, reason, portfolio_version_at_apply, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(randomUUID(), decisionId, symbol, decision.action, simulation.outcome, simulation.quantityMicros, simulation.fillPriceCents, simulation.feeCents, simulation.cashDeltaCents, simulation.reason, currentPortfolio.version, evaluatedAt.toISOString());
      if (simulation.outcome === "APPLIED") {
        const previousQuantity = BigInt(policyInput.portfolio.positionQuantityMicros);
        const previousCost = BigInt(policyInput.portfolio.positionCostBasisCents);
        const nextQty = decision.action === "BUY" ? previousQuantity + simulation.quantityMicros : 0n;
        const nextCost = decision.action === "BUY" ? previousCost - simulation.cashDeltaCents : 0n;
        const realizedPnl = decision.action === "SELL" ? simulation.cashDeltaCents - previousCost : 0n;
        db.prepare("INSERT INTO holdings (portfolio_id, symbol, quantity_micros, cost_basis_cents) VALUES (?, ?, ?, ?) ON CONFLICT(portfolio_id, symbol) DO UPDATE SET quantity_micros=excluded.quantity_micros, cost_basis_cents=excluded.cost_basis_cents")
          .run(portfolioId, symbol, nextQty, nextCost);
        const update = db.prepare("UPDATE portfolios SET cash_cents = cash_cents + ?, realized_pnl_cents = realized_pnl_cents + ?, version = version + 1 WHERE id = ? AND version = ?")
          .run(simulation.cashDeltaCents, realizedPnl, portfolioId, policyInput.portfolioVersion);
        if (Number(update.changes) !== 1) throw Object.assign(new Error("Paper portfolio changed before the simulated fill could be committed"), { code: "PORTFOLIO_VERSION_CONFLICT", retryable: true });
      }
      db.prepare("UPDATE runs SET status='COMPLETED', updated_at=?, completed_at=?, failure_stage=NULL, failure_code=NULL, failure_message=NULL WHERE id=?")
        .run(evaluatedAt.toISOString(), evaluatedAt.toISOString(), runId);
    });
    return getRun(runId, sessionId);
  } catch (error) {
    const value = error as Error & { code?: string; retryable?: boolean };
    const failedStatus = value.code === "SCHEDULE_CANCELLED" ? "CANCELLED" : "FAILED";
    db.prepare("UPDATE runs SET status=?, updated_at=?, completed_at=?, failure_stage=?, failure_code=?, failure_message=? WHERE id=?")
      .run(failedStatus, clock().toISOString(), clock().toISOString(), stage, value.code ?? "RUN_FAILED", value.message.slice(0, 1_000), runId);
    throw error;
  }
}

export function replayRun(runId: string, sessionId?: string) {
  const row = db.prepare(`SELECT d.action, d.policy_input_json, f.outcome, f.quantity_micros, f.fill_price_cents,
    f.fee_cents, f.cash_delta_cents, f.reason, f.portfolio_version_at_apply, f.created_at
    FROM decisions d JOIN fills f ON f.decision_id=d.id JOIN runs r ON r.id=d.run_id
    WHERE d.run_id=? AND (? IS NULL OR r.session_id=?)`).get(runId, sessionId ?? null, sessionId ?? null) as any;
  if (!row) throw Object.assign(new Error("Completed decision and simulation result are required for replay"), { status: 404 });
  if (!row.policy_input_json) throw Object.assign(new Error("This legacy run predates saved replay inputs"), { status: 409 });
  const input = JSON.parse(row.policy_input_json) as PolicyInput;
  const portfolioState = {
    cashCents: BigInt(input.portfolio.cashCents), equityCents: BigInt(input.portfolio.equityCents),
    positionQuantityMicros: BigInt(input.portfolio.positionQuantityMicros), positionValueCents: BigInt(input.portfolio.positionValueCents),
  };
  const savedConfig = {
    feeBps: BigInt(input.simulation.feeBps), slippageBps: BigInt(input.simulation.slippageBps),
    maxBuyEquityBps: BigInt(input.simulation.maxBuyEquityBps), maxTokenExposureBps: BigInt(input.simulation.maxTokenExposureBps),
  };
  const evaluatedAt = Date.parse(row.created_at);
  const evidenceAgeMs = evaluatedAt - Date.parse(input.evidenceAsOf);
  const stale = !Number.isFinite(evidenceAgeMs) || evidenceAgeMs < -5_000 || evidenceAgeMs > input.simulation.maxPriceAgeSeconds * 1_000;
  const portfolioChanged = row.portfolio_version_at_apply !== null && Number(row.portfolio_version_at_apply) !== input.portfolioVersion;
  const referencePriceCents = BigInt(input.referencePriceCents);
  const replayed = row.action !== "HOLD" && stale
    ? { outcome: "BLOCKED_STALE_PRICE", action: row.action, quantityMicros: 0n, fillPriceCents: referencePriceCents, feeCents: 0n, cashDeltaCents: 0n, reason: `Evidence price exceeded the ${input.simulation.maxPriceAgeSeconds}-second execution freshness limit` }
    : row.action !== "HOLD" && portfolioChanged
      ? { outcome: "BLOCKED_PORTFOLIO_CHANGED", action: row.action, quantityMicros: 0n, fillPriceCents: referencePriceCents, feeCents: 0n, cashDeltaCents: 0n, reason: "The paper portfolio changed after analysis; start a new run for current sizing" }
      : simulateDecision(row.action, referencePriceCents, portfolioState, savedConfig);
  const saved = {
    outcome: row.outcome, quantityMicros: BigInt(row.quantity_micros), fillPriceCents: BigInt(row.fill_price_cents),
    feeCents: BigInt(row.fee_cents), cashDeltaCents: BigInt(row.cash_delta_cents), reason: row.reason,
  };
  const matches = saved.outcome === replayed.outcome && saved.quantityMicros === replayed.quantityMicros
    && saved.fillPriceCents === replayed.fillPriceCents && saved.feeCents === replayed.feeCents
    && saved.cashDeltaCents === replayed.cashDeltaCents && saved.reason === replayed.reason;
  const serialize = (value: typeof saved | typeof replayed) => ({
    outcome: value.outcome, quantityMicros: value.quantityMicros.toString(), fillPriceCents: value.fillPriceCents.toString(),
    feeCents: value.feeCents.toString(), cashDeltaCents: value.cashDeltaCents.toString(), reason: value.reason,
  });
  return { runId, matches, saved: serialize(saved), replayed: serialize(replayed), portfolioMutated: false };
}

export async function createRun(symbol: string, idempotencyKey: string, dependencies: RunDependencies = { research, model }, sessionId = DEFAULT_SESSION_ID) {
  const inputHash = hash({ symbol });
  const portfolioId = ensurePortfolio(sessionId);
  const activeKey = `${portfolioId}:${idempotencyKey}`;
  const active = activeRuns.get(activeKey);
  if (active) {
    if (active.inputHash !== inputHash) throw Object.assign(new Error("Idempotency key already used with different input"), { status: 409 });
    return active.promise;
  }
  const work = (async () => {
    let existing = db.prepare("SELECT id, input_hash, status FROM runs WHERE session_id=? AND portfolio_id = ? AND idempotency_key = ?").get(sessionId, portfolioId, idempotencyKey) as { id: string; input_hash: string; status: string } | undefined;
    if (existing?.input_hash !== undefined && existing.input_hash !== inputHash) throw Object.assign(new Error("Idempotency key already used with different input"), { status: 409 });
    if (existing?.status === "COMPLETED") return getRun(existing.id, sessionId);
    if (!existing) {
      const runId = randomUUID();
      const createdAt = (dependencies.now ?? (() => new Date()))().toISOString();
      db.prepare("INSERT INTO runs (id, session_id, portfolio_id, symbol, idempotency_key, input_hash, mode, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'FETCHING', ?, ?)")
        .run(runId, sessionId, portfolioId, symbol, idempotencyKey, inputHash, config.DATA_MODE, createdAt, createdAt);
      existing = { id: runId, input_hash: inputHash, status: "FETCHING" };
    } else {
      db.prepare("UPDATE runs SET attempt_count=attempt_count+1, updated_at=?, completed_at=NULL WHERE id=?")
        .run((dependencies.now ?? (() => new Date()))().toISOString(), existing.id);
    }
    return executeRun(existing.id, symbol, sessionId, portfolioId, dependencies);
  })();
  activeRuns.set(activeKey, { inputHash, promise: work });
  try { return await work; }
  finally { activeRuns.delete(activeKey); }
}

export function getRun(id: string, sessionId = DEFAULT_SESSION_ID) {
  const row = db.prepare(`SELECT r.*, d.payload_json AS decision_json, f.action AS fill_action, f.outcome, f.quantity_micros, f.fill_price_cents, f.fee_cents, f.cash_delta_cents, f.reason
    FROM runs r LEFT JOIN decisions d ON d.run_id=r.id LEFT JOIN fills f ON f.decision_id=d.id WHERE r.id=? AND r.session_id=?`).get(id, sessionId) as any;
  if (!row) throw Object.assign(new Error("Run not found"), { status: 404 });
  const evidenceRows = db.prepare("SELECT payload_json FROM evidence WHERE run_id=? ORDER BY retrieved_at").all(id) as Array<{ payload_json: string }>;
  return {
    id: row.id, symbol: row.symbol, mode: row.mode, status: row.status, createdAt: row.created_at, completedAt: row.completed_at,
    attemptCount: row.attempt_count, failure: row.failure_stage ? { stage: row.failure_stage, code: row.failure_code, message: row.failure_message } : null,
    decision: row.decision_json ? JSON.parse(row.decision_json) : null,
    simulation: row.outcome ? { action: row.fill_action, outcome: row.outcome, quantity: quantityToString(BigInt(row.quantity_micros)), fillPriceUsd: centsToUsd(BigInt(row.fill_price_cents)), feeUsd: centsToUsd(BigInt(row.fee_cents)), cashDeltaUsd: centsToUsd(BigInt(row.cash_delta_cents)), reason: row.reason } : null,
    evidence: evidenceRows.map((item) => JSON.parse(item.payload_json)),
  };
}

export function history(sessionId = DEFAULT_SESSION_ID) {
  const rows = db.prepare("SELECT id FROM runs WHERE session_id=? ORDER BY created_at DESC LIMIT 50").all(sessionId) as Array<{ id: string }>;
  return rows.map((row) => getRun(row.id, sessionId));
}

function numericField(data: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = data[key];
    const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : Number.NaN;
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function identityField(data: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value.trim().toLowerCase();
  }
  return null;
}

function evidenceWindow(evidence: Evidence): string | null {
  const explicit = identityField(evidence.data, ["window", "time_window", "change_window"]);
  return explicit ?? (numericField(evidence.data, ["change24h", "change_24h"]) !== null ? "24h" : null);
}

function latestMark(symbol: string, sessionId: string, mode: string, valuedAt: Date) {
  const rows = db.prepare(`SELECT e.payload_json FROM evidence e JOIN runs r ON r.id=e.run_id
    WHERE r.session_id=? AND r.mode=? AND r.symbol=? AND e.purpose='decision' AND e.status IN ('ok', 'partial')
    ORDER BY e.as_of DESC, e.retrieved_at DESC, e.rowid DESC LIMIT 20`).all(sessionId, mode, symbol) as Array<{ payload_json: string }>;
  for (const row of rows) {
    const evidence = JSON.parse(row.payload_json) as Evidence;
    const price = evidencePriceUsd(evidence);
    if (price === null) continue;
    const observedAt = Date.parse(evidence.asOf);
    const ageSeconds = Number.isFinite(observedAt) ? Math.max(0, Math.floor((valuedAt.getTime() - observedAt) / 1_000)) : null;
    return {
      priceUsd: centsToUsd(BigInt(Math.round(price * 100))), evidenceId: evidence.id,
      asOf: evidence.asOf, retrievedAt: evidence.retrievedAt, ageSeconds,
      freshness: ageSeconds !== null && ageSeconds <= config.SIM_MAX_PRICE_AGE_SECONDS ? "fresh" as const : "stale" as const,
    };
  }
  return null;
}

export function portfolio(sessionId = DEFAULT_SESSION_ID, valuedAt = new Date()) {
  const portfolioId = ensurePortfolio(sessionId);
  const p = db.prepare("SELECT * FROM portfolios WHERE id=?").get(portfolioId) as any;
  const holdings = db.prepare("SELECT symbol, quantity_micros, cost_basis_cents FROM holdings WHERE portfolio_id=? AND quantity_micros > 0").all(portfolioId) as any[];
  let holdingsValueCents = 0n;
  let unrealizedPnlCents = 0n;
  let missingMarks = 0;
  const valuedHoldings = holdings.map((holding) => {
    const quantityMicros = BigInt(holding.quantity_micros);
    const costBasisCents = BigInt(holding.cost_basis_cents);
    const mark = latestMark(holding.symbol, sessionId, p.mode, valuedAt);
    if (!mark) {
      missingMarks += 1;
      return { symbol: holding.symbol, quantity: quantityToString(quantityMicros), costBasisUsd: centsToUsd(costBasisCents), mark: null, marketValueUsd: null, unrealizedPnlUsd: null };
    }
    const marketValueCents = BigInt(Math.round(Number(mark.priceUsd) * 100)) * quantityMicros / 1_000_000n;
    const holdingPnlCents = marketValueCents - costBasisCents;
    holdingsValueCents += marketValueCents;
    unrealizedPnlCents += holdingPnlCents;
    return { symbol: holding.symbol, quantity: quantityToString(quantityMicros), costBasisUsd: centsToUsd(costBasisCents), mark, marketValueUsd: centsToUsd(marketValueCents), unrealizedPnlUsd: centsToUsd(holdingPnlCents) };
  });
  const valuationStatus = holdings.length === 0 ? "complete" : missingMarks === 0 ? "complete" : missingMarks === holdings.length ? "unavailable" : "partial";
  const complete = valuationStatus === "complete";
  const cashCents = BigInt(p.cash_cents);
  return {
    id: p.id, mode: p.mode, cashUsd: centsToUsd(cashCents), realizedPnlUsd: centsToUsd(BigInt(p.realized_pnl_cents)), version: p.version,
    holdings: valuedHoldings,
    valuation: {
      status: valuationStatus, valuedAt: valuedAt.toISOString(), missingMarks,
      holdingsValueUsd: complete ? centsToUsd(holdingsValueCents) : null,
      totalEquityUsd: complete ? centsToUsd(cashCents + holdingsValueCents) : null,
      unrealizedPnlUsd: complete ? centsToUsd(unrealizedPnlCents) : null,
    },
  };
}

function comparisonForRuns(current: ReturnType<typeof getRun>, previous: ReturnType<typeof getRun> | null) {
  if (!previous) return { status: "unavailable" as const, reason: "No previous comparable run exists for this asset and data mode.", previousRunId: null };
  const currentEvidence = current.evidence[0] as Evidence | undefined;
  const previousEvidence = previous.evidence[0] as Evidence | undefined;
  if (!currentEvidence || !previousEvidence) return { status: "unavailable" as const, reason: "One of the runs has no saved decision evidence.", previousRunId: previous.id };
  const currentNetwork = identityField(currentEvidence.data, ["network", "chain"]);
  const previousNetwork = identityField(previousEvidence.data, ["network", "chain"]);
  const currentAddress = identityField(currentEvidence.data, ["address", "contract_address", "mint"]);
  const previousAddress = identityField(previousEvidence.data, ["address", "contract_address", "mint"]);
  const currentWindow = evidenceWindow(currentEvidence);
  const previousWindow = evidenceWindow(previousEvidence);
  const mismatchedNetwork = currentNetwork !== previousNetwork && (currentNetwork !== null || previousNetwork !== null);
  const mismatchedAddress = currentAddress !== previousAddress && (currentAddress !== null || previousAddress !== null);
  const mismatchedWindow = currentWindow !== previousWindow && (currentWindow !== null || previousWindow !== null);
  if (mismatchedNetwork || mismatchedAddress || mismatchedWindow) {
    const reason = mismatchedNetwork ? "Network identity differs between runs." : mismatchedAddress ? "Token address identity differs between runs." : "Metric windows differ between runs.";
    return { status: "incompatible" as const, reason, previousRunId: previous.id };
  }
  const currentPrice = evidencePriceUsd(currentEvidence);
  const previousPrice = evidencePriceUsd(previousEvidence);
  const currentChange = numericField(currentEvidence.data, ["change24h", "change_24h"]);
  const previousChange = numericField(previousEvidence.data, ["change24h", "change_24h"]);
  return {
    status: "comparable" as const, reason: null, previousRunId: previous.id,
    identity: { symbol: current.symbol, network: currentNetwork, address: currentAddress, window: currentWindow },
    observedAt: { current: currentEvidence.asOf, previous: previousEvidence.asOf },
    price: currentPrice !== null && previousPrice !== null ? {
      currentUsd: currentPrice.toFixed(2), previousUsd: previousPrice.toFixed(2),
      deltaUsd: (currentPrice - previousPrice).toFixed(2), deltaPercent: previousPrice === 0 ? null : Number((((currentPrice - previousPrice) / previousPrice) * 100).toFixed(4)),
    } : null,
    change24h: currentChange !== null && previousChange !== null ? { current: currentChange, previous: previousChange, deltaPoints: Number((currentChange - previousChange).toFixed(4)) } : null,
    decision: { current: current.decision?.action ?? null, previous: previous.decision?.action ?? null, changed: current.decision?.action !== previous.decision?.action },
    simulation: { current: current.simulation?.outcome ?? null, previous: previous.simulation?.outcome ?? null, changed: current.simulation?.outcome !== previous.simulation?.outcome },
  };
}

export function dashboardSummary(symbol: string, sessionId = DEFAULT_SESSION_ID, generatedAt = new Date()) {
  const rows = db.prepare("SELECT id FROM runs WHERE session_id=? AND mode=? AND symbol=? ORDER BY created_at DESC, rowid DESC LIMIT 20")
    .all(sessionId, config.DATA_MODE, symbol) as Array<{ id: string }>;
  const latestRun = rows[0] ? getRun(rows[0].id, sessionId) : null;
  const candidates = rows.slice(1).map((row) => getRun(row.id, sessionId));
  const comparisons = latestRun ? candidates.map((candidate) => comparisonForRuns(latestRun, candidate)) : [];
  const comparison = comparisons.find((candidate) => candidate.status === "comparable") ?? comparisons[0]
    ?? (latestRun ? comparisonForRuns(latestRun, null) : { status: "unavailable" as const, reason: "No saved run exists for this asset and data mode.", previousRunId: null });
  return {
    symbol, mode: config.DATA_MODE, generatedAt: generatedAt.toISOString(), latestRun,
    comparison,
    portfolio: portfolio(sessionId, generatedAt),
    chart: { status: "unavailable" as const, reason: "No persisted timestamped candle series is available." },
  };
}

export async function market(sessionId = DEFAULT_SESSION_ID) {
  return callResearchWithBudget(research, "scan_market", { top_n: 5 }, sessionId, "market");
}

export function createConversation(symbol?: string, sessionId = DEFAULT_SESSION_ID) {
  touchSession(sessionId);
  const id = randomUUID();
  transaction(() => {
    const count = db.prepare("SELECT COUNT(*) AS count FROM conversations WHERE session_id=?").get(sessionId) as { count: number };
    if (count.count >= config.CHAT_MAX_CONVERSATIONS_PER_SESSION) {
      throw Object.assign(new Error("Conversation retention limit reached for this session"), { status: 429, code: "CHAT_CONVERSATION_LIMIT", retryable: false });
    }
    db.prepare("INSERT INTO conversations (id, session_id, mode, symbol, created_at) VALUES (?, ?, ?, ?, ?)").run(id, sessionId, config.DATA_MODE, symbol ?? null, now());
  });
  return { id, mode: config.DATA_MODE, symbol: symbol ?? null, messages: [] };
}

async function executeChatMessage(
  conversation: any,
  userId: string,
  text: string,
  sessionId: string,
  dependencies: ChatDependencies,
  symbol?: string,
  runId?: string,
) {
  let stage = "RESEARCHING";
  const activeSymbol = symbol ?? conversation.symbol ?? "BTC";
  try {
    const priorRows = db.prepare("SELECT role, text FROM messages WHERE conversation_id=? AND id<>? AND status='complete' ORDER BY created_at DESC, rowid DESC LIMIT 8")
      .all(conversation.id, userId) as Array<{ role: "user" | "assistant"; text: string }>;
    const chatHistory = priorRows.reverse();
    const evidence: Evidence[] = [];
    const requiredEvidenceIds: string[] = [];
    if (runId) {
      const run = getRun(runId, sessionId);
      if (run.mode !== conversation.mode) throw Object.assign(new Error("Linked run and conversation use different data modes"), { status: 409, code: "CHAT_MODE_MISMATCH", retryable: false });
      const savedEvidence = run.evidence[0] as Evidence | undefined;
      if (!savedEvidence) throw Object.assign(new Error("Saved run has no evidence"), { code: "RUN_EVIDENCE_MISSING", retryable: false });
      evidence.push(savedEvidence);
      chatHistory.push({ role: "assistant", text: `[SAVED_DECISION] ${JSON.stringify({ symbol: run.symbol, decision: run.decision, simulation: run.simulation })}` });
    } else {
      const savedRyo = db.prepare("SELECT payload_json FROM evidence WHERE message_id=? AND purpose='chat' AND tool<>'tavily_search' ORDER BY retrieved_at LIMIT 1")
        .get(userId) as { payload_json: string } | undefined;
      if (savedRyo) {
        evidence.push(JSON.parse(savedRyo.payload_json) as Evidence);
      } else {
        const ryoEvidence = await callResearchWithBudget(dependencies.research, /compare/i.test(text) ? "compare_tokens" : /market/i.test(text) && !/token/i.test(text) ? "market_overview" : "analyze_token", /compare/i.test(text) ? { symbols: `${activeSymbol},BTC`, intent: "swing" } : /market/i.test(text) && !/token/i.test(text) ? {} : { symbol: activeSymbol }, sessionId, "chat");
        db.prepare("INSERT INTO evidence (id, message_id, purpose, tool, symbol, status, mode, as_of, retrieved_at, payload_json) VALUES (?, ?, 'chat', ?, ?, ?, ?, ?, ?, ?)")
          .run(ryoEvidence.id, userId, ryoEvidence.tool, activeSymbol, ryoEvidence.status, ryoEvidence.dataMode, ryoEvidence.asOf, ryoEvidence.retrievedAt, JSON.stringify(ryoEvidence));
        evidence.push(ryoEvidence);
      }
    }
    if (needsWebSearch(text)) {
      const savedWeb = db.prepare("SELECT payload_json FROM evidence WHERE message_id=? AND purpose='chat' AND tool='tavily_search' ORDER BY retrieved_at LIMIT 1")
        .get(userId) as { payload_json: string } | undefined;
      let webEvidence: Evidence;
      if (savedWeb) {
        webEvidence = JSON.parse(savedWeb.payload_json) as Evidence;
      } else {
        const priorUsage = db.prepare("SELECT status FROM tavily_usage WHERE user_message_id=?").get(userId) as { status: string } | undefined;
        if (priorUsage) throw Object.assign(new Error("A prior Tavily attempt ended without a recoverable evidence snapshot; send a new message before searching again"), { status: 409, code: "CHAT_WEB_RESULT_UNKNOWN", retryable: false });
        webEvidence = await dependencies.searchWeb(conversation.id, userId, buildWebSearchQuery(text, activeSymbol), activeSymbol);
        db.prepare("INSERT INTO evidence (id, message_id, purpose, tool, symbol, status, mode, as_of, retrieved_at, payload_json) VALUES (?, ?, 'chat', ?, ?, ?, ?, ?, ?, ?)")
          .run(webEvidence.id, userId, webEvidence.tool, activeSymbol, webEvidence.status, webEvidence.dataMode, webEvidence.asOf, webEvidence.retrievedAt, JSON.stringify(webEvidence));
      }
      evidence.push(webEvidence);
      requiredEvidenceIds.push(webEvidence.id);
    }

    stage = "ANSWERING";
    db.prepare("UPDATE messages SET status='answering', failure_stage=NULL, failure_code=NULL, failure_message=NULL, updated_at=? WHERE id=?")
      .run(now(), userId);
    const invocation = await callModelWithBudget(sessionId, "chat", () => dependencies.model.answerQuestion({ question: text, symbol: activeSymbol, evidence, history: chatHistory, requiredEvidenceIds }));
    const assistantId = randomUUID();
    transaction(() => {
      db.prepare("INSERT INTO messages (id, conversation_id, role, text, symbol, run_id, parent_message_id, status, citations_json, created_at, updated_at) VALUES (?, ?, 'assistant', ?, ?, ?, ?, 'complete', ?, ?, ?)")
        .run(assistantId, conversation.id, invocation.output.text, activeSymbol, runId ?? null, userId, JSON.stringify(invocation.output.citations), now(), now());
      db.prepare("UPDATE messages SET status='complete', updated_at=?, failure_stage=NULL, failure_code=NULL, failure_message=NULL WHERE id=?").run(now(), userId);
      saveModelCall("chat", invocation.audit, undefined, assistantId);
      db.prepare("UPDATE tavily_usage SET assistant_message_id=? WHERE user_message_id=?").run(assistantId, userId);
    });
    return conversationView(conversation.id, sessionId);
  } catch (error) {
    const value = error as Error & { code?: string };
    db.prepare("UPDATE messages SET status='failed', failure_stage=?, failure_code=?, failure_message=?, updated_at=? WHERE id=?")
      .run(stage, value.code ?? "CHAT_FAILED", value.message.slice(0, 1_000), now(), userId);
    throw error;
  }
}

export async function ask(
  conversationId: string,
  text: string,
  idempotencyKey: string,
  symbol?: string,
  runId?: string,
  sessionId = DEFAULT_SESSION_ID,
  dependencies: ChatDependencies = { research, model, searchWeb: searchChatWeb },
) {
  const conversation = db.prepare("SELECT * FROM conversations WHERE id=? AND session_id=?").get(conversationId, sessionId) as any;
  if (!conversation) throw Object.assign(new Error("Conversation not found"), { status: 404 });
  const inputHash = hash({ text, symbol, runId });
  const activeKey = `${conversationId}:${idempotencyKey}`;
  const active = activeChats.get(activeKey);
  if (active) {
    if (active.inputHash !== inputHash) throw Object.assign(new Error("Idempotency key already used with different input"), { status: 409 });
    return active.promise;
  }
  const work = (async () => {
    let userMessage = db.prepare("SELECT id, input_hash, status, failure_stage FROM messages WHERE conversation_id=? AND role='user' AND idempotency_key=?")
      .get(conversationId, idempotencyKey) as { id: string; input_hash: string; status: string; failure_stage: string | null } | undefined;
    if (userMessage?.input_hash !== undefined && userMessage.input_hash !== inputHash) throw Object.assign(new Error("Idempotency key already used with different input"), { status: 409 });
    if (userMessage) {
      const answer = db.prepare("SELECT id FROM messages WHERE parent_message_id=? AND role='assistant'").get(userMessage.id);
      if (answer) return conversationView(conversationId, sessionId);
      if (userMessage.status === "answering" && !userMessage.failure_stage) {
        throw Object.assign(new Error("The prior model call may have completed externally, but no answer was committed; send a new message to avoid an untracked duplicate call"), { status: 409, code: "CHAT_MODEL_OUTCOME_UNKNOWN", retryable: false });
      }
      db.prepare("UPDATE messages SET status='researching', attempt_count=attempt_count+1, failure_stage=NULL, failure_code=NULL, failure_message=NULL, updated_at=? WHERE id=?")
        .run(now(), userMessage.id);
    } else {
      const userId = randomUUID();
      const timestamp = now();
      transaction(() => {
        const count = db.prepare("SELECT COUNT(*) AS count FROM messages WHERE conversation_id=?").get(conversationId) as { count: number };
        if (count.count + 2 > config.CHAT_MAX_MESSAGES_PER_CONVERSATION) {
          throw Object.assign(new Error("Conversation message limit reached; start a new conversation"), { status: 429, code: "CHAT_MESSAGE_LIMIT", retryable: false });
        }
        db.prepare("INSERT INTO messages (id, conversation_id, role, text, symbol, run_id, idempotency_key, input_hash, status, created_at, updated_at) VALUES (?, ?, 'user', ?, ?, ?, ?, ?, 'researching', ?, ?)")
          .run(userId, conversationId, text, symbol ?? conversation.symbol, runId ?? null, idempotencyKey, inputHash, timestamp, timestamp);
      });
      userMessage = { id: userId, input_hash: inputHash, status: "researching", failure_stage: null };
    }
    return executeChatMessage(conversation, userMessage.id, text, sessionId, dependencies, symbol, runId);
  })();
  activeChats.set(activeKey, { inputHash, promise: work });
  try { return await work; }
  finally { activeChats.delete(activeKey); }
}

export function conversationView(id: string, sessionId = DEFAULT_SESSION_ID) {
  const conversation = db.prepare("SELECT * FROM conversations WHERE id=? AND session_id=?").get(id, sessionId) as any;
  if (!conversation) throw Object.assign(new Error("Conversation not found"), { status: 404 });
  const messages = db.prepare("SELECT id, role, text, symbol, run_id, status, citations_json, failure_stage, failure_code, failure_message, attempt_count, created_at, updated_at FROM messages WHERE conversation_id=? ORDER BY created_at, rowid").all(id) as any[];
  return { id, mode: conversation.mode, symbol: conversation.symbol, messages: messages.map((m) => {
    const citations = JSON.parse(m.citations_json) as string[];
    const sources = citations.flatMap((evidenceId) => {
      const row = db.prepare(`SELECT e.payload_json FROM evidence e WHERE e.id=? AND (
        e.message_id IN (SELECT m2.id FROM messages m2 JOIN conversations c2 ON c2.id=m2.conversation_id WHERE c2.session_id=?)
        OR e.run_id IN (SELECT r2.id FROM runs r2 WHERE r2.session_id=?))`).get(evidenceId, sessionId, sessionId) as { payload_json: string } | undefined;
      if (!row) return [];
      const item = JSON.parse(row.payload_json) as Evidence;
      if (item.tool !== "tavily_search") return [{ evidenceId, kind: "ryo", title: item.summary.headline, retrievedAt: item.retrievedAt }];
      const results = Array.isArray(item.data.results) ? item.data.results : [];
      return results.flatMap((result) => {
        if (!result || typeof result !== "object") return [];
        const value = result as Record<string, unknown>;
        return typeof value.title === "string" && typeof value.url === "string"
          ? [{ evidenceId, kind: "web", title: value.title, url: value.url, publishedAt: typeof value.publishedAt === "string" ? value.publishedAt : null, retrievedAt: item.retrievedAt }]
          : [];
      });
    });
    return { id: m.id, role: m.role, text: m.text, symbol: m.symbol, runId: m.run_id, status: m.status, citations, sources, attemptCount: m.attempt_count, failure: m.failure_stage ? { stage: m.failure_stage, code: m.failure_code, message: m.failure_message } : null, createdAt: m.created_at, updatedAt: m.updated_at };
  }) };
}
