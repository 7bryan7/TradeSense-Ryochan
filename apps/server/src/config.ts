import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { z } from "zod";
import { dataModeSchema } from "@tradesense/core";

const workspaceRoot = resolve(import.meta.dirname, "../../..");
loadEnv({ path: resolve(workspaceRoot, ".env"), quiet: true });

const envSchema = z.object({
  DATA_MODE: dataModeSchema.default("fixture"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
  DATABASE_PATH: z.string().default("./data/tradesense.sqlite"),
  RYO_MCP_URL: z.string().url().default("https://app-ryochan.com/api/mcp"),
  RYO_MCP_KEY: z.string().default(""),
  LLM_PROVIDER: z.enum(["fixture", "gemini"]).default("fixture"),
  LLM_MODEL: z.string().default("gemini-3.5-flash-lite"),
  LLM_API_KEY: z.string().default(""),
  SIM_INITIAL_CASH: z.coerce.number().positive().default(10_000),
  SIM_FEE_BPS: z.coerce.number().int().min(0).max(1000).default(10),
  SIM_SLIPPAGE_BPS: z.coerce.number().int().min(0).max(1000).default(10),
  SIM_MAX_BUY_EQUITY_BPS: z.coerce.number().int().min(1).max(10_000).default(500),
  SIM_MAX_TOKEN_EXPOSURE_BPS: z.coerce.number().int().min(1).max(10_000).default(2000),
});

const parsed = envSchema.parse(process.env);
if (parsed.DATA_MODE === "live" && !parsed.RYO_MCP_KEY) throw new Error("RYO_MCP_KEY is required in live mode");
if (parsed.LLM_PROVIDER === "gemini" && !parsed.LLM_API_KEY) throw new Error("LLM_API_KEY is required when LLM_PROVIDER=gemini");
if (parsed.DATA_MODE === "live" && parsed.LLM_PROVIDER !== "gemini") throw new Error("Live mode requires the Gemini model adapter");

export const config = {
  ...parsed,
  DATABASE_PATH: resolve(workspaceRoot, parsed.DATABASE_PATH),
  simulation: {
    feeBps: BigInt(parsed.SIM_FEE_BPS), slippageBps: BigInt(parsed.SIM_SLIPPAGE_BPS),
    maxBuyEquityBps: BigInt(parsed.SIM_MAX_BUY_EQUITY_BPS), maxTokenExposureBps: BigInt(parsed.SIM_MAX_TOKEN_EXPOSURE_BPS),
  },
};
