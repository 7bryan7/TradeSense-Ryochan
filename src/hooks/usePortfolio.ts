import { useState, useEffect } from 'react';
import { PaperPortfolio } from '../types/portfolio';
import { portfolioService } from '../services/portfolioService';
import { mockPortfolio } from '../data/portfolio';

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<PaperPortfolio>(mockPortfolio);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchPort() {
      setIsLoading(true);
      const data = await portfolioService.getPortfolio();
      setPortfolio(data);
      setIsLoading(false);
    }
    fetchPort();
  }, []);

  const handleReset = async () => {
    const updated = await portfolioService.resetPortfolio();
    setPortfolio(updated);
  };

  return {
    portfolio,
    isLoading,
    handleReset,
  };
}

