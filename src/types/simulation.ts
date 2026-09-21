export interface SimulationPolicy {
  startingCash: number;
  maxBuyEquityPct: number; // e.g. 5%
  maxTokenExposurePct: number; // e.g. 20%
  feeBps: number; // 10 bps = 0.10%
  slippageBps: number; // 10 bps = 0.10%
  maxPriceAgeSeconds: number; // 60s
}

export interface PaperTradeOrder {
  id: string;
  runId: string;
  timestamp: string;
  tokenId: string;
  tokenSymbol: string;
  action: 'BUY' | 'SELL';
  orderType: 'MARKET_SIMULATION';
  leverage: string; // '1x (spot simulation)'
  positionSizeUsd: number;
  positionPercent: number; // e.g. 10%
  quantity: number;
  referencePrice: number;
  fillPrice: number;
  feeEstimatedUsd: number;
  slippageEstimatedUsd: number;
  takeProfitPrice: number;
  takeProfitPct: number;
  stopLossPrice: number;
  stopLossPct: number;
  status: 'FILLED' | 'SKIPPED_NO_POSITION' | 'BLOCKED' | 'HOLD_NO_ACTION';
  statusReason?: string;
}

export interface SimulationResult {
  order: PaperTradeOrder;
  realizedPnlUsd: number;
  unrealizedPnlUsd: number;
  unrealizedPnlPct: number;
  totalPnlUsd: number;
  totalPnlPct: number;
  newPortfolioEquity: number;
}

