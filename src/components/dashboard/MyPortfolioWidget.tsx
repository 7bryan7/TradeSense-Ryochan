import React from 'react';
import { PaperPortfolio } from '../../types/portfolio';
import { Token } from '../../types/market';
import { ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MyPortfolioWidgetProps {
  portfolio: PaperPortfolio;
  tokens: Token[];
  selectedTokenId: string;
  onSelectToken: (id: string) => void;
}

export const MyPortfolioWidget: React.FC<MyPortfolioWidgetProps> = ({
  portfolio,
  tokens,
  selectedTokenId,
  onSelectToken,
}) => {
  // Use portfolio positions or fallback to the curated list matching template
  const holdings = [
    {
      id: 'btc',
      name: 'Bitcoin',
      symbol: 'BTC',
      amount: '0.14 BTC',
      value: 15585.95,
      change: '+2.84%',
      isPositive: true,
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      amount: '3.61 ETH',
      value: 12344.20,
      change: '+3.21%',
      isPositive: true,
      color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    },
    {
      id: 'avax',
      name: 'Avalanche',
      symbol: 'AVAX',
      amount: '350 AVAX',
      value: 10215.54,
      change: '-0.45%',
      isPositive: false,
      color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    {
      id: 'sol',
      name: 'Solana',
      symbol: 'SOL',
      amount: '46.8 SOL',
      value: 10221.12,
      change: '+4.12%',
      isPositive: true,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
  ];

  return (
    <div className="dashboard-glass-card rounded-2xl p-4 sm:p-5 space-y-3">
      {/* Header (matching template image) */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white tracking-tight">
          My Portfolio
        </h4>
        <Link
          to="/portfolio"
          className="text-xs font-mono text-[#8F9CAE] hover:text-white flex items-center gap-0.5 transition-colors"
        >
          <span>See all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Holdings List (matching template image) */}
      <div className="space-y-2">
        {holdings.map((item) => {
          const isSelected = item.id === selectedTokenId;
          return (
            <div
              key={item.id}
              onClick={() => onSelectToken(item.id)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-white/10 border-[#4ce07a] shadow-xs'
                  : 'bg-[#15171C]/75 backdrop-blur-md hover:bg-white/[0.04] border-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs ${item.color}`}>
                  {item.symbol[0]}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block leading-tight">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-[#8F9CAE] font-mono">
                    {item.amount}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-white font-mono block">
                  ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-[10px] font-mono font-semibold flex items-center justify-end gap-0.5 ${
                    item.isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}
                >
                  {item.isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                  {item.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyPortfolioWidget;
