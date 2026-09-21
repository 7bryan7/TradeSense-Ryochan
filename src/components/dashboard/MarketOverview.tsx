import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { Token } from '../../types/market';

interface MarketOverviewProps {
  tokens: Token[];
  selectedToken: Token;
  onSelectToken: (id: string) => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  tokens,
  selectedToken,
  onSelectToken,
}) => {
  const isPositive = selectedToken.metrics.change24h >= 0;

  const formatCurrency = (val: number) => {
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toLocaleString('en-US')}`;
  };

  return (
    <div className="space-y-4">
      {/* Token Selector Tabs (ethonline-main pill style with keyboard hints) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tokens.map((t, idx) => {
          const isSelected = t.id === selectedToken.id;
          const keyNum = idx + 1;
          return (
            <button
              key={t.id}
              onClick={() => onSelectToken(t.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 shrink-0 ${
                isSelected
                  ? 'bg-[#FBEDE0] text-[#0C0E17] shadow-glow-cream-sm scale-[1.02]'
                  : 'bg-[#161926] text-[rgba(251,237,224,0.65)] hover:text-[#FBEDE0] hover:bg-[#1C2030] border border-[rgba(251,237,224,0.08)]'
              }`}
            >
              {keyNum <= 5 && (
                <kbd
                  className={`px-1 py-0.2 rounded text-[9px] font-mono leading-none ${
                    isSelected
                      ? 'bg-black/20 text-[#0C0E17]'
                      : 'bg-black/40 text-[rgba(251,237,224,0.4)]'
                  }`}
                >
                  {keyNum}
                </kbd>
              )}
              <span>{t.symbol}</span>
              <span
                className={`text-[11px] font-mono font-bold ${
                  isSelected
                    ? 'text-[#0C0E17]'
                    : t.metrics.change24h >= 0
                    ? 'text-[#38F997]'
                    : 'text-[#F87171]'
                }`}
              >
                {t.metrics.change24h >= 0 ? '+' : ''}
                {t.metrics.change24h}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid: Primary Token Featured Card + Watchlist Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Main Token Details & Big Sparkline */}
        <div className="lg:col-span-2 bg-[#161926]/90 backdrop-blur-xl border border-[rgba(251,237,224,0.12)] rounded-2xl p-5 relative overflow-hidden shadow-xl">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg shadow-sm">
                {selectedToken.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#FBEDE0] tracking-tight">
                    {selectedToken.pair}
                  </h2>
                  <span className="text-xs text-[rgba(251,237,224,0.6)] font-medium">
                    {selectedToken.name}
                  </span>
                </div>
                <div className="flex items-baseline gap-2.5 mt-1">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-[#FBEDE0] tracking-tight">
                    ${selectedToken.metrics.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`flex items-center text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
                      isPositive ? 'text-[#38F997] bg-[#38F997]/15 border border-[#38F997]/25' : 'text-[#F87171] bg-[#F87171]/15 border border-[#F87171]/25'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                    )}
                    {isPositive ? '+' : ''}
                    {selectedToken.metrics.change24h}% (24h)
                  </span>
                </div>
              </div>
            </div>

            {/* Mini Sparkline Visualization */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] text-[rgba(251,237,224,0.5)] font-mono mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#38F997]" />
                24h Trend
              </span>
              <svg className="w-32 h-10 overflow-visible" viewBox="0 0 100 30">
                <polyline
                  fill="none"
                  stroke={isPositive ? '#38F997' : '#F87171'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={selectedToken.sparkline
                    .map((val, idx) => {
                      const min = Math.min(...selectedToken.sparkline);
                      const max = Math.max(...selectedToken.sparkline);
                      const range = max - min || 1;
                      const x = (idx / (selectedToken.sparkline.length - 1)) * 100;
                      const y = 28 - ((val - min) / range) * 24;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              </svg>
            </div>
          </div>

          {/* 4 Bottom Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[rgba(251,237,224,0.08)]">
            <div>
              <div className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] uppercase tracking-wider">Volume (24h)</div>
              <div className="text-sm font-semibold font-mono text-[#FBEDE0] mt-0.5">
                {formatCurrency(selectedToken.metrics.volume24h)}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] uppercase tracking-wider">Market Cap</div>
              <div className="text-sm font-semibold font-mono text-[#FBEDE0] mt-0.5">
                {formatCurrency(selectedToken.metrics.marketCap)}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] uppercase tracking-wider">24h High</div>
              <div className="text-sm font-semibold font-mono text-[#38F997] mt-0.5">
                ${selectedToken.metrics.high24h.toLocaleString('en-US')}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] uppercase tracking-wider">24h Low</div>
              <div className="text-sm font-semibold font-mono text-[#F87171] mt-0.5">
                ${selectedToken.metrics.low24h.toLocaleString('en-US')}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Watchlist (ethonline-main style) */}
        <div className="bg-[#161926]/90 backdrop-blur-xl border border-[rgba(251,237,224,0.12)] rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 border-b border-[rgba(251,237,224,0.08)] mb-2">
            <h3 className="text-xs font-bold text-[#FBEDE0] uppercase tracking-wider font-mono">
              Market Watchlist
            </h3>
            <span className="text-[10px] text-[rgba(251,237,224,0.5)] font-mono">Real-Time Ingestion</span>
          </div>

          <div className="space-y-1.5">
            {tokens.slice(0, 5).map(t => {
              const pos = t.metrics.change24h >= 0;
              const isSelected = t.id === selectedToken.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectToken(t.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-[rgba(251,237,224,0.10)] border border-[rgba(251,237,224,0.20)] shadow-xs'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-[#FBEDE0] font-bold">
                      {t.icon}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-[#FBEDE0]">{t.symbol}</div>
                      <div className="text-[10px] text-[rgba(251,237,224,0.5)]">{t.name}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs font-semibold text-[#FBEDE0]">
                      ${t.metrics.price < 10 ? t.metrics.price.toFixed(4) : t.metrics.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div
                      className={`text-[10px] font-bold ${
                        pos ? 'text-[#38F997]' : 'text-[#F87171]'
                      }`}
                    >
                      {pos ? '+' : ''}{t.metrics.change24h}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;
