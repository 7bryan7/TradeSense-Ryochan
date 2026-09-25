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
  MessageSquareCode,
  Zap,
} from 'lucide-react';


interface AIDecisionCardProps {
  decision: DecisionReport;
  isScanning?: boolean;
  onInterrogateInChat?: (prompt: string) => void;
}

export const AIDecisionCard: React.FC<AIDecisionCardProps> = ({
  decision,
  isScanning = false,
  onInterrogateInChat,
}) => {
  if (!decision) return null;

  const action = decision.action || 'HOLD';
  const isBuy = action === 'BUY';
  const isSell = action === 'SELL';

  const actionConfig = {
    BUY: {
      badge: 'bg-[#4ce07a]/20 text-[#4ce07a] border-[#4ce07a]/50 shadow-ryo-sm',
      icon: TrendingUp,
      accent: '#4ce07a',
      glow: 'shadow-[0_0_24px_-4px_rgba(76,224,122,0.25)]',
    },
    SELL: {
      badge: 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_16px_-2px_rgba(244,63,94,0.3)]',
      icon: TrendingDown,
      accent: '#f43f5e',
      glow: 'shadow-[0_0_24px_-4px_rgba(244,63,94,0.25)]',
    },
    HOLD: {
      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_16px_-2px_rgba(245,158,11,0.3)]',
      icon: Activity,
      accent: '#f59e0b',
      glow: 'shadow-[0_0_24px_-4px_rgba(245,158,11,0.25)]',
    },
  }[action] || {
    badge: 'bg-white/10 text-white border-white/20',
    icon: Activity,
    accent: '#ffffff',
    glow: '',
  };

  const ActionIcon = actionConfig.icon;

  return (
    <div className={`tradesense-glass-card rounded-2xl p-5 space-y-4 border border-white/[0.12] ${actionConfig.glow}`}>
      {/* Top Header: Model Tag & Safety Policy Stamp */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#4ce07a]/15 text-[#4ce07a] border border-[#4ce07a]/30 shadow-ryo-sm">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Autonomous AI Verdict
              </span>
              {isScanning && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-[#4ce07a]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ce07a] animate-ping" />
                  Synthesizing...
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#8F9CAE] font-mono">
              TradeSense AI Reasoning Engine
            </span>
          </div>
        </div>

        {/* Policy Invariant Status */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          {decision.policyOutcome.allowed ? (
            <span className="px-2.5 py-1 rounded-lg bg-[#4ce07a]/15 border border-[#4ce07a]/35 text-[#4ce07a] font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(76,224,122,0.15)]">
              <ShieldCheck className="w-3.5 h-3.5" /> Policy Invariants Passed
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/35 text-rose-400 font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.15)]">
              <ShieldAlert className="w-3.5 h-3.5" /> Policy Invariants Blocked
            </span>
          )}
        </div>
      </div>

      {/* Hero Verdict HUD Strip */}
      <div className="tradesense-glass-pill rounded-xl p-3.5 border border-white/[0.10] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`px-3.5 py-1.5 rounded-xl text-sm font-black font-mono tracking-wider flex items-center gap-2 border ${actionConfig.badge}`}
          >
            <ActionIcon className="w-4 h-4" />
            <span>{decision.action}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white">
                {decision.confidenceScore}% Conviction
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.08] text-[#8F9CAE] border border-white/[0.10]">
                {decision.confidenceLevel}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#8F9CAE] block">
              Confidence Score
            </span>
          </div>
        </div>

        {/* Target Boundaries HUD */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="tradesense-glass-pill px-3 py-1.5 rounded-lg border border-white/[0.08] text-right">
            <span className="text-[9px] text-[#8F9CAE] block uppercase">Take-Profit</span>
            <span className="text-[#4ce07a] font-bold">
              ${decision.outlook.targetPrice ? decision.outlook.targetPrice.toLocaleString() : '116,200'}
            </span>
          </div>
          <div className="tradesense-glass-pill px-3 py-1.5 rounded-lg border border-white/[0.08] text-right">
            <span className="text-[9px] text-[#8F9CAE] block uppercase">Invalidation</span>
            <span className="text-rose-400 font-bold">
              ${decision.outlook.invalidationPrice ? decision.outlook.invalidationPrice.toLocaleString() : '108,500'}
            </span>
          </div>
          <div className="tradesense-glass-pill px-3 py-1.5 rounded-lg border border-white/[0.08] text-right hidden sm:block">
            <span className="text-[9px] text-[#8F9CAE] block uppercase">Horizon</span>
            <span className="text-white font-bold">{decision.outlook.timeframe}</span>
          </div>
        </div>
      </div>

      {/* Core AI Thesis (Concise, 1 punchy explanation — no duplicate quotes) */}
      <div className="p-3.5 tradesense-glass-pill rounded-xl border border-white/[0.08] space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#4ce07a] font-bold flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#4ce07a]" />
          <span>Core AI Thesis</span>
        </div>
        <p className="text-xs text-white/95 font-medium leading-relaxed">
          {decision.explanation}
        </p>
      </div>

      {/* What Changed (Fast 4-metric quantitative delta scan) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#8F9CAE]">
          <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-[#4ce07a]" /> Key Metric Shifts (Since Last Scan)
          </span>
          <span className="text-[10px] text-[#8F9CAE]/70">Deterministic Telemetry</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {decision.whatChanged.slice(0, 4).map((delta, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl tradesense-glass-pill border border-white/[0.08] flex flex-col justify-between text-xs font-mono"
            >
              <span className="text-[10px] text-[#8F9CAE] truncate block">
                {delta.metric}
              </span>
              <div className="mt-1 flex items-baseline justify-between gap-1">
                <span className="text-xs font-bold text-white truncate">
                  {delta.current}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    delta.sentiment === 'positive'
                      ? 'bg-[#4ce07a]/15 text-[#4ce07a]'
                      : delta.sentiment === 'negative'
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'bg-white/5 text-[#8F9CAE]'
                  }`}
                >
                  {delta.delta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interrogate CTA */}

      {onInterrogateInChat && (
        <button
          type="button"
          onClick={() => onInterrogateInChat(`Why did the model select ${decision.action} with ${decision.confidenceScore}% confidence?`)}
          className="w-full py-2.5 px-3 rounded-xl tradesense-glass-pill hover:bg-[#4ce07a]/15 hover:border-[#4ce07a]/40 text-white hover:text-[#4ce07a] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group shadow-sm"
        >
          <MessageSquareCode className="w-4 h-4 text-[#4ce07a] group-hover:scale-110 transition-transform" />
          <span>Interrogate AI Thesis in Gemini Chat</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#8F9CAE] group-hover:text-[#4ce07a] group-hover:translate-x-0.5 transition-all" />
        </button>
      )}
    </div>
  );
};

export default AIDecisionCard;

