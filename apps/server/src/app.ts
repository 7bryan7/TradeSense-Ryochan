import express from "express";
import cors from "cors";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { createMessageSchema, createRunSchema, tokenSymbolSchema } from "@tradesense/core";
import { config } from "./config.js";
import { migrate } from "./db.js";
import { ask, conversationView, createConversation, createRun, getRun, history, market, portfolio } from "./services.js";

export function createApp() {
  migrate();
  const app = express();
  app.use(cors({ origin: config.WEB_ORIGIN }));
  app.use(express.json({ limit: "32kb" }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok", mode: config.DATA_MODE, trading: "simulated-only" }));
  app.get("/api/market", async (_req, res, next) => { try { res.json(await market()); } catch (e) { next(e); } });
  app.post("/api/runs", async (req, res, next) => { try { const body = createRunSchema.parse(req.body); res.status(201).json(await createRun(body.symbol, body.idempotencyKey)); } catch (e) { next(e); } });
  app.get("/api/runs/:id", (req, res, next) => { try { res.json(getRun(req.params.id)); } catch (e) { next(e); } });
  app.get("/api/history", (_req, res) => res.json(history()));
  app.get("/api/portfolio", (_req, res) => res.json(portfolio()));
  app.post("/api/chat/conversations", (req, res, next) => { try { const symbol = req.body?.symbol ? tokenSymbolSchema.parse(req.body.symbol) : undefined; res.status(201).json(createConversation(symbol)); } catch (e) { next(e); } });
  app.get("/api/chat/conversations/:id", (req, res, next) => { try { res.json(conversationView(req.params.id)); } catch (e) { next(e); } });
  app.post("/api/chat/conversations/:id/messages", async (req, res, next) => { try { const body = createMessageSchema.parse(req.body); res.status(201).json(await ask(req.params.id, body.text, body.idempotencyKey, body.symbol, body.runId)); } catch (e) { next(e); } });
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
