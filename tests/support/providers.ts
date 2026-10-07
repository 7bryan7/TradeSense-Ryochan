// Test-only providers. Never imported by the application or shipped in production.
import { randomUUID, createHash } from "node:crypto";
import { evidenceSchema, decisionSchema, chatAnswerSchema, type Evidence, type Decision, type ChatAnswer } from "@tradesense/core";
import type { ResearchAdapter, RyoTool, ModelAdapter, DecisionModelInput, ChatModelInput, ModelInvocation } from "@tradesense/adapters";
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const POLICY_VERSION = "paper-long-only-v1";
const DECISION_PROMPT_VERSION = "decision-v2-multi-tool";
const CHAT_PROMPT_VERSION = "chat-v2-classified";
const fixtureTokens: Record<string, { price: number; change24h: number; volume24h: number; rsi14: number; atr14: number }> = {
  BTC: { price: 64250, change24h: 2.8, volume24h: 31_400_000_000, rsi14: 58, atr14: 2150 },
  ETH: { price: 3450, change24h: -1.4, volume24h: 15_200_000_000, rsi14: 44, atr14: 138 },
  SOL: { price: 172.4, change24h: 5.7, volume24h: 3_100_000_000, rsi14: 67, atr14: 9.8 },
};

function token(symbol: string) {
  const value = fixtureTokens[symbol];
  if (!value) throw new Error(`Fixture token ${symbol} is unsupported`);
  return value;
}

function fixtureCandles(symbol: string, asOf: string) {
  const values = token(symbol);
  const count = 25;
  const end = Date.parse(asOf);
  const startPrice = values.price / (1 + values.change24h / 100);
  const rawVolumes = Array.from({ length: count }, (_, index) => 0.82 + ((index * 7 + symbol.charCodeAt(0)) % 9) / 20);
  const volumeScale = values.volume24h / rawVolumes.reduce((total, value) => total + value, 0);
  let previous = startPrice;
  return Array.from({ length: count }, (_, index) => {
    const progress = index / (count - 1);
    const baseline = startPrice + (values.price - startPrice) * progress;
    const wave = Math.sin(progress * Math.PI * 4) * values.price * 0.006 * Math.sin(progress * Math.PI);
    const close = index === count - 1 ? values.price : baseline + wave;
    const open = index === 0 ? startPrice : previous;
    const spread = values.price * (0.0025 + (index % 4) * 0.00045);
    previous = close;
    return {
      timestamp: new Date(end - (count - 1 - index) * 3_600_000).toISOString(),
      open: Number(open.toFixed(8)), high: Number((Math.max(open, close) + spread).toFixed(8)),
      low: Number(Math.max(0.00000001, Math.min(open, close) - spread).toFixed(8)), close: Number(close.toFixed(8)),
      volume: Number((rawVolumes[index]! * volumeScale).toFixed(2)),
    };
  });
}

export class FixtureResearchAdapter implements ResearchAdapter {
  async call(tool: RyoTool, args: Record<string, unknown> = {}): Promise<Evidence> {
    const asOf = new Date().toISOString();
    const symbol = String(args.symbol ?? "BTC").toUpperCase();
    let data: Record<string, unknown>;
    let headline: string;
    if (tool === "market_overview") {
      data = { regime: "risk-on", fearGreed: 62, breadthPercent: 58, topMovers: ["SOL", "BTC", "ETH"] };
      headline = "Fixture market breadth is positive with moderate greed";
    } else if (tool === "scan_market") {
      data = { candidates: Object.entries(fixtureTokens).map(([ticker, values]) => ({ symbol: ticker, ...values })).sort((a, b) => b.change24h - a.change24h) };
      headline = "SOL leads the fixture shortlist on 24-hour momentum";
    } else if (tool === "compare_tokens") {
      const symbols = String(args.symbols ?? "BTC,ETH").split(/[ ,]+/).filter(Boolean).map((s) => s.toUpperCase());
      data = { intent: args.intent ?? "swing", tokens: symbols.map((ticker) => ({ symbol: ticker, ...token(ticker) })) };
      headline = `Compared ${symbols.join(", ")} using the same fixture window`;
    } else if (tool === "monitor_market_sentiment_shift") {
      data = { timeWindow: "7d", currentFearGreed: 62, previousFearGreed: 54, change: 8, regime: "improving" };
      headline = "Fixture sentiment improved over seven days";
    } else {
      const values = token(symbol);
      data = { symbol, currency: "USD", ...values, ...(tool === "analyze_token" ? { candles: fixtureCandles(symbol, asOf), candleInterval: "1h", candleWindow: "24h", volumeUnit: "USD" } : {}), safety: { status: "clear", coverage: "live", flags: [] }, performance: { "24h": values.change24h } };
      headline = `${symbol} is ${values.change24h >= 0 ? "up" : "down"} ${Math.abs(values.change24h)}% over 24 hours in fixture data`;
    }
    return evidenceSchema.parse({
      id: randomUUID(), tool, ...(tool.includes("token") || tool === "deep_analysis" ? { symbol } : {}), status: "ok", dataMode: "live", asOf, retrievedAt: asOf, data,
      summary: { headline, keyPoints: [] }, warnings: ["Synthetic fixture data for offline development; not a live market observation"],
    });
  }
}

