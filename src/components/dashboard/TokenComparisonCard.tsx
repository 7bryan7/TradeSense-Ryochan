import React from 'react';
import { Token } from '../../types/market';
import { Scale, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TokenComparisonCardProps {
  tokens: Token[];
  onSelectToken: (id: string) => void;
}

export const TokenComparisonCard: React.FC<TokenComparisonCardProps> = ({
  tokens,
  onSelectToken,
}) => {
  const topTokens = tokens.slice(0, 3); // BTC, ETH, SOL

  return (
    <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
        <h3 className="text-xs font-semibold text-white uppercase font-mono tracking-wider flex items-center gap-2">
          <Scale className="w-3.5 h-3.5 text-[#4ce07a]" />
          Candidate Comparison
        </h3>
        <span className="text-[10px] text-[#8F9CAE] font-mono">Tier-1 Assets</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-white/[0.06] text-[#8F9CAE] text-[11px]">
              <th className="pb-2 font-medium">Token</th>
              <th className="pb-2 font-medium text-right">Price</th>
              <th className="pb-2 font-medium text-right">24h Change</th>
              <th className="pb-2 font-medium text-right">RSI (14)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {topTokens.map(t => {
              const isPos = t.metrics.change24h >= 0;
              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectToken(t.id)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="py-2.5 flex items-center gap-2 font-bold text-white">
                    <span className="w-5 h-5 rounded-full bg-[#15171C] border border-white/[0.08] flex items-center justify-center text-[10px] text-[#4ce07a] font-bold">
                      {t.icon}
                    </span>
                    <span>{t.symbol}</span>
                  </td>
                  <td className="py-2.5 text-right text-white font-semibold">
                    ${t.metrics.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 text-right font-semibold">
                    <span
                      className={`inline-flex items-center ${
                        isPos ? 'text-[#4ce07a]' : 'text-rose-400'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {t.metrics.change24h}%
                      {isPos ? <ArrowUpRight className="w-3 h-3 ml-0.5" /> : <ArrowDownRight className="w-3 h-3 ml-0.5" />}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-[#8F9CAE]">
                    {t.metrics.rsi14}
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
