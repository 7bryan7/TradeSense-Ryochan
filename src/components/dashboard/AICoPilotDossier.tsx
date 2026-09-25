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
  CheckCircle2,
  AlertTriangle,
  MessageSquareCode,
  Zap,
} from 'lucide-react';

interface AICoPilotDossierProps {
  decision: DecisionReport;
  isScanning?: boolean;
  onInterrogateInChat?: (prompt: string) => void;
}

export const AICoPilotDossier: React.FC<AICoPilotDossierProps> = ({
  decision,
  isScanning = false,
  onInterrogateInChat,
}) => {
  const actionConfig = {
    BUY: {
      badge: 'bg-[#4ce07a]/15 text-[#4ce07a] border-[#4ce07a]/40 shadow-ryo-sm',
      icon: TrendingUp,
      accent: '#4ce07a',
    },
    SELL: {
      badge: 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-[0_0_14px_-2px_rgba(244,63,94,0.3)]',
      icon: TrendingDown,
      accent: '#f43f5e',
    },
    HOLD: {
      badge: 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-[0_0_14px_-2px_rgba(245,158,11,0.3)]',
      icon: Activity,
      accent: '#f59e0b',
    },
  }[decision.action];

  const ActionIcon = actionConfig.icon;

  return (
    <div className="dashboard-glass-card rounded-2xl p-4 sm:p-5 space-y-3.5 border border-white/[0.08]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#4ce07a]/10 text-[#4ce07a] border border-[#4ce07a]/20">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-mono tracking-tight flex items-center gap-1.5">
              <span>AI Intelligence Thesis</span>
              {isScanning && <span className="w-1.5 h-1.5 rounded-full bg-[#4ce07a] animate-pulse" />}
            </h3>
            <span className="text-[10px] text-[#8F9CAE] font-mono">
              TradeSense-v2.1 • Multi-Modal Synthesis
            </span>
          </div>
        </div>

        {/* Policy Pass/Fail Stamp */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          {decision.policyOutcome.allowed ? (
            <span className="px-2 py-0.5 rounded-md bg-[#4ce07a]/10 border border-[#4ce07a]/25 text-[#4ce07a] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Policy Passed
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-400 font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Policy Blocked
            </span>
          )}
        </div>
      </div>

      {/* Action Verdict & Targets Strip */}
      <div className="bg-[#15171C]/90 rounded-xl p-3 border border-white/[0.06] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`px-3 py-1 rounded-lg text-sm font-black font-mono tracking-wider flex items-center gap-1.5 border ${actionConfig.badge}`}
            >
              <ActionIcon className="w-4 h-4" />
              <span>{decision.action}</span>
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-white">
                {decision.confidenceScore}% confidence
              </span>
              <span className="text-[10px] font-mono text-[#8F9CAE] block">
                {decision.confidenceLevel} Conviction
              </span>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono">
            <span className="text-[#8F9CAE] block text-[10px]">RISK / REWARD</span>
            <span className="text-[#4ce07a] font-bold">&gt; 1:1.34</span>
          </div>
        </div>

        {/* Dynamic Targets Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.04] text-[11px] font-mono">
          <div className="bg-[#15171C] p-2 rounded-lg border border-white/[0.06]">
            <span className="text-[#8F9CAE] text-[9px] block uppercase">Take-Profit</span>
            <span className="text-[#4ce07a] font-bold">
              ${decision.outlook.targetPrice ? decision.outlook.targetPrice.toLocaleString() : '116,200'}
            </span>
          </div>
          <div className="bg-[#15171C] p-2 rounded-lg border border-white/[0.06]">
            <span className="text-[#8F9CAE] text-[9px] block uppercase">Stop-Loss (Invalidation)</span>
            <span className="text-rose-400 font-bold">
              ${decision.outlook.invalidationPrice ? decision.outlook.invalidationPrice.toLocaleString() : '108,500'}
            </span>
          </div>
        </div>
      </div>

      {/* Synthesis Reasoning (Crisp, 1 concise thesis) */}
      <div className="p-3 bg-[#15171C]/70 rounded-xl border border-white/[0.06] space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#4ce07a] font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#4ce07a]" />
          Executive Thesis
        </span>
        <p className="text-xs text-white/90 font-normal leading-relaxed">
          {decision.explanation}
        </p>
      </div>

      {/* Supporting vs Contrary Evidence Highlights (concise) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-[#4ce07a]/5 border border-[#4ce07a]/20 space-y-1">
          <span className="text-[10px] font-bold text-[#4ce07a] flex items-center gap-1 uppercase">
            <CheckCircle2 className="w-3 h-3" /> Supporting
          </span>
          <p className="text-[11px] text-[#8F9CAE] font-sans leading-tight line-clamp-1">
            {decision.supportingEvidence[0] || 'Orderbook bid absorption at support.'}
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-1">
          <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 uppercase">
            <AlertTriangle className="w-3 h-3" /> Risk Factor
          </span>
          <p className="text-[11px] text-[#8F9CAE] font-sans leading-tight line-clamp-1">
            {decision.contraryEvidence[0] || 'Near-term resistance at local high.'}
          </p>
        </div>
      </div>

      {/* Interrogate CTA */}
      {onInterrogateInChat && (
        <button
          type="button"
          onClick={() => onInterrogateInChat(`Why did the model choose ${decision.action} in this analysis?`)}
          className="w-full py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-[#4ce07a]/10 border border-white/[0.08] hover:border-[#4ce07a]/30 text-white hover:text-[#4ce07a] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group"
        >
          <MessageSquareCode className="w-4 h-4 text-[#4ce07a] group-hover:scale-110 transition-transform" />
          <span>Interrogate Thesis in Gemini Chat</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#8F9CAE] group-hover:text-[#4ce07a] group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default AICoPilotDossier;
