import { createHash, randomUUID } from "node:crypto";
import { FixtureModelAdapter, FixtureResearchAdapter, GeminiModelAdapter, RyoRestAdapter, type ModelAdapter, type ModelAudit, type ResearchAdapter } from "@tradesense/adapters";
import { centsToUsd, quantityToString, simulateDecision, type Evidence } from "@tradesense/core";
import { config } from "./config.js";
import { db, transaction } from "./db.js";

export const research: ResearchAdapter = config.DATA_MODE === "live"
  ? new RyoRestAdapter(config.RYO_MCP_URL, config.RYO_MCP_KEY)
  : new FixtureResearchAdapter();
export const model: ModelAdapter = config.LLM_PROVIDER === "gemini"
  ? new GeminiModelAdapter(config.LLM_API_KEY, config.LLM_MODEL)
  : new FixtureModelAdapter();

const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const now = () => new Date().toISOString();
const portfolioId = `demo-${config.DATA_MODE}`;

function saveModelCall(purpose: "decision" | "chat", audit: ModelAudit, runId?: string, messageId?: string): void {
  db.prepare("INSERT INTO model_calls (id, purpose, run_id, message_id, provider, model, prompt_version, input_hash, request_json, response_json, generation_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(randomUUID(), purpose, runId ?? null, messageId ?? null, audit.provider, audit.model, audit.promptVersion, audit.inputHash, JSON.stringify(audit.request), JSON.stringify(audit.response), JSON.stringify(audit.generation), now());
}

export async function createRun(symbol: string, idempotencyKey: string) {
  const inputHash = hash({ symbol });
  const existing = db.prepare("SELECT id, input_hash FROM runs WHERE portfolio_id = ? AND idempotency_key = ?").get(portfolioId, idempotencyKey) as { id: string; input_hash: string } | undefined;
  if (existing) {
    if (existing.input_hash !== inputHash) throw Object.assign(new Error("Idempotency key already used with different input"), { status: 409 });
    return getRun(existing.id);
  }

  const runId = randomUUID();
  db.prepare("INSERT INTO runs (id, portfolio_id, symbol, idempotency_key, input_hash, mode, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'FETCHING', ?)")
    .run(runId, portfolioId, symbol, idempotencyKey, inputHash, config.DATA_MODE, now());
  try {
    const evidence = await research.call("analyze_token", { symbol });
    const price = Number(evidence.data.price);
    if (!Number.isFinite(price) || price <= 0) throw new Error("Evidence has no valid price");
    const snapshotPortfolio = db.prepare("SELECT cash_cents FROM portfolios WHERE id = ?").get(portfolioId) as { cash_cents: number };
    const snapshotHolding = db.prepare("SELECT quantity_micros, cost_basis_cents FROM holdings WHERE portfolio_id = ? AND symbol = ?").get(portfolioId, symbol) as { quantity_micros: number; cost_basis_cents: number } | undefined;
    const invocation = await model.createDecision({
      symbol,
      evidence: [evidence],
      portfolio: {
        cashUsd: centsToUsd(BigInt(snapshotPortfolio.cash_cents)),
        positionQuantity: quantityToString(BigInt(snapshotHolding?.quantity_micros ?? 0)),
        positionCostBasisUsd: centsToUsd(BigInt(snapshotHolding?.cost_basis_cents ?? 0)),
      },
    });
    const decision = invocation.output;
    const decisionId = randomUUID();
    transaction(() => {
      db.prepare("INSERT INTO evidence (id, run_id, purpose, tool, symbol, status, mode, as_of, retrieved_at, payload_json) VALUES (?, ?, 'decision', ?, ?, ?, ?, ?, ?, ?)")
        .run(evidence.id, runId, evidence.tool, symbol, evidence.status, evidence.dataMode, evidence.asOf, evidence.retrievedAt, JSON.stringify(evidence));
      db.prepare("INSERT INTO decisions (id, run_id, action, payload_json, created_at) VALUES (?, ?, ?, ?, ?)")
        .run(decisionId, runId, decision.action, JSON.stringify(decision), now());
      saveModelCall("decision", invocation.audit, runId);
      const portfolio = db.prepare("SELECT cash_cents, version FROM portfolios WHERE id = ?").get(portfolioId) as { cash_cents: number; version: number };
      const holding = db.prepare("SELECT quantity_micros, cost_basis_cents FROM holdings WHERE portfolio_id = ? AND symbol = ?").get(portfolioId, symbol) as { quantity_micros: number; cost_basis_cents: number } | undefined;
      const quantity = BigInt(holding?.quantity_micros ?? 0);
      const priceCents = BigInt(Math.round(price * 100));
      const simulation = simulateDecision(decision.action, priceCents, {
        cashCents: BigInt(portfolio.cash_cents), equityCents: BigInt(portfolio.cash_cents) + priceCents * quantity / 1_000_000n,
        positionQuantityMicros: quantity, positionValueCents: priceCents * quantity / 1_000_000n,
      }, config.simulation);
      db.prepare("INSERT INTO fills (id, decision_id, symbol, action, outcome, quantity_micros, fill_price_cents, fee_cents, cash_delta_cents, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(randomUUID(), decisionId, symbol, decision.action, simulation.outcome, simulation.quantityMicros, simulation.fillPriceCents, simulation.feeCents, simulation.cashDeltaCents, simulation.reason, now());
      if (simulation.outcome === "APPLIED") {
        const nextQty = decision.action === "BUY" ? quantity + simulation.quantityMicros : 0n;
        const nextCost = decision.action === "BUY" ? BigInt(holding?.cost_basis_cents ?? 0) - simulation.cashDeltaCents : 0n;
        db.prepare("INSERT INTO holdings (portfolio_id, symbol, quantity_micros, cost_basis_cents) VALUES (?, ?, ?, ?) ON CONFLICT(portfolio_id, symbol) DO UPDATE SET quantity_micros=excluded.quantity_micros, cost_basis_cents=excluded.cost_basis_cents")
          .run(portfolioId, symbol, nextQty, nextCost);
        db.prepare("UPDATE portfolios SET cash_cents = cash_cents + ?, version = version + 1 WHERE id = ? AND version = ?")
          .run(simulation.cashDeltaCents, portfolioId, portfolio.version);
      }
      db.prepare("UPDATE runs SET status='COMPLETED', completed_at=? WHERE id=?").run(now(), runId);
    });
    return getRun(runId);
  } catch (error) {
    db.prepare("UPDATE runs SET status='FAILED', completed_at=? WHERE id=?").run(now(), runId);
    throw error;
  }
}

export function getRun(id: string) {
  const row = db.prepare(`SELECT r.*, d.payload_json AS decision_json, f.action AS fill_action, f.outcome, f.quantity_micros, f.fill_price_cents, f.fee_cents, f.cash_delta_cents, f.reason
    FROM runs r LEFT JOIN decisions d ON d.run_id=r.id LEFT JOIN fills f ON f.decision_id=d.id WHERE r.id=?`).get(id) as any;
  if (!row) throw Object.assign(new Error("Run not found"), { status: 404 });
  const evidenceRows = db.prepare("SELECT payload_json FROM evidence WHERE run_id=? ORDER BY retrieved_at").all(id) as Array<{ payload_json: string }>;
  return {
    id: row.id, symbol: row.symbol, mode: row.mode, status: row.status, createdAt: row.created_at, completedAt: row.completed_at,
    decision: row.decision_json ? JSON.parse(row.decision_json) : null,
    simulation: row.outcome ? { action: row.fill_action, outcome: row.outcome, quantity: quantityToString(BigInt(row.quantity_micros)), fillPriceUsd: centsToUsd(BigInt(row.fill_price_cents)), feeUsd: centsToUsd(BigInt(row.fee_cents)), cashDeltaUsd: centsToUsd(BigInt(row.cash_delta_cents)), reason: row.reason } : null,
    evidence: evidenceRows.map((item) => JSON.parse(item.payload_json)),
  };
}

export function history() {
  const rows = db.prepare("SELECT id FROM runs ORDER BY created_at DESC LIMIT 50").all() as Array<{ id: string }>;
  return rows.map((row) => getRun(row.id));
}

export function portfolio() {
  const p = db.prepare("SELECT * FROM portfolios WHERE id=?").get(portfolioId) as any;
  const holdings = db.prepare("SELECT symbol, quantity_micros, cost_basis_cents FROM holdings WHERE portfolio_id=? AND quantity_micros > 0").all(portfolioId) as any[];
  return { id: p.id, mode: p.mode, cashUsd: centsToUsd(BigInt(p.cash_cents)), version: p.version, holdings: holdings.map((h) => ({ symbol: h.symbol, quantity: quantityToString(BigInt(h.quantity_micros)), costBasisUsd: centsToUsd(BigInt(h.cost_basis_cents)) })) };
}

export async function market() {
  return research.call("scan_market", { top_n: 5 });
}

export function createConversation(symbol?: string) {
  const id = randomUUID();
  db.prepare("INSERT INTO conversations (id, mode, symbol, created_at) VALUES (?, ?, ?, ?)").run(id, config.DATA_MODE, symbol ?? null, now());
  return { id, mode: config.DATA_MODE, symbol: symbol ?? null, messages: [] };
}

export async function ask(conversationId: string, text: string, idempotencyKey: string, symbol?: string, runId?: string) {
  const conversation = db.prepare("SELECT * FROM conversations WHERE id=?").get(conversationId) as any;
  if (!conversation) throw Object.assign(new Error("Conversation not found"), { status: 404 });
  const inputHash = hash({ text, symbol, runId });
  const existing = db.prepare("SELECT id, input_hash FROM messages WHERE conversation_id=? AND idempotency_key=?").get(conversationId, idempotencyKey) as any;
  if (existing) {
    if (existing.input_hash !== inputHash) throw Object.assign(new Error("Idempotency key already used with different input"), { status: 409 });
    return conversationView(conversationId);
  }
  const priorRows = db.prepare("SELECT role, text FROM messages WHERE conversation_id=? AND status='complete' ORDER BY created_at DESC, rowid DESC LIMIT 8").all(conversationId) as Array<{ role: "user" | "assistant"; text: string }>;
  const history = priorRows.reverse();
  const userId = randomUUID();
  db.prepare("INSERT INTO messages (id, conversation_id, role, text, symbol, run_id, idempotency_key, input_hash, status, created_at) VALUES (?, ?, 'user', ?, ?, ?, ?, ?, 'complete', ?)")
    .run(userId, conversationId, text, symbol ?? conversation.symbol, runId ?? null, idempotencyKey, inputHash, now());
  const activeSymbol = symbol ?? conversation.symbol ?? "BTC";
  let evidence: Evidence;
  if (runId) {
    const run = getRun(runId);
    evidence = run.evidence[0] as Evidence;
    history.push({ role: "assistant", text: `[SAVED_DECISION] ${JSON.stringify({ symbol: run.symbol, decision: run.decision, simulation: run.simulation })}` });
  } else {
    evidence = await research.call(/compare/i.test(text) ? "compare_tokens" : /market/i.test(text) && !/token/i.test(text) ? "market_overview" : "analyze_token", /compare/i.test(text) ? { symbols: `${activeSymbol},BTC`, intent: "swing" } : /market/i.test(text) && !/token/i.test(text) ? {} : { symbol: activeSymbol });
  }
  try {
    const invocation = await model.answerQuestion({ question: text, symbol: activeSymbol, evidence: [evidence], history });
    const assistantId = randomUUID();
    transaction(() => {
      if (!runId) {
        db.prepare("INSERT INTO evidence (id, message_id, purpose, tool, symbol, status, mode, as_of, retrieved_at, payload_json) VALUES (?, ?, 'chat', ?, ?, ?, ?, ?, ?, ?)")
          .run(evidence.id, assistantId, evidence.tool, activeSymbol, evidence.status, evidence.dataMode, evidence.asOf, evidence.retrievedAt, JSON.stringify(evidence));
      }
      db.prepare("INSERT INTO messages (id, conversation_id, role, text, symbol, run_id, status, citations_json, created_at) VALUES (?, ?, 'assistant', ?, ?, ?, 'complete', ?, ?)")
        .run(assistantId, conversationId, invocation.output.text, activeSymbol, runId ?? null, JSON.stringify(invocation.output.citations), now());
      saveModelCall("chat", invocation.audit, undefined, assistantId);
    });
    return conversationView(conversationId);
  } catch (error) {
    db.prepare("UPDATE messages SET status='failed' WHERE id=?").run(userId);
    throw error;
  }
}

export function conversationView(id: string) {
  const conversation = db.prepare("SELECT * FROM conversations WHERE id=?").get(id) as any;
  if (!conversation) throw Object.assign(new Error("Conversation not found"), { status: 404 });
  const messages = db.prepare("SELECT id, role, text, symbol, run_id, status, citations_json, created_at FROM messages WHERE conversation_id=? ORDER BY created_at, rowid").all(id) as any[];
  return { id, mode: conversation.mode, symbol: conversation.symbol, messages: messages.map((m) => ({ id: m.id, role: m.role, text: m.text, symbol: m.symbol, runId: m.run_id, status: m.status, citations: JSON.parse(m.citations_json), createdAt: m.created_at })) };
}
