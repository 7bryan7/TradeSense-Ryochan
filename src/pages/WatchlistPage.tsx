import { PageIntro } from '../components/common/PageIntro';
import React from 'react';
import { mockTokens } from '../data/tokens';
import { Bookmark, Star, ArrowUpRight, ArrowDownRight, Bell, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WatchlistPage: React.FC = () => {
  return (
    <div className="studio-page">
      <PageIntro eyebrow="KEEP A CLOSER EYE" title="Your market shortlist." description="A curated sample watchlist. Explore an asset's movement, then open its dashboard for the full picture.">
        <span className="studio-chip">{mockTokens.length} sample assets</span>
      </PageIntro>

      {/* Watchlist Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockTokens.map(t => {
          const isPos = t.metrics.change24h >= 0;
          return (
            <div
              key={t.id}
              className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-5 shadow-sm hover:border-white/[0.15] transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#15171C] border border-white/[0.08] text-[#4ce07a] font-bold flex items-center justify-center text-base">
                    {t.icon}
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-white">{t.name}</h3>
                    <span className="text-xs font-mono text-[#8F9CAE]">{t.pair}</span>
                  </div>
                </div>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>

              <div>
                <div className="text-2xl font-bold font-mono text-white">
                  ${t.metrics.price < 10 ? t.metrics.price.toFixed(4) : t.metrics.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className={`text-xs font-mono font-semibold mt-1 flex items-center ${isPos ? 'text-[#4ce07a]' : 'text-rose-400'}`}>
                  {isPos ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                  {isPos ? '+' : ''}{t.metrics.change24h}% (24h)
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <span className="text-[#8F9CAE]">RSI: {t.metrics.rsi14}</span>
                <Link
                  to={`/dashboard?asset=${t.id}`}
                  className="text-[#4ce07a] hover:underline font-semibold flex items-center gap-1 transition-colors"
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
