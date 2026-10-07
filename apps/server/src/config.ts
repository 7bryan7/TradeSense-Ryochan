import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { z } from "zod";
import { dataModeSchema } from "@tradesense/core";

const workspaceRoot = resolve(import.meta.dirname, "../../..");
loadEnv({ path: resolve(workspaceRoot, ".env"), quiet: true });

const envSchema = z.object({
  DATA_MODE: dataModeSchema.default("live"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
  DATABASE_PATH: z.string().default("./data/tradesense.sqlite"),
  RYO_MCP_URL: z.string().url().default("https://app-ryochan.com/api/mcp"),
  RYO_MCP_KEY: z.string().default(""),
  TAVILY_API_KEY: z.string().default(""),
  TAVILY_BASE_URL: z.string().url().default("https://api.tavily.com"),
  TAVILY_SEARCH_DEPTH: z.literal("basic").default("basic"),
  TAVILY_MAX_RESULTS: z.coerce.number().int().min(1).max(5).default(5),
  TAVILY_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(30_000).default(15_000),
  TAVILY_MONTHLY_CREDIT_CAP: z.coerce.number().int().min(1).default(1000),
  LLM_PROVIDER: z.literal("gemini").default("gemini"),
  LLM_MODEL: z.string().default("gemini-3.5-flash-lite"),
  LLM_API_KEY: z.string().default(""),
  SIM_INITIAL_CASH: z.coerce.number().positive().default(10_000),
  SIM_FEE_BPS: z.coerce.number().int().min(0).max(1000).default(10),
  SIM_SLIPPAGE_BPS: z.coerce.number().int().min(0).max(1000).default(10),
  SIM_MAX_BUY_EQUITY_BPS: z.coerce.number().int().min(1).max(10_000).default(500),
  SIM_MAX_TOKEN_EXPOSURE_BPS: z.coerce.number().int().min(1).max(10_000).default(2000),
  SIM_MAX_PRICE_AGE_SECONDS: z.coerce.number().int().min(1).max(3_600).default(60),
  MARKET_OVERVIEW_MAX_AGE_SECONDS: z.coerce.number().int().min(30).max(86_400).default(300),
  SCHEDULER_ENABLED: z.string().default("false").transform((value) => value === "true"),
  SCHEDULER_TICK_MS: z.coerce.number().int().min(1_000).max(60_000).default(10_000),
  SCHEDULER_LEASE_SECONDS: z.coerce.number().int().min(30).max(900).default(120),
  HTTP_REQUESTS_PER_SESSION_MINUTE: z.coerce.number().int().min(10).max(10_000).default(120),
  MODEL_CALLS_PER_SESSION_HOUR: z.coerce.number().int().min(1).max(1_000).default(30),
  RYO_DAILY_CALL_CAP: z.coerce.number().int().min(1).max(100_000).default(500),
  GEMINI_DAILY_CALL_CAP: z.coerce.number().int().min(1).max(100_000).default(200),
  CHAT_MAX_CONVERSATIONS_PER_SESSION: z.coerce.number().int().min(1).max(100).default(10),
  CHAT_MAX_MESSAGES_PER_CONVERSATION: z.coerce.number().int().min(2).max(1_000).default(100),
});

const parsed = envSchema.parse(process.env);

export const config = {
  ...parsed,
  DATABASE_PATH: resolve(workspaceRoot, parsed.DATABASE_PATH),
  simulation: {
    feeBps: BigInt(parsed.SIM_FEE_BPS), slippageBps: BigInt(parsed.SIM_SLIPPAGE_BPS),
    maxBuyEquityBps: BigInt(parsed.SIM_MAX_BUY_EQUITY_BPS), maxTokenExposureBps: BigInt(parsed.SIM_MAX_TOKEN_EXPOSURE_BPS),
  },
};
