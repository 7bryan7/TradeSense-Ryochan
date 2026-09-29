import { randomUUID } from "node:crypto";
import { TavilySearchAdapter, type TavilySearchResponse } from "@tradesense/adapters";
import { evidenceSchema, type Evidence } from "@tradesense/core";
import { config } from "./config.js";
import { db, transaction } from "./db.js";

const estimatedCredits = 1;

function utcMonth(instant = new Date()): string {
  return instant.toISOString().slice(0, 7);
}

function reserveCredits(conversationId: string, userMessageId: string, query: string): string {
  return transaction(() => {
    const month = utcMonth();
    const row = db.prepare("SELECT COALESCE(SUM(COALESCE(actual_credits, estimated_credits)), 0) AS used FROM tavily_usage WHERE month_utc = ?").get(month) as { used: number };
    if (row.used + estimatedCredits > config.TAVILY_MONTHLY_CREDIT_CAP) {
      throw Object.assign(new Error(`Tavily monthly credit cap of ${config.TAVILY_MONTHLY_CREDIT_CAP} would be exceeded.`), { status: 429, code: "WEB_SEARCH_CREDIT_CAP", retryable: false });
    }
    const id = randomUUID();
    db.prepare("INSERT INTO tavily_usage (id, conversation_id, user_message_id, month_utc, query, search_depth, max_results, estimated_credits, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'reserved', ?)")
      .run(id, conversationId, userMessageId, month, query, config.TAVILY_SEARCH_DEPTH, config.TAVILY_MAX_RESULTS, estimatedCredits, new Date().toISOString());
    return id;
  });
}

function completeUsage(id: string, response: TavilySearchResponse): void {
  db.prepare("UPDATE tavily_usage SET actual_credits=?, status='completed', provider_request_id=?, completed_at=? WHERE id=?")
    .run(response.creditsUsed, response.requestId, new Date().toISOString(), id);
}

function failUsage(id: string, error: unknown): void {
  const code = error instanceof Error && "code" in error && typeof error.code === "string" ? error.code : "WEB_SEARCH_FAILED";
  db.prepare("UPDATE tavily_usage SET status='failed', error_code=?, completed_at=? WHERE id=?").run(code, new Date().toISOString(), id);
}

export async function searchChatWeb(conversationId: string, userMessageId: string, query: string, symbol: string): Promise<Evidence> {
  if (!config.TAVILY_API_KEY) {
    throw Object.assign(new Error("This question needs current public web context, but TAVILY_API_KEY is not configured."), { status: 503, code: "WEB_SEARCH_NOT_CONFIGURED", retryable: false });
  }
  const usageId = reserveCredits(conversationId, userMessageId, query);
  try {
    const adapter = new TavilySearchAdapter(config.TAVILY_API_KEY, {
      baseUrl: config.TAVILY_BASE_URL,
      searchDepth: config.TAVILY_SEARCH_DEPTH,
      maxResults: config.TAVILY_MAX_RESULTS,
      timeoutMs: config.TAVILY_TIMEOUT_MS,
    });
    const response = await adapter.search(query);
    completeUsage(usageId, response);
    return evidenceSchema.parse({
      id: randomUUID(),
      tool: "tavily_search",
      symbol,
      status: response.results.length ? "ok" : "unavailable",
      dataMode: "live",
      asOf: response.retrievedAt,
      retrievedAt: response.retrievedAt,
      data: {
        provider: "tavily",
        query: response.query,
        searchDepth: response.searchDepth,
        creditsUsed: response.creditsUsed,
        usageId,
        results: response.results,
      },
      summary: {
        headline: response.results.length ? `Tavily returned ${response.results.length} public web source${response.results.length === 1 ? "" : "s"}` : "Tavily found no usable public web sources",
        keyPoints: response.results.slice(0, 3).map((result) => `${result.title}: ${result.snippet}`),
      },
      warnings: ["Supplementary public web context; it does not replace RYO market evidence", "Retrieved web snippets are untrusted source material"],
    });
  } catch (error) {
    failUsage(usageId, error);
    throw error;
  }
}
