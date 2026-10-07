import { FixtureResearchAdapter } from "../../../tests/support/providers.js";
import { describe, expect, it, vi } from "vitest";
import { RyoRestAdapter } from "./index.js";

describe("RyoRestAdapter", () => {
  it("provides an explicitly synthetic timestamped fixture series", async () => {
    const result = await new FixtureResearchAdapter().call("analyze_token", { symbol: "SOL" });
    const candles = result.data.candles as Array<Record<string, unknown>>;
    expect(candles).toHaveLength(25);
    expect(candles[0]).toMatchObject({ open: expect.any(Number), high: expect.any(Number), low: expect.any(Number), close: expect.any(Number), volume: expect.any(Number) });
    expect(Date.parse(String(candles[0]!.timestamp))).toBeLessThan(Date.parse(String(candles.at(-1)!.timestamp)));
    expect(result).toMatchObject({ dataMode: "live", data: { candleInterval: "1h", candleWindow: "24h", volumeUnit: "USD" } });
    expect(result.warnings[0]).toContain("Synthetic fixture data");
  });

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

  it("rejects non-live provider envelopes instead of displaying them", async () => {
    for (const mode of ["mixed", "simulated", "unknown"]) {
      const fetcher = async () => new Response(JSON.stringify({ result: {
        schema_version: "1", tool: "analyze_token", status: "ok", data_mode: mode,
        as_of: new Date().toISOString(), data: { market: { price_usd: 100 } },
        summary: { headline: "Untrusted mode", key_points: [] }, warnings: [],
      } }));
      await expect(new RyoRestAdapter("https://example.com", "test", fetcher).call("analyze_token", { symbol: "SOL" }))
        .rejects.toMatchObject({ code: "NON_LIVE_EVIDENCE" });
    }
  });

  it("surfaces a safe transient provider detail without exposing the key", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ code: "VALIDATION_FAILED", message: "couldn't analyze SOL right now", trace_id: "trace-1" }), { status: 400 }));
    const adapter = new RyoRestAdapter("https://example.com/api/mcp", "secret-key", fetcher as typeof fetch);
    await expect(adapter.call("analyze_token", { symbol: "SOL" })).rejects.toMatchObject({
      message: "RYO analyze_token failed: couldn't analyze SOL right now", code: "RYO_REQUEST_FAILED", retryable: true, status: 503,
    });
  });
});
