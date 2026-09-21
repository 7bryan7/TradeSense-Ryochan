import { PaperPortfolio } from '../types/portfolio';
import { mockPortfolio } from '../data/portfolio';

let currentPortfolio: PaperPortfolio = { ...mockPortfolio };

export const portfolioService = {
  async getPortfolio(): Promise<PaperPortfolio> {
    // In future: return fetch('/api/portfolio').then(r => r.json());
    return { ...currentPortfolio };
  },

  async resetPortfolio(): Promise<PaperPortfolio> {
    currentPortfolio = {
      ...mockPortfolio,
      virtualCash: 10000.00,
      totalValue: 10000.00,
      change24hPct: 0.0,
      cryptoExposurePct: 0,
      cashExposurePct: 100,
      totalRealizedPnl: 0,
      totalUnrealizedPnl: 0,
      totalPnlUsd: 0,
      totalPnlPct: 0,
      totalFeesPaid: 0,
      holdings: [],
      ledgerHistory: [
        {
          id: `ledg-${Date.now()}`,
          timestamp: new Date().toISOString(),
          runId: 'manual-reset',
          action: 'DEPOSIT_INIT',
          symbol: 'USD',
          amount: 10000,
          price: 1.0,
          fees: 0,
          cashAfter: 10000.00,
        },
      ],
    };
    return { ...currentPortfolio };
  },
};

