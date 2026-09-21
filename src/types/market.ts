export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D';

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TokenMetrics {
  price: number;
  change24h: number;
  change1h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  volatility7d: number;
  rsi14: number;
  liquidityUsd: number;
  circulatingSupply?: string;
  rank: number;
}

export interface Token {
  id: string;
  symbol: string;
  name: string;
  pair: string;
  network: string;
  contractAddress?: string;
  icon: string;
  metrics: TokenMetrics;
  sparkline: number[];
}

export interface MarketSnapshot {
  asOf: string;
  mode: 'LIVE' | 'FIXTURE';
  selectedTokenId: string;
  tokens: Token[];
  totalMarketCap: string;
  marketVolume24h: string;
  btcDominance: number;
}

