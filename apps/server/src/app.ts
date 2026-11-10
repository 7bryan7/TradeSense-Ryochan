import express from "express";
import cors from "cors";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { createMessageSchema, createRunSchema, dataModeSchema, tokenSymbolSchema, type DataMode } from "@tradesense/core";
import { config } from "./config.js";
import { migrate } from "./db.js";
import { ask, conversationView, createConversation, createPracticePortfolio, createRun, dashboardSummary, getRun, history, latestNews, listConversations, liveMarketChart, liveModeAvailable, marketOverview, portfolio, refreshMarketOverview, refreshNews, replayRun, touchSession } from "./services.js";
import { createSchedule, listSchedules, updateSchedule } from "./scheduler.js";
import { consumeHttpRequest } from "./limits.js";

const sessionIdSchema = z.string().uuid();
const chartRangeSchema = z.enum(["1D", "1W", "1M", "3M", "1Y"]);
const requestMode = (value: string | undefined): DataMode => dataModeSchema.parse(value ?? config.DATA_MODE);

export function createApp() {
  migrate();
  const app = express();
  app.use(cors({ origin: config.WEB_ORIGIN }));
  app.use(express.json({ limit: "32kb" }));
  app.get("/api/health", (req, res, next) => {
    try {
      const mode = requestMode(req.header("x-tradesense-mode"));
      res.json({ status: "ok", mode, defaultMode: config.DATA_MODE, availableModes: ["live"], providersConfigured: liveModeAvailable, trading: "simulated-only", schedulerEnabled: config.SCHEDULER_ENABLED, policy: { initialCashUsd: config.SIM_INITIAL_CASH, feeBps: config.SIM_FEE_BPS, slippageBps: config.SIM_SLIPPAGE_BPS, maxBuyEquityBps: config.SIM_MAX_BUY_EQUITY_BPS, maxTokenExposureBps: config.SIM_MAX_TOKEN_EXPOSURE_BPS, maxPriceAgeSeconds: config.SIM_MAX_PRICE_AGE_SECONDS } });
    } catch (error) { next(error); }
  });
  app.use("/api", (req, res, next) => {
    try {
      const sessionId = sessionIdSchema.parse(req.header("x-tradesense-session"));
      touchSession(sessionId);
      consumeHttpRequest(sessionId);
      res.locals.sessionId = sessionId;
      res.locals.mode = requestMode(req.header("x-tradesense-mode"));
      next();
    } catch (error) {
      if (sessionIdSchema.safeParse(req.header("x-tradesense-session")).success) { next(error); return; }
      next(Object.assign(new Error("A valid X-TradeSense-Session header is required"), { status: 401, code: "SESSION_REQUIRED", retryable: false, cause: error }));
    }
  });
  app.get("/api/market", (_req, res, next) => { try { res.json(marketOverview(res.locals.sessionId, new Date(), res.locals.mode)); } catch (e) { next(e); } });
  app.post("/api/market/refresh", async (_req, res, next) => { try { res.json(await refreshMarketOverview(res.locals.sessionId, undefined, res.locals.mode)); } catch (e) { next(e); } });
  app.post("/api/runs", async (req, res, next) => { try { const body = createRunSchema.parse(req.body); res.status(201).json(await createRun(body.symbol, body.idempotencyKey, undefined, res.locals.sessionId, res.locals.mode)); } catch (e) { next(e); } });
  app.get("/api/runs/:id/replay", (req, res, next) => { try { res.json(replayRun(req.params.id, res.locals.sessionId, res.locals.mode)); } catch (e) { next(e); } });
  app.get("/api/runs/:id", (req, res, next) => { try { res.json(getRun(req.params.id, res.locals.sessionId, res.locals.mode)); } catch (e) { next(e); } });
  app.get("/api/history", (_req, res) => res.json(history(res.locals.sessionId, res.locals.mode)));
  app.get("/api/news", (req, res, next) => { try { const symbol = tokenSymbolSchema.parse(req.query.symbol ?? "SOL"); res.json(latestNews(symbol, res.locals.sessionId, res.locals.mode)); } catch (e) { next(e); } });
  app.post("/api/news/refresh", async (req, res, next) => { try { const symbol = tokenSymbolSchema.parse(req.body?.symbol ?? "SOL"); res.json({ symbol, status: "available", evidence: await refreshNews(symbol, res.locals.sessionId, res.locals.mode) }); } catch (e) { next(e); } });
  app.get("/api/portfolio", (_req, res) => res.json(portfolio(res.locals.sessionId, new Date(), res.locals.mode)));
  app.post("/api/portfolio/new", (_req, res, next) => { try { res.status(201).json(createPracticePortfolio(res.locals.sessionId, res.locals.mode)); } catch (e) { next(e); } });
  app.get("/api/dashboard", async (req, res, next) => {
    try {
      const symbol = tokenSymbolSchema.parse(req.query.symbol ?? "SOL");
      const range = chartRangeSchema.parse(req.query.range ?? "1D");
      const generatedAt = new Date();
      const dashboard = dashboardSummary(symbol, res.locals.sessionId, generatedAt, res.locals.mode);
      let chart = range === "1D" ? dashboard.chart : { status: "unavailable" as const, reason: `No saved ${range} chart is available.` };
      try {
        const publicChart = await liveMarketChart(symbol, res.locals.sessionId, generatedAt, res.locals.mode, undefined, range);
        if (publicChart.status === "available" || chart.status === "unavailable") chart = publicChart;
      } catch (error) {
        if (chart.status === "unavailable") {
          chart = { status: "unavailable", reason: error instanceof Error ? `Coinbase public candle data unavailable: ${error.message}` : "Coinbase public candle data unavailable." };
        }
      }
      res.json({ ...dashboard, chart });
    } catch (e) { next(e); }
  });
  app.get("/api/schedules", (_req, res) => res.json(listSchedules(res.locals.sessionId, res.locals.mode)));
  app.post("/api/schedules", (req, res, next) => { try { res.status(201).json(createSchedule(req.body, res.locals.sessionId, new Date(), res.locals.mode)); } catch (e) { next(e); } });
  app.patch("/api/schedules/:id", (req, res, next) => { try { res.json(updateSchedule(req.params.id, req.body, res.locals.sessionId, new Date(), config.SCHEDULER_ENABLED, res.locals.mode)); } catch (e) { next(e); } });
  app.post("/api/chat/conversations", (req, res, next) => { try { const symbol = req.body?.symbol ? tokenSymbolSchema.parse(req.body.symbol) : undefined; res.status(201).json(createConversation(symbol, res.locals.sessionId, res.locals.mode)); } catch (e) { next(e); } });
  app.get("/api/chat/conversations", (_req, res) => res.json(listConversations(res.locals.sessionId, res.locals.mode)));
  app.get("/api/chat/conversations/:id", (req, res, next) => { try { res.json(conversationView(req.params.id, res.locals.sessionId, res.locals.mode)); } catch (e) { next(e); } });
  app.post("/api/chat/conversations/:id/messages", async (req, res, next) => { try { const body = createMessageSchema.parse(req.body); res.status(201).json(await ask(req.params.id, body.text, body.idempotencyKey, body.symbol, body.runId, res.locals.sessionId, undefined, res.locals.mode)); } catch (e) { next(e); } });
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
