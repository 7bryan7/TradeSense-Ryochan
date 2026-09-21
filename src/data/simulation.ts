import { SimulationResult, SimulationPolicy } from '../types/simulation';

export const mockDefaultSimulationPolicy: SimulationPolicy = {
  startingCash: 10000,
  maxBuyEquityPct: 10, // 10% demo allocation
  maxTokenExposurePct: 20, // 20% max per token
  feeBps: 10, // 10 bps
  slippageBps: 10, // 10 bps
  maxPriceAgeSeconds: 60,
};

export const mockBtcSimulationResult: SimulationResult = {
  order: {
    id: 'sim-ord-btc-01',
    runId: 'run-9842-btc-01',
    timestamp: '2026-09-20 14:32:04 UTC',
    tokenId: 'btc',
    tokenSymbol: 'BTC',
    action: 'BUY',
    orderType: 'MARKET_SIMULATION',
    leverage: '1x (spot simulation)',
    positionSizeUsd: 1000.00,
    positionPercent: 10,
    quantity: 0.0089,
    referencePrice: 112482.31,
    fillPrice: 112482.31,
    feeEstimatedUsd: 1.00,
    slippageEstimatedUsd: 0.50,
    takeProfitPrice: 116200.00,
    takeProfitPct: 3.3,
    stopLossPrice: 108500.00,
    stopLossPct: -3.5,
    status: 'FILLED',
    statusReason: 'Simulated market fill executed at spot reference price within 60s freshness constraint.',
  },
  realizedPnlUsd: 0.00,
  unrealizedPnlUsd: 42.18,
  unrealizedPnlPct: 4.22,
  totalPnlUsd: 42.18,
  totalPnlPct: 4.22,
  newPortfolioEquity: 10874.23,
};

