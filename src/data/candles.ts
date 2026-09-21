import { Candle, Timeframe } from '../types/market';

// Generate realistic candlestick patterns matching FMFW & reference chart
export function generateCandles(basePrice: number, count: number = 40, volatility: number = 0.008): Candle[] {
  const candles: Candle[] = [];
  const now = new Date('2026-09-20T14:32:00Z').getTime();
  const intervalMs = 15 * 60 * 1000; // 15m default
  
  let currentPrice = basePrice * 0.97; // start slightly lower to show upward momentum
  
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - (i * intervalMs);
    const isUp = Math.random() > 0.42; // slightly bullish bias for BTC
    const change = currentPrice * volatility * (Math.random() * 0.9 + 0.1);
    
    const open = currentPrice;
    const close = isUp ? open + change : Math.max(open - change, open * 0.9);
    const high = Math.max(open, close) + (currentPrice * volatility * Math.random() * 0.5);
    const low = Math.min(open, close) - (currentPrice * volatility * Math.random() * 0.5);
    const volume = Math.floor(Math.random() * 1400 + 350) * (isUp ? 1.4 : 0.9); // higher volume on green candles
    
    candles.push({
      timestamp,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    });
    
    currentPrice = close;
  }
  
  // Ensure the final candle closes exactly at basePrice
  if (candles.length > 0) {
    const last = candles[candles.length - 1];
    last.close = basePrice;
    last.high = Math.max(last.high, basePrice);
  }
  
  return candles;
}

export const mockCandlesByTimeframe: Record<Timeframe, Candle[]> = {
  '1m': generateCandles(112482.31, 30, 0.002),
  '5m': generateCandles(112482.31, 35, 0.004),
  '15m': generateCandles(112482.31, 40, 0.007),
  '1h': generateCandles(112482.31, 40, 0.012),
  '4h': generateCandles(112482.31, 40, 0.025),
  '1D': generateCandles(112482.31, 30, 0.045),
};

