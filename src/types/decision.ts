export type DecisionAction = 'BUY' | 'HOLD' | 'SELL';
export type DecisionConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

export interface WhatChangedDelta {
  metric: string;
  previous: string;
  current: string;
  delta: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  evidenceRefId: string;
}

export interface DecisionReport {
  id: string;
  runId: string;
  tokenId: string;
  asOf: string;
  action: DecisionAction;
  confidenceScore: number; // e.g. 82
  confidenceLevel: DecisionConfidence;
  rationale: string;
  explanation: string;
  whatChanged: WhatChangedDelta[];
  supportingEvidence: string[];
  contraryEvidence: string[];
  risks: string[];
  outlook: {
    bias: 'Bullish' | 'Bearish' | 'Neutral';
    timeframe: string;
    targetPrice?: number;
    invalidationPrice: number;
    summary: string;
  };
  policyOutcome: {
    allowed: boolean;
    reasonCode: 'POLICY_PASSED' | 'BLOCKED_SAFETY' | 'BLOCKED_STALE_EVIDENCE' | 'SKIPPED_NO_HOLDINGS' | 'NO_TRADE_HOLD';
    message: string;
  };
  modelMetadata: {
    provider: string;
    model: string;
    promptVersion: string;
    policyVersion: string;
  };
}

