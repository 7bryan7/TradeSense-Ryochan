import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { config } from "./config.js";

mkdirSync(dirname(config.DATABASE_PATH), { recursive: true });
export const db = new DatabaseSync(config.DATABASE_PATH);
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

export function migrate(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY, created_at TEXT NOT NULL, last_seen_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS portfolios (
      id TEXT PRIMARY KEY, session_id TEXT REFERENCES sessions(id), mode TEXT NOT NULL, cash_cents INTEGER NOT NULL,
      realized_pnl_cents INTEGER NOT NULL DEFAULT 0, version INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS holdings (
      portfolio_id TEXT NOT NULL REFERENCES portfolios(id), symbol TEXT NOT NULL,
      quantity_micros INTEGER NOT NULL, cost_basis_cents INTEGER NOT NULL,
      PRIMARY KEY (portfolio_id, symbol)
    );
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY, session_id TEXT REFERENCES sessions(id), portfolio_id TEXT NOT NULL REFERENCES portfolios(id), symbol TEXT NOT NULL,
      idempotency_key TEXT NOT NULL, input_hash TEXT NOT NULL, mode TEXT NOT NULL,
      status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT, completed_at TEXT,
      failure_stage TEXT, failure_code TEXT, failure_message TEXT,
      attempt_count INTEGER NOT NULL DEFAULT 1,
      UNIQUE(portfolio_id, idempotency_key)
    );
    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY, run_id TEXT, message_id TEXT, purpose TEXT NOT NULL,
      tool TEXT NOT NULL, symbol TEXT, status TEXT NOT NULL, mode TEXT NOT NULL,
      as_of TEXT NOT NULL, retrieved_at TEXT NOT NULL, payload_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY, run_id TEXT UNIQUE NOT NULL REFERENCES runs(id), action TEXT NOT NULL,
      payload_json TEXT NOT NULL, policy_input_json TEXT, portfolio_version INTEGER,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS fills (
      id TEXT PRIMARY KEY, decision_id TEXT UNIQUE NOT NULL REFERENCES decisions(id), symbol TEXT NOT NULL,
      action TEXT NOT NULL, outcome TEXT NOT NULL, quantity_micros INTEGER NOT NULL,
      fill_price_cents INTEGER NOT NULL, fee_cents INTEGER NOT NULL, cash_delta_cents INTEGER NOT NULL,
      reason TEXT NOT NULL, portfolio_version_at_apply INTEGER, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY, session_id TEXT REFERENCES sessions(id), mode TEXT NOT NULL, symbol TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES conversations(id), role TEXT NOT NULL,
      text TEXT NOT NULL, symbol TEXT, run_id TEXT, idempotency_key TEXT, input_hash TEXT,
      parent_message_id TEXT, status TEXT NOT NULL, citations_json TEXT NOT NULL DEFAULT '[]',
      failure_stage TEXT, failure_code TEXT, failure_message TEXT, attempt_count INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL, updated_at TEXT,
      UNIQUE(conversation_id, idempotency_key)
    );
    CREATE TABLE IF NOT EXISTS model_calls (
      id TEXT PRIMARY KEY, purpose TEXT NOT NULL, run_id TEXT, message_id TEXT,
      provider TEXT NOT NULL, model TEXT NOT NULL, prompt_version TEXT NOT NULL,
      input_hash TEXT NOT NULL, request_json TEXT NOT NULL, response_json TEXT NOT NULL,
      generation_json TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tavily_usage (
      id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL, user_message_id TEXT NOT NULL UNIQUE,
      assistant_message_id TEXT,
      month_utc TEXT NOT NULL, query TEXT NOT NULL, search_depth TEXT NOT NULL,
      max_results INTEGER NOT NULL, estimated_credits INTEGER NOT NULL, actual_credits INTEGER,
      status TEXT NOT NULL, provider_request_id TEXT, error_code TEXT,
      created_at TEXT NOT NULL, completed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), mode TEXT NOT NULL,
      symbols_json TEXT NOT NULL, cadence_seconds INTEGER NOT NULL, max_runs_per_day INTEGER NOT NULL,
      status TEXT NOT NULL, next_slot_at TEXT NOT NULL, last_slot_at TEXT, last_run_id TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS schedule_slots (
      id TEXT PRIMARY KEY, schedule_id TEXT NOT NULL REFERENCES schedules(id), session_id TEXT NOT NULL REFERENCES sessions(id),
      symbol TEXT NOT NULL, slot_at TEXT NOT NULL, status TEXT NOT NULL, attempt_count INTEGER NOT NULL DEFAULT 0,
      lease_owner TEXT, lease_expires_at TEXT, run_id TEXT, error_code TEXT, error_message TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      UNIQUE(schedule_id, symbol, slot_at)
    );
    CREATE TABLE IF NOT EXISTS http_rate_usage (
      session_id TEXT NOT NULL REFERENCES sessions(id), minute_utc TEXT NOT NULL,
      request_count INTEGER NOT NULL, updated_at TEXT NOT NULL,
      PRIMARY KEY(session_id, minute_utc)
    );
    CREATE TABLE IF NOT EXISTS provider_usage (
      id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), provider TEXT NOT NULL,
      purpose TEXT NOT NULL, day_utc TEXT NOT NULL, hour_utc TEXT NOT NULL, status TEXT NOT NULL,
      error_code TEXT, created_at TEXT NOT NULL, completed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_tavily_usage_month ON tavily_usage(month_utc);
    CREATE INDEX IF NOT EXISTS idx_schedules_due ON schedules(status, next_slot_at);
    CREATE INDEX IF NOT EXISTS idx_schedule_slots_claim ON schedule_slots(status, lease_expires_at, slot_at);
    CREATE INDEX IF NOT EXISTS idx_provider_usage_daily ON provider_usage(provider, day_utc);
    CREATE INDEX IF NOT EXISTS idx_provider_usage_session_hour ON provider_usage(provider, session_id, hour_utc);
  `);
  const ensureColumn = (table: string, name: string, definition: string) => {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
    if (!columns.some((column) => column.name === name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
  };
  ensureColumn("runs", "updated_at", "TEXT");
  ensureColumn("runs", "failure_stage", "TEXT");
  ensureColumn("runs", "failure_code", "TEXT");
  ensureColumn("runs", "failure_message", "TEXT");
  ensureColumn("runs", "attempt_count", "INTEGER NOT NULL DEFAULT 1");
  ensureColumn("runs", "session_id", "TEXT");
  ensureColumn("decisions", "policy_input_json", "TEXT");
  ensureColumn("decisions", "portfolio_version", "INTEGER");
  ensureColumn("fills", "portfolio_version_at_apply", "INTEGER");
  ensureColumn("portfolios", "session_id", "TEXT");
  ensureColumn("conversations", "session_id", "TEXT");
  ensureColumn("messages", "parent_message_id", "TEXT");
  ensureColumn("messages", "failure_stage", "TEXT");
  ensureColumn("messages", "failure_code", "TEXT");
  ensureColumn("messages", "failure_message", "TEXT");
  ensureColumn("messages", "attempt_count", "INTEGER NOT NULL DEFAULT 1");
  ensureColumn("messages", "updated_at", "TEXT");
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolios_session_mode ON portfolios(session_id, mode) WHERE session_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_runs_session ON runs(session_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id, created_at);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_parent ON messages(parent_message_id) WHERE parent_message_id IS NOT NULL;
  `);
  const usageColumns = db.prepare("PRAGMA table_info(tavily_usage)").all() as Array<{ name: string }>;
  if (!usageColumns.some((column) => column.name === "assistant_message_id")) {
    db.exec("ALTER TABLE tavily_usage ADD COLUMN assistant_message_id TEXT");
  }
  const initialCash = Math.round(config.SIM_INITIAL_CASH * 100);
  db.prepare("INSERT OR IGNORE INTO portfolios (id, mode, cash_cents, created_at) VALUES (?, ?, ?, ?)")
    .run(`demo-${config.DATA_MODE}`, config.DATA_MODE, initialCash, new Date().toISOString());
}

export function transaction<T>(work: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try { const result = work(); db.exec("COMMIT"); return result; }
  catch (error) { db.exec("ROLLBACK"); throw error; }
}
