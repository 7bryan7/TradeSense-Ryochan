import { config } from "./config.js";
import { migrate } from "./db.js";
import { callResearchWithBudget, DEFAULT_SESSION_ID, replayRun, research, touchSession } from "./services.js";

const command = process.argv[2];
if (command === "doctor") {
  migrate();
  console.log(JSON.stringify({ node: process.version, mode: config.DATA_MODE, database: "ready", ryoKeyConfigured: Boolean(config.RYO_MCP_KEY), tavilyKeyConfigured: Boolean(config.TAVILY_API_KEY), tavilyUse: "chat-only-when-required", tavilySearchDepth: config.TAVILY_SEARCH_DEPTH, tavilyMaxResults: config.TAVILY_MAX_RESULTS, tavilyTimeoutMs: config.TAVILY_TIMEOUT_MS, tavilyMonthlyCreditCap: config.TAVILY_MONTHLY_CREDIT_CAP, llmProvider: config.LLM_PROVIDER, llmModel: config.LLM_MODEL, llmKeyConfigured: Boolean(config.LLM_API_KEY), httpRequestsPerSessionMinute: config.HTTP_REQUESTS_PER_SESSION_MINUTE, modelCallsPerSessionHour: config.MODEL_CALLS_PER_SESSION_HOUR, ryoDailyCallCap: config.RYO_DAILY_CALL_CAP, geminiDailyCallCap: config.GEMINI_DAILY_CALL_CAP, chatMaxConversationsPerSession: config.CHAT_MAX_CONVERSATIONS_PER_SESSION, chatMaxMessagesPerConversation: config.CHAT_MAX_MESSAGES_PER_CONVERSATION, simulationMaxPriceAgeSeconds: config.SIM_MAX_PRICE_AGE_SECONDS, schedulerEnabled: config.SCHEDULER_ENABLED, schedulerTickMs: config.SCHEDULER_TICK_MS, schedulerLeaseSeconds: config.SCHEDULER_LEASE_SECONDS, trading: "simulated-only" }, null, 2));
} else if (command === "migrate") {
  migrate(); console.log("Database migrations applied without resetting existing data.");
} else if (command === "smoke-live") {
  if (config.DATA_MODE !== "live") throw new Error("smoke:live requires DATA_MODE=live");
  migrate();
  touchSession(DEFAULT_SESSION_ID);
  console.log(JSON.stringify(await callResearchWithBudget(research, "analyze_token", { symbol: "SOL" }, DEFAULT_SESSION_ID, "smoke"), null, 2));
} else if (command === "replay") {
  migrate();
  const flag = process.argv.indexOf("--run-id");
  const runId = flag >= 0 ? process.argv[flag + 1] : undefined;
  if (!runId) throw new Error("replay requires --run-id <id>");
  console.log(JSON.stringify(replayRun(runId), null, 2));
} else {
  throw new Error("Expected doctor, migrate, smoke-live, or replay");
}
