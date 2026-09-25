import React from 'react';
import { Token } from '../../types/market';
import { Scale, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TokenComparisonCardProps {
  tokens: Token[];
  selectedTokenId?: string;
  onSelectToken: (id: string) => void;
}

export const TokenComparisonCard: React.FC<TokenComparisonCardProps> = ({
  tokens = [],
  selectedTokenId,
  onSelectToken,
}) => {
  const topTokens = (tokens || []).slice(0, 4);

  return (
    <div className="tradesense-glass-card rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 border border-white/[0.12]">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
          <Scale className="w-3.5 h-3.5 text-[#4ce07a]" />
          Cross-Asset Relative Strength
        </h3>
        <span className="text-[10px] text-[#8F9CAE] font-mono">Tier-1 Candidates</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-white/[0.06] text-[#8F9CAE] text-[10px] uppercase">
              <th className="pb-2 font-medium">Asset</th>
              <th className="pb-2 font-medium text-right">Mark Price</th>
              <th className="pb-2 font-medium text-right">24h Chg</th>
              <th className="pb-2 font-medium text-right">RSI (14)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {topTokens.map(t => {
              const isPos = (t.metrics?.change24h ?? 0) >= 0;
              const isSelected = t.id === selectedTokenId;
              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectToken(t.id)}
                  className={`hover:bg-white/[0.05] cursor-pointer transition-colors ${
                    isSelected ? 'bg-gradient-to-r from-[#4ce07a]/15 to-[#38bdf8]/10 text-white font-bold' : ''
                  }`}
                >
                  <td className="py-2.5 flex items-center gap-2 text-white">
                    <span className="w-5 h-5 rounded-full tradesense-glass-pill flex items-center justify-center text-[10px] text-[#4ce07a] font-bold">
                      {t.icon}
                    </span>
                    <span className={isSelected ? 'text-[#4ce07a] font-bold' : 'font-semibold'}>{t.symbol}</span>
                    {isSelected && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#4ce07a]/20 text-[#4ce07a] border border-[#4ce07a]/30 ml-1">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-right text-white font-semibold">
                    ${t.metrics?.price ? t.metrics.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                  </td>
                  <td className="py-2.5 text-right font-semibold">
                    <span
                      className={`inline-flex items-center ${
                        isPos ? 'text-[#4ce07a]' : 'text-rose-400'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {t.metrics?.change24h ?? 0}%
                      {isPos ? <ArrowUpRight className="w-3 h-3 ml-0.5" /> : <ArrowDownRight className="w-3 h-3 ml-0.5" />}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-[#8F9CAE]">
                    {t.metrics?.rsi14 ?? '--'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default TokenComparisonCard;
