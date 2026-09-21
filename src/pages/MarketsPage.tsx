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
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[rgba(251,237,224,0.08)]">
        <div>
          <h1 className="text-2xl font-bold text-[#FBEDE0] tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[#00D2FF]" />
            Market Intelligence & Screening
          </h1>
          <p className="text-xs text-[rgba(251,237,224,0.6)] font-mono mt-1">
            Global market snapshots, liquidity depth, and multi-asset candidate screening
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 bg-[#10131F] border border-[rgba(251,237,224,0.12)] rounded-xl px-3.5 py-2 text-xs font-mono">
          <Search className="w-4 h-4 text-[rgba(251,237,224,0.5)]" />
          <input
            type="text"
            placeholder="Search token (e.g. BTC, ETH)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent text-[#FBEDE0] placeholder-[rgba(251,237,224,0.35)] focus:outline-none w-48 sm:w-64"
          />
        </div>
      </div>

      {/* Market Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#161926]/90 border border-[rgba(251,237,224,0.10)] rounded-2xl p-4 shadow-panel">
          <span className="text-xs font-mono text-[rgba(251,237,224,0.5)] uppercase">Total Market Cap</span>
          <div className="text-2xl font-bold font-mono text-[#FBEDE0] mt-1">$3.42T</div>
          <span className="text-[11px] font-mono text-[#38F997] flex items-center mt-0.5">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> +2.1% (24h)
          </span>
        </div>
        <div className="bg-[#161926]/90 border border-[rgba(251,237,224,0.10)] rounded-2xl p-4 shadow-panel">
          <span className="text-xs font-mono text-[rgba(251,237,224,0.5)] uppercase">24h Global Volume</span>
          <div className="text-2xl font-bold font-mono text-[#FBEDE0] mt-1">$118.4B</div>
          <span className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] mt-0.5 block">Tier-1 Spot Venues</span>
        </div>
        <div className="bg-[#161926]/90 border border-[rgba(251,237,224,0.10)] rounded-2xl p-4 shadow-panel">
          <span className="text-xs font-mono text-[rgba(251,237,224,0.5)] uppercase">BTC Dominance</span>
          <div className="text-2xl font-bold font-mono text-[#00D2FF] mt-1">58.4%</div>
          <span className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] mt-0.5 block">Market Weight</span>
        </div>
        <div className="bg-[#161926]/90 border border-[rgba(251,237,224,0.10)] rounded-2xl p-4 shadow-panel">
          <span className="text-xs font-mono text-[rgba(251,237,224,0.5)] uppercase">Active Scans Today</span>
          <div className="text-2xl font-bold font-mono text-[#38F997] mt-1">178 Runs</div>
          <span className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] mt-0.5 block">Autonomous Cadence</span>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-[#161926]/90 border border-[rgba(251,237,224,0.10)] rounded-2xl overflow-hidden shadow-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#10131F]/90 border-b border-[rgba(251,237,224,0.08)] text-[rgba(251,237,224,0.5)] text-[11px] uppercase">
                <th className="py-3.5 px-4"># Rank</th>
                <th className="py-3.5 px-4">Asset</th>
                <th className="py-3.5 px-4 text-right">Price</th>
                <th className="py-3.5 px-4 text-right">1h %</th>
                <th className="py-3.5 px-4 text-right">24h %</th>
                <th className="py-3.5 px-4 text-right">7d %</th>
                <th className="py-3.5 px-4 text-right">24h Volume</th>
                <th className="py-3.5 px-4 text-right">Market Cap</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(251,237,224,0.06)]">
              {filteredTokens.map(token => {
                const isPos24 = token.metrics.change24h >= 0;
                const isPos7d = token.metrics.change7d >= 0;
                return (
                  <tr key={token.id} className="hover:bg-[rgba(251,237,224,0.04)] transition-colors">
                    <td className="py-4 px-4 text-[rgba(251,237,224,0.6)] font-bold">{token.metrics.rank}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-[#10131F] border border-[rgba(251,237,224,0.12)] flex items-center justify-center font-bold text-amber-400 text-sm">
                          {token.icon}
                        </span>
                        <div>
                          <span className="font-bold text-[#FBEDE0] text-sm block">{token.name}</span>
                          <span className="text-[10px] text-[rgba(251,237,224,0.5)]">{token.symbol} • {token.network}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-[#FBEDE0] text-sm">
                      ${token.metrics.price < 10 ? token.metrics.price.toFixed(4) : token.metrics.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-[rgba(251,237,224,0.7)]">
                      {token.metrics.change1h >= 0 ? '+' : ''}{token.metrics.change1h}%
                    </td>
                    <td className="py-4 px-4 text-right font-semibold">
                      <span className={`inline-flex items-center ${isPos24 ? 'text-[#38F997]' : 'text-rose-400'}`}>
                        {isPos24 ? '+' : ''}{token.metrics.change24h}%
                        {isPos24 ? <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 ml-0.5" />}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold">
                      <span className={isPos7d ? 'text-[#38F997]' : 'text-rose-400'}>
                        {isPos7d ? '+' : ''}{token.metrics.change7d}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-[rgba(251,237,224,0.7)]">
                      ${(token.metrics.volume24h / 1e9).toFixed(2)}B
                    </td>
                    <td className="py-4 px-4 text-right text-[rgba(251,237,224,0.7)]">
                      ${(token.metrics.marketCap / 1e9).toFixed(1)}B
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Link
                        to="/dashboard"
                        className="px-3 py-1.5 rounded-xl bg-[#38F997]/15 border border-[#38F997]/30 text-[#38F997] hover:bg-[#38F997]/25 font-semibold text-xs transition-colors inline-block"
                      >
                        Analyze
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketsPage;