export class FixtureModelAdapter implements ModelAdapter {
  async createDecision(input: DecisionModelInput): Promise<ModelInvocation<Decision>> {
    const evidence = input.evidence.find((item) => item.tool === "analyze_token") ?? input.evidence[0];
    if (!evidence) throw new Error("Decision requires evidence");
    const deepEvidence = input.evidence.find((item) => item.tool === "deep_analysis");
    const contextualEvidence = input.evidence.filter((item) => item.tool === "scan_market" || item.tool === "compare_tokens");
    const change = Number(evidence.data.change24h ?? 0);
    const rsi = Number(evidence.data.rsi14 ?? 50);
    const action = change >= 2 && rsi < 70 ? "BUY" : change <= -3 ? "SELL" : "HOLD";
    const output = decisionSchema.parse({
      action,
      summary: action === "BUY" ? "Momentum is positive without an overbought RSI reading." : action === "SELL" ? "Momentum has weakened beyond the fixture risk threshold." : "Evidence is mixed, so the simulated portfolio stays unchanged.",
      supportingEvidence: [evidence.id, ...(deepEvidence ? [deepEvidence.id] : []), ...contextualEvidence.filter((item) => item.status === "ok").map((item) => item.id)], counterEvidence: rsi >= 65 ? [evidence.id] : [],
      risks: rsi >= 65 ? ["RSI is approaching an overbought range"] : ["Short-window momentum can reverse"],
      missingData: input.evidence.filter((item) => item.status !== "ok").map((item) => `${item.tool} returned ${item.status}`),
      outlook: { direction: action === "BUY" ? "upside bias" : action === "SELL" ? "downside risk" : "neutral", horizon: "24 hours", invalidation: "A material reversal in price momentum or safety coverage" },
      confidence: "medium", model: "fixture-rules-v1", promptVersion: DECISION_PROMPT_VERSION, policyVersion: POLICY_VERSION,
    });
    return { output, audit: { provider: "gemini", model: output.model, promptVersion: output.promptVersion, inputHash: hash(input), request: input, response: output, generation: { deterministic: true } } };
  }

  async answerQuestion(input: ChatModelInput): Promise<ModelInvocation<ChatAnswer>> {
    const evidence = input.evidence[0];
    if (!evidence) throw new Error("Chat answer requires evidence");
    const webEvidence = input.evidence.find((item) => item.tool === "tavily_search");
    const savedDecision = [...input.history].reverse().find((message) => message.text.startsWith("[SAVED_DECISION] "))?.text.slice("[SAVED_DECISION] ".length);
    const saved = savedDecision ? JSON.parse(savedDecision) as { symbol?: string; decision?: { action?: string; summary?: string } } : undefined;
    const citations = webEvidence ? [evidence.id, webEvidence.id] : [evidence.id];
    const output = chatAnswerSchema.parse({
      text: saved
        ? `The saved ${saved.symbol ?? input.symbol} decision was ${saved.decision?.action ?? "unavailable"}. ${saved.decision?.summary ?? "No explanation was saved."} This answer uses the ${evidence.dataMode} snapshot from ${evidence.asOf}.`
        : `${evidence.summary.headline}. Evidence status is ${evidence.status}; observed at ${evidence.asOf}.${webEvidence ? ` Additional public context: ${webEvidence.summary.headline}.` : ""}`,
      citations,
      classification: {
        observedFacts: [
          { text: `${evidence.summary.headline} Observed at ${evidence.asOf}.`, evidenceIds: [evidence.id] },
          ...(webEvidence ? [{ text: `${webEvidence.summary.headline} Retrieved as supplementary public web context.`, evidenceIds: [webEvidence.id] }] : []),
        ],
        derivedCalculations: [],
        interpretations: [{ text: saved ? `The saved paper decision is ${saved.decision?.action ?? "unavailable"}; this describes the recorded agent output, not a guaranteed market outcome.` : `The available ${evidence.status} evidence supports the answer above within its stated coverage.`, evidenceIds: citations }],
      },
      limitations: [...evidence.warnings, ...(webEvidence?.warnings ?? [])], suggestedQuestions: ["What evidence would change this view?"],
      model: "fixture-rules-v1", promptVersion: CHAT_PROMPT_VERSION,
    });
    return { output, audit: { provider: "gemini", model: output.model, promptVersion: output.promptVersion, inputHash: hash(input), request: input, response: output, generation: { deterministic: true } } };
  }
}


export * from "@tradesense/adapters";
