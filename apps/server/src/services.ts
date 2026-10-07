import { createHash, randomUUID } from "node:crypto";
import { GeminiModelAdapter, RyoRestAdapter, type ModelAdapter, type ModelAudit, type ResearchAdapter, type RyoTool } from "@tradesense/adapters";
import { centsToUsd, evidencePriceUsd, marketChartSchema, quantityToString, simulateDecision, type DataMode, type Evidence, type MarketChart } from "@tradesense/core";
import { config } from "./config.js";
import { db, transaction } from "./db.js";
import { buildWebSearchQuery, needsWebSearch } from "./chat-routing.js";
import { searchChatWeb } from "./web-search.js";
import { withProviderBudget } from "./limits.js";

const liveResearch: ResearchAdapter | null = config.RYO_MCP_KEY ? new RyoRestAdapter(config.RYO_MCP_URL, config.RYO_MCP_KEY) : null;
const configuredModel: ModelAdapter | null = config.LLM_API_KEY ? new GeminiModelAdapter(config.LLM_API_KEY, config.LLM_MODEL) : null;
export const liveModeAvailable = Boolean(liveResearch && config.LLM_PROVIDER === "gemini" && config.LLM_API_KEY);

export function researchForMode(mode: DataMode): ResearchAdapter {
  if (mode !== "live") throw Object.assign(new Error("Only live data is supported"), { status: 400 });
  if (!liveResearch) throw Object.assign(new Error("missing data: RYO is not configured"), { status: 409, code: "LIVE_MODE_UNAVAILABLE", retryable: false });
  return liveResearch;
}

export function modelForMode(mode: DataMode): ModelAdapter {
  if (mode === "live" && !liveModeAvailable) throw Object.assign(new Error("missing data: live research requires configured RYO and Gemini credentials"), { status: 409, code: "LIVE_MODE_UNAVAILABLE", retryable: false });
  if (!configuredModel) throw Object.assign(new Error("missing data: Gemini is not configured"), { status: 503 });
  return configuredModel;
}

export function runDependenciesForMode(mode: DataMode): RunDependencies {
  return { research: researchForMode(mode), model: modelForMode(mode) };
}

export const research: ResearchAdapter = { call: (tool, args) => researchForMode("live").call(tool, args) };
export const model: ModelAdapter = { createDecision: (input) => modelForMode("live").createDecision(input), answerQuestion: (input) => modelForMode("live").answerQuestion(input) };

const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const now = () => new Date().toISOString();
export const DEFAULT_SESSION_ID = "00000000-0000-4000-8000-000000000001";

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
  mode: DataMode = config.DATA_MODE,
): Promise<T> {
  if (mode !== "live") throw new Error("Only live data is supported");
  touchSession(sessionId);
  return withProviderBudget("ryo", purpose, sessionId, () => adapter.call(tool, args)) as Promise<T>;
}

async function callModelWithBudget<T>(sessionId: string, purpose: "decision" | "chat", operation: () => Promise<T>): Promise<T> {
  if (config.LLM_PROVIDER !== "gemini") return operation();
  touchSession(sessionId);
  return withProviderBudget("gemini", purpose, sessionId, operation);
}

