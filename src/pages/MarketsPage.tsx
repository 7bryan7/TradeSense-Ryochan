import { PageIntro } from '../components/common/PageIntro';
import React, { useState } from 'react';
import { mockTokens } from '../data/tokens';
import { ArrowUpRight, ArrowDownRight, Search, BarChart3, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MarketsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTokens = mockTokens.filter(
    t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="studio-page">
      <PageIntro eyebrow="DISCOVER & COMPARE" title="The market, in perspective." description="Compare price, volume, and momentum across the sample market. Find an asset worth a closer look.">
        <label className="studio-secondary"><Search size={15} /><input aria-label="Search markets" type="search" placeholder="Find an asset…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent min-w-0 w-40 text-white focus:outline-none" /></label>
      </PageIntro>

      {/* Market Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-4 sm:p-5 shadow-lg">
          <span className="text-xs font-mono text-[#8F9CAE] uppercase">Total Market Cap</span>
          <div className="text-2xl font-black font-mono text-white mt-1">$3.42T</div>
          <span className="text-[11px] font-mono text-[#10B981] font-bold flex items-center mt-1">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> +2.1% (24h)
          </span>
        </div>
        <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-4 sm:p-5 shadow-lg">
          <span className="text-xs font-mono text-[#8F9CAE] uppercase">24h Global Volume</span>
          <div className="text-2xl font-black font-mono text-white mt-1">$118.4B</div>
          <span className="text-[11px] font-mono text-[#8F9CAE] mt-1 block">Illustrative market snapshot</span>
        </div>
        <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-4 sm:p-5 shadow-lg">
          <span className="text-xs font-mono text-[#8F9CAE] uppercase">BTC Dominance</span>
          <div className="text-2xl font-black font-mono text-[#4ce07a] mt-1">58.4%</div>
          <span className="text-[11px] font-mono text-[#8F9CAE] mt-1 block">Market Weight</span>
        </div>
        <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-4 sm:p-5 shadow-lg">
          <span className="text-xs font-mono text-[#8F9CAE] uppercase">Assets to explore</span>
          <div className="text-2xl font-black font-mono text-[#4ce07a] mt-1">{mockTokens.length}</div>
          <span className="text-[11px] font-mono text-[#8F9CAE] mt-1 block">Sample market coverage</span>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#15171C] border-b border-white/[0.06] text-[#8F9CAE] text-[11px] uppercase">
                <th className="py-3.5 px-4 font-bold"># Rank</th>
                <th className="py-3.5 px-4 font-bold">Asset</th>
                <th className="py-3.5 px-4 text-right font-bold">Price</th>
                <th className="py-3.5 px-4 text-right font-bold">1h %</th>
                <th className="py-3.5 px-4 text-right font-bold">24h %</th>
                <th className="py-3.5 px-4 text-right font-bold">7d %</th>
                <th className="py-3.5 px-4 text-right font-bold">24h Volume</th>
                <th className="py-3.5 px-4 text-right font-bold">Market Cap</th>
                <th className="py-3.5 px-4 text-center font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredTokens.map(token => {
                const isPos24 = token.metrics.change24h >= 0;
                const isPos7d = token.metrics.change7d >= 0;
                return (
                  <tr key={token.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 text-[#8F9CAE] font-bold">{token.metrics.rank}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-[#15171C] border border-white/10 flex items-center justify-center font-bold text-amber-400 text-sm">
                          {token.icon}
                        </span>
                        <div>
                          <span className="font-bold text-white text-sm block">{token.name}</span>
                          <span className="text-[10px] text-[#8F9CAE] font-mono">{token.symbol} • {token.network}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-white text-sm">
                      ${token.metrics.price < 10 ? token.metrics.price.toFixed(4) : token.metrics.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-[#8F9CAE]">
                      {token.metrics.change1h >= 0 ? '+' : ''}{token.metrics.change1h}%
                    </td>
                    <td className="py-4 px-4 text-right font-semibold">
                      <span className={`inline-flex items-center font-bold ${isPos24 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {isPos24 ? '+' : ''}{token.metrics.change24h}%
                        {isPos24 ? <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 ml-0.5" />}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold">
                      <span className={`font-bold ${isPos7d ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {isPos7d ? '+' : ''}{token.metrics.change7d}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-[#8F9CAE]">
                      ${(token.metrics.volume24h / 1e9).toFixed(2)}B
                    </td>
                    <td className="py-4 px-4 text-right text-[#8F9CAE]">
                      ${(token.metrics.marketCap / 1e9).toFixed(1)}B
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Link
                        to={`/dashboard?asset=${token.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-ryo-gradient text-[#050806] hover:opacity-90 font-bold text-xs transition-all inline-block shadow-ryo-sm"
                      >
                        Analyze
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTokens.length === 0 && <p className="studio-empty m-4">No sample assets match your search. Try a name or symbol.</p>}
        </div>
      </div>
    </div>
  );
};

export default MarketsPage;
