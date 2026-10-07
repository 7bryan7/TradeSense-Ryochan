import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { ModelAdapter, ResearchAdapter } from "@tradesense/adapters";
import type { Evidence } from "@tradesense/core";

const databasePath = `/tmp/tradesense-run-lifecycle-${process.pid}-${randomUUID()}.sqlite`;
process.env.DATA_MODE = "live";
process.env.LLM_PROVIDER = "gemini";
process.env.LLM_API_KEY = "";
process.env.RYO_MCP_KEY = "";
process.env.DATABASE_PATH = databasePath;
process.env.SIM_MAX_PRICE_AGE_SECONDS = "60";

const [{ FixtureModelAdapter, FixtureResearchAdapter }, database, services] = await Promise.all([
  import("../../../tests/support/providers.js"),
  import("./db.js"),
  import("./services.js"),
]);

const currentTime = new Date("2026-09-26T12:00:00.000Z");

function evidence(asOf = currentTime.toISOString()): Evidence {
  return {
    id: randomUUID(), tool: "analyze_token", symbol: "BTC", status: "ok", dataMode: "live",
    asOf, retrievedAt: asOf,
    data: { symbol: "BTC", price: 64_250, change24h: 2.8, rsi14: 58 },
    summary: { headline: "Fixture BTC evidence", keyPoints: [] }, warnings: [],
  };
}

