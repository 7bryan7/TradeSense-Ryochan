import React, { useState } from 'react';
import { SimulationResult } from '../../types/simulation';
import { DecisionReport } from '../../types/decision';
import { Token } from '../../types/market';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  MessageSquareCode,
  Zap,
} from 'lucide-react';

interface TradeExecutionWidgetProps {
  token: Token;
  decision: DecisionReport;
  simulation: SimulationResult;
  onInterrogateInChat?: (prompt: string) => void;
}

export const TradeExecutionWidget: React.FC<TradeExecutionWidgetProps> = ({
  token,
  decision,
  simulation,
  onInterrogateInChat,
}) => {
  const [activeTab, setActiveTab] = useState<'BUY' | 'HOLD' | 'SELL'>(decision.action);
  const [orderAmount, setOrderAmount] = useState<string>('1000.00');

  const fillPrice = simulation.order.fillPrice || token.metrics.price;
  const numericAmount = parseFloat(orderAmount) || 0;
  const estimatedQty = fillPrice > 0 ? (numericAmount / fillPrice).toFixed(4) : '0.0000';

  const isBuy = activeTab === 'BUY';
  const isSell = activeTab === 'SELL';
  const isHold = activeTab === 'HOLD';

  return (
    <div className="dashboard-glass-card rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Tab Switcher (matching template Buy / Sell pills) */}
      <div className="flex items-center bg-[#15171C]/75 backdrop-blur-md p-1 rounded-xl border border-white/[0.06]">
        {(['BUY', 'HOLD', 'SELL'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
              activeTab === tab
                ? tab === 'BUY'
                  ? 'bg-[#4ce07a]/20 text-[#4ce07a] shadow-xs'
                  : tab === 'SELL'
                  ? 'bg-rose-500/20 text-[#EF4444] shadow-xs'
                  : 'bg-amber-500/20 text-[#F59E0B] shadow-xs'
                : 'text-[#8F9CAE] hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Execution Reference Price */}
      <div className="bg-[#15171C] rounded-xl p-3 border border-white/[0.06] flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#8F9CAE] block font-mono uppercase">
            Simulated Execution Price
          </span>
          <span className="text-lg font-bold text-white font-mono">
            ${fillPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#8F9CAE] block font-mono uppercase">
            Policy Invariant
          </span>
          {decision.policyOutcome.allowed ? (
            <span className="text-xs font-bold text-[#10B981] flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> Passed
            </span>
          ) : (
            <span className="text-xs font-bold text-[#EF4444] flex items-center gap-1 font-mono">
              <ShieldAlert className="w-3.5 h-3.5" /> Blocked
            </span>
          )}
        </div>
      </div>

      {/* Inputs Strip (matching template input fields) */}
      <div className="space-y-2">
        {/* Pay / Spend Amount */}
        <div className="bg-[#15171C] rounded-xl p-2.5 border border-white/[0.06] flex items-center justify-between">
          <div className="flex-1 pr-2">
            <span className="text-[9px] text-[#8F9CAE] block font-mono uppercase">
              Virtual USD Allocation
            </span>
            <input
              type="text"
              value={orderAmount}
              onChange={e => setOrderAmount(e.target.value)}
              className="bg-transparent text-white font-mono font-bold text-sm focus:outline-none w-full"
            />
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-bold text-white flex items-center gap-1">
            <span>USDT</span>
          </div>
        </div>

        {/* Receive Amount */}
        <div className="bg-[#15171C] rounded-xl p-2.5 border border-white/[0.06] flex items-center justify-between">
          <div className="flex-1 pr-2">
            <span className="text-[9px] text-[#8F9CAE] block font-mono uppercase">
              Estimated {token.symbol} Quantity
            </span>
            <span className="text-sm font-bold text-white font-mono block">
              {estimatedQty}
            </span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-bold text-white flex items-center gap-1">
            <span>{token.symbol}</span>
          </div>
        </div>
      </div>

      {/* Targets Banner */}
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
        <div className="bg-[#15171C] p-2 rounded-xl border border-white/[0.06]">
          <span className="text-[9px] text-[#8F9CAE] block uppercase">Take-Profit</span>
          <span className="text-[#10B981] font-bold">
            ${decision.outlook.targetPrice ? decision.outlook.targetPrice.toLocaleString() : '116,200'}
          </span>
        </div>
        <div className="bg-[#15171C] p-2 rounded-xl border border-white/[0.06]">
          <span className="text-[9px] text-[#8F9CAE] block uppercase">Stop-Loss (Invalidation)</span>
          <span className="text-[#EF4444] font-bold">
            ${decision.outlook.invalidationPrice ? decision.outlook.invalidationPrice.toLocaleString() : '108,500'}
          </span>
        </div>
      </div>

      {/* Signature RYO Green Action Button (matching ryobuild.com) */}
      <button
        type="button"
        onClick={() => {
          if (onInterrogateInChat) {
            onInterrogateInChat(`Why did the agent choose ${decision.action} in this analysis?`);
          }
        }}
        className="w-full py-3 px-4 rounded-xl bg-ryo-gradient hover:opacity-95 text-[#050806] font-bold text-xs sm:text-sm font-mono tracking-wide shadow-ryo flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Zap className="w-4 h-4 fill-current text-[#050806]" />
        <span>{activeTab === 'BUY' ? `Buy ${token.symbol} (Paper)` : activeTab === 'SELL' ? `Sell ${token.symbol} (Paper)` : 'Maintain HOLD Position'}</span>
      </button>

      {/* Interrogate in Chat link */}
      {onInterrogateInChat && (
        <button
          type="button"
          onClick={() => onInterrogateInChat(`Why did the agent choose ${decision.action} in this analysis?`)}
          className="w-full text-center text-xs font-mono text-[#8F9CAE] hover:text-[#4ce07a] flex items-center justify-center gap-1.5 transition-colors pt-0.5"
        >
          <MessageSquareCode className="w-3.5 h-3.5 text-[#4ce07a]" />
          <span>Interrogate AI Thesis in Chat</span>
          <ArrowRight className="w-3 h-3 text-[#4ce07a]" />
        </button>
      )}
    </div>
  );
};

export default TradeExecutionWidget;
