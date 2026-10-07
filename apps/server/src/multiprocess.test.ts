import { fork, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const databasePath = `/tmp/tradesense-multiprocess-${process.pid}-${randomUUID()}.sqlite`;
process.env.DATA_MODE = "live";
process.env.LLM_PROVIDER = "gemini";
process.env.LLM_API_KEY = "";
process.env.RYO_MCP_KEY = "";
process.env.DATABASE_PATH = databasePath;
process.env.SCHEDULER_ENABLED = "false";

const [database, services, scheduler] = await Promise.all([
  import("./db.js"),
  import("./services.js"),
  import("./scheduler.js"),
]);

type ChildMessage = { type: "ready" | "model-ready" | "result" | "error"; result?: any; error?: { message: string; code?: string; status?: number } };

function child(): ChildProcess {
  return fork(fileURLToPath(new URL("../../../tests/support/multiprocess-worker.ts", import.meta.url)), [], {
    execArgv: ["--import", "tsx"],
    env: { ...process.env, DATABASE_PATH: databasePath, DATA_MODE: "live", LLM_PROVIDER: "gemini", LLM_API_KEY: "", RYO_MCP_KEY: "" },
    stdio: ["ignore", "ignore", "pipe", "ipc"],
  });
}

function nextMessage(process: ChildProcess, type: ChildMessage["type"]): Promise<ChildMessage> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting for child ${type}`)), 15_000);
    const listener = (message: ChildMessage) => {
      if (message.type !== type && message.type !== "error") return;
      clearTimeout(timeout);
      process.off("message", listener);
      resolve(message);
    };
    process.on("message", listener);
    process.once("error", reject);
  });
}

async function readyChild(): Promise<ChildProcess> {
  const process = child();
  const message = await nextMessage(process, "ready");
  expect(message.type).toBe("ready");
  return process;
}

async function closeChildren(children: ChildProcess[]): Promise<void> {
  await Promise.all(children.map((process) => new Promise<void>((resolve) => {
    if (process.exitCode !== null) return resolve();
    process.once("exit", () => resolve());
  })));
}

describe("cross-process persistence safety", () => {
  beforeAll(() => database.migrate());

  afterAll(() => {
    database.db.close();
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${databasePath}${suffix}`, { force: true });
  });

  it("lets only one stale portfolio snapshot mutate the ledger", async () => {
    const sessionId = "71000000-0000-4000-8000-000000000007";
    services.portfolio(sessionId);
    const children = await Promise.all([readyChild(), readyChild()]);
    children[0].send({ type: "manual", symbol: "BTC", key: `parallel-a-${randomUUID()}`, sessionId, synchronizeModel: true });
    children[1].send({ type: "manual", symbol: "BTC", key: `parallel-b-${randomUUID()}`, sessionId, synchronizeModel: true });
    await Promise.all(children.map((process) => nextMessage(process, "model-ready")));
    const results = children.map((process) => nextMessage(process, "result"));
    children.forEach((process) => process.send({ type: "release-model" }));
    const messages = await Promise.all(results);
    await closeChildren(children);

    expect(messages.every((message) => message.type === "result")).toBe(true);
    expect(messages.map((message) => message.result.outcome).sort()).toEqual(["APPLIED", "BLOCKED_PORTFOLIO_CHANGED"]);
    expect(services.portfolio(sessionId).version).toBe(1);
    const counts = database.db.prepare(`SELECT COUNT(*) AS fills, COUNT(DISTINCT f.decision_id) AS decisions,
      SUM(CASE WHEN f.outcome='APPLIED' THEN 1 ELSE 0 END) AS applied
      FROM fills f JOIN decisions d ON d.id=f.decision_id JOIN runs r ON r.id=d.run_id WHERE r.session_id=?`).get(sessionId) as any;
    expect(counts).toMatchObject({ fills: 2, decisions: 2, applied: 1 });
  }, 30_000);

  it("cannot create duplicate runs or fills for one idempotency key across processes", async () => {
    const sessionId = "71500000-0000-4000-8000-000000000007";
    const key = `same-key-${randomUUID()}`;
    services.portfolio(sessionId);
    const children = await Promise.all([readyChild(), readyChild()]);
    const results = children.map((process) => nextMessage(process, "result"));
    children.forEach((process) => process.send({ type: "manual", symbol: "BTC", key, sessionId, synchronizeModel: false }));
    const messages = await Promise.all(results);
    await closeChildren(children);

    expect(messages.every((message) => message.type === "result")).toBe(true);
    expect(new Set(messages.map((message) => message.result.id)).size).toBe(1);
    const counts = database.db.prepare(`SELECT COUNT(DISTINCT r.id) AS runs, COUNT(DISTINCT d.id) AS decisions, COUNT(DISTINCT f.id) AS fills
      FROM runs r LEFT JOIN decisions d ON d.run_id=r.id LEFT JOIN fills f ON f.decision_id=d.id
      WHERE r.session_id=? AND r.idempotency_key=?`).get(sessionId, key) as any;
    expect(counts).toMatchObject({ runs: 1, decisions: 1, fills: 1 });
    const saved = database.db.prepare("SELECT id FROM runs WHERE session_id=? AND idempotency_key=?").get(sessionId, key) as { id: string };
    expect(services.getRun(saved.id, sessionId)).toMatchObject({ status: "COMPLETED", simulation: { outcome: "APPLIED" } });
  }, 30_000);

  it("allows only one process to claim a durable scheduler slot", async () => {
    const sessionId = "72000000-0000-4000-8000-000000000007";
    const start = new Date("2026-10-01T10:00:00.000Z");
    const schedule = scheduler.createSchedule({ symbols: ["ETH"], cadenceMinutes: 5, maxRunsPerDay: 2 }, sessionId, start);
    scheduler.updateSchedule(schedule.id, { status: "ACTIVE" }, sessionId, start, true);
    const instant = new Date(start.getTime() + 5 * 60_000).toISOString();
    const children = await Promise.all([readyChild(), readyChild()]);
    const results = children.map((process) => nextMessage(process, "result"));
    children[0].send({ type: "scheduler", instant, workerId: "process-a" });
    children[1].send({ type: "scheduler", instant, workerId: "process-b" });
    const messages = await Promise.all(results);
    await closeChildren(children);

    expect(messages.every((message) => message.type === "result")).toBe(true);
    expect(messages.flatMap((message) => message.result.results)).toHaveLength(1);
    const slot = database.db.prepare("SELECT status, attempt_count, run_id FROM schedule_slots WHERE schedule_id=?").get(schedule.id) as any;
    expect(slot).toMatchObject({ status: "COMPLETED", attempt_count: 1 });
    expect(slot.run_id).toBeTruthy();
    const fillCount = database.db.prepare("SELECT COUNT(*) AS count FROM fills f JOIN decisions d ON d.id=f.decision_id JOIN runs r ON r.id=d.run_id WHERE r.session_id=?").get(sessionId) as { count: number };
    expect(fillCount.count).toBe(1);
  }, 30_000);
});
