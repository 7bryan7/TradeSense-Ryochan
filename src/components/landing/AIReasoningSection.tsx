import React from 'react';
import { BrainCircuit, CheckCircle2, AlertTriangle, Target, ShieldCheck } from 'lucide-react';
import { mockBtcDecision } from '../../data/decisions';

export const AIReasoningSection: React.FC = () => {
  return (
    <section className="py-20 px-6 border-t border-[rgba(80,160,255,0.1)] bg-[#050B14]/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
            Section 04 — AI Reasoning
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Transparent evidence-linked decisions
          </h2>
          <p className="text-sm text-slate-400 mt-2 font-mono">
            No black-box hallucinations. TradeSense synthesizes verified RYO tool signals into actionable decisions.
          </p>
        </div>

        {/* Featured Decision Card Showcase */}
        <div className="max-w-4xl mx-auto bg-[#091522] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white font-mono">BTC / USD Research Run</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    Passed Safety Policy
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-3 py-1 rounded-lg text-xs font-black font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    BUY
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    82% Evidence Strength (HIGH)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-slate-400">
              <div>Cutoff: 20 Sep 2026, 14:32 UTC</div>
              <div className="text-emerald-400 font-semibold mt-0.5">Execution Allowed</div>
            </div>
          </div>

          {/* Explanation Quote */}
          <div className="my-6 p-4 bg-[#050B14] rounded-2xl border border-slate-800">
            <p className="text-sm text-slate-200 leading-relaxed">
              "{mockBtcDecision.explanation}"
            </p>
          </div>

          {/* 2-Col Evidence Contrast */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0c1a29]/60 border border-emerald-500/20 rounded-2xl p-4">
              <h4 className="text-xs font-mono text-emerald-400 uppercase font-semibold flex items-center gap-1.5 mb-2.5">
                <CheckCircle2 className="w-4 h-4" />
                Supporting Evidence
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {mockBtcDecision.supportingEvidence.map((ev, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0c1a29]/60 border border-amber-500/20 rounded-2xl p-4">
              <h4 className="text-xs font-mono text-amber-400 uppercase font-semibold flex items-center gap-1.5 mb-2.5">
                <AlertTriangle className="w-4 h-4" />
                Contrary Evidence & Risks
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {mockBtcDecision.contraryEvidence.map((ev, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">⚠</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

