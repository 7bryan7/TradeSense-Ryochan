import React from 'react';
import { Token } from '../../types/market';
import { Activity, BarChart2, DollarSign, TrendingUp, Percent, ShieldCheck } from 'lucide-react';

interface TokenMetricsCardProps {
  token: Token;
}

export const TokenMetricsCard: React.FC<TokenMetricsCardProps> = ({ token }) => {
  const m = token.metrics;
  const isPositive = m.change24h >= 0;

  const items = [
    {
      label: 'Spot Price',
      value: `$${m.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      sub: `${isPositive ? '+' : ''}${m.change24h}% (24h)`,
      subColor: isPositive ? 'text-[#38F997]' : 'text-rose-400',
      icon: DollarSign,
    },
    {
      label: '24h Volume',
      value: `$${(m.volume24h / 1e9).toFixed(1)}B`,
      sub: 'Tier-1 Venues',
      subColor: 'text-[rgba(251,237,224,0.5)]',
      icon: BarChart2,
    },
    {
      label: 'Market Cap',
      value: `$${(m.marketCap / 1e12).toFixed(2)}T`,
      sub: `Rank #${m.rank}`,
      subColor: 'text-[#00D2FF]',
      icon: Activity,
    },
    {
      label: 'Volatility (7d)',
      value: `${m.volatility7d}%`,
      sub: 'Moderate Band',
      subColor: 'text-[rgba(251,237,224,0.5)]',
      icon: Percent,
    },
    {
      label: 'RSI Momentum (14)',
      value: `${m.rsi14}`,
      sub: m.rsi14 > 70 ? 'Overbought' : m.rsi14 < 30 ? 'Oversold' : 'Bullish Expansion',
      subColor: m.rsi14 > 60 ? 'text-[#38F997]' : 'text-amber-400',
      icon: TrendingUp,
    },
    {
      label: 'Liquidity Depth',
      value: `$${(m.liquidityUsd / 1e9).toFixed(2)}B`,
      sub: '±2% Market Depth',
      subColor: 'text-[#38F997]',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="bg-[#161926]/90 border border-[rgba(251,237,224,0.10)] rounded-2xl p-5 shadow-panel">
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(251,237,224,0.08)] mb-3">
        <h3 className="text-xs font-semibold text-[#FBEDE0] uppercase font-mono tracking-wider flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#00D2FF]" />
          Token Metrics
        </h3>
        <span className="text-[10px] text-[rgba(251,237,224,0.5)] font-mono">Real-Time</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-[#10131F]/80 border border-[rgba(251,237,224,0.08)] rounded-xl p-3 hover:border-[rgba(251,237,224,0.20)] transition-all"
            >
              <div className="flex items-center justify-between text-[10px] text-[rgba(251,237,224,0.5)] font-mono mb-1">
                <span>{item.label}</span>
                <Icon className="w-3 h-3 text-[rgba(251,237,224,0.4)]" />
              </div>
              <div className="text-sm font-bold font-mono text-[#FBEDE0]">{item.value}</div>
              <div className={`text-[10px] font-medium font-mono mt-0.5 ${item.subColor}`}>
                {item.sub}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TokenMetricsCard;
