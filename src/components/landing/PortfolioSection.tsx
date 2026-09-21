import React from 'react';
import { Wallet, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { mockPortfolio } from '../../data/portfolio';

export const PortfolioSection: React.FC = () => {
  return (
    <section id="portfolio" className="py-20 px-6 border-t border-[rgba(80,160,255,0.1)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
              Section 07 — Paper Portfolio
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Real-time simulated portfolio tracking
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Durable ledger & position valuation
          </span>
        </div>

        {/* Portfolio Stats Banner */}
        <div className="bg-[#091522] border border-[rgba(80,160,255,0.16)] rounded-3xl p-6 sm:p-8 shadow-panel">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs text-slate-400 font-mono uppercase">Virtual Cash</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                ${mockPortfolio.virtualCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-mono uppercase">Total Portfolio</span>
              <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                ${mockPortfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-mono uppercase">Simulated Return</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 flex items-center">
                <ArrowUpRight className="w-5 h-5 mr-0.5" />
                +{mockPortfolio.change24hPct}%
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-mono uppercase">Asset Allocation</span>
              <div className="text-sm font-mono text-slate-200 mt-2">
                28% Crypto • 72% Cash
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Valuation 100% Complete — Zero unpriced marks
            </span>
            <span>Fee Deductions: $18.42 simulated • 10 bps slippage applied</span>
          </div>
        </div>
      </div>
    </section>
  );
};

