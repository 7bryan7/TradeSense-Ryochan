import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { ModelAdapter, ResearchAdapter } from "@tradesense/adapters";
import { tokenSymbolSchema, type DataMode } from "@tradesense/core";
import { config } from "./config.js";
import { db, transaction } from "./db.js";
import { createRun, runDependenciesForMode, touchSession } from "./services.js";

export const createScheduleSchema = z.object({
  symbols: z.array(tokenSymbolSchema).min(1).max(3).transform((symbols) => [...new Set(symbols)]),
  cadenceMinutes: z.number().int().min(5).max(1_440),
  maxRunsPerDay: z.number().int().min(1).max(100).default(24),
});

export const updateScheduleSchema = z.object({ status: z.enum(["ACTIVE", "PAUSED", "CANCELLED"]) });

type ScheduleRow = {
  id: string; session_id: string; mode: string; symbols_json: string; cadence_seconds: number;
  max_runs_per_day: number; status: "ACTIVE" | "PAUSED" | "CANCELLED"; next_slot_at: string;
  last_slot_at: string | null; last_run_id: string | null; created_at: string; updated_at: string;
};

export interface SchedulerDependencies {
  research?: ResearchAdapter;
  model?: ModelAdapter;
  now?: () => Date;
  workerId?: string;
  maxJobs?: number;
}

