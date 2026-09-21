import React from 'react';
import { mockTokens } from '../data/tokens';
import { Bookmark, Star, ArrowUpRight, ArrowDownRight, Bell, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WatchlistPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[rgba(251,237,224,0.08)]">
        <div>
          <h1 className="text-2xl font-bold text-[#FBEDE0] tracking-tight flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-[#00D2FF]" />
            Active Token Watchlist
          </h1>
          <p className="text-xs text-[rgba(251,237,224,0.6)] font-mono mt-1">
            Pinned candidates monitored by the autonomous recurring scan engine
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#00D2FF] bg-[#10131F] px-3.5 py-1.5 rounded-full border border-[rgba(251,237,224,0.15)]">
            6 Tokens Monitored
          </span>
        </div>
      </div>

      {/* Watchlist Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockTokens.map(t => {
          const isPos = t.metrics.change24h >= 0;
          return (
            <div
              key={t.id}
              className="bg-[#161926]/90 border border-[rgba(251,237,224,0.10)] rounded-2xl p-5 shadow-panel hover:border-[rgba(251,237,224,0.25)] hover:shadow-2xl transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#10131F] border border-[rgba(251,237,224,0.12)] text-amber-400 font-bold flex items-center justify-center text-base">
                    {t.icon}
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-[#FBEDE0]">{t.name}</h3>
                    <span className="text-xs font-mono text-[rgba(251,237,224,0.5)]">{t.pair}</span>
                  </div>
                </div>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>

              <div>
                <div className="text-2xl font-bold font-mono text-[#FBEDE0]">
                  ${t.metrics.price < 10 ? t.metrics.price.toFixed(4) : t.metrics.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className={`text-xs font-mono font-semibold mt-1 flex items-center ${isPos ? 'text-[#38F997]' : 'text-rose-400'}`}>
                  {isPos ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                  {isPos ? '+' : ''}{t.metrics.change24h}% (24h)
                </div>
              </div>

              <div className="pt-3 border-t border-[rgba(251,237,224,0.08)] flex items-center justify-between text-xs font-mono">
                <span className="text-[rgba(251,237,224,0.5)]">RSI: {t.metrics.rsi14}</span>
                <Link
                  to="/dashboard"
                  className="text-[#38F997] hover:text-[#5affac] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WatchlistPage;