function pipelineResearch(primary: Evidence, onCall?: (tool: string) => void, executionQuote: Evidence = evidence()): ResearchAdapter {
  const fixture = new FixtureResearchAdapter();
  let analyzeCalls = 0;
  return { call: async (tool, args) => {
    onCall?.(tool);
    if (tool === "analyze_token") return analyzeCalls++ === 0 ? primary : { ...executionQuote, id: randomUUID() };
    return fixture.call(tool, args);
  } };
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
    const research = pipelineResearch(evidence(), () => { researchCalls += 1; });
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
    expect(failed.evidence).toHaveLength(4);
    expect(failed.researchTimeline).toMatchObject([
      { ordinal: 1, role: "selected_token", tool: "analyze_token", status: "COMPLETED", attemptCount: 1, providerStatus: "ok" },
      { ordinal: 2, role: "risk_coverage", tool: "deep_analysis", status: "COMPLETED", attemptCount: 1, providerStatus: "ok" },
      { ordinal: 3, role: "market_context", tool: "scan_market", status: "COMPLETED", attemptCount: 1, providerStatus: "ok" },
      { ordinal: 4, role: "benchmark_comparison", tool: "compare_tokens", status: "COMPLETED", attemptCount: 1, providerStatus: "ok" },
    ]);
    expect(failed.researchTimeline[3]).toMatchObject({ args: { symbols: "BTC,ETH", intent: "swing" } });
    expect(failed.researchTimeline.every((step: { evidenceId: string | null }) => step.evidenceId)).toBe(true);

    const completed = await services.createRun("BTC", key, dependencies);
    expect(completed.status).toBe("COMPLETED");
    expect(completed.attemptCount).toBe(2);
    expect(completed.simulation?.outcome).toBe("APPLIED");
    expect(researchCalls).toBe(5);
    expect(modelCalls).toBe(2);
    expect(services.replayRun(completed.id)).toMatchObject({ matches: true, portfolioMutated: false });

    const repeated = await services.createRun("BTC", key, dependencies);
    expect(repeated.id).toBe(completed.id);
    expect(researchCalls).toBe(5);
    expect(modelCalls).toBe(2);
    const fills = database.db.prepare("SELECT COUNT(*) AS count FROM fills f JOIN decisions d ON d.id=f.decision_id WHERE d.run_id=?").get(completed.id) as { count: number };
    expect(fills.count).toBe(1);
  });

  it("resumes a saved decision after an application-stage interruption and applies it exactly once", async () => {
    let researchCalls = 0;
    let modelCalls = 0;
    let applyAttempts = 0;
    const fixture = new FixtureModelAdapter();
    const key = `apply-resume-${randomUUID()}`;
    const dependencies = {
      research: pipelineResearch(evidence(), () => { researchCalls += 1; }),
      model: {
        createDecision: async (input: Parameters<ModelAdapter["createDecision"]>[0]) => {
          modelCalls += 1;
          return fixture.createDecision(input);
        },
        answerQuestion: (input: Parameters<ModelAdapter["answerQuestion"]>[0]) => fixture.answerQuestion(input),
      } satisfies ModelAdapter,
      now: () => currentTime,
      beforeApply: () => {
        applyAttempts += 1;
        if (applyAttempts === 1) throw Object.assign(new Error("injected interruption before ledger commit"), { code: "TEST_INTERRUPTION", retryable: true });
      },
    };

    await expect(services.createRun("BTC", key, dependencies)).rejects.toThrow("injected interruption");
    const runId = (database.db.prepare("SELECT id FROM runs WHERE idempotency_key=?").get(key) as { id: string }).id;
    expect(services.getRun(runId)).toMatchObject({ status: "FAILED", simulation: null, failure: { stage: "APPLYING", code: "TEST_INTERRUPTION" } });
    expect((database.db.prepare("SELECT COUNT(*) AS count FROM decisions WHERE run_id=?").get(runId) as { count: number }).count).toBe(1);
    expect((database.db.prepare("SELECT COUNT(*) AS count FROM fills f JOIN decisions d ON d.id=f.decision_id WHERE d.run_id=?").get(runId) as { count: number }).count).toBe(0);

    const completed = await services.createRun("BTC", key, dependencies);
    expect(completed).toMatchObject({ id: runId, status: "COMPLETED", attemptCount: 2, simulation: { outcome: "APPLIED" } });
    expect({ researchCalls, modelCalls, applyAttempts }).toEqual({ researchCalls: 5, modelCalls: 1, applyAttempts: 2 });
    await services.createRun("BTC", key, dependencies);
    expect((database.db.prepare("SELECT COUNT(*) AS count FROM fills f JOIN decisions d ON d.id=f.decision_id WHERE d.run_id=?").get(runId) as { count: number }).count).toBe(1);
  });

  it("refreshes a stale decision price before applying the paper trade", async () => {
    const fixture = new FixtureModelAdapter();
    const staleEvidence = evidence("2026-09-26T11:58:00.000Z");
    const research = pipelineResearch(staleEvidence);
    const before = services.portfolio();

    const run = await services.createRun("BTC", `stale-${randomUUID()}`, { research, model: fixture, now: () => currentTime });

    expect(run.status).toBe("COMPLETED");
    expect(run.decision?.action).toBe("BUY");
    expect(run.simulation?.outcome).toBe("APPLIED");
    expect(run.simulation?.executionQuote).toMatchObject({ referencePriceUsd: "64250.00", asOf: currentTime.toISOString() });
    expect(run.simulation?.decisionReference).toMatchObject({ priceUsd: "64250.00", asOf: "2026-09-26T11:58:00.000Z" });
    expect(run.evidence.filter((item: Evidence & { purpose?: string }) => item.purpose === "execution_quote")).toHaveLength(1);
    expect(run.researchTimeline[4]).toMatchObject({ role: "execution_quote", status: "COMPLETED", attemptCount: 1 });
    expect(services.replayRun(run.id)).toMatchObject({ matches: true, replayed: { outcome: "APPLIED" } });
    expect(services.portfolio().version).toBe(before.version + 1);
  });

  it("records an explicit no-fill result when the refreshed quote is still stale", async () => {
    const stale = evidence("2026-09-26T11:58:00.000Z");
    const before = services.portfolio();
    const run = await services.createRun("BTC", `stale-refresh-${randomUUID()}`, {
      research: pipelineResearch(stale, undefined, stale), model: new FixtureModelAdapter(), now: () => currentTime,
    });

    expect(run.simulation).toMatchObject({ outcome: "SKIPPED_QUOTE_UNAVAILABLE", quantity: "0" });
    expect(run.simulation?.reason).toContain("refreshed quote");
    expect(services.replayRun(run.id)).toMatchObject({ matches: true, replayed: { outcome: "SKIPPED_QUOTE_UNAVAILABLE" } });
    expect(services.portfolio()).toMatchObject({ cashUsd: before.cashUsd, version: before.version });
  });

  it("resumes a failed execution-quote request without repeating research or model inference", async () => {
    const fixtureResearch = new FixtureResearchAdapter();
    const fixtureModel = new FixtureModelAdapter();
    let analyzeCalls = 0;
    let modelCalls = 0;
    const research: ResearchAdapter = { call: async (tool, args) => {
      if (tool !== "analyze_token") return fixtureResearch.call(tool, args);
      analyzeCalls += 1;
      if (analyzeCalls === 1) return evidence();
      if (analyzeCalls === 2) throw Object.assign(new Error("temporary quote failure"), { code: "RYO_REQUEST_FAILED", retryable: true });
      return { ...evidence(), id: randomUUID() };
    } };
    const model: ModelAdapter = {
      createDecision: async (input) => { modelCalls += 1; return fixtureModel.createDecision(input); },
      answerQuestion: (input) => fixtureModel.answerQuestion(input),
    };
    const key = `quote-resume-${randomUUID()}`;

    await expect(services.createRun("BTC", key, { research, model, now: () => currentTime })).rejects.toThrow("temporary quote failure");
    const runId = (database.db.prepare("SELECT id FROM runs WHERE idempotency_key=?").get(key) as { id: string }).id;
    expect(services.getRun(runId)).toMatchObject({ status: "FAILED", failure: { stage: "APPLYING", code: "RYO_REQUEST_FAILED" } });
    expect(services.getRun(runId).researchTimeline[4]).toMatchObject({ role: "execution_quote", status: "FAILED", attemptCount: 1 });

    const completed = await services.createRun("BTC", key, { research, model, now: () => currentTime });
    expect(completed).toMatchObject({ status: "COMPLETED", simulation: { outcome: "APPLIED" } });
    expect(completed.researchTimeline[4]).toMatchObject({ status: "COMPLETED", attemptCount: 2 });
    expect({ analyzeCalls, modelCalls }).toEqual({ analyzeCalls: 3, modelCalls: 1 });
  });

  it("rejects an execution quote whose token identity differs from the decision evidence", async () => {
    const primary = evidence();
    primary.data = { ...primary.data, network: "bitcoin", address: "btc-main" };
    const mismatchedQuote = evidence();
    mismatchedQuote.data = { ...mismatchedQuote.data, network: "ethereum", address: "0x-wrong" };
    const key = `quote-identity-${randomUUID()}`;

    await expect(services.createRun("BTC", key, {
      research: pipelineResearch(primary, undefined, mismatchedQuote), model: new FixtureModelAdapter(), now: () => currentTime,
    })).rejects.toThrow("Execution quote network does not match");

    const runId = (database.db.prepare("SELECT id FROM runs WHERE idempotency_key=?").get(key) as { id: string }).id;
    expect(services.getRun(runId)).toMatchObject({ status: "FAILED", failure: { stage: "APPLYING", code: "EXECUTION_QUOTE_IDENTITY_MISMATCH" }, simulation: null });
    expect((database.db.prepare("SELECT COUNT(*) AS count FROM fills f JOIN decisions d ON d.id=f.decision_id WHERE d.run_id=?").get(runId) as { count: number }).count).toBe(0);
  });

  it("runs the three independent context tools concurrently after primary evidence", async () => {
    const fixture = new FixtureResearchAdapter();
    const waiting: Array<() => void> = [];
    let activeContext = 0;
    let maxActiveContext = 0;
    let analyzeCalls = 0;
    const research: ResearchAdapter = { call: async (tool, args) => {
      if (tool === "analyze_token") {
        analyzeCalls += 1;
        return { ...evidence(), id: randomUUID() };
      }
      activeContext += 1;
      maxActiveContext = Math.max(maxActiveContext, activeContext);
      await new Promise<void>((resolve) => {
        waiting.push(resolve);
        if (waiting.length === 3) waiting.splice(0).forEach((release) => release());
      });
      const result = await fixture.call(tool, args);
      activeContext -= 1;
      return result;
    } };

    const run = await services.createRun("BTC", `parallel-${randomUUID()}`, { research, model: new FixtureModelAdapter(), now: () => currentTime });
    expect(run.simulation?.outcome).toBe("APPLIED");
    expect(maxActiveContext).toBe(3);
    expect(analyzeCalls).toBe(2);
  });

  it("blocks application when the portfolio version changes during analysis", async () => {
    const fixture = new FixtureModelAdapter();
    const research = pipelineResearch(evidence());
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

  it("resumes at the first missing research tool after a partial provider failure", async () => {
    const fixture = new FixtureResearchAdapter();
    const calls = new Map<string, number>();
    const research: ResearchAdapter = { call: async (tool, args) => {
      calls.set(tool, (calls.get(tool) ?? 0) + 1);
      if (tool === "analyze_token") return evidence();
      if (tool === "deep_analysis" && calls.get(tool) === 1) throw Object.assign(new Error("temporary deep analysis failure"), { code: "RYO_REQUEST_FAILED", retryable: true });
      return fixture.call(tool, args);
    } };
    const key = `research-resume-${randomUUID()}`;

    await expect(services.createRun("BTC", key, { research, model: new FixtureModelAdapter(), now: () => currentTime })).rejects.toThrow("temporary deep analysis failure");
    const failedId = (database.db.prepare("SELECT id FROM runs WHERE idempotency_key=?").get(key) as { id: string }).id;
    const failed = services.getRun(failedId);
    expect(failed.evidence.map((item: Evidence) => item.tool)).toEqual(["analyze_token", "scan_market", "compare_tokens"]);
    expect(failed.researchTimeline).toMatchObject([
      { tool: "analyze_token", status: "COMPLETED", attemptCount: 1 },
      { tool: "deep_analysis", status: "FAILED", attemptCount: 1, failure: { code: "RYO_REQUEST_FAILED", message: "temporary deep analysis failure" } },
      { tool: "scan_market", status: "COMPLETED", attemptCount: 1 },
      { tool: "compare_tokens", status: "COMPLETED", attemptCount: 1 },
    ]);

    const completed = await services.createRun("BTC", key, { research, model: new FixtureModelAdapter(), now: () => currentTime });
    expect(completed.evidence.map((item: Evidence) => item.tool).sort()).toEqual(["analyze_token", "analyze_token", "compare_tokens", "deep_analysis", "scan_market"]);
    expect(completed.researchTimeline.map((step: { status: string }) => step.status)).toEqual(["COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED"]);
    expect(completed.researchTimeline[1]).toMatchObject({ attemptCount: 2, failure: null });
    expect(calls.get("analyze_token")).toBe(2);
    expect(calls.get("deep_analysis")).toBe(2);
    expect(calls.get("scan_market")).toBe(1);
    expect(calls.get("compare_tokens")).toBe(1);
  });

  it("blocks a proposed paper trade when deep-analysis coverage is partial", async () => {
    const fixture = new FixtureResearchAdapter();
    const research: ResearchAdapter = { call: async (tool, args) => {
      if (tool === "analyze_token") return evidence();
      const item = await fixture.call(tool, args);
      return tool === "deep_analysis" ? { ...item, status: "partial" as const, warnings: ["Risk coverage is incomplete"] } : item;
    } };
    const before = services.portfolio();

    const run = await services.createRun("BTC", `safety-${randomUUID()}`, { research, model: new FixtureModelAdapter(), now: () => currentTime });

    expect(run.researchPlanVersion).toBe("selected-token-v3");
    expect(run.decision?.action).toBe("BUY");
    expect(run.simulation).toMatchObject({ outcome: "BLOCKED_SAFETY_COVERAGE", quantity: "0" });
    expect(services.replayRun(run.id)).toMatchObject({ matches: true, replayed: { outcome: "BLOCKED_SAFETY_COVERAGE" } });
    expect(services.portfolio()).toMatchObject({ cashUsd: before.cashUsd, version: before.version });
  });

  it("rejects mismatched and unusable primary evidence without touching the ledger", async () => {
    const fixture = new FixtureModelAdapter();
    const before = services.portfolio();
    const beforeCounts = database.db.prepare("SELECT COUNT(*) AS decisions, (SELECT COUNT(*) FROM fills) AS fills FROM decisions").get() as { decisions: number; fills: number };
    const wrongIdentity = { ...evidence(), symbol: "ETH", data: { symbol: "ETH", price: 3_500, change24h: 3, rsi14: 55 } };
    await expect(services.createRun("BTC", `wrong-symbol-${randomUUID()}`, {
      research: pipelineResearch(wrongIdentity), model: fixture, now: () => currentTime,
    })).rejects.toThrow("while BTC was requested");

    const noPrice = { ...evidence(), data: { symbol: "BTC", price: 0, change24h: 3, rsi14: 55 } };
    await expect(services.createRun("BTC", `no-price-${randomUUID()}`, {
      research: pipelineResearch(noPrice), model: fixture, now: () => currentTime,
    })).rejects.toThrow("no valid USD price");

    expect(services.portfolio()).toMatchObject({ cashUsd: before.cashUsd, version: before.version });
    const counts = database.db.prepare("SELECT COUNT(*) AS decisions, (SELECT COUNT(*) FROM fills) AS fills FROM decisions").get() as { decisions: number; fills: number };
    const failedRuns = database.db.prepare("SELECT COUNT(*) AS count FROM runs WHERE idempotency_key LIKE 'wrong-symbol-%' OR idempotency_key LIKE 'no-price-%'").get() as { count: number };
    expect(failedRuns.count).toBe(2);
    expect(counts).toEqual(beforeCounts);
  });

  it("keeps cash, cost basis, realized P&L, versions, and replay consistent over a long action sequence", async () => {
    const sessionId = "73000000-0000-4000-8000-000000000007";
    const actions = ["BUY", "BUY", "BUY", "BUY", "BUY", "BUY", "HOLD", "SELL"] as const;
    let actionIndex = 0;
    let instant = new Date("2026-09-26T13:00:00.000Z");
    const fixtureResearch = new FixtureResearchAdapter();
    const fixtureModel = new FixtureModelAdapter();
    const dynamicResearch: ResearchAdapter = { call: async (tool, args) => {
      if (tool !== "analyze_token") return fixtureResearch.call(tool, args);
      const timestamp = instant.toISOString();
      return {
        id: randomUUID(), tool, symbol: "BTC", status: "ok", dataMode: "live", asOf: timestamp, retrievedAt: timestamp,
        data: { symbol: "BTC", price: 50_000, change24h: 2.8, rsi14: 58 },
        summary: { headline: "Stateful accounting evidence", keyPoints: [] }, warnings: [],
      };
    } };
    const sequencedModel: ModelAdapter = {
      createDecision: async (input) => {
        const invocation = await fixtureModel.createDecision(input);
        const action = actions[actionIndex++];
        if (!action) throw new Error("Action sequence exhausted");
        return { ...invocation, output: { ...invocation.output, action } };
      },
      answerQuestion: (input) => fixtureModel.answerQuestion(input),
    };
    const initial = services.portfolio(sessionId);
    const runs = [];
    for (let index = 0; index < actions.length; index += 1) {
      const run = await services.createRun("BTC", `sequence-${index}-${randomUUID()}`, { research: dynamicResearch, model: sequencedModel, now: () => instant }, sessionId);
      runs.push(run);
      instant = new Date(instant.getTime() + 1_000);
      const snapshot = services.portfolio(sessionId, instant);
      expect(Number(snapshot.cashUsd)).toBeGreaterThanOrEqual(0);
      expect(snapshot.version).toBe(runs.filter((item) => item.simulation?.outcome === "APPLIED").length);
    }

    expect(runs[6]?.simulation?.outcome).toBe("NO_ACTION");
    expect(runs[7]?.simulation?.outcome).toBe("APPLIED");
    const final = services.portfolio(sessionId, instant);
    expect(final.holdings).toEqual([]);
    const fills = database.db.prepare(`SELECT f.cash_delta_cents, f.outcome FROM fills f JOIN decisions d ON d.id=f.decision_id
      JOIN runs r ON r.id=d.run_id WHERE r.session_id=? ORDER BY r.created_at, r.rowid`).all(sessionId) as Array<{ cash_delta_cents: number; outcome: string }>;
    const cashDelta = fills.reduce((sum, fill) => sum + BigInt(fill.cash_delta_cents), 0n);
    expect(BigInt(Math.round(Number(final.cashUsd) * 100))).toBe(BigInt(Math.round(Number(initial.cashUsd) * 100)) + cashDelta);
    expect(final.realizedPnlUsd).toBe((Number(final.cashUsd) - Number(initial.cashUsd)).toFixed(2));
    expect(runs.every((run) => services.replayRun(run.id, sessionId).matches)).toBe(true);
    expect((database.db.prepare("SELECT COUNT(*) AS count FROM fills f JOIN decisions d ON d.id=f.decision_id JOIN runs r ON r.id=d.run_id WHERE r.session_id=?").get(sessionId) as { count: number }).count).toBe(actions.length);
  });
});
