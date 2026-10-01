import express from "express";
import cors from "cors";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { createMessageSchema, createRunSchema, tokenSymbolSchema } from "@tradesense/core";
import { config } from "./config.js";
import { migrate } from "./db.js";
import { ask, conversationView, createConversation, createRun, dashboardSummary, getRun, history, marketOverview, portfolio, refreshMarketOverview, replayRun, touchSession } from "./services.js";
import { createSchedule, listSchedules, updateSchedule } from "./scheduler.js";
import { consumeHttpRequest } from "./limits.js";

const sessionIdSchema = z.string().uuid();

export function createApp() {
  migrate();
  const app = express();
  app.use(cors({ origin: config.WEB_ORIGIN }));
  app.use(express.json({ limit: "32kb" }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok", mode: config.DATA_MODE, trading: "simulated-only", schedulerEnabled: config.SCHEDULER_ENABLED }));
  app.use("/api", (req, res, next) => {
    try {
      const sessionId = sessionIdSchema.parse(req.header("x-tradesense-session"));
      touchSession(sessionId);
      consumeHttpRequest(sessionId);
      res.locals.sessionId = sessionId;
      next();
    } catch (error) {
      next(Object.assign(new Error("A valid X-TradeSense-Session header is required"), { status: 401, code: "SESSION_REQUIRED", retryable: false, cause: error }));
    }
  });
  app.get("/api/market", (_req, res, next) => { try { res.json(marketOverview(res.locals.sessionId)); } catch (e) { next(e); } });
  app.post("/api/market/refresh", async (_req, res, next) => { try { res.json(await refreshMarketOverview(res.locals.sessionId)); } catch (e) { next(e); } });
  app.post("/api/runs", async (req, res, next) => { try { const body = createRunSchema.parse(req.body); res.status(201).json(await createRun(body.symbol, body.idempotencyKey, undefined, res.locals.sessionId)); } catch (e) { next(e); } });
  app.get("/api/runs/:id/replay", (req, res, next) => { try { res.json(replayRun(req.params.id, res.locals.sessionId)); } catch (e) { next(e); } });
  app.get("/api/runs/:id", (req, res, next) => { try { res.json(getRun(req.params.id, res.locals.sessionId)); } catch (e) { next(e); } });
  app.get("/api/history", (_req, res) => res.json(history(res.locals.sessionId)));
  app.get("/api/portfolio", (_req, res) => res.json(portfolio(res.locals.sessionId)));
  app.get("/api/dashboard", (req, res, next) => { try { const symbol = tokenSymbolSchema.parse(req.query.symbol ?? "SOL"); res.json(dashboardSummary(symbol, res.locals.sessionId)); } catch (e) { next(e); } });
  app.get("/api/schedules", (_req, res) => res.json(listSchedules(res.locals.sessionId)));
  app.post("/api/schedules", (req, res, next) => { try { res.status(201).json(createSchedule(req.body, res.locals.sessionId)); } catch (e) { next(e); } });
  app.patch("/api/schedules/:id", (req, res, next) => { try { res.json(updateSchedule(req.params.id, req.body, res.locals.sessionId)); } catch (e) { next(e); } });
  app.post("/api/chat/conversations", (req, res, next) => { try { const symbol = req.body?.symbol ? tokenSymbolSchema.parse(req.body.symbol) : undefined; res.status(201).json(createConversation(symbol, res.locals.sessionId)); } catch (e) { next(e); } });
  app.get("/api/chat/conversations/:id", (req, res, next) => { try { res.json(conversationView(req.params.id, res.locals.sessionId)); } catch (e) { next(e); } });
  app.post("/api/chat/conversations/:id/messages", async (req, res, next) => { try { const body = createMessageSchema.parse(req.body); res.status(201).json(await ask(req.params.id, body.text, body.idempotencyKey, body.symbol, body.runId, res.locals.sessionId)); } catch (e) { next(e); } });
  const webDist = resolve(import.meta.dirname, "../../web/dist");
  if (existsSync(webDist)) {
    app.use(express.static(webDist));
    app.use((req, res, next) => req.method === "GET" && !req.path.startsWith("/api/") ? res.sendFile(resolve(webDist, "index.html")) : next());
  }
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = typeof error === "object" && error && "status" in error ? Number(error.status) : error instanceof z.ZodError ? 400 : 500;
    const message = error instanceof Error ? error.message : "Unexpected server error";
    const code = typeof error === "object" && error && "code" in error && typeof error.code === "string"
      ? error.code
      : status === 409 ? "CONFLICT" : status === 400 ? "INVALID_INPUT" : "SERVER_ERROR";
    const retryable = typeof error === "object" && error && "retryable" in error && typeof error.retryable === "boolean" ? error.retryable : status >= 500;
    res.status(status).json({ code, message, requestId: crypto.randomUUID(), retryable });
  });
  return app;
}