function scheduleView(row: ScheduleRow) {
  const latest = db.prepare("SELECT symbol, slot_at, status, run_id, error_code, error_message, updated_at FROM schedule_slots WHERE schedule_id=? ORDER BY slot_at DESC, rowid DESC LIMIT 1").get(row.id) as any;
  return {
    id: row.id, mode: row.mode, symbols: JSON.parse(row.symbols_json) as string[], cadenceMinutes: row.cadence_seconds / 60,
    maxRunsPerDay: row.max_runs_per_day, status: row.status, nextSlotAt: row.next_slot_at, lastSlotAt: row.last_slot_at,
    lastRunId: row.last_run_id, workerEnabled: config.SCHEDULER_ENABLED,
    latestSlot: latest ? { symbol: latest.symbol, slotAt: latest.slot_at, status: latest.status, runId: latest.run_id, errorCode: latest.error_code, errorMessage: latest.error_message, updatedAt: latest.updated_at } : null,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function ownedSchedule(id: string, sessionId: string, mode: DataMode = "live"): ScheduleRow {
  const row = db.prepare("SELECT * FROM schedules WHERE id=? AND session_id=? AND (? IS NULL OR mode=?)").get(id, sessionId, mode ?? null, mode ?? null) as ScheduleRow | undefined;
  if (!row) throw Object.assign(new Error("Schedule not found"), { status: 404 });
  return row;
}

export function listSchedules(sessionId: string, mode: DataMode = config.DATA_MODE) {
  const rows = db.prepare("SELECT * FROM schedules WHERE session_id=? AND mode=? ORDER BY created_at DESC").all(sessionId, mode) as ScheduleRow[];
  return rows.map(scheduleView);
}

export function createSchedule(input: unknown, sessionId: string, instant = new Date(), mode: DataMode = config.DATA_MODE) {
  const parsed = createScheduleSchema.parse(input);
  touchSession(sessionId);
  const existing = db.prepare("SELECT id FROM schedules WHERE session_id=? AND mode=? AND status<>'CANCELLED' LIMIT 1").get(sessionId, mode);
  if (existing) throw Object.assign(new Error("This session already has an active or paused schedule; update or cancel it before creating another"), { status: 409, code: "SCHEDULE_EXISTS", retryable: false });
  const id = randomUUID();
  const timestamp = instant.toISOString();
  const nextSlot = new Date(instant.getTime() + parsed.cadenceMinutes * 60_000).toISOString();
  db.prepare("INSERT INTO schedules (id, session_id, mode, symbols_json, cadence_seconds, max_runs_per_day, status, next_slot_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'PAUSED', ?, ?, ?)")
    .run(id, sessionId, mode, JSON.stringify(parsed.symbols), parsed.cadenceMinutes * 60, parsed.maxRunsPerDay, nextSlot, timestamp, timestamp);
  return scheduleView(ownedSchedule(id, sessionId, mode));
}

export function updateSchedule(id: string, input: unknown, sessionId: string, instant = new Date(), operatorEnabled = config.SCHEDULER_ENABLED, mode: DataMode = "live") {
  const parsed = updateScheduleSchema.parse(input);
  const schedule = ownedSchedule(id, sessionId, mode);
  if (schedule.status === "CANCELLED" && parsed.status !== "CANCELLED") throw Object.assign(new Error("Cancelled schedules cannot be resumed"), { status: 409, code: "SCHEDULE_TERMINAL", retryable: false });
  if (parsed.status === "ACTIVE" && !operatorEnabled) throw Object.assign(new Error("Recurring scans are disabled by the server operator"), { status: 409, code: "SCHEDULER_DISABLED", retryable: false });
  const timestamp = instant.toISOString();
  const nextSlot = parsed.status === "ACTIVE" && schedule.status !== "ACTIVE"
    ? new Date(instant.getTime() + schedule.cadence_seconds * 1_000).toISOString()
    : schedule.next_slot_at;
  transaction(() => {
    db.prepare("UPDATE schedules SET status=?, next_slot_at=?, updated_at=? WHERE id=? AND session_id=?")
      .run(parsed.status, nextSlot, timestamp, id, sessionId);
    if (parsed.status !== "ACTIVE") {
      db.prepare("UPDATE schedule_slots SET status='CANCELLED', error_code='SCHEDULE_CANCELLED', error_message='Schedule was paused or cancelled before the slot ran', updated_at=? WHERE schedule_id=? AND status='QUEUED'")
        .run(timestamp, id);
    }
  });
  return scheduleView(ownedSchedule(id, sessionId, mode));
}

function materializeDueSlots(instant: Date): number {
  const timestamp = instant.toISOString();
  const day = timestamp.slice(0, 10);
  const due = db.prepare("SELECT * FROM schedules WHERE mode='live' AND status='ACTIVE' AND next_slot_at<=? ORDER BY next_slot_at LIMIT 20").all(timestamp) as ScheduleRow[];
  let created = 0;
  for (const schedule of due) {
    const symbols = JSON.parse(schedule.symbols_json) as string[];
    const used = db.prepare("SELECT COUNT(*) AS count FROM schedule_slots WHERE schedule_id=? AND substr(slot_at,1,10)=? AND attempt_count>0").get(schedule.id, day) as { count: number };
    const remaining = Math.max(0, schedule.max_runs_per_day - used.count);
    transaction(() => {
      for (const symbol of symbols.slice(0, remaining)) {
        const result = db.prepare("INSERT OR IGNORE INTO schedule_slots (id, schedule_id, session_id, symbol, slot_at, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'QUEUED', ?, ?)")
          .run(randomUUID(), schedule.id, schedule.session_id, symbol, schedule.next_slot_at, timestamp, timestamp);
        created += Number(result.changes);
      }
      const nextSlot = new Date(instant.getTime() + schedule.cadence_seconds * 1_000).toISOString();
      db.prepare("UPDATE schedules SET last_slot_at=next_slot_at, next_slot_at=?, updated_at=? WHERE id=? AND status='ACTIVE'")
        .run(nextSlot, timestamp, schedule.id);
    });
  }
  return created;
}

function claimSlot(workerId: string, instant: Date) {
  return transaction(() => {
    const timestamp = instant.toISOString();
    const row = db.prepare(`SELECT ss.*, s.mode AS schedule_mode FROM schedule_slots ss JOIN schedules s ON s.id=ss.schedule_id
      WHERE s.mode='live' AND s.status='ACTIVE' AND (ss.status='QUEUED' OR (ss.status='RUNNING' AND ss.lease_expires_at<=?))
      AND NOT EXISTS (SELECT 1 FROM schedule_slots busy WHERE busy.session_id=ss.session_id AND busy.status='RUNNING' AND busy.lease_expires_at>? AND busy.id<>ss.id)
      ORDER BY ss.slot_at, ss.rowid LIMIT 1`).get(timestamp, timestamp) as any;
    if (!row) return null;
    const leaseExpires = new Date(instant.getTime() + config.SCHEDULER_LEASE_SECONDS * 1_000).toISOString();
    const changed = db.prepare("UPDATE schedule_slots SET status='RUNNING', attempt_count=attempt_count+1, lease_owner=?, lease_expires_at=?, error_code=NULL, error_message=NULL, updated_at=? WHERE id=? AND (status='QUEUED' OR lease_expires_at<=?)")
      .run(workerId, leaseExpires, timestamp, row.id, timestamp);
    return Number(changed.changes) === 1 ? { ...row, lease_owner: workerId, lease_expires_at: leaseExpires } : null;
  });
}

function assertSlotCanApply(slotId: string, workerId: string, instant: Date): void {
  const row = db.prepare("SELECT ss.status AS slot_status, ss.lease_owner, s.status AS schedule_status FROM schedule_slots ss JOIN schedules s ON s.id=ss.schedule_id WHERE ss.id=?").get(slotId) as any;
  if (!row || row.slot_status !== "RUNNING" || row.lease_owner !== workerId || row.schedule_status !== "ACTIVE") {
    throw Object.assign(new Error("The schedule was paused or cancelled before simulation application"), { status: 409, code: "SCHEDULE_CANCELLED", retryable: false });
  }
  db.prepare("UPDATE schedule_slots SET lease_expires_at=?, updated_at=? WHERE id=? AND lease_owner=?")
    .run(new Date(instant.getTime() + config.SCHEDULER_LEASE_SECONDS * 1_000).toISOString(), instant.toISOString(), slotId, workerId);
}

export async function runSchedulerTick(dependencies: SchedulerDependencies = {}) {
  const clock = dependencies.now ?? (() => new Date());
  const workerId = dependencies.workerId ?? randomUUID();
  const maxJobs = dependencies.maxJobs ?? 1;
  const materialized = materializeDueSlots(clock());
  const results: Array<{ slotId: string; status: string; runId?: string }> = [];
  for (let index = 0; index < maxJobs; index += 1) {
    const slot = claimSlot(workerId, clock());
    if (!slot) break;
    const idempotencyKey = `schedule:${slot.schedule_id}:${slot.symbol}:${slot.slot_at}`;
    try {
      const mode = slot.schedule_mode as DataMode;
      const selected = dependencies.research && dependencies.model ? { research: dependencies.research, model: dependencies.model } : runDependenciesForMode(mode);
      const run = await createRun(slot.symbol, idempotencyKey, {
        ...selected, now: clock,
        beforeApply: () => assertSlotCanApply(slot.id, workerId, clock()),
      }, slot.session_id, mode);
      transaction(() => {
        db.prepare("UPDATE schedule_slots SET status='COMPLETED', run_id=?, lease_owner=NULL, lease_expires_at=NULL, updated_at=? WHERE id=? AND lease_owner=?")
          .run(run.id, clock().toISOString(), slot.id, workerId);
        db.prepare("UPDATE schedules SET last_run_id=?, updated_at=? WHERE id=?").run(run.id, clock().toISOString(), slot.schedule_id);
      });
      results.push({ slotId: slot.id, status: "COMPLETED", runId: run.id });
    } catch (error) {
      const value = error as Error & { code?: string };
      const runRow = db.prepare("SELECT id FROM runs WHERE session_id=? AND idempotency_key=? ORDER BY created_at DESC LIMIT 1").get(slot.session_id, idempotencyKey) as { id: string } | undefined;
      const status = value.code === "SCHEDULE_CANCELLED" ? "CANCELLED" : "FAILED";
      db.prepare("UPDATE schedule_slots SET status=?, run_id=?, error_code=?, error_message=?, lease_owner=NULL, lease_expires_at=NULL, updated_at=? WHERE id=? AND lease_owner=?")
        .run(status, runRow?.id ?? null, value.code ?? "SCHEDULE_RUN_FAILED", value.message.slice(0, 1_000), clock().toISOString(), slot.id, workerId);
      results.push({ slotId: slot.id, status, ...(runRow ? { runId: runRow.id } : {}) });
    }
  }
  return { materialized, results };
}

export interface SchedulerController { stop: () => Promise<void> }

interface StartSchedulerOptions {
  enabled?: boolean;
  tickMs?: number;
  tick?: () => Promise<unknown>;
}

export function startScheduler(options: StartSchedulerOptions = {}): SchedulerController | null {
  if (!(options.enabled ?? config.SCHEDULER_ENABLED)) return null;
  const workerId = randomUUID();
  let stopping = false;
  let active: Promise<unknown> | null = null;
  const tick = () => {
    if (stopping || active) return;
    active = (options.tick ? options.tick() : runSchedulerTick({ workerId }))
      .catch(() => { console.error("TradeSense scheduler tick failed; recovery remains in the durable slot state."); })
      .finally(() => { active = null; });
  };
  const timer = setInterval(tick, options.tickMs ?? config.SCHEDULER_TICK_MS);
  timer.unref();
  tick();
  return {
    stop: async () => {
      stopping = true;
      clearInterval(timer);
      await active;
    },
  };
}
