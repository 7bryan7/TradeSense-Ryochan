import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { ModelAdapter, ResearchAdapter } from "@tradesense/adapters";
import type { Evidence } from "@tradesense/core";

const databasePath = `/tmp/tradesense-run-lifecycle-${process.pid}-${randomUUID()}.sqlite`;
process.env.DATA_MODE = "fixture";
process.env.LLM_PROVIDER = "fixture";
process.env.LLM_API_KEY = "";
process.env.RYO_MCP_KEY = "";
process.env.DATABASE_PATH = databasePath;
process.env.SIM_MAX_PRICE_AGE_SECONDS = "60";

const [{ FixtureModelAdapter }, database, services] = await Promise.all([
  import("@tradesense/adapters"),
  import("./db.js"),
  import("./services.js"),
]);

const currentTime = new Date("2026-09-26T12:00:00.000Z");

function evidence(asOf = currentTime.toISOString()): Evidence {
  return {
    id: randomUUID(), tool: "analyze_token", symbol: "BTC", status: "ok", dataMode: "fixture",
    asOf, retrievedAt: asOf,
    data: { symbol: "BTC", price: 64_250, change24h: 2.8, rsi14: 58 },
    summary: { headline: "Fixture BTC evidence", keyPoints: [] }, warnings: [],
  };
}

describe("durable run lifecycle", () => {
  beforeAll(() => database.migrate());

  afterAll(() => {
    database.db.close();
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${databasePath}${suffix}`, { force: true });
  });

  it("resumes from saved evidence after a model failure and never duplicates a fill", async () => {
    let researchCalls = 0;
    let modelCalls = 0;
    const research: ResearchAdapter = { call: async () => { researchCalls += 1; return evidence(); } };
    const fixture = new FixtureModelAdapter();
    const model: ModelAdapter = {
      createDecision: async (input) => {
        modelCalls += 1;
        if (modelCalls === 1) throw Object.assign(new Error("temporary model failure"), { code: "MODEL_UNAVAILABLE", retryable: true });
        return fixture.createDecision(input);
      },
      answerQuestion: (input) => fixture.answerQuestion(input),
    };
    const key = `resume-${randomUUID()}`;
    const dependencies = { research, model, now: () => currentTime };

    await expect(services.createRun("BTC", key, dependencies)).rejects.toThrow("temporary model failure");
    const failedId = (database.db.prepare("SELECT id FROM runs WHERE idempotency_key=?").get(key) as { id: string }).id;
    const failed = services.getRun(failedId);
    expect(failed.status).toBe("FAILED");
    expect(failed.failure).toMatchObject({ stage: "ANALYZING", code: "MODEL_UNAVAILABLE" });
    expect(failed.evidence).toHaveLength(1);

    const completed = await services.createRun("BTC", key, dependencies);
    expect(completed.status).toBe("COMPLETED");
    expect(completed.attemptCount).toBe(2);
    expect(completed.simulation?.outcome).toBe("APPLIED");
    expect(researchCalls).toBe(1);
    expect(modelCalls).toBe(2);
    expect(services.replayRun(completed.id)).toMatchObject({ matches: true, portfolioMutated: false });

    const repeated = await services.createRun("BTC", key, dependencies);
    expect(repeated.id).toBe(completed.id);
    expect(researchCalls).toBe(1);
    expect(modelCalls).toBe(2);
    const fills = database.db.prepare("SELECT COUNT(*) AS count FROM fills f JOIN decisions d ON d.id=f.decision_id WHERE d.run_id=?").get(completed.id) as { count: number };
    expect(fills.count).toBe(1);
  });

  it("records a stale-price policy block without changing the paper portfolio", async () => {
    const fixture = new FixtureModelAdapter();
    const staleEvidence = evidence("2026-09-26T11:58:00.000Z");
    const research: ResearchAdapter = { call: async () => staleEvidence };
    const before = services.portfolio();

    const run = await services.createRun("BTC", `stale-${randomUUID()}`, { research, model: fixture, now: () => currentTime });

    expect(run.status).toBe("COMPLETED");
    expect(run.decision?.action).toBe("BUY");
    expect(run.simulation?.outcome).toBe("BLOCKED_STALE_PRICE");
    expect(run.simulation?.reason).toContain("60-second");
    expect(services.replayRun(run.id)).toMatchObject({ matches: true, replayed: { outcome: "BLOCKED_STALE_PRICE" } });
    expect(services.portfolio()).toMatchObject({ cashUsd: before.cashUsd, version: before.version });
  });

  it("blocks application when the portfolio version changes during analysis", async () => {
    const fixture = new FixtureModelAdapter();
    const research: ResearchAdapter = { call: async () => evidence() };
    const model: ModelAdapter = {
      createDecision: async (input) => {
        const result = await fixture.createDecision(input);
        database.db.prepare("UPDATE portfolios SET version=version+1 WHERE id=(SELECT portfolio_id FROM runs ORDER BY rowid DESC LIMIT 1)").run();
        return result;
      },
      answerQuestion: (input) => fixture.answerQuestion(input),
    };
    const before = services.portfolio();

    const run = await services.createRun("BTC", `version-${randomUUID()}`, { research, model, now: () => currentTime });

    expect(run.simulation?.outcome).toBe("BLOCKED_PORTFOLIO_CHANGED");
    expect(services.portfolio().cashUsd).toBe(before.cashUsd);
  });
});
