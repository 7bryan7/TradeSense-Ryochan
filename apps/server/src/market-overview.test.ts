import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { ResearchAdapter } from "@tradesense/adapters";
import type { Evidence } from "@tradesense/core";

const databasePath = `/tmp/tradesense-market-overview-${process.pid}-${randomUUID()}.sqlite`;
process.env.DATA_MODE = "live";
process.env.LLM_PROVIDER = "gemini";
process.env.LLM_API_KEY = "";
process.env.RYO_MCP_KEY = "";
process.env.DATABASE_PATH = databasePath;
process.env.MARKET_OVERVIEW_MAX_AGE_SECONDS = "300";

const [database, services] = await Promise.all([import("./db.js"), import("./services.js")]);
const observedAt = new Date("2026-09-26T12:00:00.000Z");
const viewedAt = new Date("2026-09-26T12:01:00.000Z");

function overviewEvidence(): Evidence {
  return {
    id: randomUUID(), tool: "market_overview", status: "ok", dataMode: "live",
    asOf: observedAt.toISOString(), retrievedAt: viewedAt.toISOString(),
    data: { regime: "risk-on", fearGreed: 62, breadthPercent: 58, topMovers: ["SOL", "BTC", "ETH"] },
    summary: { headline: "Fixture market breadth is positive", keyPoints: ["Breadth is above half"] },
    warnings: ["Synthetic fixture data"],
  };
}

describe("persisted market overview", () => {
  beforeAll(() => database.migrate());

  afterAll(() => {
    database.db.close();
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${databasePath}${suffix}`, { force: true });
  });

  it("persists an owned market_overview snapshot without changing the paper portfolio", async () => {
    const sessionId = randomUUID();
    const before = services.portfolio(sessionId, viewedAt);
    let calls = 0;
    const research: ResearchAdapter = { call: async (tool, args) => {
      calls += 1;
      expect(tool).toBe("market_overview");
      expect(args).toEqual({});
      return overviewEvidence();
    } };

    expect(services.marketOverview(sessionId, viewedAt)).toMatchObject({ snapshot: null, freshness: "unknown", latestAttempt: null });
    const refreshed = await services.refreshMarketOverview(sessionId, { research, now: () => viewedAt });

    expect(calls).toBe(1);
    expect(refreshed).toMatchObject({ ageSeconds: 60, freshness: "fresh", snapshot: { tool: "market_overview", status: "ok" }, latestAttempt: { status: "COMPLETED" } });
    expect(services.marketOverview(sessionId, new Date("2026-09-26T12:06:00.000Z"))).toMatchObject({ ageSeconds: 360, freshness: "stale" });
    expect(services.marketOverview(randomUUID(), viewedAt).snapshot).toBeNull();
    expect(services.portfolio(sessionId, viewedAt)).toMatchObject({ cashUsd: before.cashUsd, version: before.version, holdings: before.holdings });
    expect((database.db.prepare("SELECT purpose, session_id FROM evidence WHERE id=?").get(refreshed.snapshot!.id) as object)).toMatchObject({ purpose: "market", session_id: sessionId });
  });

  it("records a failed refresh while preserving the last completed snapshot", async () => {
    const sessionId = randomUUID();
    const success: ResearchAdapter = { call: async () => overviewEvidence() };
    await services.refreshMarketOverview(sessionId, { research: success, now: () => viewedAt });
    const failed: ResearchAdapter = { call: async () => { throw Object.assign(new Error("market overview unavailable"), { code: "RYO_REQUEST_FAILED", retryable: true }); } };

    await expect(services.refreshMarketOverview(sessionId, { research: failed, now: () => new Date("2026-09-26T12:02:00.000Z") })).rejects.toThrow("market overview unavailable");

    expect(services.marketOverview(sessionId, new Date("2026-09-26T12:02:01.000Z"))).toMatchObject({
      snapshot: { tool: "market_overview", summary: { headline: "Fixture market breadth is positive" } },
      latestAttempt: { status: "FAILED", failure: { code: "RYO_REQUEST_FAILED", message: "market overview unavailable" } },
    });
    expect((database.db.prepare("SELECT COUNT(*) AS count FROM evidence WHERE session_id=? AND purpose='market'").get(sessionId) as { count: number }).count).toBe(1);
  });
});
