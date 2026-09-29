import { randomUUID } from "node:crypto";
import { config } from "./config.js";
import { db, transaction } from "./db.js";

export function consumeHttpRequest(sessionId: string, instant = new Date(), limit = config.HTTP_REQUESTS_PER_SESSION_MINUTE): void {
  const timestamp = instant.toISOString();
  const minute = timestamp.slice(0, 16);
  transaction(() => {
    const row = db.prepare("SELECT request_count FROM http_rate_usage WHERE session_id=? AND minute_utc=?").get(sessionId, minute) as { request_count: number } | undefined;
    if ((row?.request_count ?? 0) >= limit) {
      throw Object.assign(new Error("Session request limit reached; retry after the current UTC minute"), { status: 429, code: "HTTP_RATE_LIMITED", retryable: true });
    }
    db.prepare("INSERT INTO http_rate_usage (session_id, minute_utc, request_count, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(session_id, minute_utc) DO UPDATE SET request_count=request_count+1, updated_at=excluded.updated_at")
      .run(sessionId, minute, timestamp);
  });
}

interface ProviderBudgetOptions {
  now?: () => Date;
  dailyCap?: number;
  perSessionHourCap?: number;
}

export async function withProviderBudget<T>(
  provider: "ryo" | "gemini",
  purpose: string,
  sessionId: string,
  operation: () => Promise<T>,
  options: ProviderBudgetOptions = {},
): Promise<T> {
  const clock = options.now ?? (() => new Date());
  const instant = clock();
  const timestamp = instant.toISOString();
  const day = timestamp.slice(0, 10);
  const hour = timestamp.slice(0, 13);
  const dailyCap = options.dailyCap ?? (provider === "ryo" ? config.RYO_DAILY_CALL_CAP : config.GEMINI_DAILY_CALL_CAP);
  const perSessionHourCap = options.perSessionHourCap ?? (provider === "gemini" ? config.MODEL_CALLS_PER_SESSION_HOUR : undefined);
  const usageId = transaction(() => {
    const daily = db.prepare("SELECT COUNT(*) AS count FROM provider_usage WHERE provider=? AND day_utc=?").get(provider, day) as { count: number };
    if (daily.count >= dailyCap) {
      throw Object.assign(new Error(`${provider.toUpperCase()} operator daily call cap reached`), { status: 429, code: "PROVIDER_DAILY_CAP", retryable: false });
    }
    if (perSessionHourCap !== undefined) {
      const hourly = db.prepare("SELECT COUNT(*) AS count FROM provider_usage WHERE provider=? AND session_id=? AND hour_utc=?").get(provider, sessionId, hour) as { count: number };
      if (hourly.count >= perSessionHourCap) {
        throw Object.assign(new Error("Session model-call limit reached; retry after the current UTC hour"), { status: 429, code: "MODEL_RATE_LIMITED", retryable: true });
      }
    }
    const id = randomUUID();
    db.prepare("INSERT INTO provider_usage (id, session_id, provider, purpose, day_utc, hour_utc, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'reserved', ?)")
      .run(id, sessionId, provider, purpose, day, hour, timestamp);
    return id;
  });
  try {
    const result = await operation();
    db.prepare("UPDATE provider_usage SET status='completed', completed_at=? WHERE id=?").run(clock().toISOString(), usageId);
    return result;
  } catch (error) {
    const code = error instanceof Error && "code" in error && typeof error.code === "string" ? error.code : "PROVIDER_CALL_FAILED";
    db.prepare("UPDATE provider_usage SET status='failed', error_code=?, completed_at=? WHERE id=?").run(code, clock().toISOString(), usageId);
    throw error;
  }
}
