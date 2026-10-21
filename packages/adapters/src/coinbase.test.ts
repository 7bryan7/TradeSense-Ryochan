import { describe, expect, it, vi } from "vitest";
import { CoinbaseExchangeAdapter } from "./coinbase.js";

describe("CoinbaseExchangeAdapter", () => {
  it("normalizes bounded public OHLCV candles without authentication", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify([
      [1_767_229_200, 99, 103, 100, 102, 15],
      [1_767_225_600, 97, 101, 98, 100, 12],
    ]), { status: 200 }));
    const adapter = new CoinbaseExchangeAdapter("https://api.exchange.coinbase.com", fetcher as typeof fetch);
    const result = await adapter.candles("ETH", new Date("2026-01-01T00:00:00.000Z"), new Date("2026-01-01T02:00:00.000Z"), 3_600);

    expect(fetcher).toHaveBeenCalledOnce();
    const request = fetcher.mock.calls[0]![0] as URL;
    expect(request.origin).toBe("https://api.exchange.coinbase.com");
    expect(request.pathname).toBe("/products/ETH-USD/candles");
    expect(request.searchParams.get("granularity")).toBe("3600");
    expect(result).toMatchObject({
      tool: "coinbase_exchange_candles", symbol: "ETH", status: "ok", dataMode: "live",
      data: { provider: "Coinbase Exchange", productId: "ETH-USD", currency: "USD", volumeUnit: "ETH" },
    });
    expect(result.data.candles).toEqual([
      { timestamp: "2026-01-01T00:00:00.000Z", low: 97, high: 101, open: 98, close: 100, volume: 12 },
      { timestamp: "2026-01-01T01:00:00.000Z", low: 99, high: 103, open: 100, close: 102, volume: 15 },
    ]);
  });

  it("rejects unsupported intervals before making a request", async () => {
    const fetcher = vi.fn();
    const adapter = new CoinbaseExchangeAdapter("https://api.exchange.coinbase.com", fetcher as typeof fetch);
    await expect(adapter.candles("ETH", new Date("2026-01-01T00:00:00Z"), new Date("2026-01-02T00:00:00Z"), 120))
      .rejects.toMatchObject({ code: "COINBASE_GRANULARITY_INVALID" });
    expect(fetcher).not.toHaveBeenCalled();
  });
});
