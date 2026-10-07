import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const databasePath = `/tmp/tradesense-limits-${process.pid}-${randomUUID()}.sqlite`;
process.env.DATA_MODE = "live";
process.env.LLM_PROVIDER = "gemini";
process.env.DATABASE_PATH = databasePath;

const [database, limits, services] = await Promise.all([
  import("./db.js"),
  import("./limits.js"),
  import("./services.js"),
]);

const sessionA = "50000000-0000-4000-8000-000000000005";
const sessionB = "60000000-0000-4000-8000-000000000006";

describe("durable request and provider limits", () => {
  beforeAll(() => {
    database.migrate();
    services.touchSession(sessionA);
    services.touchSession(sessionB);
  });

  afterAll(() => {
    database.db.close();
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${databasePath}${suffix}`, { force: true });
  });

  it("limits HTTP requests per session and UTC minute", () => {
    const firstMinute = new Date("2026-09-26T10:15:05.000Z");
    limits.consumeHttpRequest(sessionA, firstMinute, 2);
    limits.consumeHttpRequest(sessionA, firstMinute, 2);
    expect(() => limits.consumeHttpRequest(sessionA, firstMinute, 2)).toThrow("Session request limit reached");
    expect(() => limits.consumeHttpRequest(sessionB, firstMinute, 2)).not.toThrow();
    expect(() => limits.consumeHttpRequest(sessionA, new Date("2026-09-26T10:16:00.000Z"), 2)).not.toThrow();
  });

  it("counts successful and failed provider operations against the daily cap", async () => {
    const clock = () => new Date("2026-09-26T11:00:00.000Z");
    await expect(limits.withProviderBudget("ryo", "decision", sessionA, async () => "ok", { now: clock, dailyCap: 2 })).resolves.toBe("ok");
    await expect(limits.withProviderBudget("ryo", "chat", sessionA, async () => { throw Object.assign(new Error("provider failed"), { code: "UPSTREAM" }); }, { now: clock, dailyCap: 2 })).rejects.toThrow("provider failed");
    await expect(limits.withProviderBudget("ryo", "market", sessionB, async () => "late", { now: clock, dailyCap: 2 })).rejects.toThrow("operator daily call cap reached");
    const statuses = database.db.prepare("SELECT status FROM provider_usage WHERE provider='ryo' ORDER BY rowid").all() as Array<{ status: string }>;
    expect(statuses.map((row) => row.status)).toEqual(["completed", "failed"]);
  });

  it("limits Gemini operations by session and UTC hour", async () => {
    const firstHour = () => new Date("2026-09-26T12:30:00.000Z");
    await limits.withProviderBudget("gemini", "chat", sessionA, async () => "a", { now: firstHour, dailyCap: 10, perSessionHourCap: 1 });
    await expect(limits.withProviderBudget("gemini", "chat", sessionA, async () => "blocked", { now: firstHour, dailyCap: 10, perSessionHourCap: 1 })).rejects.toThrow("Session model-call limit reached");
    await expect(limits.withProviderBudget("gemini", "chat", sessionB, async () => "b", { now: firstHour, dailyCap: 10, perSessionHourCap: 1 })).resolves.toBe("b");
    const nextHour = () => new Date("2026-09-26T13:00:00.000Z");
    await expect(limits.withProviderBudget("gemini", "decision", sessionA, async () => "next", { now: nextHour, dailyCap: 10, perSessionHourCap: 1 })).resolves.toBe("next");
  });
});
