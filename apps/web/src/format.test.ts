import { describe, expect, it } from "vitest";
import { formatCompactNumber, formatCompactUsd, formatMoney } from "./format";

describe("deterministic display formatting", () => {
  it("uses financial K/M/B/T suffixes independently of browser locale", () => {
    expect(formatCompactUsd(2_872_382_509_734)).toBe("$2.87T");
    expect(formatCompactUsd(104_007_991_201)).toBe("$104.01B");
    expect(formatCompactNumber(15_200_000)).toBe("15.2M");
  });

  it("formats paper money consistently", () => {
    expect(formatMoney("10000")).toBe("$10,000.00");
  });
});
