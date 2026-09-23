import React from 'react';
import { Token } from '../../types/market';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AssetStatCardsProps {
  tokens: Token[];
  selectedTokenId: string;
  onSelectToken: (id: string) => void;
}

export const AssetStatCards: React.FC<AssetStatCardsProps> = ({
  tokens,
  selectedTokenId,
  onSelectToken,
}) => {
  // Take top 4 tokens for the horizontal strip (matching template)
  const displayTokens = tokens.slice(0, 4);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {displayTokens.map((token) => {
        const isSelected = token.id === selectedTokenId;
        const isPositive = token.metrics.change24h >= 0;

        if (isSelected) {
          // Highlighted RYO Green Gradient Card (matching ryobuild.com brand)
          return (
            <div
              key={token.id}
              onClick={() => onSelectToken(token.id)}
              className="bg-ryo-card rounded-2xl p-4 sm:p-4.5 text-[#050806] shadow-ryo cursor-pointer transition-all duration-300 transform scale-[1.02] relative overflow-hidden ring-1 ring-[#4ce07a]/50"
            >
              {/* Subtle top sheen */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-white/25 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-black/15 backdrop-blur-md flex items-center justify-center font-bold text-xs text-[#050806]">
                    {token.icon}
                  </div>
                  <div>
                    <span className="text-xs font-black leading-tight block text-[#050806]">{token.name}</span>
                    <span className="text-[10px] text-[#050806]/75 font-mono uppercase font-bold">{token.symbol}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-black/15 backdrop-blur-md text-[10px] font-mono font-black text-[#050806] flex items-center gap-0.5">
                  {isPositive ? '+' : ''}{token.metrics.change24h}%
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-lg sm:text-xl font-black text-[#050806] tracking-tight block">
                  ${token.metrics.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className="flex items-center justify-between text-[10px] text-[#050806]/85 font-mono font-semibold">
                  <span>Vol: ${(token.metrics.volume24h / 1e9).toFixed(1)}B</span>
                  <span className="flex items-center gap-0.5 font-bold">
                    {isPositive ? <ArrowUpRight className="w-3 h-3 text-[#050806]" /> : <ArrowDownRight className="w-3 h-3 text-[#050806]" />}
                    Selected
                  </span>
                </div>
              </div>
            </div>
          );
        }

        // Standard Matte Dark Card (matching template image)
        return (
          <div
            key={token.id}
            onClick={() => onSelectToken(token.id)}
            className="dashboard-glass-card hover:border-white/20 rounded-2xl p-4 sm:p-4.5 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                  {token.icon}
                </div>
                <div>
                  <span className="text-xs font-semibold text-white leading-tight block">{token.name}</span>
                  <span className="text-[10px] text-[#8F9CAE] font-mono uppercase">{token.symbol}</span>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-0.5 ${
                  isPositive ? 'bg-emerald-500/15 text-[#10B981]' : 'bg-rose-500/15 text-[#EF4444]'
                }`}
              >
                {isPositive ? '+' : ''}{token.metrics.change24h}%
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight block">
                ${token.metrics.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div className="flex items-center justify-between text-[10px] text-[#8F9CAE] font-mono">
                <span>Vol: ${(token.metrics.volume24h / 1e9).toFixed(1)}B</span>
                <span>Click to View</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AssetStatCards;
