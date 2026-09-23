import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PaperPortfolio } from '../../types/portfolio';
import { MoreVertical, ChevronDown, Wallet, ArrowUpRight } from 'lucide-react';

interface AccountBalanceWidgetProps {
  portfolio: PaperPortfolio;
  onResetPortfolio?: () => void;
}

export const AccountBalanceWidget: React.FC<AccountBalanceWidgetProps> = ({
  portfolio,
  onResetPortfolio,
}) => {
  const { user } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState<'USDT' | 'BTC'>('USDT');

  const totalValue = portfolio.totalValue || 10000;
  const pnl = portfolio.totalUnrealizedPnl || 42.18;
  const isPositivePnl = pnl >= 0;

  return (
    <div className="dashboard-glass-card rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Top User Info & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=trader'}
            alt={user?.name || 'Trader'}
            className="w-10 h-10 rounded-full bg-[#15171C] border border-white/10 object-cover shadow-sm"
          />
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight leading-tight">
              {user?.name || 'HackerJose25'}
            </h3>
            <span className="text-[11px] text-[#8F9CAE] font-mono">
              Pro Paper Trader
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetPortfolio}
          title="Portfolio Actions"
          className="p-1.5 rounded-lg text-[#8F9CAE] hover:text-white hover:bg-white/5 transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Currency Selector Pill (matching reference image) */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#15171C]/75 backdrop-blur-md border border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
            $
          </div>
          <div>
            <span className="text-[10px] text-[#8F9CAE] block font-mono uppercase leading-tight">
              Default Currency
            </span>
            <span className="text-xs font-bold text-white font-mono">
              {selectedCurrency} / USD (Virtual)
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSelectedCurrency(prev => (prev === 'USDT' ? 'BTC' : 'USDT'))}
          className="p-1 text-[#8F9CAE] hover:text-white"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Balance Display (matching reference image) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#8F9CAE] font-medium">Total Balance</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-0.5 ${
              isPositivePnl ? 'bg-emerald-500/15 text-[#10B981]' : 'bg-rose-500/15 text-[#EF4444]'
            }`}
          >
            <ArrowUpRight className="w-3 h-3" />
            {isPositivePnl ? '+' : ''}${pnl.toFixed(2)}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-mono text-[#8F9CAE]">USDT</span>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-[#8F9CAE] pt-1">
          <span>Available Cash: ${(portfolio.virtualCash ?? 10000).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          <span>10 bps Model</span>
        </div>
      </div>
    </div>
  );
};

export default AccountBalanceWidget;
