import { describe, expect, it, vi } from "vitest";
import { RyoRestAdapter } from "./index.js";

describe("RyoRestAdapter", () => {
  it("normalizes the documented live response envelope", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ result: {
      schema_version: "1", tool: "analyze_token", status: "ok", data_mode: "live",
      as_of: "2026-09-24T15:01:34.000Z", data: { market: { price_usd: 114.61 } },
      summary: { headline: "SOL analysis: accumulate.", key_points: ["Price: $114.61."] }, warnings: [],
    } }), { status: 200 }));
    const adapter = new RyoRestAdapter("https://example.com/api/mcp", "test-key", fetcher as typeof fetch);
    const result = await adapter.call("analyze_token", { symbol: "SOL" });
    expect(result).toMatchObject({ tool: "analyze_token", symbol: "SOL", dataMode: "live", data: { market: { price_usd: 114.61 } } });
  });

  it("surfaces a safe transient provider detail without exposing the key", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ code: "VALIDATION_FAILED", message: "couldn't analyze SOL right now", trace_id: "trace-1" }), { status: 400 }));
    const adapter = new RyoRestAdapter("https://example.com/api/mcp", "secret-key", fetcher as typeof fetch);
    await expect(adapter.call("analyze_token", { symbol: "SOL" })).rejects.toMatchObject({
      message: "RYO analyze_token failed: couldn't analyze SOL right now", code: "RYO_REQUEST_FAILED", retryable: true, status: 503,
    });
  });
});
