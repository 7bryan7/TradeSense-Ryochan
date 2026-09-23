import { randomUUID } from "node:crypto";
import { evidenceSchema, type Evidence } from "@tradesense/core";
import { z } from "zod";

export * from "./model.js";

export type RyoTool = "market_overview" | "scan_market" | "analyze_token" | "deep_analysis" | "compare_tokens" | "monitor_market_sentiment_shift";

export interface ResearchAdapter {
  call(tool: RyoTool, args?: Record<string, unknown>): Promise<Evidence>;
}

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
      data = { symbol, currency: "USD", ...values, safety: { status: "clear", coverage: "fixture", flags: [] }, performance: { "24h": values.change24h } };
      headline = `${symbol} is ${values.change24h >= 0 ? "up" : "down"} ${Math.abs(values.change24h)}% over 24 hours in fixture data`;
    }
    return evidenceSchema.parse({
      id: randomUUID(), tool, ...(tool.includes("token") || tool === "deep_analysis" ? { symbol } : {}), status: "ok", dataMode: "fixture", asOf, retrievedAt: asOf, data,
      summary: { headline, keyPoints: [] }, warnings: ["Synthetic fixture data for offline development; not a live market observation"],
    });
  }
}

const ryoEnvelopeSchema = z.object({
  schema_version: z.string(), tool: z.string(), status: z.enum(["ok", "partial", "unavailable"]),
  data_mode: z.enum(["live", "mixed", "simulated", "unknown"]), as_of: z.string(),
  data: z.record(z.string(), z.unknown()),
  summary: z.object({ headline: z.string(), key_points: z.array(z.string()).optional() }).passthrough(),
  warnings: z.array(z.string()).default([]),
});

export class RyoRestAdapter implements ResearchAdapter {
  constructor(private readonly baseUrl: string, private readonly key: string) {}

  async call(tool: RyoTool, args: Record<string, unknown> = {}): Promise<Evidence> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/tools/${tool}/call`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) throw new Error(`RYO request failed with HTTP ${response.status}`);
    const body = z.object({ result: z.unknown() }).parse(await response.json());
    const result = ryoEnvelopeSchema.parse(body.result);
    return evidenceSchema.parse({
      id: randomUUID(), tool: result.tool, ...(typeof args.symbol === "string" ? { symbol: args.symbol.toUpperCase() } : {}),
      status: result.status, dataMode: result.data_mode, asOf: new Date(result.as_of).toISOString(), retrievedAt: new Date().toISOString(), data: result.data,
      summary: { headline: result.summary.headline, keyPoints: result.summary.key_points ?? [] }, warnings: result.warnings,
    });
  }
}
