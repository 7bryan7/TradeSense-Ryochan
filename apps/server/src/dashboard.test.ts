import { FixtureModelAdapter, FixtureResearchAdapter } from "../../../tests/support/providers.js";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type ResearchAdapter } from "@tradesense/adapters";
import type { Evidence } from "@tradesense/core";

const databasePath = `/tmp/tradesense-dashboard-${process.pid}-${randomUUID()}.sqlite`;
process.env.DATA_MODE = "live";
process.env.LLM_PROVIDER = "gemini";
process.env.LLM_API_KEY = "";
process.env.RYO_MCP_KEY = "";
process.env.DATABASE_PATH = databasePath;
process.env.SIM_MAX_PRICE_AGE_SECONDS = "60";

const [database, services] = await Promise.all([import("./db.js"), import("./services.js")]);

function snapshot(price: number, change24h: number, at: Date, withCandles = false): Evidence {
  return {
    id: randomUUID(), tool: "analyze_token", symbol: "SOL", status: "ok", dataMode: "live",
    asOf: at.toISOString(), retrievedAt: at.toISOString(),
    data: { symbol: "SOL", currency: "USD", price, change24h, rsi14: 55, ...(withCandles ? { volumeUnit: "USD", candles: [
      { timestamp: new Date(at.getTime() - 3_600_000).toISOString(), open: price - 2, high: price + 1, low: price - 3, close: price - 1, volume: 1_000_000 },
      { timestamp: at.toISOString(), open: price - 1, high: price + 2, low: price - 2, close: price, volume: 1_250_000 },
    ] } : {}) },
    summary: { headline: `SOL fixture price is ${price}`, keyPoints: [] }, warnings: [],
  };
}

function pipelineResearch(primary: Evidence): ResearchAdapter {
  const fixture = new FixtureResearchAdapter();
  let analyzeCalls = 0;
  return { call: (tool, args) => tool === "analyze_token" ? Promise.resolve(analyzeCalls++ === 0 ? primary : { ...primary, id: randomUUID() }) : fixture.call(tool, args) };
}

describe("owned dashboard summary", () => {
  beforeAll(() => database.migrate());

  afterAll(() => {
    database.db.close();
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${databasePath}${suffix}`, { force: true });
  });

  it("compares compatible saved runs and values holdings from the latest saved mark", async () => {
    const sessionId = randomUUID();
    const model = new FixtureModelAdapter();
    const firstAt = new Date("2026-09-26T12:00:00.000Z");
    const secondAt = new Date("2026-09-26T12:00:30.000Z");
    const firstResearch = pipelineResearch(snapshot(100, 3, firstAt));
    const secondResearch = pipelineResearch(snapshot(110, 5, secondAt, true));

    await services.createRun("SOL", randomUUID(), { research: firstResearch, model, now: () => firstAt }, sessionId);
    const latest = await services.createRun("SOL", randomUUID(), { research: secondResearch, model, now: () => secondAt }, sessionId);
    const dashboard = services.dashboardSummary("SOL", sessionId, new Date("2026-09-26T12:00:31.000Z"));

    expect(dashboard.latestRun?.id).toBe(latest.id);
    expect(dashboard.comparison).toMatchObject({
      status: "comparable",
      price: { currentUsd: "110.00", previousUsd: "100.00", deltaUsd: "10.00", deltaPercent: 10 },
      change24h: { current: 5, previous: 3, deltaPoints: 2 },
      decision: { current: "BUY", previous: "BUY", changed: false },
    });
    expect(dashboard.portfolio.valuation).toMatchObject({ status: "complete", missingMarks: 0 });
    expect(Number(dashboard.portfolio.valuation.totalEquityUsd)).toBeGreaterThan(10_000);
    expect(dashboard.portfolio.holdings[0]).toMatchObject({ symbol: "SOL", mark: { priceUsd: "110.00", freshness: "fresh", ageSeconds: 1 } });
    expect(dashboard.chart).toMatchObject({
      status: "available", symbol: "SOL", currency: "USD", volumeUnit: "USD", intervalSeconds: 3600,
      windowSeconds: 3600, sourcePath: "candles", volumeCoverage: "complete",
      points: [{ close: 109, volume: 1_000_000 }, { close: 110, volume: 1_250_000 }],
    });
  });

  it("keeps malformed or unlabelled history unavailable instead of inventing a chart", async () => {
    const sessionId = randomUUID();
    const at = new Date("2026-09-26T13:00:00.000Z");
    const evidence = snapshot(108, 2, at);
    evidence.data.candles = [{ timestamp: "not-a-time", close: 108 }, { timestamp: at.toISOString(), close: 108 }];
    await services.createRun("SOL", randomUUID(), { research: pipelineResearch(evidence), model: new FixtureModelAdapter(), now: () => at }, sessionId);

    expect(services.dashboardSummary("SOL", sessionId, at).chart).toEqual({
      status: "unavailable", reason: "The saved candle series has fewer than two valid timestamped price points.",
    });
  });

  it("compares the nested 24-hour performance field used by live RYO evidence", async () => {
    const sessionId = randomUUID();
    const firstAt = new Date("2026-09-26T14:00:00.000Z");
    const secondAt = new Date("2026-09-26T14:00:20.000Z");
    const first = snapshot(100, 0, firstAt);
    const second = snapshot(101, 0, secondAt);
    delete first.data.change24h;
    delete second.data.change24h;
    first.data.performance = { h24: 1.25 };
    second.data.performance = { h24: 2.75 };
    await services.createRun("SOL", randomUUID(), { research: pipelineResearch(first), model: new FixtureModelAdapter(), now: () => firstAt }, sessionId);
    await services.createRun("SOL", randomUUID(), { research: pipelineResearch(second), model: new FixtureModelAdapter(), now: () => secondAt }, sessionId);

    expect(services.dashboardSummary("SOL", sessionId, secondAt).comparison).toMatchObject({
      status: "comparable",
      identity: { window: "24h" },
      change24h: { current: 2.75, previous: 1.25, deltaPoints: 1.5 },
    });
  });

  it("does not expose another session's runs or valuation", () => {
    const dashboard = services.dashboardSummary("SOL", randomUUID(), new Date("2026-09-26T12:00:31.000Z"));
    expect(dashboard.latestRun).toBeNull();
    expect(dashboard.comparison.status).toBe("unavailable");
    expect(dashboard.portfolio.cashUsd).toBe("10000.00");
    expect(dashboard.portfolio.holdings).toEqual([]);
  });
});
