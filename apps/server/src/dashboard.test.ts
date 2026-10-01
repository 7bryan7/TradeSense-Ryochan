import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { FixtureModelAdapter, FixtureResearchAdapter, type ResearchAdapter } from "@tradesense/adapters";
import type { Evidence } from "@tradesense/core";

const databasePath = `/tmp/tradesense-dashboard-${process.pid}-${randomUUID()}.sqlite`;
process.env.DATA_MODE = "fixture";
process.env.LLM_PROVIDER = "fixture";
process.env.LLM_API_KEY = "";
process.env.RYO_MCP_KEY = "";
process.env.DATABASE_PATH = databasePath;
process.env.SIM_MAX_PRICE_AGE_SECONDS = "60";

const [database, services] = await Promise.all([import("./db.js"), import("./services.js")]);

function snapshot(price: number, change24h: number, at: Date): Evidence {
  return {
    id: randomUUID(), tool: "analyze_token", symbol: "SOL", status: "ok", dataMode: "fixture",
    asOf: at.toISOString(), retrievedAt: at.toISOString(),
    data: { symbol: "SOL", currency: "USD", price, change24h, rsi14: 55 },
    summary: { headline: `SOL fixture price is ${price}`, keyPoints: [] }, warnings: [],
  };
}

function pipelineResearch(primary: Evidence): ResearchAdapter {
  const fixture = new FixtureResearchAdapter();
  return { call: (tool, args) => tool === "analyze_token" ? Promise.resolve(primary) : fixture.call(tool, args) };
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
    const secondResearch = pipelineResearch(snapshot(110, 5, secondAt));

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
    expect(dashboard.chart.status).toBe("unavailable");
  });

  it("does not expose another session's runs or valuation", () => {
    const dashboard = services.dashboardSummary("SOL", randomUUID(), new Date("2026-09-26T12:00:31.000Z"));
    expect(dashboard.latestRun).toBeNull();
    expect(dashboard.comparison.status).toBe("unavailable");
    expect(dashboard.portfolio.cashUsd).toBe("10000.00");
    expect(dashboard.portfolio.holdings).toEqual([]);
  });
});
