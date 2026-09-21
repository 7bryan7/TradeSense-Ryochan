export interface HoldingItem {
  tokenId: string;
  symbol: string;
  name: string;
  icon: string;
  amount: number;
  avgCostPrice: number;
  currentPrice: number;
  currentValueUsd: number;
  unrealizedPnlUsd: number;
  unrealizedPnlPct: number;
  allocationPct: number;
}

export interface LedgerEvent {
  id: string;
  timestamp: string;
  runId: string;
  action: 'BUY' | 'SELL' | 'FEE' | 'DEPOSIT_INIT';
  symbol: string;
  amount: number;
  price: number;
  fees: number;
  realizedPnl?: number;
  cashAfter: number;
}

export interface PaperPortfolio {
  virtualCash: number;
  totalValue: number;
  change24hPct: number;
  holdings: HoldingItem[];
  cryptoExposurePct: number;
  cashExposurePct: number;
  totalRealizedPnl: number;
  totalUnrealizedPnl: number;
  totalPnlUsd: number;
  totalPnlPct: number;
  totalFeesPaid: number;
  valuationCompletenessPct: number; // e.g. 100%
  lastValuationTimestamp: string;
  ledgerHistory: LedgerEvent[];
}

