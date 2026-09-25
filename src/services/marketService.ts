import { Token, Candle, Timeframe, MarketSnapshot } from '../types/market';
import { mockTokens } from '../data/tokens';
import { mockCandlesByTimeframe, generateCandles } from '../data/candles';

export const marketService = {
  async getTokens(): Promise<Token[]> {
    // In future: return fetch('/api/tokens').then(r => r.json());
    return [...mockTokens];
  },

  async getTokenById(id: string): Promise<Token | undefined> {
    return mockTokens.find(t => t.id.toLowerCase() === id.toLowerCase());
  },

  async getMarketSnapshot(selectedTokenId: string = 'btc', mode: 'LIVE' | 'FIXTURE' = 'FIXTURE'): Promise<MarketSnapshot> {
    // In future: return fetch('/api/market').then(r => r.json());
    return {
      asOf: '20 Sep 2026, 14:32 UTC',
      mode,
      selectedTokenId,
      tokens: mockTokens,
      totalMarketCap: '$3.42T',
      marketVolume24h: '$118.4B',
      btcDominance: 58.4,
    };
  },

  async getCandles(symbol: string, timeframe: Timeframe = '15m'): Promise<Candle[]> {
    const baseToken = mockTokens.find(t => t.symbol.toLowerCase() === symbol.toLowerCase()) || mockTokens[0];
    if (symbol.toUpperCase() === 'BTC' && mockCandlesByTimeframe[timeframe]) {
      return mockCandlesByTimeframe[timeframe];
    }
    const isBullish = baseToken.metrics.change24h >= 0;
    return generateCandles(baseToken.metrics.price, 40, 0.008, isBullish);
  },
};