function ensurePortfolio(sessionId: string, mode: DataMode = config.DATA_MODE): string {
  touchSession(sessionId);
  const active = db.prepare("SELECT id FROM portfolios WHERE session_id=? AND mode=? AND archived_at IS NULL").get(sessionId, mode) as { id: string } | undefined;
  if (active) return active.id;
  const id = randomUUID();
  db.prepare("INSERT INTO portfolios (id, session_id, mode, cash_cents, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(id, sessionId, mode, Math.round(config.SIM_INITIAL_CASH * 100), now());
  return id;
}

export function createPracticePortfolio(sessionId = DEFAULT_SESSION_ID, mode: DataMode = config.DATA_MODE) {
  const currentId = ensurePortfolio(sessionId, mode);
  const unfinished = db.prepare("SELECT id FROM runs WHERE portfolio_id=? AND status NOT IN ('COMPLETED', 'FAILED') LIMIT 1").get(currentId);
  if (unfinished) throw Object.assign(new Error("Wait for the current analysis to finish before starting a new practice account"), { status: 409, code: "RUN_IN_PROGRESS", retryable: true });
  const activeSchedule = db.prepare("SELECT id FROM schedules WHERE session_id=? AND mode=? AND status='ACTIVE' LIMIT 1").get(sessionId, mode);
  if (activeSchedule) throw Object.assign(new Error("Pause the active recurring schedule before starting a new practice account"), { status: 409, code: "SCHEDULE_ACTIVE", retryable: false });
  const timestamp = now();
  transaction(() => {
    db.prepare("UPDATE portfolios SET archived_at=? WHERE id=? AND session_id=? AND archived_at IS NULL").run(timestamp, currentId, sessionId);
    db.prepare("INSERT INTO portfolios (id, session_id, mode, cash_cents, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(randomUUID(), sessionId, mode, Math.round(config.SIM_INITIAL_CASH * 100), timestamp);
  });
  return portfolio(sessionId, new Date(timestamp), mode);
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
  researchPlanVersion?: string;
  executionQuotePolicyVersion?: string;
  criticalEvidence?: {
    analyzeTokenId: string;
    deepAnalysisId: string;
    deepAnalysisStatus: Evidence["status"];
  };
  referencePriceCents: string;
  evidenceAsOf: string;
  executionQuote?: {
    evidenceId: string;
    priceCents: string;
    asOf: string;
    retrievedAt: string;
  };
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

export const DECISION_RESEARCH_PLAN_VERSION = "selected-token-v3";
export const EXECUTION_QUOTE_POLICY_VERSION = "post-decision-quote-v1";

interface ResearchStep {
  ordinal: number;
  role: "selected_token" | "risk_coverage" | "market_context" | "benchmark_comparison" | "execution_quote";
  tool: RyoTool;
  args: Record<string, unknown>;
}

function comparisonBenchmark(symbol: string): string {
  return symbol === "BTC" ? "ETH" : "BTC";
}

function decisionResearchPlan(symbol: string): ResearchStep[] {
  return [
    { ordinal: 1, role: "selected_token", tool: "analyze_token", args: { symbol } },
    { ordinal: 2, role: "risk_coverage", tool: "deep_analysis", args: { symbol } },
    { ordinal: 3, role: "market_context", tool: "scan_market", args: { top_n: 5 } },
    { ordinal: 4, role: "benchmark_comparison", tool: "compare_tokens", args: { symbols: `${symbol},${comparisonBenchmark(symbol)}`, intent: "swing" } },
  ];
}

function ensureResearchSteps(runId: string, plan: ResearchStep[]): void {
  transaction(() => {
    const insert = db.prepare("INSERT OR IGNORE INTO research_steps (id, run_id, plan_version, ordinal, role, tool, args_json, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')");
    for (const step of plan) insert.run(randomUUID(), runId, DECISION_RESEARCH_PLAN_VERSION, step.ordinal, step.role, step.tool, JSON.stringify(step.args));
  });
}

function decisionEvidenceFor(runId: string): Evidence[] {
  const rows = db.prepare("SELECT payload_json FROM evidence WHERE run_id=? AND purpose='decision' ORDER BY rowid").all(runId) as Array<{ payload_json: string }>;
  return rows.map((row) => JSON.parse(row.payload_json) as Evidence);
}

function validateResearchEvidence(evidence: Evidence, step: ResearchStep, symbol: string, mode: DataMode): void {
  if (evidence.tool !== step.tool) {
    throw Object.assign(new Error(`RYO returned ${evidence.tool} while ${step.tool} was requested`), { code: "RYO_TOOL_MISMATCH", retryable: false });
  }
  if ((step.tool === "analyze_token" || step.tool === "deep_analysis") && evidence.symbol !== symbol) {
    throw Object.assign(new Error(`RYO returned ${evidence.symbol ?? "no symbol"} while ${symbol} was requested`), { code: "RYO_IDENTITY_MISMATCH", retryable: false });
  }
  if (evidence.dataMode !== mode) {
    throw Object.assign(new Error(`Research returned ${evidence.dataMode} evidence while ${mode} mode was requested`), { code: "RYO_MODE_MISMATCH", retryable: false });
  }
}

async function runDecisionResearchStep(runId: string, symbol: string, sessionId: string, mode: DataMode, step: ResearchStep, dependencies: RunDependencies, clock: () => Date): Promise<Evidence> {
  const startedAt = clock().toISOString();
  db.prepare("UPDATE research_steps SET status='RUNNING', attempt_count=attempt_count+1, started_at=?, completed_at=NULL, evidence_id=NULL, provider_status=NULL, failure_code=NULL, failure_message=NULL WHERE run_id=? AND ordinal=?")
    .run(startedAt, runId, step.ordinal);
  try {
    const evidence = await callResearchWithBudget(dependencies.research, step.tool, step.args, sessionId, "decision", mode);
    validateResearchEvidence(evidence, step, symbol, mode);
    transaction(() => {
      db.prepare("INSERT INTO evidence (id, run_id, purpose, tool, symbol, status, mode, as_of, retrieved_at, payload_json) VALUES (?, ?, 'decision', ?, ?, ?, ?, ?, ?, ?)")
        .run(evidence.id, runId, evidence.tool, evidence.symbol ?? null, evidence.status, evidence.dataMode, evidence.asOf, evidence.retrievedAt, JSON.stringify(evidence));
      db.prepare("UPDATE research_steps SET status='COMPLETED', completed_at=?, evidence_id=?, provider_status=?, failure_code=NULL, failure_message=NULL WHERE run_id=? AND ordinal=?")
        .run(clock().toISOString(), evidence.id, evidence.status, runId, step.ordinal);
      db.prepare("UPDATE runs SET updated_at=?, completed_at=NULL, failure_stage=NULL, failure_code=NULL, failure_message=NULL WHERE id=?")
        .run(clock().toISOString(), runId);
    });
    return evidence;
  } catch (error) {
    const value = error as Error & { code?: string };
    db.prepare("UPDATE research_steps SET status='FAILED', completed_at=?, failure_code=?, failure_message=? WHERE run_id=? AND ordinal=?")
      .run(clock().toISOString(), value.code ?? "RYO_REQUEST_FAILED", value.message.slice(0, 1_000), runId, step.ordinal);
    throw error;
  }
}

function primaryTokenEvidence(evidence: Evidence[]): Evidence | undefined {
  return evidence.find((item) => item.tool === "analyze_token");
}

async function collectDecisionEvidence(runId: string, symbol: string, sessionId: string, mode: DataMode, dependencies: RunDependencies, clock: () => Date): Promise<Evidence[]> {
  const plan = decisionResearchPlan(symbol);
  ensureResearchSteps(runId, plan);
  const saved = decisionEvidenceFor(runId);
  const byTool = new Map(saved.map((item) => [item.tool, item]));

  for (const step of plan) {
    const existing = byTool.get(step.tool);
    if (existing) {
      db.prepare("UPDATE research_steps SET status='COMPLETED', completed_at=COALESCE(completed_at, ?), evidence_id=?, provider_status=?, failure_code=NULL, failure_message=NULL WHERE run_id=? AND ordinal=?")
        .run(existing.retrievedAt, existing.id, existing.status, runId, step.ordinal);
      continue;
    }
  }

  const primary = plan[0];
  if (!primary) throw new Error("Decision research plan has no primary step");
  if (!byTool.has(primary.tool)) byTool.set(primary.tool, await runDecisionResearchStep(runId, symbol, sessionId, mode, primary, dependencies, clock));

  const pendingContext = plan.slice(1).filter((step) => !byTool.has(step.tool));
  const contextResults = await Promise.allSettled(pendingContext.map(async (step) => {
    const evidence = await runDecisionResearchStep(runId, symbol, sessionId, mode, step, dependencies, clock);
    byTool.set(step.tool, evidence);
    return evidence;
  }));
  const failedIndex = contextResults.findIndex((result) => result.status === "rejected");
  if (failedIndex >= 0) throw (contextResults[failedIndex] as PromiseRejectedResult).reason;

  return plan.map((step) => byTool.get(step.tool)).filter((item): item is Evidence => Boolean(item));
}

const activeRuns = new Map<string, { inputHash: string; promise: Promise<ReturnType<typeof getRun>> }>();
const activeChats = new Map<string, { inputHash: string; promise: Promise<ReturnType<typeof conversationView>> }>();
const activeMarketOverviews = new Map<string, Promise<MarketOverviewView>>();

interface MarketOverviewView {
  mode: string;
  generatedAt: string;
  maxAgeSeconds: number;
  snapshot: Evidence | null;
  ageSeconds: number | null;
  freshness: "fresh" | "stale" | "unknown";
  latestAttempt: null | {
    status: "FETCHING" | "COMPLETED" | "FAILED";
    startedAt: string;
    completedAt: string | null;
    evidenceId: string | null;
    failure: null | { code: string; message: string };
  };
}

function saveModelCall(purpose: "decision" | "chat", audit: ModelAudit, runId?: string, messageId?: string): void {
  db.prepare("INSERT INTO model_calls (id, purpose, run_id, message_id, provider, model, prompt_version, input_hash, request_json, response_json, generation_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(randomUUID(), purpose, runId ?? null, messageId ?? null, audit.provider, audit.model, audit.promptVersion, audit.inputHash, JSON.stringify(audit.request), JSON.stringify(audit.response), JSON.stringify(audit.generation), now());
}

function evidenceIdentity(evidence: Evidence): { network: string | null; address: string | null } {
  return {
    network: firstStringAt(evidence.data, [["network"], ["chain"], ["asset", "network"], ["asset", "chain"]])?.toLowerCase() ?? null,
    address: firstStringAt(evidence.data, [["address"], ["contract_address"], ["mint"], ["asset", "address"], ["asset", "contract_address"], ["asset", "mint"]])?.toLowerCase() ?? null,
  };
}

function validateExecutionQuote(evidence: Evidence, primary: Evidence, symbol: string, mode: DataMode): bigint {
  validateResearchEvidence(evidence, { ordinal: 5, role: "execution_quote", tool: "analyze_token", args: { symbol } }, symbol, mode);
  if (evidence.status !== "ok") throw Object.assign(new Error("A complete refreshed execution quote was not available"), { code: "EXECUTION_QUOTE_UNAVAILABLE", retryable: true });
  const explicitCurrency = firstStringAt(evidence.data, [["currency"], ["quoteCurrency"], ["quote_currency"], ["market", "currency"], ["market", "quote_currency"]]);
  if (explicitCurrency && explicitCurrency.toUpperCase() !== "USD") {
    throw Object.assign(new Error(`Execution quote currency ${explicitCurrency} is not USD`), { code: "EXECUTION_QUOTE_CURRENCY_MISMATCH", retryable: false });
  }
  const primaryIdentity = evidenceIdentity(primary);
  const quoteIdentity = evidenceIdentity(evidence);
  if (primaryIdentity.network && quoteIdentity.network && primaryIdentity.network !== quoteIdentity.network) {
    throw Object.assign(new Error("Execution quote network does not match the decision evidence"), { code: "EXECUTION_QUOTE_IDENTITY_MISMATCH", retryable: false });
  }
  if (primaryIdentity.address && quoteIdentity.address && primaryIdentity.address !== quoteIdentity.address) {
    throw Object.assign(new Error("Execution quote address does not match the decision evidence"), { code: "EXECUTION_QUOTE_IDENTITY_MISMATCH", retryable: false });
  }
  const price = evidencePriceUsd(evidence);
  if (price === null) throw Object.assign(new Error("Refreshed execution evidence has no valid USD price"), { code: "EXECUTION_QUOTE_PRICE_MISSING", retryable: true });
  return BigInt(Math.round(price * 100));
}

function ensureExecutionQuoteStep(runId: string, symbol: string): ResearchStep {
  const step: ResearchStep = { ordinal: 5, role: "execution_quote", tool: "analyze_token", args: { symbol } };
  db.prepare("INSERT OR IGNORE INTO research_steps (id, run_id, plan_version, ordinal, role, tool, args_json, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')")
    .run(randomUUID(), runId, DECISION_RESEARCH_PLAN_VERSION, step.ordinal, step.role, step.tool, JSON.stringify(step.args));
  return step;
}

async function ensureExecutionQuote(runId: string, decisionId: string, symbol: string, sessionId: string, mode: DataMode, primary: Evidence, policyInput: PolicyInput, dependencies: RunDependencies, clock: () => Date): Promise<PolicyInput> {
  if (policyInput.executionQuote) return policyInput;
  const step = ensureExecutionQuoteStep(runId, symbol);
  const startedAt = clock().toISOString();
  db.prepare("UPDATE research_steps SET status='RUNNING', attempt_count=attempt_count+1, started_at=?, completed_at=NULL, evidence_id=NULL, provider_status=NULL, failure_code=NULL, failure_message=NULL WHERE run_id=? AND ordinal=?")
    .run(startedAt, runId, step.ordinal);
  try {
    const quote = await callResearchWithBudget(dependencies.research, step.tool, step.args, sessionId, "decision", mode);
    const priceCents = validateExecutionQuote(quote, primary, symbol, mode);
    const quantity = BigInt(policyInput.portfolio.positionQuantityMicros);
    const cash = BigInt(policyInput.portfolio.cashCents);
    const refreshedPositionValue = priceCents * quantity / 1_000_000n;
    const next: PolicyInput = {
      ...policyInput,
      executionQuotePolicyVersion: EXECUTION_QUOTE_POLICY_VERSION,
      executionQuote: { evidenceId: quote.id, priceCents: priceCents.toString(), asOf: quote.asOf, retrievedAt: quote.retrievedAt },
      portfolio: { ...policyInput.portfolio, equityCents: (cash + refreshedPositionValue).toString(), positionValueCents: refreshedPositionValue.toString() },
    };
    transaction(() => {
      db.prepare("INSERT INTO evidence (id, session_id, run_id, purpose, tool, symbol, status, mode, as_of, retrieved_at, payload_json) VALUES (?, ?, ?, 'execution_quote', ?, ?, ?, ?, ?, ?, ?)")
        .run(quote.id, sessionId, runId, quote.tool, quote.symbol ?? null, quote.status, quote.dataMode, quote.asOf, quote.retrievedAt, JSON.stringify(quote));
      db.prepare("UPDATE decisions SET policy_input_json=? WHERE id=?").run(JSON.stringify(next), decisionId);
      db.prepare("UPDATE research_steps SET status='COMPLETED', completed_at=?, evidence_id=?, provider_status=?, failure_code=NULL, failure_message=NULL WHERE run_id=? AND ordinal=?")
        .run(clock().toISOString(), quote.id, quote.status, runId, step.ordinal);
      db.prepare("UPDATE runs SET updated_at=?, failure_stage=NULL, failure_code=NULL, failure_message=NULL WHERE id=?").run(clock().toISOString(), runId);
    });
    return next;
  } catch (error) {
    const value = error as Error & { code?: string };
    db.prepare("UPDATE research_steps SET status='FAILED', completed_at=?, failure_code=?, failure_message=? WHERE run_id=? AND ordinal=?")
      .run(clock().toISOString(), value.code ?? "EXECUTION_QUOTE_FAILED", value.message.slice(0, 1_000), runId, step.ordinal);
    throw error;
  }
}

async function executeRun(runId: string, symbol: string, sessionId: string, portfolioId: string, mode: DataMode, dependencies: RunDependencies) {
  const clock = dependencies.now ?? (() => new Date());
  let stage = "FETCHING";
  try {
    const evidence = await collectDecisionEvidence(runId, symbol, sessionId, mode, dependencies, clock);
    db.prepare("UPDATE runs SET status='ANALYZING', updated_at=?, completed_at=NULL, failure_stage=NULL, failure_code=NULL, failure_message=NULL WHERE id=?")
      .run(clock().toISOString(), runId);

    stage = "ANALYZING";
    const tokenEvidence = primaryTokenEvidence(evidence);
    const deepEvidence = evidence.find((item) => item.tool === "deep_analysis");
    if (!tokenEvidence || !deepEvidence) throw Object.assign(new Error("The decision research plan is incomplete"), { code: "RESEARCH_PLAN_INCOMPLETE", retryable: true });
    const price = evidencePriceUsd(tokenEvidence);
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
        evidence,
        portfolio: {
          cashUsd: centsToUsd(cash),
          positionQuantity: quantityToString(quantity),
          positionCostBasisUsd: centsToUsd(BigInt(snapshotHolding?.cost_basis_cents ?? 0)),
        },
      }));
      decision = invocation.output;
      decisionId = randomUUID();
      policyInput = {
        researchPlanVersion: DECISION_RESEARCH_PLAN_VERSION,
        executionQuotePolicyVersion: EXECUTION_QUOTE_POLICY_VERSION,
        criticalEvidence: { analyzeTokenId: tokenEvidence.id, deepAnalysisId: deepEvidence.id, deepAnalysisStatus: deepEvidence.status },
        referencePriceCents: priceCents.toString(), evidenceAsOf: tokenEvidence.asOf, portfolioVersion: snapshotPortfolio.version,
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
    if (decision.action !== "HOLD" && policyInput.criticalEvidence?.deepAnalysisStatus === "ok") {
      policyInput = await ensureExecutionQuote(runId, decisionId, symbol, sessionId, mode, tokenEvidence, policyInput, dependencies, clock);
    }

    transaction(() => {
      dependencies.beforeApply?.();
      const existingFill = db.prepare("SELECT id FROM fills WHERE decision_id=?").get(decisionId);
      if (existingFill) {
        db.prepare("UPDATE runs SET status='COMPLETED', updated_at=?, completed_at=?, failure_stage=NULL, failure_code=NULL, failure_message=NULL WHERE id=?")
          .run(clock().toISOString(), clock().toISOString(), runId);
        return;
      }

      const evaluatedAt = clock();
      const referencePriceCents = BigInt(policyInput.executionQuote?.priceCents ?? policyInput.referencePriceCents);
      const referenceAsOf = policyInput.executionQuote?.asOf ?? policyInput.evidenceAsOf;
      const portfolioState = {
        cashCents: BigInt(policyInput.portfolio.cashCents), equityCents: BigInt(policyInput.portfolio.equityCents),
        positionQuantityMicros: BigInt(policyInput.portfolio.positionQuantityMicros), positionValueCents: BigInt(policyInput.portfolio.positionValueCents),
      };
      const currentPortfolio = db.prepare("SELECT version FROM portfolios WHERE id=?").get(portfolioId) as { version: number };
      const evidenceAgeMs = evaluatedAt.getTime() - Date.parse(referenceAsOf);
      const priceIsStale = !Number.isFinite(evidenceAgeMs) || evidenceAgeMs < -5_000 || evidenceAgeMs > policyInput.simulation.maxPriceAgeSeconds * 1_000;
      const portfolioChanged = currentPortfolio.version !== policyInput.portfolioVersion;
      const savedSimulationConfig = {
        feeBps: BigInt(policyInput.simulation.feeBps), slippageBps: BigInt(policyInput.simulation.slippageBps),
        maxBuyEquityBps: BigInt(policyInput.simulation.maxBuyEquityBps), maxTokenExposureBps: BigInt(policyInput.simulation.maxTokenExposureBps),
      };
      const simulation = decision.action !== "HOLD" && policyInput.criticalEvidence !== undefined && policyInput.criticalEvidence.deepAnalysisStatus !== "ok"
        ? { outcome: "BLOCKED_SAFETY_COVERAGE", action: decision.action, quantityMicros: 0n, fillPriceCents: referencePriceCents, feeCents: 0n, cashDeltaCents: 0n, reason: "Deep-analysis risk coverage was not complete enough to apply a paper trade" }
        : decision.action !== "HOLD" && priceIsStale
          ? policyInput.executionQuote
            ? { outcome: "SKIPPED_QUOTE_UNAVAILABLE", action: decision.action, quantityMicros: 0n, fillPriceCents: referencePriceCents, feeCents: 0n, cashDeltaCents: 0n, reason: `No paper fill — the refreshed quote was not current within the ${policyInput.simulation.maxPriceAgeSeconds}-second limit` }
            : { outcome: "BLOCKED_STALE_PRICE", action: decision.action, quantityMicros: 0n, fillPriceCents: referencePriceCents, feeCents: 0n, cashDeltaCents: 0n, reason: `Evidence price exceeded the ${policyInput.simulation.maxPriceAgeSeconds}-second execution freshness limit` }
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
    const failureUpdate = db.prepare("UPDATE runs SET status=?, updated_at=?, completed_at=?, failure_stage=?, failure_code=?, failure_message=? WHERE id=? AND status<>'COMPLETED'")
      .run(failedStatus, clock().toISOString(), clock().toISOString(), stage, value.code ?? "RUN_FAILED", value.message.slice(0, 1_000), runId);
    if (Number(failureUpdate.changes) === 0) {
      const concurrent = db.prepare("SELECT status FROM runs WHERE id=? AND session_id=?").get(runId, sessionId) as { status: string } | undefined;
      if (concurrent?.status === "COMPLETED") return getRun(runId, sessionId);
    }
    throw error;
  }
}

export function replayRun(runId: string, sessionId?: string, mode: DataMode = "live") {
  const row = db.prepare(`SELECT d.action, d.policy_input_json, f.outcome, f.quantity_micros, f.fill_price_cents,
    f.fee_cents, f.cash_delta_cents, f.reason, f.portfolio_version_at_apply, f.created_at
    FROM decisions d JOIN fills f ON f.decision_id=d.id JOIN runs r ON r.id=d.run_id
    WHERE d.run_id=? AND (? IS NULL OR r.session_id=?) AND (? IS NULL OR r.mode=?)`).get(runId, sessionId ?? null, sessionId ?? null, mode ?? null, mode ?? null) as any;
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
  const referencePriceCents = BigInt(input.executionQuote?.priceCents ?? input.referencePriceCents);
  const referenceAsOf = input.executionQuote?.asOf ?? input.evidenceAsOf;
  const evidenceAgeMs = evaluatedAt - Date.parse(referenceAsOf);
  const stale = !Number.isFinite(evidenceAgeMs) || evidenceAgeMs < -5_000 || evidenceAgeMs > input.simulation.maxPriceAgeSeconds * 1_000;
  const portfolioChanged = row.portfolio_version_at_apply !== null && Number(row.portfolio_version_at_apply) !== input.portfolioVersion;
  const replayed = row.action !== "HOLD" && input.criticalEvidence?.deepAnalysisStatus !== undefined && input.criticalEvidence.deepAnalysisStatus !== "ok"
    ? { outcome: "BLOCKED_SAFETY_COVERAGE", action: row.action, quantityMicros: 0n, fillPriceCents: referencePriceCents, feeCents: 0n, cashDeltaCents: 0n, reason: "Deep-analysis risk coverage was not complete enough to apply a paper trade" }
    : row.action !== "HOLD" && stale
      ? input.executionQuote
        ? { outcome: "SKIPPED_QUOTE_UNAVAILABLE", action: row.action, quantityMicros: 0n, fillPriceCents: referencePriceCents, feeCents: 0n, cashDeltaCents: 0n, reason: `No paper fill — the refreshed quote was not current within the ${input.simulation.maxPriceAgeSeconds}-second limit` }
        : { outcome: "BLOCKED_STALE_PRICE", action: row.action, quantityMicros: 0n, fillPriceCents: referencePriceCents, feeCents: 0n, cashDeltaCents: 0n, reason: `Evidence price exceeded the ${input.simulation.maxPriceAgeSeconds}-second execution freshness limit` }
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

export async function createRun(symbol: string, idempotencyKey: string, dependencies: RunDependencies | undefined = undefined, sessionId = DEFAULT_SESSION_ID, mode: DataMode = config.DATA_MODE) {
  const resolvedDependencies = dependencies ?? runDependenciesForMode(mode);
  const inputHash = hash({ symbol });
  const portfolioId = ensurePortfolio(sessionId, mode);
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
      const createdAt = (resolvedDependencies.now ?? (() => new Date()))().toISOString();
      db.prepare("INSERT INTO runs (id, session_id, portfolio_id, symbol, idempotency_key, input_hash, mode, research_plan_version, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'FETCHING', ?, ?)")
        .run(runId, sessionId, portfolioId, symbol, idempotencyKey, inputHash, mode, DECISION_RESEARCH_PLAN_VERSION, createdAt, createdAt);
      existing = { id: runId, input_hash: inputHash, status: "FETCHING" };
    } else {
      db.prepare("UPDATE runs SET attempt_count=attempt_count+1, research_plan_version=?, updated_at=?, completed_at=NULL WHERE id=?")
        .run(DECISION_RESEARCH_PLAN_VERSION, (resolvedDependencies.now ?? (() => new Date()))().toISOString(), existing.id);
    }
    return executeRun(existing.id, symbol, sessionId, portfolioId, mode, resolvedDependencies);
  })();
  activeRuns.set(activeKey, { inputHash, promise: work });
  try { return await work; }
  finally { activeRuns.delete(activeKey); }
}

export function getRun(id: string, sessionId = DEFAULT_SESSION_ID, mode: DataMode = "live") {
  const row = db.prepare(`SELECT r.*, d.payload_json AS decision_json, d.policy_input_json, f.action AS fill_action, f.outcome, f.quantity_micros, f.fill_price_cents, f.fee_cents, f.cash_delta_cents, f.reason
    FROM runs r LEFT JOIN decisions d ON d.run_id=r.id LEFT JOIN fills f ON f.decision_id=d.id WHERE r.id=? AND r.session_id=? AND (? IS NULL OR r.mode=?)`).get(id, sessionId, mode ?? null, mode ?? null) as any;
  if (!row) throw Object.assign(new Error("Run not found"), { status: 404 });
  const evidenceRows = db.prepare("SELECT purpose, payload_json FROM evidence WHERE run_id=? ORDER BY retrieved_at, rowid").all(id) as Array<{ purpose: string; payload_json: string }>;
  const researchRows = db.prepare("SELECT ordinal, role, tool, args_json, status, attempt_count, started_at, completed_at, evidence_id, provider_status, failure_code, failure_message FROM research_steps WHERE run_id=? ORDER BY ordinal").all(id) as any[];
  const policyInput = row.policy_input_json ? JSON.parse(row.policy_input_json) as PolicyInput : null;
  return {
    id: row.id, symbol: row.symbol, mode: row.mode, researchPlanVersion: row.research_plan_version, status: row.status, createdAt: row.created_at, completedAt: row.completed_at,
    attemptCount: row.attempt_count, failure: row.failure_stage ? { stage: row.failure_stage, code: row.failure_code, message: row.failure_message } : null,
    decision: row.decision_json ? JSON.parse(row.decision_json) : null,
    simulation: row.outcome ? {
      action: row.fill_action, outcome: row.outcome, quantity: quantityToString(BigInt(row.quantity_micros)), fillPriceUsd: centsToUsd(BigInt(row.fill_price_cents)), feeUsd: centsToUsd(BigInt(row.fee_cents)), cashDeltaUsd: centsToUsd(BigInt(row.cash_delta_cents)), reason: row.reason,
      decisionReference: policyInput ? { evidenceId: policyInput.criticalEvidence?.analyzeTokenId ?? null, priceUsd: centsToUsd(BigInt(policyInput.referencePriceCents)), asOf: policyInput.evidenceAsOf } : null,
      executionQuote: policyInput?.executionQuote ? { evidenceId: policyInput.executionQuote.evidenceId, referencePriceUsd: centsToUsd(BigInt(policyInput.executionQuote.priceCents)), asOf: policyInput.executionQuote.asOf, retrievedAt: policyInput.executionQuote.retrievedAt } : null,
    } : null,
    researchTimeline: researchRows.map((item) => ({
      ordinal: item.ordinal, role: item.role, tool: item.tool, args: JSON.parse(item.args_json), status: item.status,
      attemptCount: item.attempt_count, startedAt: item.started_at, completedAt: item.completed_at,
      durationMs: item.started_at && item.completed_at ? Math.max(0, Date.parse(item.completed_at) - Date.parse(item.started_at)) : null,
      evidenceId: item.evidence_id, providerStatus: item.provider_status,
      failure: item.failure_code ? { code: item.failure_code, message: item.failure_message } : null,
    })),
    evidence: evidenceRows.map((item) => ({ ...JSON.parse(item.payload_json), purpose: item.purpose })),
  };
}

export function history(sessionId = DEFAULT_SESSION_ID, mode: DataMode = config.DATA_MODE) {
  const rows = db.prepare("SELECT id FROM runs WHERE session_id=? AND mode=? ORDER BY created_at DESC LIMIT 50").all(sessionId, mode) as Array<{ id: string }>;
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

function numericAt(data: Record<string, unknown>, paths: string[][]): number | null {
  for (const path of paths) {
    const value = nestedValue(data, path);
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
  return explicit ?? (numericAt(evidence.data, [["change24h"], ["change_24h"], ["performance", "h24"], ["performance", "24h"]]) !== null ? "24h" : null);
}

function nestedValue(data: Record<string, unknown>, path: string[]): unknown {
  let value: unknown = data;
  for (const key of path) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
    value = (value as Record<string, unknown>)[key];
  }
  return value;
}

function firstStringAt(data: Record<string, unknown>, paths: string[][]): string | null {
  for (const path of paths) {
    const value = nestedValue(data, path);
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function pointNumber(data: Record<string, unknown>, keys: string[]): number | null {
  return numericField(data, keys);
}

function pointTimestamp(data: Record<string, unknown>): string | null {
  const value = ["timestamp", "time", "datetime", "open_time", "close_time", "date"].map((key) => data[key]).find((item) => item !== undefined);
  const milliseconds = typeof value === "number"
    ? (value < 10_000_000_000 ? value * 1_000 : value)
    : typeof value === "string" && /^\d+(?:\.\d+)?$/.test(value.trim())
      ? (Number(value) < 10_000_000_000 ? Number(value) * 1_000 : Number(value))
      : typeof value === "string" ? Date.parse(value) : Number.NaN;
  return Number.isFinite(milliseconds) ? new Date(milliseconds).toISOString() : null;
}

function chartFromEvidence(evidence: Evidence | null): MarketChart {
  if (!evidence) return { status: "unavailable", reason: "The selected run has no saved analyze_token evidence." };
  const candidates = [
    ["candles"], ["ohlcv"], ["priceHistory"], ["price_history"],
    ["market", "candles"], ["market", "ohlcv"], ["market", "priceHistory"], ["market", "price_history"],
  ];
  const selected = candidates.map((path) => ({ path, value: nestedValue(evidence.data, path) })).find((item) => Array.isArray(item.value));
  if (!selected || !Array.isArray(selected.value)) return { status: "unavailable", reason: "The saved analyze_token evidence contains no timestamped candle series." };
  const currency = firstStringAt(evidence.data, [["currency"], ["quoteCurrency"], ["quote_currency"], ["market", "currency"], ["market", "quote_currency"]]);
  if (!currency) return { status: "unavailable", reason: "The timestamped series has no verified price currency." };
  const explicitVolumeUnit = firstStringAt(evidence.data, [["volumeUnit"], ["volume_unit"], ["market", "volumeUnit"], ["market", "volume_unit"]]);
  const futureBoundary = Date.parse(evidence.retrievedAt) + 5 * 60_000;
  let sawUsdVolume = false;
  const points = selected.value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const record = item as Record<string, unknown>;
    const timestamp = pointTimestamp(record);
    const close = pointNumber(record, ["close", "close_price", "price", "price_usd"]);
    if (!timestamp || close === null || close <= 0 || Date.parse(timestamp) > futureBoundary) return [];
    const open = pointNumber(record, ["open", "open_price"]);
    const high = pointNumber(record, ["high", "high_price"]);
    const low = pointNumber(record, ["low", "low_price"]);
    const hasValidOhlc = open !== null && high !== null && low !== null && open > 0 && high >= Math.max(open, close) && low > 0 && low <= Math.min(open, close);
    const volumeUsd = pointNumber(record, ["volume_usd", "quote_volume_usd"]);
    if (volumeUsd !== null) sawUsdVolume = true;
    const volume = volumeUsd ?? pointNumber(record, ["volume", "quote_volume"]);
    return [{ timestamp, open: hasValidOhlc ? open : null, high: hasValidOhlc ? high : null, low: hasValidOhlc ? low : null, close, volume: volume !== null && volume >= 0 ? volume : null }];
  });
  const ordered = [...new Map(points.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp)).map((point) => [point.timestamp, point])).values()].slice(-500);
  if (ordered.length < 2) return { status: "unavailable", reason: "The saved candle series has fewer than two valid timestamped price points." };
  const deltas = ordered.slice(1).map((point, index) => Math.round((Date.parse(point.timestamp) - Date.parse(ordered[index]!.timestamp)) / 1_000)).filter((value) => value > 0).sort((a, b) => a - b);
  const intervalSeconds = deltas[Math.floor(deltas.length / 2)] ?? 0;
  const windowSeconds = Math.round((Date.parse(ordered.at(-1)!.timestamp) - Date.parse(ordered[0]!.timestamp)) / 1_000);
  if (intervalSeconds <= 0 || windowSeconds <= 0) return { status: "unavailable", reason: "The saved candle timestamps do not form a valid positive time window." };
  const volumeUnit = explicitVolumeUnit ?? (sawUsdVolume ? "USD" : null);
  const normalized = volumeUnit ? ordered : ordered.map((point) => ({ ...point, volume: null }));
  const volumeCount = normalized.filter((point) => point.volume !== null).length;
  return marketChartSchema.parse({
    status: "available", evidenceId: evidence.id, symbol: evidence.symbol, currency: currency.toUpperCase(), volumeUnit,
    intervalSeconds, windowSeconds, sourcePath: selected.path.join("."), dataMode: evidence.dataMode,
    asOf: evidence.asOf, retrievedAt: evidence.retrievedAt, points: normalized,
    volumeCoverage: volumeCount === normalized.length ? "complete" : volumeCount > 0 ? "partial" : "unavailable",
  });
}

function latestMark(symbol: string, sessionId: string, mode: string, valuedAt: Date) {
  const rows = db.prepare(`SELECT e.payload_json FROM evidence e JOIN runs r ON r.id=e.run_id
    WHERE r.session_id=? AND r.mode=? AND r.symbol=? AND e.purpose='decision' AND e.tool='analyze_token' AND e.status IN ('ok', 'partial')
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

export function portfolio(sessionId = DEFAULT_SESSION_ID, valuedAt = new Date(), mode: DataMode = config.DATA_MODE) {
  const portfolioId = ensurePortfolio(sessionId, mode);
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
  const currentEvidence = primaryTokenEvidence(current.evidence as Evidence[]);
  const previousEvidence = primaryTokenEvidence(previous.evidence as Evidence[]);
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
  const currentChange = numericAt(currentEvidence.data, [["change24h"], ["change_24h"], ["performance", "h24"], ["performance", "24h"]]);
  const previousChange = numericAt(previousEvidence.data, [["change24h"], ["change_24h"], ["performance", "h24"], ["performance", "24h"]]);
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

export function dashboardSummary(symbol: string, sessionId = DEFAULT_SESSION_ID, generatedAt = new Date(), mode: DataMode = config.DATA_MODE) {
  const portfolioId = ensurePortfolio(sessionId, mode);
  const rows = db.prepare("SELECT id FROM runs WHERE session_id=? AND portfolio_id=? AND mode=? AND symbol=? ORDER BY created_at DESC, rowid DESC LIMIT 20")
    .all(sessionId, portfolioId, mode, symbol) as Array<{ id: string }>;
  const latestRun = rows[0] ? getRun(rows[0].id, sessionId) : null;
  const candidates = rows.slice(1).map((row) => getRun(row.id, sessionId));
  const comparisons = latestRun ? candidates.map((candidate) => comparisonForRuns(latestRun, candidate)) : [];
  const comparison = comparisons.find((candidate) => candidate.status === "comparable") ?? comparisons[0]
    ?? (latestRun ? comparisonForRuns(latestRun, null) : { status: "unavailable" as const, reason: "No saved run exists for this asset and data mode.", previousRunId: null });
  return {
    symbol, mode, generatedAt: generatedAt.toISOString(), latestRun,
    comparison,
    portfolio: portfolio(sessionId, generatedAt, mode),
    chart: chartFromEvidence(latestRun ? primaryTokenEvidence(latestRun.evidence as Evidence[]) ?? null : null),
  };
}

export function marketOverview(sessionId = DEFAULT_SESSION_ID, viewedAt = new Date(), mode: DataMode = config.DATA_MODE): MarketOverviewView {
  touchSession(sessionId);
  const snapshotRow = db.prepare(`SELECT e.payload_json FROM market_overview_attempts a
    JOIN evidence e ON e.id=a.evidence_id
    WHERE a.session_id=? AND a.mode=? AND a.status='COMPLETED'
    ORDER BY a.started_at DESC, a.rowid DESC LIMIT 1`).get(sessionId, mode) as { payload_json: string } | undefined;
  const attempt = db.prepare(`SELECT status, started_at, completed_at, evidence_id, failure_code, failure_message
    FROM market_overview_attempts WHERE session_id=? AND mode=? ORDER BY started_at DESC, rowid DESC LIMIT 1`)
    .get(sessionId, mode) as any;
  const snapshot = snapshotRow ? JSON.parse(snapshotRow.payload_json) as Evidence : null;
  const elapsedMs = snapshot ? viewedAt.getTime() - Date.parse(snapshot.asOf) : Number.NaN;
  const ageSeconds = Number.isFinite(elapsedMs) && elapsedMs >= -5_000 ? Math.max(0, Math.floor(elapsedMs / 1_000)) : null;
  return {
    mode,
    generatedAt: viewedAt.toISOString(),
    maxAgeSeconds: config.MARKET_OVERVIEW_MAX_AGE_SECONDS,
    snapshot,
    ageSeconds,
    freshness: snapshot && ageSeconds !== null ? ageSeconds <= config.MARKET_OVERVIEW_MAX_AGE_SECONDS ? "fresh" : "stale" : "unknown",
    latestAttempt: attempt ? {
      status: attempt.status,
      startedAt: attempt.started_at,
      completedAt: attempt.completed_at,
      evidenceId: attempt.evidence_id,
      failure: attempt.failure_code ? { code: attempt.failure_code, message: attempt.failure_message } : null,
    } : null,
  };
}

export async function refreshMarketOverview(
  sessionId = DEFAULT_SESSION_ID,
  dependencies: { research: ResearchAdapter; now?: () => Date } | undefined = undefined,
  mode: DataMode = config.DATA_MODE,
): Promise<MarketOverviewView> {
  const resolvedDependencies = dependencies ?? { research: researchForMode(mode) };
  const activeKey = `${sessionId}:${mode}`;
  const active = activeMarketOverviews.get(activeKey);
  if (active) return active;
  const work = (async () => {
    touchSession(sessionId);
    const clock = resolvedDependencies.now ?? (() => new Date());
    const attemptId = randomUUID();
    db.prepare("INSERT INTO market_overview_attempts (id, session_id, mode, status, started_at) VALUES (?, ?, ?, 'FETCHING', ?)")
      .run(attemptId, sessionId, mode, clock().toISOString());
    try {
      const evidence = await callResearchWithBudget(resolvedDependencies.research, "market_overview", {}, sessionId, "market", mode);
      if (evidence.tool !== "market_overview") {
        throw Object.assign(new Error(`RYO returned ${evidence.tool} while market_overview was requested`), { code: "RYO_TOOL_MISMATCH", retryable: false });
      }
      if (evidence.dataMode !== mode) throw Object.assign(new Error(`Research returned ${evidence.dataMode} evidence while ${mode} mode was requested`), { code: "RYO_MODE_MISMATCH", retryable: false });
      transaction(() => {
        db.prepare("INSERT INTO evidence (id, session_id, purpose, tool, symbol, status, mode, as_of, retrieved_at, payload_json) VALUES (?, ?, 'market', ?, NULL, ?, ?, ?, ?, ?)")
          .run(evidence.id, sessionId, evidence.tool, evidence.status, evidence.dataMode, evidence.asOf, evidence.retrievedAt, JSON.stringify(evidence));
        db.prepare("UPDATE market_overview_attempts SET status='COMPLETED', completed_at=?, evidence_id=?, failure_code=NULL, failure_message=NULL WHERE id=?")
          .run(clock().toISOString(), evidence.id, attemptId);
      });
      return marketOverview(sessionId, clock(), mode);
    } catch (error) {
      const value = error as Error & { code?: string };
      db.prepare("UPDATE market_overview_attempts SET status='FAILED', completed_at=?, failure_code=?, failure_message=? WHERE id=?")
        .run(clock().toISOString(), value.code ?? "RYO_REQUEST_FAILED", value.message.slice(0, 1_000), attemptId);
      throw error;
    }
  })();
  activeMarketOverviews.set(activeKey, work);
  try { return await work; }
  finally { activeMarketOverviews.delete(activeKey); }
}

export function createConversation(symbol?: string, sessionId = DEFAULT_SESSION_ID, mode: DataMode = config.DATA_MODE) {
  touchSession(sessionId);
  const id = randomUUID();
  transaction(() => {
    const count = db.prepare("SELECT COUNT(*) AS count FROM conversations WHERE session_id=?").get(sessionId) as { count: number };
    if (count.count >= config.CHAT_MAX_CONVERSATIONS_PER_SESSION) {
      throw Object.assign(new Error("Conversation retention limit reached for this session"), { status: 429, code: "CHAT_CONVERSATION_LIMIT", retryable: false });
    }
    db.prepare("INSERT INTO conversations (id, session_id, mode, symbol, created_at) VALUES (?, ?, ?, ?, ?)").run(id, sessionId, mode, symbol ?? null, now());
  });
  return { id, mode, symbol: symbol ?? null, messages: [] };
}

export function listConversations(sessionId = DEFAULT_SESSION_ID, mode: DataMode = config.DATA_MODE) {
  touchSession(sessionId);
  const rows = db.prepare(`SELECT c.id, c.mode, c.symbol, c.created_at,
    COUNT(m.id) AS message_count,
    COALESCE(MAX(COALESCE(m.updated_at, m.created_at)), c.created_at) AS updated_at
    FROM conversations c LEFT JOIN messages m ON m.conversation_id=c.id
    WHERE c.session_id=? AND c.mode=? GROUP BY c.id
    ORDER BY updated_at DESC, c.rowid DESC LIMIT ?`).all(sessionId, mode, config.CHAT_MAX_CONVERSATIONS_PER_SESSION) as any[];
  return rows.map((row) => {
    const firstUser = db.prepare("SELECT text FROM messages WHERE conversation_id=? AND role='user' ORDER BY created_at, rowid LIMIT 1").get(row.id) as { text: string } | undefined;
    const latest = db.prepare("SELECT role, text, status FROM messages WHERE conversation_id=? ORDER BY created_at DESC, rowid DESC LIMIT 1").get(row.id) as { role: string; text: string; status: string } | undefined;
    const defaultTitle = `${row.symbol ?? "Market"} research`;
    return {
      id: row.id, mode: row.mode, symbol: row.symbol, createdAt: row.created_at, updatedAt: row.updated_at,
      messageCount: Number(row.message_count),
      title: firstUser ? firstUser.text.slice(0, 60) : defaultTitle,
      latestMessage: latest ? { role: latest.role, text: latest.text.slice(0, 100), status: latest.status } : null,
    };
  });
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
        const ryoEvidence = await callResearchWithBudget(dependencies.research, /compare/i.test(text) ? "compare_tokens" : /market/i.test(text) && !/token/i.test(text) ? "market_overview" : "analyze_token", /compare/i.test(text) ? { symbols: `${activeSymbol},BTC`, intent: "swing" } : /market/i.test(text) && !/token/i.test(text) ? {} : { symbol: activeSymbol }, sessionId, "chat", conversation.mode);
        if (ryoEvidence.dataMode !== conversation.mode) throw Object.assign(new Error(`Research returned ${ryoEvidence.dataMode} evidence while ${conversation.mode} mode was requested`), { code: "RYO_MODE_MISMATCH", retryable: false });
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
      db.prepare("INSERT INTO messages (id, conversation_id, role, text, symbol, run_id, parent_message_id, status, citations_json, classification_json, created_at, updated_at) VALUES (?, ?, 'assistant', ?, ?, ?, ?, 'complete', ?, ?, ?, ?)")
        .run(assistantId, conversation.id, invocation.output.text, activeSymbol, runId ?? null, userId, JSON.stringify(invocation.output.citations), JSON.stringify(invocation.output.classification), now(), now());
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
  dependencies: ChatDependencies | undefined = undefined,
  expectedMode?: DataMode,
) {
  const conversation = db.prepare("SELECT * FROM conversations WHERE id=? AND session_id=? AND (? IS NULL OR mode=?)").get(conversationId, sessionId, expectedMode ?? null, expectedMode ?? null) as any;
  if (!conversation) throw Object.assign(new Error("Conversation not found"), { status: 404 });
  const resolvedDependencies = dependencies ?? { research: researchForMode(conversation.mode), model: modelForMode(conversation.mode), searchWeb: searchChatWeb };
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
    return executeChatMessage(conversation, userMessage.id, text, sessionId, resolvedDependencies, symbol, runId);
  })();
  activeChats.set(activeKey, { inputHash, promise: work });
  try { return await work; }
  finally { activeChats.delete(activeKey); }
}

export function conversationView(id: string, sessionId = DEFAULT_SESSION_ID, mode: DataMode = "live") {
  const conversation = db.prepare("SELECT * FROM conversations WHERE id=? AND session_id=? AND (? IS NULL OR mode=?)").get(id, sessionId, mode ?? null, mode ?? null) as any;
  if (!conversation) throw Object.assign(new Error("Conversation not found"), { status: 404 });
  const messages = db.prepare("SELECT id, role, text, symbol, run_id, status, citations_json, classification_json, failure_stage, failure_code, failure_message, attempt_count, created_at, updated_at FROM messages WHERE conversation_id=? ORDER BY created_at, rowid").all(id) as any[];
  return { id, mode: conversation.mode, symbol: conversation.symbol, messages: messages.map((m) => {
    const citations = JSON.parse(m.citations_json) as string[];
    const sources = citations.flatMap((evidenceId) => {
      const row = db.prepare(`SELECT e.payload_json FROM evidence e WHERE e.id=? AND (
        e.message_id IN (SELECT m2.id FROM messages m2 JOIN conversations c2 ON c2.id=m2.conversation_id WHERE c2.session_id=?)
        OR e.run_id IN (SELECT r2.id FROM runs r2 WHERE r2.session_id=?))`).get(evidenceId, sessionId, sessionId) as { payload_json: string } | undefined;
      if (!row) return [];
      const item = JSON.parse(row.payload_json) as Evidence;
      if (item.tool !== "tavily_search") return [{ evidenceId, kind: "ryo", title: item.summary.headline, retrievedAt: item.retrievedAt, dataMode: item.dataMode }];
      const results = Array.isArray(item.data.results) ? item.data.results : [];
      return results.flatMap((result) => {
        if (!result || typeof result !== "object") return [];
        const value = result as Record<string, unknown>;
        return typeof value.title === "string" && typeof value.url === "string"
          ? [{ evidenceId, kind: "web", title: value.title, url: value.url, publishedAt: typeof value.publishedAt === "string" ? value.publishedAt : null, retrievedAt: item.retrievedAt, dataMode: item.dataMode }]
          : [];
      });
    });
    const mismatchedModes = [...new Set(sources.map((source) => source.dataMode).filter((sourceMode) => sourceMode !== conversation.mode))];
    const integrityWarning = mismatchedModes.length ? `Legacy answer uses ${mismatchedModes.join("/").toUpperCase()} evidence inside a ${String(conversation.mode).toUpperCase()} conversation. Do not treat it as current ${String(conversation.mode).toUpperCase()} research.` : null;
    return { id: m.id, role: m.role, text: integrityWarning ? "missing data" : m.text, symbol: m.symbol, runId: m.run_id, status: m.status, citations: integrityWarning ? [] : citations, classification: !integrityWarning && m.classification_json ? JSON.parse(m.classification_json) : null, sources: integrityWarning ? [] : sources, integrityWarning, attemptCount: m.attempt_count, failure: m.failure_stage ? { stage: m.failure_stage, code: m.failure_code, message: m.failure_message } : null, createdAt: m.created_at, updatedAt: m.updated_at };
  }) };
}
