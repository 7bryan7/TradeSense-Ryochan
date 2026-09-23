import { describe, expect, it } from "vitest";
import { simulateDecision } from "./index.js";

const config = { feeBps: 10n, slippageBps: 10n, maxBuyEquityBps: 500n, maxTokenExposureBps: 2000n };
const empty = { cashCents: 1_000_000n, equityCents: 1_000_000n, positionQuantityMicros: 0n, positionValueCents: 0n };

describe("paper simulation", () => {
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
});
