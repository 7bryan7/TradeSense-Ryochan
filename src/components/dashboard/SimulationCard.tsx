import React from 'react';
import { SimulationResult } from '../../types/simulation';
import { ShieldCheck, HelpCircle, ArrowUpRight, Ban, PauseCircle, Sparkles } from 'lucide-react';

interface SimulationCardProps {
  simulation: SimulationResult;
  status: 'APPLIED' | 'SKIPPED' | 'BLOCKED' | 'HOLD';
}

export const SimulationCard: React.FC<SimulationCardProps> = ({ simulation, status }) => {
  const o = simulation.order;
  const isApplied = status === 'APPLIED' || o.status === 'FILLED';
  const isHold = status === 'HOLD' || o.status === 'HOLD_NO_ACTION';
  const isBlocked = status === 'BLOCKED' || o.status === 'BLOCKED';
  const isSkipped = status === 'SKIPPED' || o.status === 'SKIPPED_NO_POSITION';

  return (
    <div className="bg-[#161926]/90 backdrop-blur-xl border border-[rgba(251,237,224,0.12)] rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[rgba(251,237,224,0.08)]">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-[#FBEDE0] tracking-tight flex items-center gap-2.5">
            <span>Paper Trading Simulation</span>
            <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FBEDE0]/10 border border-[rgba(251,237,224,0.2)] text-[#FBEDE0]">
              Virtual • No Capital At Risk
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {isApplied && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#38F997]/15 border border-[#38F997]/30 text-[#38F997] shadow-glow-green-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> Order Applied (10 bps Model)
            </span>
          )}
          {isHold && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FBBF24]/15 border border-[#FBBF24]/30 text-[#FBBF24]">
              <PauseCircle className="w-3.5 h-3.5" /> HOLD — Capital Preserved
            </span>
          )}
          {isBlocked && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#F87171]/15 border border-[#F87171]/30 text-[#F87171] shadow-glow-red-sm">
              <Ban className="w-3.5 h-3.5" /> Execution Blocked
            </span>
          )}
          {isSkipped && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/5 text-[rgba(251,237,224,0.7)] border border-white/10">
              <HelpCircle className="w-3.5 h-3.5" /> Skipped (No Position)
            </span>
          )}
        </div>
      </div>

      {/* Grid: Position Size, Entry/Fill, Position Units, Simulated P&L */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* Col 1: Position Size & Leverage */}
        <div className="bg-[#10131F]/85 border border-[rgba(251,237,224,0.08)] rounded-xl p-3.5 space-y-2">
          <div className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] uppercase tracking-wider">Position Sizing</div>
          <div>
            <div className="text-base font-bold font-mono text-[#FBEDE0]">
              ${o.positionSizeUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-[rgba(251,237,224,0.5)] font-mono mt-0.5">
              ({o.positionPercent}% of portfolio equity)
            </div>
          </div>
          <div className="text-[11px] text-[#00D2FF] font-mono border-t border-[rgba(251,237,224,0.08)] pt-1.5">
            Leverage: {o.leverage}
          </div>
        </div>

        {/* Col 2: Entry / Fill & Fees */}
        <div className="bg-[#10131F]/85 border border-[rgba(251,237,224,0.08)] rounded-xl p-3.5 space-y-2">
          <div className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] uppercase tracking-wider">Simulated Fill</div>
          <div>
            <div className="text-base font-bold font-mono text-[#FBEDE0]">
              ${o.fillPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-[rgba(251,237,224,0.5)] font-mono mt-0.5">
              Spot Quote Ref
            </div>
          </div>
          <div className="text-[11px] text-[rgba(251,237,224,0.6)] font-mono border-t border-[rgba(251,237,224,0.08)] pt-1.5 flex justify-between">
            <span>Fee: ${o.feeEstimatedUsd.toFixed(2)}</span>
            <span>Slip: ${o.slippageEstimatedUsd.toFixed(2)}</span>
          </div>
        </div>

        {/* Col 3: Units, Take Profit & Stop Loss */}
        <div className="bg-[#10131F]/85 border border-[rgba(251,237,224,0.08)] rounded-xl p-3.5 space-y-2">
          <div className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] uppercase tracking-wider">Risk Guardrails</div>
          <div>
            <div className="text-base font-bold font-mono text-[#FBEDE0]">
              {o.quantity} {o.tokenSymbol}
            </div>
            <div className="text-xs text-[rgba(251,237,224,0.5)] font-mono mt-0.5">
              Simulated Inventory
            </div>
          </div>
          <div className="text-[11px] font-mono border-t border-[rgba(251,237,224,0.08)] pt-1.5 flex justify-between">
            <span className="text-[#38F997] font-bold">TP: ${o.takeProfitPrice.toLocaleString()}</span>
            <span className="text-[#F87171] font-bold">SL: ${o.stopLossPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Col 4: Simulated P&L Highlight */}
        <div className="bg-[#10131F]/85 border border-[rgba(251,237,224,0.08)] rounded-xl p-3.5 space-y-2">
          <div className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] uppercase tracking-wider">Simulated P&L</div>
          <div>
            <div className="text-base font-bold font-mono text-[#38F997] flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-0.5" />
              +${simulation.totalPnlUsd.toFixed(2)}
              <span className="text-xs font-semibold ml-1.5">
                (+{simulation.totalPnlPct}%)
              </span>
            </div>
            <div className="text-xs text-[rgba(251,237,224,0.5)] font-mono mt-0.5">
              Realized: ${simulation.realizedPnlUsd.toFixed(2)}
            </div>
          </div>
          <div className="text-[11px] text-[rgba(251,237,224,0.6)] font-mono border-t border-[rgba(251,237,224,0.08)] pt-1.5">
            Equity: ${simulation.newPortfolioEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Disclaimers & Invariant Note */}
      <div className="mt-4 px-3.5 py-2.5 bg-[#10131F] rounded-xl border border-[rgba(251,237,224,0.06)] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[rgba(251,237,224,0.5)]">
        <span>Policy Rules: 5% Max Single Allocation • 20% Max Token Exposure • 10 bps Slippage Model</span>
        <span className="text-[#00D2FF] font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Deterministic Simulation Only
        </span>
      </div>
    </div>
  );
};

export default SimulationCard;
