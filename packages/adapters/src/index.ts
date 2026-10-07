import { randomUUID } from "node:crypto";
import { evidenceSchema, type Evidence } from "@tradesense/core";
import { z } from "zod";

export * from "./model.js";
export * from "./tavily.js";

export type RyoTool = "market_overview" | "scan_market" | "analyze_token" | "deep_analysis" | "compare_tokens" | "monitor_market_sentiment_shift";

export interface ResearchAdapter {
  call(tool: RyoTool, args?: Record<string, unknown>): Promise<Evidence>;
}

const ryoEnvelopeSchema = z.object({
  schema_version: z.string(), tool: z.string(), status: z.enum(["ok", "partial", "unavailable"]),
  data_mode: z.enum(["live", "mixed", "simulated", "unknown"]), as_of: z.string(),
  data: z.record(z.string(), z.unknown()),
  summary: z.object({ headline: z.string(), key_points: z.array(z.string()).optional() }).passthrough(),
  warnings: z.array(z.string()).default([]),
});

export class RyoRestAdapter implements ResearchAdapter {
  constructor(private readonly baseUrl: string, private readonly key: string, private readonly fetcher: typeof fetch = fetch) {}

  async call(tool: RyoTool, args: Record<string, unknown> = {}): Promise<Evidence> {
    const response = await this.fetcher(`${this.baseUrl.replace(/\/$/, "")}/tools/${tool}/call`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) {
      const text = (await response.text()).slice(0, 4_000);
      let providerMessage = "The RYO research provider rejected the request.";
      try {
        const body = JSON.parse(text) as Record<string, unknown>;
        if (typeof body.message === "string" && body.message.length <= 500) providerMessage = body.message;
      } catch { /* keep the safe fallback */ }
      const retryable = response.status === 429 || response.status >= 500 || /right now|temporar/i.test(providerMessage);
      throw Object.assign(new Error(`RYO ${tool} failed: ${providerMessage}`), {
        status: response.status === 401 || response.status === 403 ? 502 : retryable ? 503 : 502,
        code: response.status === 401 || response.status === 403 ? "RYO_AUTH_FAILED" : "RYO_REQUEST_FAILED",
        retryable,
      });
    }
    const body = z.object({ result: z.unknown() }).parse(await response.json());
    const result = ryoEnvelopeSchema.parse(body.result);
    if (result.data_mode !== "live") throw Object.assign(new Error("missing data: RYO did not supply live observations"), { status: 503, code: "NON_LIVE_EVIDENCE", retryable: true });
    return evidenceSchema.parse({
      id: randomUUID(), tool: result.tool, ...(typeof args.symbol === "string" ? { symbol: args.symbol.toUpperCase() } : {}),
      status: result.status, dataMode: result.data_mode, asOf: new Date(result.as_of).toISOString(), retrievedAt: new Date().toISOString(), data: result.data,
      summary: { headline: result.summary.headline, keyPoints: result.summary.key_points ?? [] }, warnings: result.warnings,
    });
  }
}
