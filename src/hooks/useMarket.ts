import { useState, useEffect } from 'react';
import { Token, Candle, Timeframe } from '../types/market';
import { marketService } from '../services/marketService';

export function useMarket(initialTokenId: string = 'btc') {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string>(initialTokenId);
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [candleSnapshot, setCandleSnapshot] = useState<{ tokenId: string; timeframe: Timeframe; data: Candle[] } | null>(null);
  const [candleError, setCandleError] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataMode, setDataMode] = useState<'LIVE' | 'FIXTURE'>('FIXTURE');

  useEffect(() => {
    async function loadTokens() {
      setIsLoading(true);
      const allTokens = await marketService.getTokens();
      setTokens(allTokens);
      setIsLoading(false);
    }
    loadTokens();
  }, []);

  const currentToken = tokens.find(t => t.id === selectedTokenId) || tokens[0];
  const candles = candleSnapshot?.tokenId === currentToken?.id && candleSnapshot?.timeframe === timeframe ? candleSnapshot.data : [];

  useEffect(() => {
    let cancelled = false;
    setCandleError('');
    async function loadCandles() {
      if (!currentToken) return;
      try {
        const data = await marketService.getCandles(currentToken.symbol, timeframe);
        if (!cancelled) setCandleSnapshot({ tokenId: currentToken.id, timeframe, data });
      } catch {
        if (!cancelled) setCandleError('The sample chart could not load. Select another asset or timeframe to try again.');
      }
    }
    void loadCandles();
    return () => { cancelled = true; };
  }, [currentToken?.id, timeframe]);

  return {
    tokens,
    currentToken,
    selectedTokenId,
    setSelectedTokenId,
    timeframe,
    setTimeframe,
    candles,
    candleError,
    isLoading,
    dataMode,
    setDataMode,
  };
}
