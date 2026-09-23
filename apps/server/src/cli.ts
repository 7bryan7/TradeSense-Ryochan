import { config } from "./config.js";
import { migrate } from "./db.js";
import { research } from "./services.js";

const command = process.argv[2];
if (command === "doctor") {
  migrate();
  console.log(JSON.stringify({ node: process.version, mode: config.DATA_MODE, database: "ready", ryoKeyConfigured: Boolean(config.RYO_MCP_KEY), llmProvider: config.LLM_PROVIDER, llmModel: config.LLM_MODEL, llmKeyConfigured: Boolean(config.LLM_API_KEY), trading: "simulated-only" }, null, 2));
} else if (command === "migrate") {
  migrate(); console.log("Database migrations applied without resetting existing data.");
} else if (command === "smoke-live") {
  if (config.DATA_MODE !== "live") throw new Error("smoke:live requires DATA_MODE=live");
  console.log(JSON.stringify(await research.call("analyze_token", { symbol: "SOL" }), null, 2));
} else if (command === "replay") {
  console.log("Replay CLI is reserved for the next persistence milestone; no portfolio mutation occurred.");
} else {
  throw new Error("Expected doctor, migrate, smoke-live, or replay");
}
