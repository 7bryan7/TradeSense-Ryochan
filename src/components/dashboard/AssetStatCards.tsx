import React from 'react';
import { ArrowDownRight, ArrowUpRight, Check } from 'lucide-react';
import { Token } from '../../types/market';

interface AssetStatCardsProps {
  tokens: Token[];
  selectedTokenId: string;
  onSelectToken: (id: string) => void;
}
export const AssetStatCards: React.FC<AssetStatCardsProps> = ({ tokens, selectedTokenId, onSelectToken }) => (
  <div className="dashboard-watchlist grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5" aria-label="Choose an asset">
    {tokens.map(token => {
      const selected = token.id === selectedTokenId;
      const positive = token.metrics.change24h >= 0;
      const Direction = positive ? ArrowUpRight : ArrowDownRight;
      const low = Math.min(...token.sparkline);
      const range = Math.max(...token.sparkline) - low || 1;
      const points = token.sparkline.map((price, index) => `${index * 120 / Math.max(1, token.sparkline.length - 1)},${30 - (price - low) / range * 24}`).join(' ');
      return (
        <button key={token.id} type="button" aria-pressed={selected} onClick={() => onSelectToken(token.id)}
          className="dashboard-glass-surface min-w-0 rounded-2xl p-4 text-left">
          <span className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2.5 min-w-0">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${selected ? 'bg-[#4ce07a]/15 text-[#4ce07a]' : 'bg-white/[0.06] text-slate-300'}`}>{token.icon}</span>
              <span className="min-w-0"><span className="block text-sm font-semibold">{token.symbol}</span><span className="block truncate text-xs text-slate-400">{token.name}</span></span>
            </span>
            {selected && <Check className="h-4 w-4 shrink-0 text-[#4ce07a]" aria-label="Selected" />}
          </span>
          <span className="mt-4 block text-xl font-semibold tracking-tight tabular-nums">${token.metrics.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
          <span className="mt-1.5 flex flex-wrap items-center gap-1 text-xs">
            <span className={`flex items-center ${positive ? 'text-[#4ce07a]' : 'text-rose-400'}`}><Direction className="h-3.5 w-3.5" />{positive ? '+' : ''}{token.metrics.change24h}%</span>
            <span className="text-slate-400">past 24h</span>
          </span>
          {token.sparkline.length > 1 && <svg className="studio-sparkline" viewBox="0 0 120 36" role="img" aria-label={`${token.symbol} illustrative price trend`}><polyline points={points} fill="none" stroke={positive ? '#4ce07a' : '#ed95ac'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </button>
      );
    })}
  </div>
);
export default AssetStatCards;
