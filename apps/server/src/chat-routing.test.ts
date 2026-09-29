import { describe, expect, it } from "vitest";
import { buildWebSearchQuery, needsWebSearch } from "./chat-routing.js";

describe("chat web-search routing", () => {
  it.each(["What is the latest SOL news?", "Any recent protocol updates?", "Search the web for the exchange announcement", "Was there a hack or exploit?"])("routes public web context: %s", (question) => {
    expect(needsWebSearch(question)).toBe(true);
  });

  it.each(["What is the current BTC price?", "Why did the agent choose HOLD?", "Compare SOL and BTC momentum", "Explain RSI"])("keeps market-data questions on RYO evidence: %s", (question) => {
    expect(needsWebSearch(question)).toBe(false);
  });

  it("builds a bounded token-specific query", () => {
    expect(buildWebSearchQuery("latest news", "SOL")).toBe("SOL cryptocurrency latest news");
    expect(buildWebSearchQuery("x".repeat(600), "BTC")).toHaveLength(500);
  });
});
