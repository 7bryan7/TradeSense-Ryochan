import { describe, expect, it } from "vitest";
import { extractMarketOverview } from "../marketOverviewPresentation";

describe("market overview presentation normalization", () => {
  it("maps the nested fields returned by live RYO market_overview evidence", () => {
    const result = extractMarketOverview({
      regime: "neutral",
      sentiment: { fear_greed_index: 68, label: "greed" },
      market: {
        total_market_cap_usd: 2_872_382_509_734.4097,
        total_volume_24h_usd: 104_007_991_201.17,
        btc_dominance_pct: 58.692163397471,
        breadth: 0.3478,
      },
      top_movers: { gainers: [{ symbol: "STX" }], losers: [{ symbol: "QNT" }] },
    });

    expect(Object.fromEntries(result.metrics)).toEqual({
      "Market regime": "neutral",
      "Fear & greed": "68 · greed",
      "Market breadth": "34.78%",
      "BTC dominance": "58.69%",
      "Total market cap": "$2.87T",
      "24h volume": "$104.01B",
    });
    expect(result.topMovers).toEqual(["STX", "QNT"]);
  });
});
