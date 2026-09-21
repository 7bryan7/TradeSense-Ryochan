import { useState, useEffect } from 'react';
import { Token, Candle, Timeframe } from '../types/market';
import { marketService } from '../services/marketService';

export function useMarket(initialTokenId: string = 'btc') {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string>(initialTokenId);
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [candles, setCandles] = useState<Candle[]>([]);
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

  useEffect(() => {
    async function loadCandles() {
      if (!currentToken) return;
      const data = await marketService.getCandles(currentToken.symbol, timeframe);
      setCandles(data);
    }
    loadCandles();
  }, [currentToken?.id, timeframe]);

  return {
    tokens,
    currentToken,
    selectedTokenId,
    setSelectedTokenId,
    timeframe,
    setTimeframe,
    candles,
    isLoading,
    dataMode,
    setDataMode,
  };
}

