import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { config } from "./config.js";

mkdirSync(dirname(config.DATABASE_PATH), { recursive: true });
export const db = new DatabaseSync(config.DATABASE_PATH);
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

export function migrate(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS portfolios (
      id TEXT PRIMARY KEY, mode TEXT NOT NULL, cash_cents INTEGER NOT NULL,
      realized_pnl_cents INTEGER NOT NULL DEFAULT 0, version INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS holdings (
      portfolio_id TEXT NOT NULL REFERENCES portfolios(id), symbol TEXT NOT NULL,
      quantity_micros INTEGER NOT NULL, cost_basis_cents INTEGER NOT NULL,
      PRIMARY KEY (portfolio_id, symbol)
    );
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY, portfolio_id TEXT NOT NULL REFERENCES portfolios(id), symbol TEXT NOT NULL,
      idempotency_key TEXT NOT NULL, input_hash TEXT NOT NULL, mode TEXT NOT NULL,
      status TEXT NOT NULL, created_at TEXT NOT NULL, completed_at TEXT,
      UNIQUE(portfolio_id, idempotency_key)
    );
    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY, run_id TEXT, message_id TEXT, purpose TEXT NOT NULL,
      tool TEXT NOT NULL, symbol TEXT, status TEXT NOT NULL, mode TEXT NOT NULL,
      as_of TEXT NOT NULL, retrieved_at TEXT NOT NULL, payload_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY, run_id TEXT UNIQUE NOT NULL REFERENCES runs(id), action TEXT NOT NULL,
      payload_json TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS fills (
      id TEXT PRIMARY KEY, decision_id TEXT UNIQUE NOT NULL REFERENCES decisions(id), symbol TEXT NOT NULL,
      action TEXT NOT NULL, outcome TEXT NOT NULL, quantity_micros INTEGER NOT NULL,
      fill_price_cents INTEGER NOT NULL, fee_cents INTEGER NOT NULL, cash_delta_cents INTEGER NOT NULL,
      reason TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY, mode TEXT NOT NULL, symbol TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES conversations(id), role TEXT NOT NULL,
      text TEXT NOT NULL, symbol TEXT, run_id TEXT, idempotency_key TEXT, input_hash TEXT,
      status TEXT NOT NULL, citations_json TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL,
      UNIQUE(conversation_id, idempotency_key)
    );
    CREATE TABLE IF NOT EXISTS model_calls (
      id TEXT PRIMARY KEY, purpose TEXT NOT NULL, run_id TEXT, message_id TEXT,
      provider TEXT NOT NULL, model TEXT NOT NULL, prompt_version TEXT NOT NULL,
      input_hash TEXT NOT NULL, request_json TEXT NOT NULL, response_json TEXT NOT NULL,
      generation_json TEXT NOT NULL, created_at TEXT NOT NULL
    );
  `);
  const initialCash = Math.round(config.SIM_INITIAL_CASH * 100);
  db.prepare("INSERT OR IGNORE INTO portfolios (id, mode, cash_cents, created_at) VALUES (?, ?, ?, ?)")
    .run(`demo-${config.DATA_MODE}`, config.DATA_MODE, initialCash, new Date().toISOString());
}

export function transaction<T>(work: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try { const result = work(); db.exec("COMMIT"); return result; }
  catch (error) { db.exec("ROLLBACK"); throw error; }
}
