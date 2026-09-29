import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { ModelAdapter, ResearchAdapter } from "@tradesense/adapters";
import type { Evidence } from "@tradesense/core";

const databasePath = `/tmp/tradesense-scheduler-${process.pid}-${randomUUID()}.sqlite`;
process.env.DATA_MODE = "fixture";
process.env.LLM_PROVIDER = "fixture";
process.env.LLM_API_KEY = "";
process.env.RYO_MCP_KEY = "";
process.env.DATABASE_PATH = databasePath;
process.env.SCHEDULER_ENABLED = "false";
process.env.SCHEDULER_LEASE_SECONDS = "120";

const [{ FixtureModelAdapter }, database, scheduler, services] = await Promise.all([
  import("@tradesense/adapters"),
  import("./db.js"),
  import("./scheduler.js"),
  import("./services.js"),
]);

const sessionA = "30000000-0000-4000-8000-000000000003";
const sessionB = "40000000-0000-4000-8000-000000000004";
let clock = new Date("2026-09-26T10:00:00.000Z");

const research: ResearchAdapter = {
  call: async (_tool, args = {}): Promise<Evidence> => {
    const symbol = String(args.symbol ?? "BTC");
    const timestamp = clock.toISOString();
    return {
      id: randomUUID(), tool: "analyze_token", symbol, status: "ok", dataMode: "fixture", asOf: timestamp, retrievedAt: timestamp,
      data: { symbol, price: symbol === "ETH" ? 3_450 : 64_250, change24h: 2.8, rsi14: 58 },
      summary: { headline: `${symbol} fixture schedule evidence`, keyPoints: [] }, warnings: [],
    };
  },
};

