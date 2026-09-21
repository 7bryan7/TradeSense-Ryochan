import React from 'react';
import { DecisionReport } from '../../types/decision';
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Target,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface AICoPilotDossierProps {
  decision: DecisionReport;
  isScanning?: boolean;
}

export const AICoPilotDossier: React.FC<AICoPilotDossierProps> = ({
  decision,
  isScanning = false,
}) => {
  const isBuy = decision.action === 'BUY';
  const isSell = decision.action === 'SELL';
  const isHold = decision.action === 'HOLD';

  const actionStyle = {
    BUY: {
      badge: 'bg-[#38F997]/15 text-[#38F997] border-[#38F997]/40 ring-[#38F997]/20',
      icon: TrendingUp,
      accent: '#38F997',
    },
    SELL: {
      badge: 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/40 ring-[#F87171]/20',
      icon: TrendingDown,
      accent: '#F87171',
    },
    HOLD: {
      badge: 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/40 ring-[#FBBF24]/20',
      icon: Activity,
      accent: '#FBBF24',
    },
  }[decision.action];

  const ActionIcon = actionStyle.icon;

  return (
    <div className="bg-[#121522]/95 backdrop-blur-xl border border-[rgba(251,237,224,0.12)] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 relative overflow-hidden">
      {/* Top Header: Model Tag & Policy Status */}
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(251,237,224,0.08)]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#00D2FF]/10 text-[#00D2FF]">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#FBEDE0] font-mono tracking-tight flex items-center gap-1.5">
              <span>Explainable AI Thesis</span>
              {isScanning && <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] animate-pulse" />}
            </h3>
            <span className="text-[10px] text-[rgba(251,237,224,0.45)] font-mono">
              TradeSense-v2.1 • 14ms
            </span>
          </div>
        </div>

        {/* Policy Pass/Fail Stamp */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          {decision.policyOutcome.allowed ? (
            <span className="px-2 py-0.5 rounded-md bg-[#38F997]/10 border border-[#38F997]/25 text-[#38F997] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Policy Passed
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-[#F87171]/10 border border-[#F87171]/25 text-[#F87171] font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Policy Blocked
            </span>
          )}
        </div>
      </div>

      {/* Action Verdict & Target Boundaries Banner */}
      <div className="bg-[#0C0E17]/80 rounded-xl p-3 border border-[rgba(251,237,224,0.08)] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`px-3 py-1 rounded-lg text-sm font-black font-mono tracking-wider flex items-center gap-1.5 border ring-1 ${actionStyle.badge}`}
            >
              <ActionIcon className="w-4 h-4" />
              <span>{decision.action}</span>
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-[#FBEDE0]">
                {decision.confidenceScore}% confidence
              </span>
              <span className="text-[10px] font-mono text-[rgba(251,237,224,0.5)] block">
                Calibrated Softmax
              </span>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono">
            <span className="text-[rgba(251,237,224,0.45)] block text-[10px]">RISK / REWARD</span>
            <span className="text-[#00D2FF] font-bold">&gt; 1:1.34</span>
          </div>
        </div>

        {/* Dynamic Targets Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[rgba(251,237,224,0.06)] text-[11px] font-mono">
          <div className="bg-[#141724] p-2 rounded-lg border border-[rgba(251,237,224,0.06)]">
            <span className="text-[rgba(251,237,224,0.45)] text-[9px] block uppercase">Take-Profit</span>
            <span className="text-[#38F997] font-bold">
              ${decision.outlook.targetPrice ? decision.outlook.targetPrice.toLocaleString() : '116,200'}
            </span>
          </div>
          <div className="bg-[#141724] p-2 rounded-lg border border-[rgba(251,237,224,0.06)]">
            <span className="text-[rgba(251,237,224,0.45)] text-[9px] block uppercase">Stop-Loss (Invalidation)</span>
            <span className="text-[#F87171] font-bold">
              ${decision.outlook.invalidationPrice ? decision.outlook.invalidationPrice.toLocaleString() : '108,500'}
            </span>
          </div>
        </div>
      </div>

      {/* What Changed (30-Second Delta Brief) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-[rgba(251,237,224,0.6)] font-bold">
          <span className="flex items-center gap-1 text-[#00D2FF]">
            <Sparkles className="w-3 h-3 text-[#00D2FF]" />
            <span>What Changed</span>
          </span>
          <span className="text-[10px] text-[rgba(251,237,224,0.4)]">Since Last Scan</span>
        </div>

        <div className="space-y-1">
          {decision.whatChanged.slice(0, 3).map((delta, i) => (
            <div
              key={i}
              className="p-2 rounded-lg bg-[#0C0E17]/60 border border-[rgba(251,237,224,0.06)] flex items-center justify-between text-xs font-mono"
            >
              <div className="truncate pr-2">
                <span className="text-[10px] text-[rgba(251,237,224,0.5)] block truncate">
                  {delta.metric}
                </span>
                <span className="text-[11px] text-[#FBEDE0] font-medium truncate block">
                  {delta.previous} <ArrowRight className="inline w-2.5 h-2.5 text-[rgba(251,237,224,0.3)] mx-0.5" /> {delta.current}
                </span>
              </div>
              <span
                className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border ${
                  delta.sentiment === 'positive'
                    ? 'bg-[#38F997]/15 text-[#38F997] border-[#38F997]/30'
                    : delta.sentiment === 'negative'
                    ? 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/30'
                    : 'bg-white/5 text-[rgba(251,237,224,0.6)] border-white/10'
                }`}
              >
                {delta.delta}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Synthesis Reasoning */}
      <div className="p-3 bg-[#0C0E17]/80 rounded-xl border border-[rgba(251,237,224,0.06)] space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[rgba(251,237,224,0.45)] font-semibold block">
          Chain-of-Thought Synthesis
        </span>
        <p className="text-xs text-[#FBEDE0] font-normal leading-relaxed">
          {decision.explanation}
        </p>
      </div>

      {/* Supporting vs Contrary Evidence Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-[#38F997]/5 border border-[#38F997]/20 space-y-1">
          <span className="text-[10px] font-bold text-[#38F997] flex items-center gap-1 uppercase">
            <CheckCircle2 className="w-3 h-3" /> Supporting
          </span>
          <p className="text-[11px] text-[rgba(251,237,224,0.8)] font-sans leading-tight line-clamp-2">
            {decision.supportingEvidence[0] || 'Orderbook bid absorption at support.'}
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-[#FBBF24]/5 border border-[#FBBF24]/20 space-y-1">
          <span className="text-[10px] font-bold text-[#FBBF24] flex items-center gap-1 uppercase">
            <AlertTriangle className="w-3 h-3" /> Risk Factor
          </span>
          <p className="text-[11px] text-[rgba(251,237,224,0.8)] font-sans leading-tight line-clamp-2">
            {decision.contraryEvidence[0] || 'Near-term resistance at local high.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICoPilotDossier;
