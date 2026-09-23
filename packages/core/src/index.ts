import { z } from "zod";

export const dataModeSchema = z.enum(["fixture", "live"]);
export type DataMode = z.infer<typeof dataModeSchema>;

export const tokenSymbolSchema = z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,12}$/);

export const evidenceSchema = z.object({
  id: z.string(),
  tool: z.string(),
  symbol: tokenSymbolSchema.optional(),
  status: z.enum(["ok", "partial", "unavailable"]),
  dataMode: z.enum(["live", "mixed", "simulated", "unknown", "fixture"]),
  asOf: z.string().datetime(),
  retrievedAt: z.string().datetime(),
  data: z.record(z.string(), z.unknown()),
  summary: z.object({ headline: z.string(), keyPoints: z.array(z.string()).default([]) }),
  warnings: z.array(z.string()).default([]),
});
export type Evidence = z.infer<typeof evidenceSchema>;

export const actionSchema = z.enum(["BUY", "HOLD", "SELL"]);
export type Action = z.infer<typeof actionSchema>;

export const decisionProposalSchema = z.object({
  action: actionSchema,
  summary: z.string(),
  supportingEvidence: z.array(z.string()).min(1),
  counterEvidence: z.array(z.string()),
  risks: z.array(z.string()),
  missingData: z.array(z.string()),
  outlook: z.object({ direction: z.string(), horizon: z.string(), invalidation: z.string() }),
  confidence: z.enum(["low", "medium", "high"]),
});
export type DecisionProposal = z.infer<typeof decisionProposalSchema>;

export const decisionSchema = decisionProposalSchema.extend({
  model: z.string(),
  promptVersion: z.string(),
  policyVersion: z.string(),
});
export type Decision = z.infer<typeof decisionSchema>;

export const chatAnswerSchema = z.object({
  text: z.string().min(1).max(4_000),
  citations: z.array(z.string()).min(1),
  limitations: z.array(z.string()).max(8),
  suggestedQuestions: z.array(z.string()).max(4),
  model: z.string(),
  promptVersion: z.string(),
});
export type ChatAnswer = z.infer<typeof chatAnswerSchema>;

export const createRunSchema = z.object({
  symbol: tokenSymbolSchema,
  idempotencyKey: z.string().min(8).max(128),
});

export const createMessageSchema = z.object({
  text: z.string().trim().min(1).max(2_000),
  symbol: tokenSymbolSchema.optional(),
  runId: z.string().optional(),
  idempotencyKey: z.string().min(8).max(128),
});

export interface PortfolioState {
  cashCents: bigint;
  equityCents: bigint;
  positionQuantityMicros: bigint;
  positionValueCents: bigint;
}

export interface SimulationConfig {
  feeBps: bigint;
  slippageBps: bigint;
  maxBuyEquityBps: bigint;
  maxTokenExposureBps: bigint;
}

export interface SimulationResult {
  outcome: "APPLIED" | "NO_ACTION" | "SKIPPED_NO_POSITION" | "SKIPPED_LIMIT";
  action: Action;
  quantityMicros: bigint;
  fillPriceCents: bigint;
  feeCents: bigint;
  cashDeltaCents: bigint;
  reason: string;
}

const BPS = 10_000n;
const QUANTITY_SCALE = 1_000_000n;

function ceilDiv(value: bigint, divisor: bigint): bigint {
  return (value + divisor - 1n) / divisor;
}

export function simulateDecision(
  action: Action,
  referencePriceCents: bigint,
  portfolio: PortfolioState,
  config: SimulationConfig,
): SimulationResult {
  if (referencePriceCents <= 0n) throw new Error("Reference price must be positive");
  if (action === "HOLD") {
    return { outcome: "NO_ACTION", action, quantityMicros: 0n, fillPriceCents: 0n, feeCents: 0n, cashDeltaCents: 0n, reason: "HOLD creates no simulated fill" };
  }
  if (action === "SELL") {
    if (portfolio.positionQuantityMicros <= 0n) {
      return { outcome: "SKIPPED_NO_POSITION", action, quantityMicros: 0n, fillPriceCents: 0n, feeCents: 0n, cashDeltaCents: 0n, reason: "No simulated position is available to sell" };
    }
    const fillPriceCents = referencePriceCents * (BPS - config.slippageBps) / BPS;
    const grossCents = fillPriceCents * portfolio.positionQuantityMicros / QUANTITY_SCALE;
    const feeCents = ceilDiv(grossCents * config.feeBps, BPS);
    return { outcome: "APPLIED", action, quantityMicros: portfolio.positionQuantityMicros, fillPriceCents, feeCents, cashDeltaCents: grossCents - feeCents, reason: "Sold the full simulated position" };
  }

  const fillPriceCents = ceilDiv(referencePriceCents * (BPS + config.slippageBps), BPS);
  const perRunCap = portfolio.equityCents * config.maxBuyEquityBps / BPS;
  const exposureCap = portfolio.equityCents * config.maxTokenExposureBps / BPS;
  const remainingExposure = exposureCap > portfolio.positionValueCents ? exposureCap - portfolio.positionValueCents : 0n;
  const affordableBeforeFee = portfolio.cashCents * BPS / (BPS + config.feeBps);
  const notionalCap = [perRunCap, remainingExposure, affordableBeforeFee].reduce((a, b) => a < b ? a : b);
  const quantityMicros = notionalCap * QUANTITY_SCALE / fillPriceCents;
  if (quantityMicros <= 0n) {
    return { outcome: "SKIPPED_LIMIT", action, quantityMicros: 0n, fillPriceCents, feeCents: 0n, cashDeltaCents: 0n, reason: "Cash or exposure limits leave no valid quantity" };
  }
  const grossCents = fillPriceCents * quantityMicros / QUANTITY_SCALE;
  const feeCents = ceilDiv(grossCents * config.feeBps, BPS);
  return { outcome: "APPLIED", action, quantityMicros, fillPriceCents, feeCents, cashDeltaCents: -(grossCents + feeCents), reason: "Applied a capped simulated buy" };
}

export function centsToUsd(cents: bigint): string {
  const sign = cents < 0n ? "-" : "";
  const value = cents < 0n ? -cents : cents;
  return `${sign}${value / 100n}.${(value % 100n).toString().padStart(2, "0")}`;
}

export function quantityToString(micros: bigint): string {
  const whole = micros / QUANTITY_SCALE;
  const fraction = (micros % QUANTITY_SCALE).toString().padStart(6, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}
