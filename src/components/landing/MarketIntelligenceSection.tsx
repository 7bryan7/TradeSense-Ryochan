import React from 'react';
import { mockTokens } from '../../data/tokens';
import { ArrowUpRight, ArrowDownRight, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MarketIntelligenceSection: React.FC = () => {
  return (
    <section className="py-20 px-6 border-t border-[rgba(80,160,255,0.1)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
              Section 03 — Market Intelligence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Real-time crypto asset feeds
            </h2>
          </div>
          <Link
            to="/markets"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Explore all markets →
          </Link>
        </div>

        {/* Token Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTokens.map(token => {
            const isPos = token.metrics.change24h >= 0;
            return (
              <div
                key={token.id}
                className="bg-[#091522] border border-[rgba(80,160,255,0.14)] rounded-2xl p-5 hover:border-cyan-500/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-sm">
                      {token.icon}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
                        {token.pair}
                      </h4>
                      <span className="text-[11px] text-slate-400">{token.name}</span>
                    </div>
                  </div>
                  <span
                    className={`flex items-center text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isPos ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                    }`}
                  >
                    {isPos ? '+' : ''}{token.metrics.change24h}%
                    {isPos ? <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 ml-0.5" />}
                  </span>
                </div>

                <div className="text-2xl font-bold font-mono text-white mb-3">
                  ${token.metrics.price < 10 ? token.metrics.price.toFixed(4) : token.metrics.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-slate-800/80 pt-3 text-slate-400">
                  <div>Vol: ${(token.metrics.volume24h / 1e9).toFixed(1)}B</div>
                  <div className="text-right">RSI: {token.metrics.rsi14}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

