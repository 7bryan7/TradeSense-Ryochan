import { randomUUID } from "node:crypto";
import { evidenceSchema, tokenSymbolSchema, type Evidence } from "@tradesense/core";
import { z } from "zod";

const candleRowSchema = z.tuple([
  z.number().nonnegative(),
  z.number().positive(),
  z.number().positive(),
  z.number().positive(),
  z.number().positive(),
  z.number().nonnegative(),
]);

const candleResponseSchema = z.array(candleRowSchema).max(300);

export interface CandleMarketDataAdapter {
  candles(symbol: string, start: Date, end: Date, granularitySeconds: number): Promise<Evidence>;
}

export class CoinbaseExchangeAdapter implements CandleMarketDataAdapter {
  constructor(
    private readonly baseUrl = "https://api.exchange.coinbase.com",
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async candles(symbolInput: string, start: Date, end: Date, granularitySeconds: number): Promise<Evidence> {
    const symbol = tokenSymbolSchema.parse(symbolInput);
    if (![60, 300, 900, 3_600, 21_600, 86_400].includes(granularitySeconds)) {
      throw Object.assign(new Error("Coinbase candle granularity is unsupported"), { code: "COINBASE_GRANULARITY_INVALID", retryable: false });
    }
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start >= end) {
      throw Object.assign(new Error("Coinbase candle window is invalid"), { code: "COINBASE_WINDOW_INVALID", retryable: false });
    }

    const productId = `${symbol}-USD`;
    const url = new URL(`/products/${productId}/candles`, this.baseUrl);
    url.searchParams.set("start", String(Math.floor(start.getTime() / 1_000)));
    url.searchParams.set("end", String(Math.floor(end.getTime() / 1_000)));
    url.searchParams.set("granularity", String(granularitySeconds));
    const response = await this.fetcher(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      throw Object.assign(new Error(`Coinbase public candles failed with HTTP ${response.status}`), {
        code: "COINBASE_CANDLES_FAILED", retryable: response.status === 429 || response.status >= 500,
      });
    }
    const text = await response.text();
    if (text.length > 1_000_000) {
      throw Object.assign(new Error("Coinbase candle response exceeded the size limit"), { code: "COINBASE_RESPONSE_TOO_LARGE", retryable: false });
    }
    const rows = candleResponseSchema.parse(JSON.parse(text));
    const candles = rows
      .filter(([timestamp]) => timestamp * 1_000 >= start.getTime() && timestamp * 1_000 <= end.getTime() + 5_000)
      .map(([timestamp, low, high, open, close, volume]) => ({
        timestamp: new Date(timestamp * 1_000).toISOString(), low, high, open, close, volume,
      }))
      .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
    const retrievedAt = new Date().toISOString();
    const asOf = candles.at(-1)?.timestamp ?? retrievedAt;
    return evidenceSchema.parse({
      id: randomUUID(),
      tool: "coinbase_exchange_candles",
      symbol,
      status: candles.length >= 2 ? "ok" : "unavailable",
      dataMode: "live",
      asOf,
      retrievedAt,
      data: {
        provider: "Coinbase Exchange",
        productId,
        currency: "USD",
        volumeUnit: symbol,
        candleIntervalSeconds: granularitySeconds,
        candleWindowSeconds: Math.round((end.getTime() - start.getTime()) / 1_000),
        candles,
      },
      summary: {
        headline: candles.length >= 2 ? `${symbol}-USD public hourly candles` : `${symbol}-USD candle data unavailable`,
        keyPoints: [`${candles.length} timestamped public candle(s) returned by Coinbase Exchange.`],
      },
      warnings: candles.length >= 2 ? [] : ["Coinbase returned fewer than two candles for the requested window."],
    });
  }
}
