import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { ResearchAdapter } from "@tradesense/adapters";

const databasePath = `/tmp/tradesense-mode-switching-${process.pid}-${randomUUID()}.sqlite`;
process.env.DATA_MODE = "live";
process.env.LLM_PROVIDER = "gemini";
process.env.LLM_API_KEY = "";
process.env.RYO_MCP_KEY = "";
process.env.DATABASE_PATH = databasePath;

const [{ FixtureModelAdapter, FixtureResearchAdapter }, database, services] = await Promise.all([
  import("../../../tests/support/providers.js"),
  import("./db.js"),
  import("./services.js"),
]);

describe("request-selected data modes", () => {
  beforeAll(() => database.migrate());

  afterAll(() => {
    database.db.close();
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${databasePath}${suffix}`, { force: true });
  });

  it("rejects fixture mode and non-live evidence", async () => {
    const { dataModeSchema } = await import("@tradesense/core");
    expect(dataModeSchema.safeParse("fixture").success).toBe(false);
    const source = new FixtureResearchAdapter();
    const research: ResearchAdapter = { call: async (tool, args) => ({ ...await source.call(tool, args), dataMode: "simulated" }) };
    await expect(services.createRun("BTC", `mismatch-${randomUUID()}`, {
      research, model: new FixtureModelAdapter(),
    }, "92000000-0000-4000-8000-000000000009", "live")).rejects.toThrow("simulated evidence while live mode was requested");
  });

  it("hides retained legacy fixture records from live reads and scheduling", async () => {
    const sessionId = "94000000-0000-4000-8000-000000000009";
    const run = await services.createRun("BTC", `legacy-${randomUUID()}`, {
      research: new FixtureResearchAdapter(), model: new FixtureModelAdapter(),
    }, sessionId);
    database.db.prepare("UPDATE runs SET mode='fixture' WHERE id=?").run(run.id);
    const conversation = services.createConversation("BTC", sessionId);
    database.db.prepare("UPDATE conversations SET mode='fixture' WHERE id=?").run(conversation.id);
    expect(services.history(sessionId)).toEqual([]);
    expect(services.listConversations(sessionId)).toEqual([]);
    expect(() => services.getRun(run.id, sessionId)).toThrow("Run not found");
    expect(() => services.conversationView(conversation.id, sessionId)).toThrow("Conversation not found");
    const scheduler = await import("./scheduler.js");
    const schedule = scheduler.createSchedule({ symbols: ["BTC"], cadenceMinutes: 5 }, sessionId);
    database.db.prepare("UPDATE schedules SET mode='fixture', status='ACTIVE', next_slot_at='2020-01-01T00:00:00.000Z' WHERE id=?").run(schedule.id);
    expect(scheduler.listSchedules(sessionId)).toEqual([]);
    const before = database.db.prepare("SELECT COUNT(*) AS count FROM schedule_slots WHERE schedule_id=?").get(schedule.id);
    await scheduler.runSchedulerTick({ research: new FixtureResearchAdapter(), model: new FixtureModelAdapter() });
    expect(database.db.prepare("SELECT COUNT(*) AS count FROM schedule_slots WHERE schedule_id=?").get(schedule.id)).toEqual(before);
  });

  it("archives the active practice portfolio and preserves its run history", async () => {
    const sessionId = "93000000-0000-4000-8000-000000000009";
    const fixtureResearch = new FixtureResearchAdapter();
    const model = new FixtureModelAdapter();
    const run = await services.createRun("SOL", `portfolio-${randomUUID()}`, { research: fixtureResearch, model }, sessionId, "live");
    const previous = services.portfolio(sessionId, new Date(), "live");

    const next = services.createPracticePortfolio(sessionId, "live");

    expect(next.id).not.toBe(previous.id);
    expect(next).toMatchObject({ cashUsd: "10000.00", realizedPnlUsd: "0.00", version: 0, holdings: [] });
    expect(services.history(sessionId, "live").map((item) => item.id)).toContain(run.id);
    expect(database.db.prepare("SELECT archived_at FROM portfolios WHERE id=?").get(previous.id)).toMatchObject({ archived_at: expect.any(String) });
  });
});
