import React from 'react';
import { DecisionReport } from '../../types/decision';
import {
  BrainCircuit,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Target,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  MessageSquareCode,
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
  const isBuy = decision.action === 'BUY';
  const isSell = decision.action === 'SELL';
  const isHold = decision.action === 'HOLD';

  const actionConfig = {
    BUY: {
      border: 'border-[#38F997]/40 shadow-glow-green-sm',
      badgeBg: 'bg-[#38F997]/15 text-[#38F997] border border-[#38F997]/30',
      iconColor: 'text-[#38F997]',
    },
    SELL: {
      border: 'border-[#F87171]/40 shadow-glow-red-sm',
      badgeBg: 'bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30',
      iconColor: 'text-[#F87171]',
    },
    HOLD: {
      border: 'border-[#FBBF24]/40',
      badgeBg: 'bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30',
      iconColor: 'text-[#FBBF24]',
    },
  }[decision.action];

  return (
    <div
      className={`bg-gradient-to-br from-[#161926] to-[#1C2030] backdrop-blur-xl border rounded-2xl p-5 shadow-xl transition-all duration-300 ${actionConfig.border}`}
    >
      {/* Top Header: Decision Badge + Confidence */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[rgba(251,237,224,0.08)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00D2FF]/10 border border-[#00D2FF]/25 text-[#00D2FF] shadow-xs">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <span>AI Autonomous Decision</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <span
                className={`px-3 py-1 rounded-xl text-sm font-black font-mono tracking-wider flex items-center gap-1.5 shadow-xs ${actionConfig.badgeBg}`}
              >
                {isBuy && <TrendingUp className="w-4 h-4" />}
                {decision.action}
              </span>
              <span className="text-xs font-mono font-bold text-[#FBEDE0] bg-[#10131F] px-2.5 py-1 rounded-xl border border-[rgba(251,237,224,0.12)]">
                {decision.confidenceScore}% confidence ({decision.confidenceLevel})
              </span>
            </div>
          </div>
        </div>

        {/* Policy Outcome Stamp */}
        <div className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl bg-[#10131F] border border-[rgba(251,237,224,0.12)] shadow-xs">
          {decision.policyOutcome.allowed ? (
            <ShieldCheck className="w-4 h-4 text-[#38F997]" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-[#F87171]" />
          )}
          <span
            className={`font-semibold ${
              decision.policyOutcome.allowed ? 'text-[#38F997]' : 'text-[#F87171]'
            }`}
          >
            {decision.policyOutcome.allowed ? 'Safety Policy: Passed' : 'Safety Policy: Blocked'}
          </span>
        </div>
      </div>

      {/* Rationale & Evidence-Linked AI Explanation */}
      <div className="my-4 p-4 bg-[#10131F]/90 rounded-xl border border-[rgba(251,237,224,0.10)] space-y-2">
        <div className="text-[11px] font-mono uppercase text-[#00D2FF] font-bold flex items-center gap-1.5 tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#00D2FF]" />
          Evidence-Linked Synthesis
        </div>
        <p className="text-sm font-medium text-[#FBEDE0] leading-relaxed">
          {decision.explanation}
        </p>
        <p className="text-xs text-[rgba(251,237,224,0.6)] italic leading-relaxed">
          "{decision.rationale}"
        </p>
      </div>

      {/* What Changed Deltas (30-second comprehension) */}
      <div className="mb-4">
        <div className="text-[11px] font-mono uppercase text-[rgba(251,237,224,0.5)] font-bold mb-2 flex items-center gap-1 tracking-wider">
          <span>What changed since last scan?</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {decision.whatChanged.map((delta, idx) => (
            <div
              key={idx}
              className="bg-[#10131F]/80 border border-[rgba(251,237,224,0.08)] rounded-xl p-2.5 flex items-center justify-between text-xs"
            >
              <div>
                <span className="text-[rgba(251,237,224,0.5)] block text-[10px] font-mono">
                  {delta.metric}
                </span>
                <span className="font-mono text-[#FBEDE0] font-medium text-xs">
                  {delta.previous} <ArrowRight className="inline w-3 h-3 text-[rgba(251,237,224,0.3)] mx-0.5" /> {delta.current}
                </span>
              </div>
              <span
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                  delta.sentiment === 'positive'
                    ? 'bg-[#38F997]/15 text-[#38F997] border border-[#38F997]/25'
                    : delta.sentiment === 'negative'
                    ? 'bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/25'
                    : 'bg-white/5 text-[rgba(251,237,224,0.65)]'
                }`}
              >
                {delta.delta}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Supporting vs Contrary Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Supporting Evidence */}
        <div className="bg-[#38F997]/5 border border-[#38F997]/20 rounded-xl p-3.5">
          <div className="text-[11px] font-mono text-[#38F997] uppercase font-bold flex items-center gap-1.5 mb-2.5 tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#38F997]" />
            Supporting Evidence
          </div>
          <ul className="space-y-1.5">
            {decision.supportingEvidence.map((ev, idx) => (
              <li key={idx} className="text-xs text-[rgba(251,237,224,0.85)] flex items-start gap-2 leading-relaxed">
                <span className="text-[#38F997] font-bold shrink-0 mt-0.5">✓</span>
                <span>{ev}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contrary Evidence */}
        <div className="bg-[#FBBF24]/5 border border-[#FBBF24]/20 rounded-xl p-3.5">
          <div className="text-[11px] font-mono text-[#FBBF24] uppercase font-bold flex items-center gap-1.5 mb-2.5 tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-[#FBBF24]" />
            Contrary Evidence & Risks
          </div>
          <ul className="space-y-1.5">
            {decision.contraryEvidence.map((ev, idx) => (
              <li key={idx} className="text-xs text-[rgba(251,237,224,0.85)] flex items-start gap-2 leading-relaxed">
                <span className="text-[#FBBF24] font-bold shrink-0 mt-0.5">⚠</span>
                <span>{ev}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Outlook & Invalidation Condition */}
      <div className="bg-[#10131F] border border-[rgba(251,237,224,0.10)] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#00D2FF]" />
          <span className="text-[rgba(251,237,224,0.5)]">Target Horizon:</span>
          <span className="text-[#FBEDE0] font-bold">{decision.outlook.timeframe}</span>
        </div>
        <div className="text-[rgba(251,237,224,0.7)]">
          Invalidation Level: <strong className="text-[#F87171]">${decision.outlook.invalidationPrice.toLocaleString()}</strong>
        </div>
      </div>

      {/* Interrogate in Chat CTA */}
      {onInterrogateInChat && (
        <button
          type="button"
          onClick={() => onInterrogateInChat(`Why did the agent choose ${decision.action} in this analysis?`)}
          className="mt-3 w-full py-2.5 px-3 rounded-xl bg-[#00D2FF]/10 hover:bg-[#00D2FF]/20 border border-[#00D2FF]/30 text-[#00D2FF] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-glow-cyan-xs group"
        >
          <MessageSquareCode className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Interrogate Thesis in Chat ("Why {decision.action}?")</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default AIDecisionCard;
