import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const databasePath = `/tmp/tradesense-ownership-matrix-${process.pid}-${randomUUID()}.sqlite`;
process.env.DATA_MODE = "live";
process.env.LLM_PROVIDER = "gemini";
process.env.LLM_API_KEY = "";
process.env.RYO_MCP_KEY = "";
process.env.DATABASE_PATH = databasePath;

const [{ FixtureModelAdapter, FixtureResearchAdapter }, database, services, scheduler] = await Promise.all([
  import("../../../tests/support/providers.js"),
  import("./db.js"),
  import("./services.js"),
  import("./scheduler.js"),
]);

describe("session ownership matrix", () => {
  beforeAll(() => database.migrate());

  afterAll(() => {
    database.db.close();
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${databasePath}${suffix}`, { force: true });
  });

  it("keeps runs, evidence, portfolio, conversations, schedules, and market snapshots isolated", async () => {
    const owner = "81000000-0000-4000-8000-000000000008";
    const outsider = "82000000-0000-4000-8000-000000000008";
    const research = new FixtureResearchAdapter();
    const model = new FixtureModelAdapter();
    const run = await services.createRun("BTC", `owned-${randomUUID()}`, { research, model }, owner);
    const conversation = services.createConversation("BTC", owner);
    const schedule = scheduler.createSchedule({ symbols: ["BTC"], cadenceMinutes: 5 }, owner);
    const market = await services.refreshMarketOverview(owner, { research });

    expect(() => services.getRun(run.id, outsider)).toThrow("Run not found");
    expect(() => services.replayRun(run.id, outsider)).toThrow("Completed decision and simulation result are required");
    expect(() => services.conversationView(conversation.id, outsider)).toThrow("Conversation not found");
    expect(() => scheduler.updateSchedule(schedule.id, { status: "PAUSED" }, outsider)).toThrow("Schedule not found");
    expect(services.history(outsider)).toEqual([]);
    expect(services.listConversations(outsider)).toEqual([]);
    expect(scheduler.listSchedules(outsider)).toEqual([]);
    expect(services.marketOverview(outsider).snapshot).toBeNull();
    expect(services.dashboardSummary("BTC", outsider).latestRun).toBeNull();
    expect(services.portfolio(outsider)).toMatchObject({ cashUsd: "10000.00", version: 0, holdings: [] });

    expect(services.getRun(run.id, owner).evidence).toHaveLength(5);
    expect(services.listConversations(owner).map((item) => item.id)).toEqual([conversation.id]);
    expect(scheduler.listSchedules(owner).map((item) => item.id)).toEqual([schedule.id]);
    expect(market.snapshot?.tool).toBe("market_overview");
    expect(services.portfolio(owner).version).toBe(1);
  });
});
