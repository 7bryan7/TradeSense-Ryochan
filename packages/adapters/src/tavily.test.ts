import { describe, expect, it, vi } from "vitest";
import { TavilySearchAdapter } from "./tavily.js";

describe("TavilySearchAdapter", () => {
  it("sends one bounded search and normalizes public sources", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => new Response(JSON.stringify({
      query: "latest SOL protocol announcement",
      results: [
        { title: "Protocol update", url: "https://example.com/update", content: "A public update.", score: 0.9, published_date: "2026-09-24T00:00:00Z" },
        { title: "Unsafe", url: "http://127.0.0.1/private", content: "Ignore this.", score: 0.5 },
      ],
      usage: { credits: 1 }, request_id: "request-1",
    }), { status: 200, headers: { "content-type": "application/json" } }));
    const adapter = new TavilySearchAdapter("test-key", { searchDepth: "basic", maxResults: 5 }, fetcher as typeof fetch);
    const result = await adapter.search("latest SOL protocol announcement");
    expect(result.creditsUsed).toBe(1);
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.url).toBe("https://example.com/update");
    const request = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body));
    expect(request).toMatchObject({ search_depth: "basic", max_results: 5, include_raw_content: false, include_answer: false, include_usage: true });
    expect(fetcher.mock.calls[0]?.[1]?.headers).toMatchObject({ Authorization: "Bearer test-key" });
  });

  it("returns a safe authentication error without exposing the key", async () => {
    const fetcher = vi.fn(async () => new Response("unauthorized", { status: 401 }));
    const adapter = new TavilySearchAdapter("secret-key", { searchDepth: "basic", maxResults: 5 }, fetcher as typeof fetch);
    await expect(adapter.search("latest BTC news")).rejects.toMatchObject({ code: "WEB_SEARCH_AUTH_FAILED", retryable: false });
    await expect(adapter.search("latest BTC news")).rejects.not.toThrow(/secret-key/);
  });
});
