import { describe, expect, it } from "vitest";
import { evidencePriceUsd, simulateDecision, type Evidence } from "./index.js";

const config = { feeBps: 10n, slippageBps: 10n, maxBuyEquityBps: 500n, maxTokenExposureBps: 2000n };
const empty = { cashCents: 1_000_000n, equityCents: 1_000_000n, positionQuantityMicros: 0n, positionValueCents: 0n };

describe("paper simulation", () => {

  it("reads prices from fixture and live RYO evidence shapes", () => {
    const base: Evidence = { id: "e1", tool: "analyze_token", status: "ok", dataMode: "live", asOf: "2026-09-24T00:00:00.000Z", retrievedAt: "2026-09-24T00:00:01.000Z", data: {}, summary: { headline: "test", keyPoints: [] }, warnings: [] };
    expect(evidencePriceUsd({ ...base, data: { price: 123.45 } })).toBe(123.45);
    expect(evidencePriceUsd({ ...base, data: { market: { price_usd: 114.61 } } })).toBe(114.61);
    expect(evidencePriceUsd({ ...base, data: { market: { price_usd: null } } })).toBeNull();
  });
  it("caps a buy at five percent of equity and includes fees", () => {
    const result = simulateDecision("BUY", 10_000n, empty, config);
    expect(result.outcome).toBe("APPLIED");
    expect(-result.cashDeltaCents).toBeLessThanOrEqual(50_050n);
    expect(result.feeCents).toBeGreaterThan(0n);
  });

  it("does not fill a hold", () => {
    expect(simulateDecision("HOLD", 10_000n, empty, config).outcome).toBe("NO_ACTION");
  });

  it("skips a sell without a position", () => {
    expect(simulateDecision("SELL", 10_000n, empty, config).outcome).toBe("SKIPPED_NO_POSITION");
  });

  it("sells the full simulated position with adverse slippage and a fee", () => {
    const result = simulateDecision("SELL", 10_000n, { ...empty, positionQuantityMicros: 1_500_000n, positionValueCents: 15_000n }, config);
    expect(result.outcome).toBe("APPLIED");
    expect(result.quantityMicros).toBe(1_500_000n);
    expect(result.fillPriceCents).toBe(9_990n);
    expect(result.cashDeltaCents).toBe(14_970n);
  });

  it("preserves accounting and policy invariants across boundary-sized portfolios", () => {
    const prices = [1n, 2n, 99n, 10_000n, 6_543_210n];
    const cashBalances = [0n, 1n, 99n, 10_000n, 1_000_000n, 90_000_000n];
    const equityBalances = [1n, 99n, 10_000n, 1_000_000n, 100_000_000n];
    const quantities = [0n, 1n, 999_999n, 1_000_000n, 45_678_901n];

    for (const referencePriceCents of prices) {
      for (const cashCents of cashBalances) {
        for (const equityCents of equityBalances) {
          for (const positionQuantityMicros of quantities) {
            const positionValueCents = referencePriceCents * positionQuantityMicros / 1_000_000n;
            const portfolio = { cashCents, equityCents, positionQuantityMicros, positionValueCents };
            const buy = simulateDecision("BUY", referencePriceCents, portfolio, config);
            const sell = simulateDecision("SELL", referencePriceCents, portfolio, config);

            expect(buy.fillPriceCents).toBeGreaterThanOrEqual(referencePriceCents);
            expect(-buy.cashDeltaCents).toBeLessThanOrEqual(cashCents);
            expect(buy.quantityMicros).toBeGreaterThanOrEqual(0n);
            if (buy.outcome === "APPLIED") {
              const gross = buy.fillPriceCents * buy.quantityMicros / 1_000_000n;
              expect(-buy.cashDeltaCents).toBe(gross + buy.feeCents);
              expect(gross).toBeLessThanOrEqual(equityCents * config.maxBuyEquityBps / 10_000n);
              expect(gross).toBeLessThanOrEqual(
                equityCents * config.maxTokenExposureBps / 10_000n > positionValueCents
                  ? equityCents * config.maxTokenExposureBps / 10_000n - positionValueCents
                  : 0n,
              );
            } else {
              expect(buy).toMatchObject({ outcome: "SKIPPED_LIMIT", quantityMicros: 0n, feeCents: 0n, cashDeltaCents: 0n });
            }

            if (positionQuantityMicros === 0n) {
              expect(sell).toMatchObject({ outcome: "SKIPPED_NO_POSITION", quantityMicros: 0n, cashDeltaCents: 0n });
            } else {
              expect(sell.outcome).toBe("APPLIED");
              expect(sell.quantityMicros).toBe(positionQuantityMicros);
              expect(sell.fillPriceCents).toBeLessThanOrEqual(referencePriceCents);
              expect(sell.cashDeltaCents).toBeGreaterThanOrEqual(0n);
            }
          }
        }
      }
    }
  });

  it("never creates value during a buy-then-sell round trip at an unchanged price", () => {
    for (const price of [1n, 10n, 10_000n, 1_000_000n]) {
      const buy = simulateDecision("BUY", price, empty, config);
      if (buy.outcome !== "APPLIED") continue;
      const cost = -buy.cashDeltaCents;
      const sell = simulateDecision("SELL", price, {
        cashCents: empty.cashCents - cost,
        equityCents: empty.equityCents,
        positionQuantityMicros: buy.quantityMicros,
        positionValueCents: price * buy.quantityMicros / 1_000_000n,
      }, config);
      expect(sell.outcome).toBe("APPLIED");
      expect(sell.cashDeltaCents).toBeLessThan(cost);
      expect(empty.cashCents - cost + sell.cashDeltaCents).toBeLessThan(empty.cashCents);
    }
  });
});