describe("durable recurring scheduler", () => {
  beforeAll(() => database.migrate());

  afterAll(() => {
    database.db.close();
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${databasePath}${suffix}`, { force: true });
  });

  it("creates unique time slots, runs a bounded watchlist, and enforces the daily cap", async () => {
    const model = new FixtureModelAdapter();
    const schedule = scheduler.createSchedule({ symbols: ["BTC", "ETH"], cadenceMinutes: 5, maxRunsPerDay: 2 }, sessionA, clock);
    expect(schedule.status).toBe("PAUSED");
    scheduler.updateSchedule(schedule.id, { status: "ACTIVE" }, sessionA, clock, true);
    clock = new Date(clock.getTime() + 5 * 60_000);

    const first = await scheduler.runSchedulerTick({ research, model, now: () => clock, workerId: "worker-a", maxJobs: 2 });
    expect(first.materialized).toBe(2);
    expect(first.results.map((result) => result.status)).toEqual(["COMPLETED", "COMPLETED"]);
    expect(services.history(sessionA)).toHaveLength(2);
    expect((database.db.prepare("SELECT COUNT(*) AS count FROM fills").get() as { count: number }).count).toBe(2);

    const repeated = await scheduler.runSchedulerTick({ research, model, now: () => clock, workerId: "worker-b", maxJobs: 2 });
    expect(repeated).toEqual({ materialized: 0, results: [] });
    clock = new Date(clock.getTime() + 5 * 60_000);
    const capped = await scheduler.runSchedulerTick({ research, model, now: () => clock, workerId: "worker-b", maxJobs: 2 });
    expect(capped.materialized).toBe(0);
    expect((database.db.prepare("SELECT COUNT(*) AS count FROM schedule_slots WHERE schedule_id=?").get(schedule.id) as { count: number }).count).toBe(2);
    scheduler.updateSchedule(schedule.id, { status: "CANCELLED" }, sessionA, clock, true);
  });

  it("does not overlap a leased portfolio job and recovers an expired lease", async () => {
    const model = new FixtureModelAdapter();
    const schedule = scheduler.createSchedule({ symbols: ["SOL"], cadenceMinutes: 5, maxRunsPerDay: 4 }, sessionB, clock);
    scheduler.updateSchedule(schedule.id, { status: "ACTIVE" }, sessionB, clock, true);
    clock = new Date(clock.getTime() + 5 * 60_000);
    await scheduler.runSchedulerTick({ research, model, now: () => clock, workerId: "materializer", maxJobs: 0 });
    const slot = database.db.prepare("SELECT id FROM schedule_slots WHERE schedule_id=?").get(schedule.id) as { id: string };
    database.db.prepare("UPDATE schedule_slots SET status='RUNNING', attempt_count=1, lease_owner='old-worker', lease_expires_at=? WHERE id=?")
      .run(new Date(clock.getTime() + 120_000).toISOString(), slot.id);

    const blocked = await scheduler.runSchedulerTick({ research, model, now: () => clock, workerId: "new-worker" });
    expect(blocked.results).toEqual([]);
    clock = new Date(clock.getTime() + 121_000);
    const recovered = await scheduler.runSchedulerTick({ research, model, now: () => clock, workerId: "new-worker" });
    expect(recovered.results[0]).toMatchObject({ slotId: slot.id, status: "COMPLETED" });
    const stored = database.db.prepare("SELECT attempt_count, status FROM schedule_slots WHERE id=?").get(slot.id) as { attempt_count: number; status: string };
    expect(stored).toEqual({ attempt_count: 2, status: "COMPLETED" });
    scheduler.updateSchedule(schedule.id, { status: "CANCELLED" }, sessionB, clock, true);
  });

  it("lets pause win before application and records no simulated fill", async () => {
    const fixtureModel = new FixtureModelAdapter();
    const schedule = scheduler.createSchedule({ symbols: ["BTC"], cadenceMinutes: 5, maxRunsPerDay: 4 }, sessionB, clock);
    scheduler.updateSchedule(schedule.id, { status: "ACTIVE" }, sessionB, clock, true);
    clock = new Date(clock.getTime() + 5 * 60_000);
    const before = services.portfolio(sessionB);
    const pausingModel: ModelAdapter = {
      createDecision: async (input) => {
        const result = await fixtureModel.createDecision(input);
        scheduler.updateSchedule(schedule.id, { status: "PAUSED" }, sessionB, clock, true);
        return result;
      },
      answerQuestion: (input) => fixtureModel.answerQuestion(input),
    };

    const result = await scheduler.runSchedulerTick({ research, model: pausingModel, now: () => clock, workerId: "pause-worker" });

    expect(result.results[0]?.status).toBe("CANCELLED");
    expect(services.portfolio(sessionB)).toMatchObject({ cashUsd: before.cashUsd, version: before.version });
    const runId = result.results[0]?.runId;
    expect(runId && services.getRun(runId, sessionB)).toMatchObject({ status: "CANCELLED", simulation: null, failure: { code: "SCHEDULE_CANCELLED" } });
    scheduler.updateSchedule(schedule.id, { status: "CANCELLED" }, sessionB, clock, true);
  });

  it("enforces ownership, terminal cancellation, and the operator enable gate", () => {
    const schedule = scheduler.createSchedule({ symbols: ["BTC"], cadenceMinutes: 5 }, sessionA, clock);
    expect(() => scheduler.updateSchedule(schedule.id, { status: "ACTIVE" }, sessionB, clock, true)).toThrow("Schedule not found");
    expect(() => scheduler.updateSchedule(schedule.id, { status: "ACTIVE" }, sessionA, clock, false)).toThrow("disabled by the server operator");
    const cancelled = scheduler.updateSchedule(schedule.id, { status: "CANCELLED" }, sessionA, clock, true);
    expect(cancelled.status).toBe("CANCELLED");
    expect(() => scheduler.updateSchedule(schedule.id, { status: "ACTIVE" }, sessionA, clock, true)).toThrow("cannot be resumed");
  });

  it("stops new ticks and waits for an in-flight tick during shutdown", async () => {
    let release!: () => void;
    let started!: () => void;
    const startedPromise = new Promise<void>((resolve) => { started = resolve; });
    const releasePromise = new Promise<void>((resolve) => { release = resolve; });
    let calls = 0;
    const controller = scheduler.startScheduler({ enabled: true, tickMs: 60_000, tick: async () => {
      calls += 1;
      started();
      await releasePromise;
    } });
    expect(controller).not.toBeNull();
    await startedPromise;
    let stopped = false;
    const stopping = controller!.stop().then(() => { stopped = true; });
    await Promise.resolve();
    expect(stopped).toBe(false);
    release();
    await stopping;
    expect(stopped).toBe(true);
    expect(calls).toBe(1);
  });
});
