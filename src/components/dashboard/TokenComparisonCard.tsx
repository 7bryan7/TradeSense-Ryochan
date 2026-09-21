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
    <div className="bg-[#161926]/90 border border-[rgba(251,237,224,0.10)] rounded-2xl p-5 shadow-panel">
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(251,237,224,0.08)] mb-3">
        <h3 className="text-xs font-semibold text-[#FBEDE0] uppercase font-mono tracking-wider flex items-center gap-2">
          <Scale className="w-3.5 h-3.5 text-[#00D2FF]" />
          Candidate Comparison
        </h3>
        <span className="text-[10px] text-[rgba(251,237,224,0.5)] font-mono">Tier-1 Assets</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[rgba(251,237,224,0.08)] text-[rgba(251,237,224,0.5)] text-[11px]">
              <th className="pb-2 font-medium">Token</th>
              <th className="pb-2 font-medium text-right">Price</th>
              <th className="pb-2 font-medium text-right">24h Change</th>
              <th className="pb-2 font-medium text-right">RSI (14)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(251,237,224,0.06)]">
            {topTokens.map(t => {
              const isPos = t.metrics.change24h >= 0;
              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectToken(t.id)}
                  className="hover:bg-[rgba(251,237,224,0.04)] cursor-pointer transition-colors"
                >
                  <td className="py-2.5 flex items-center gap-2 font-bold text-[#FBEDE0]">
                    <span className="w-5 h-5 rounded-full bg-[#10131F] border border-[rgba(251,237,224,0.12)] flex items-center justify-center text-[10px] text-amber-400 font-bold">
                      {t.icon}
                    </span>
                    <span>{t.symbol}</span>
                  </td>
                  <td className="py-2.5 text-right text-[#FBEDE0] font-semibold">
                    ${t.metrics.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 text-right font-semibold">
                    <span
                      className={`inline-flex items-center ${
                        isPos ? 'text-[#38F997]' : 'text-rose-400'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {t.metrics.change24h}%
                      {isPos ? <ArrowUpRight className="w-3 h-3 ml-0.5" /> : <ArrowDownRight className="w-3 h-3 ml-0.5" />}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-[rgba(251,237,224,0.7)]">
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
