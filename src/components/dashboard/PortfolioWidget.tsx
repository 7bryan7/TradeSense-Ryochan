import React from 'react';
import { PaperPortfolio } from '../../types/portfolio';
import { Wallet, ArrowUpRight, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PortfolioWidgetProps {
  portfolio: PaperPortfolio;
  onReset?: () => void;
}

export const PortfolioWidget: React.FC<PortfolioWidgetProps> = ({ portfolio, onReset }) => {
  return (
    <div className="bg-[#161926]/90 backdrop-blur-xl border border-[rgba(251,237,224,0.12)] rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[rgba(251,237,224,0.08)]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FBEDE0]/10 text-[#FBEDE0] border border-[rgba(251,237,224,0.2)]">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#FBEDE0] tracking-tight flex items-center gap-2">
              Paper Portfolio
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#38F997]/15 border border-[#38F997]/30 text-[#38F997] font-bold">
                100% Mark Valuation
              </span>
            </h3>
            <p className="text-xs text-[rgba(251,237,224,0.5)] font-mono">
              Simulated institutional paper trading account & inventory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              title="Reset virtual balance to initial $10,000"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-[rgba(251,237,224,0.7)] hover:text-[#FBEDE0] bg-[#10131F] border border-[rgba(251,237,224,0.12)] rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Funds</span>
            </button>
          )}

          <Link
            to="/portfolio"
            className="text-xs font-bold text-[#FBEDE0] hover:text-[#38F997] font-mono px-3 py-1.5 rounded-xl bg-[#10131F] border border-[rgba(251,237,224,0.12)] transition-colors"
          >
            View Details →
          </Link>
        </div>
      </div>

      {/* Grid: Virtual Cash, Total Value, Holdings, Exposure Ring, P&L */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
        {/* Virtual Cash */}
        <div className="bg-[#10131F]/80 border border-[rgba(251,237,224,0.08)] rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] uppercase tracking-wider">Virtual Cash</span>
          <div className="text-xl font-bold font-mono text-[#FBEDE0] my-1">
            ${portfolio.virtualCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] font-mono text-[rgba(251,237,224,0.45)]">Available Liquid USD</span>
        </div>

        {/* Total Value */}
        <div className="bg-[#10131F]/80 border border-[rgba(251,237,224,0.08)] rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] uppercase tracking-wider">Total Portfolio</span>
          <div className="text-xl font-bold font-mono text-[#FBEDE0] my-1">
            ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] font-mono text-[#38F997] flex items-center font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            +{portfolio.change24hPct}% (24h)
          </span>
        </div>

        {/* Holdings List */}
        <div className="bg-[#10131F]/80 border border-[rgba(251,237,224,0.08)] rounded-xl p-3.5 space-y-2">
          <span className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] uppercase tracking-wider block">Holdings</span>
          <div className="space-y-1 text-xs font-mono">
            {portfolio.holdings.map(h => (
              <div key={h.symbol} className="flex items-center justify-between text-[rgba(251,237,224,0.85)]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF]" />
                  {h.symbol} ({h.amount})
                </span>
                <span className="font-semibold text-[#FBEDE0]">${h.currentValueUsd.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exposure Donut / Ring */}
        <div className="bg-[#10131F]/80 border border-[rgba(251,237,224,0.08)] rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] uppercase tracking-wider block mb-1">
              Exposure
            </span>
            <div className="text-xs font-mono space-y-0.5">
              <div className="text-[#00D2FF] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00D2FF]" />
                {portfolio.cryptoExposurePct}% Crypto
              </div>
              <div className="text-[rgba(251,237,224,0.5)] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                {portfolio.cashExposurePct}% Cash
              </div>
            </div>
          </div>

          {/* SVG mini donut chart */}
          <div className="relative w-14 h-14 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="rgba(251,237,224,0.1)"
                strokeWidth="4"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#38F997"
                strokeWidth="4"
                strokeDasharray={`${portfolio.cryptoExposurePct} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-[#FBEDE0]">
              {portfolio.cryptoExposurePct}%
            </div>
          </div>
        </div>

        {/* Total P&L */}
        <div className="bg-[#10131F]/80 border border-[rgba(251,237,224,0.08)] rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] uppercase tracking-wider">Simulated Profit</span>
          <div className="text-xl font-bold font-mono text-[#38F997] my-1 flex items-center">
            <ArrowUpRight className="w-5 h-5 mr-0.5" />
            +${portfolio.totalPnlUsd.toFixed(2)}
          </div>
          <span className="text-[11px] font-mono text-[rgba(251,237,224,0.5)]">
            Realized: ${portfolio.totalRealizedPnl.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioWidget;
