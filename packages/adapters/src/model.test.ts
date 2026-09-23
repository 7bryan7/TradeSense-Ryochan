import { describe, expect, it, vi } from "vitest";
import type { GenerateContentParameters, GenerateContentResponse } from "@google/genai";
import type { Evidence } from "@tradesense/core";
import { GeminiModelAdapter } from "./model.js";

const evidence: Evidence = {
  id: "evidence-1", tool: "analyze_token", symbol: "SOL", status: "ok", dataMode: "fixture",
  asOf: "2026-09-23T00:00:00.000Z", retrievedAt: "2026-09-23T00:00:01.000Z",
  data: { price: 172.4, change24h: 5.7, rsi14: 67 },
  summary: { headline: "SOL rose 5.7%", keyPoints: [] }, warnings: [],
};

function clientWith(responses: unknown[]) {
  const generateContent = vi.fn(async (_parameters: GenerateContentParameters) => {
    const response = responses.shift();
    if (response instanceof Error) throw response;
    return { text: JSON.stringify(response) } as GenerateContentResponse;
  });
  return { client: { models: { generateContent } }, generateContent };
}

describe("GeminiModelAdapter", () => {
  it("validates a structured decision and adds trusted metadata", async () => {
    const fake = clientWith([{ action: "BUY", summary: "Positive momentum with elevated RSI risk.", supportingEvidence: [evidence.id], counterEvidence: [evidence.id], risks: ["Momentum may reverse"], missingData: [], outlook: { direction: "upside bias", horizon: "24 hours", invalidation: "Momentum turns negative" }, confidence: "medium" }]);
    const adapter = new GeminiModelAdapter("test-key", "gemini-3.5-flash-lite", fake.client);
    const result = await adapter.createDecision({ symbol: "SOL", evidence: [evidence], portfolio: { cashUsd: "10000.00", positionQuantity: "0", positionCostBasisUsd: "0.00" } });
    expect(result.output.action).toBe("BUY");
    expect(result.output.model).toBe("gemini-3.5-flash-lite");
    expect(result.audit.provider).toBe("gemini");
  });

  it("repairs one answer that cites evidence outside the supplied set", async () => {
    const base = { text: "SOL has positive fixture momentum.", limitations: [], suggestedQuestions: [] };
    const fake = clientWith([{ ...base, citations: ["invented"] }, { ...base, citations: [evidence.id] }]);
    const adapter = new GeminiModelAdapter("test-key", "gemini-3.5-flash-lite", fake.client);
    const result = await adapter.answerQuestion({ question: "What changed?", symbol: "SOL", evidence: [evidence], history: [] });
    expect(result.output.citations).toEqual([evidence.id]);
    expect(fake.generateContent).toHaveBeenCalledTimes(2);
  });

  it("retries an explicit transient provider failure", async () => {
    const transient = Object.assign(new Error("Service unavailable"), { status: 503 });
    const response = { action: "HOLD", summary: "Evidence is mixed.", supportingEvidence: [evidence.id], counterEvidence: [], risks: ["Momentum may reverse"], missingData: [], outlook: { direction: "neutral", horizon: "24 hours", invalidation: "Momentum changes materially" }, confidence: "medium" };
    const fake = clientWith([transient, response]);
    const adapter = new GeminiModelAdapter("test-key", "gemini-3.5-flash-lite", fake.client);
    const result = await adapter.createDecision({ symbol: "SOL", evidence: [evidence], portfolio: { cashUsd: "10000.00", positionQuantity: "0", positionCostBasisUsd: "0.00" } });
    expect(result.output.action).toBe("HOLD");
    expect(fake.generateContent).toHaveBeenCalledTimes(2);
  });

  it("returns an actionable error when a configured model is unavailable", async () => {
    const unavailable = Object.assign(new Error("Not found"), { status: 404 });
    const fake = clientWith([unavailable]);
    const adapter = new GeminiModelAdapter("test-key", "retired-model", fake.client);
    await expect(adapter.createDecision({ symbol: "SOL", evidence: [evidence], portfolio: { cashUsd: "10000.00", positionQuantity: "0", positionCostBasisUsd: "0.00" } }))
      .rejects.toMatchObject({ status: 502, code: "MODEL_NOT_AVAILABLE", retryable: false });
    expect(fake.generateContent).toHaveBeenCalledTimes(1);
  });
});
