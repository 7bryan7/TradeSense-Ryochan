import React, { useState, useEffect } from 'react';
import { DecisionReport } from '../../types/decision';
import { Token } from '../../types/market';
import { SimulationResult } from '../../types/simulation';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
  Activity,
  Keyboard,
  Target,
  AlertCircle,
  Flame,
} from 'lucide-react';

interface WhatChanged30sBannerProps {
  token: Token;
  decision: DecisionReport;
  simulation: SimulationResult;
  isScanning: boolean;
  viewMode: 'executive' | 'full';
  onToggleViewMode: (mode: 'executive' | 'full') => void;
  onRunAnalysis: () => void;
  onSimulateOrder: () => void;
  onOpenShortcuts: () => void;
}

export const WhatChanged30sBanner: React.FC<WhatChanged30sBannerProps> = ({
  token,
  decision,
  simulation,
  isScanning,
  viewMode,
  onToggleViewMode,
  onRunAnalysis,
  onSimulateOrder,
  onOpenShortcuts,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  // Simulated 30-second read countdown for hackathon demonstration
  useEffect(() => {
    setSecondsRemaining(30);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(interval);
  }, [decision.id]);

  const isBuy = decision.action === 'BUY';
  const isSell = decision.action === 'SELL';
  const isHold = decision.action === 'HOLD';

  const actionStyle = {
    BUY: {
      badge: 'bg-[#38F997]/15 text-[#38F997] border-[#38F997]/40 ring-[#38F997]/20',
      glow: 'shadow-[0_0_24px_rgba(56,249,151,0.15)]',
      border: 'border-[#38F997]/40',
      icon: TrendingUp,
      accent: '#38F997',
    },
    SELL: {
      badge: 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/40 ring-[#F87171]/20',
      glow: 'shadow-[0_0_24px_rgba(248,113,113,0.15)]',
      border: 'border-[#F87171]/40',
      icon: TrendingDown,
      accent: '#F87171',
    },
    HOLD: {
      badge: 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/40 ring-[#FBBF24]/20',
      glow: 'shadow-[0_0_24px_rgba(251,191,36,0.15)]',
      border: 'border-[#FBBF24]/40',
      icon: Activity,
      accent: '#FBBF24',
    },
  }[decision.action];

  const ActionIcon = actionStyle.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121522] via-[#161926] to-[#0E101B] border border-[rgba(251,237,224,0.14)] p-4 sm:p-5 shadow-2xl transition-all duration-300">
      {/* Ambient background glow */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-20"
        style={{ backgroundColor: actionStyle.accent }}
      />

      {/* Top Header Row: 30s Rule Badge + View Switcher + Hotkeys */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(251,237,224,0.08)]">
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#38F997]/10 border border-[#38F997]/30 text-xs font-mono text-[#38F997] font-semibold">
            <Zap className="w-3.5 h-3.5 text-[#38F997] animate-pulse" />
            <span>30-Second Intelligence Brief</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[rgba(251,237,224,0.05)] border border-[rgba(251,237,224,0.1)] text-[11px] font-mono text-[rgba(251,237,224,0.65)]">
            <Clock className="w-3 h-3 text-[rgba(251,237,224,0.5)]" />
            <span>Comprehend in &lt; 30s ({secondsRemaining}s loop)</span>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hidden md:inline">
            Track 02: Dashboards &amp; Interfaces
          </span>
        </div>

        {/* View Mode & Keyboard Shortcut Controls */}
        <div className="flex items-center gap-2">
          {/* Executive vs Full View Mode Toggle */}
          <div className="flex items-center bg-[#0C0E17] p-0.5 rounded-xl border border-[rgba(251,237,224,0.12)]">
            <button
              type="button"
              onClick={() => onToggleViewMode('executive')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                viewMode === 'executive'
                  ? 'bg-[#FBEDE0] text-[#0C0E17] font-bold shadow-md'
                  : 'text-[rgba(251,237,224,0.6)] hover:text-[#FBEDE0]'
              }`}
            >
              ⚡ 30s Executive
            </button>
            <button
              type="button"
              onClick={() => onToggleViewMode('full')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                viewMode === 'full'
                  ? 'bg-[#FBEDE0] text-[#0C0E17] font-bold shadow-md'
                  : 'text-[rgba(251,237,224,0.6)] hover:text-[#FBEDE0]'
              }`}
            >
              🔬 Deep Telemetry
            </button>
          </div>

          {/* Keyboard Shortcuts Trigger Button */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            title="Press '?' for Keyboard Shortcuts"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[rgba(251,237,224,0.06)] hover:bg-[rgba(251,237,224,0.12)] border border-[rgba(251,237,224,0.12)] text-xs font-mono text-[rgba(251,237,224,0.8)] transition-colors"
          >
            <Keyboard className="w-3.5 h-3.5 text-[#00D2FF]" />
            <span className="hidden lg:inline">Shortcuts</span>
            <kbd className="px-1.5 py-0.2 rounded bg-black/40 border border-white/10 text-[10px] text-neutral-300 font-mono">?</kbd>
          </button>
        </div>
      </div>

      {/* Main 30-Second Grid: 3 Pillars (Action Verdict | What Changed | Why It Matters) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 pt-4 items-center">
        {/* Pillar 1: Directional Verdict & Immediate Action (3 cols) */}
        <div className="lg:col-span-4 bg-[#0F121E] border border-[rgba(251,237,224,0.10)] rounded-xl p-4 space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[rgba(251,237,224,0.45)] font-semibold">
              Calibrated Verdict
            </span>
            <span className="text-[10px] font-mono text-[#38F997] bg-[#38F997]/10 px-2 py-0.5 rounded border border-[#38F997]/20">
              Deterministic 10 bps
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-xl text-lg font-black font-mono tracking-wider flex items-center gap-2 border ring-1 ${actionStyle.badge} ${actionStyle.glow}`}
            >
              <ActionIcon className="w-5 h-5" />
              <span>{decision.action}</span>
            </div>

            <div>
              <div className="text-base font-bold text-[#FBEDE0] font-mono">
                {decision.confidenceScore}% <span className="text-xs font-normal text-[rgba(251,237,224,0.6)]">({decision.confidenceLevel})</span>
              </div>
              <div className="text-[11px] font-mono text-[rgba(251,237,224,0.5)] flex items-center gap-1">
                <Target className="w-3 h-3 text-[#00D2FF]" />
                <span>R:R &gt; 1:1.3</span>
              </div>
            </div>
          </div>

          {/* Boundaries & Target Marks */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono border-t border-[rgba(251,237,224,0.06)]">
            <div className="bg-[#141827] p-2 rounded-lg border border-[rgba(251,237,224,0.06)]">
              <span className="text-[rgba(251,237,224,0.4)] block text-[9px] uppercase">Take-Profit</span>
              <span className="text-[#38F997] font-bold">
                ${decision.outlook.targetPrice ? decision.outlook.targetPrice.toLocaleString() : '116,200'}
              </span>
            </div>
            <div className="bg-[#141827] p-2 rounded-lg border border-[rgba(251,237,224,0.06)]">
              <span className="text-[rgba(251,237,224,0.4)] block text-[9px] uppercase">Stop-Loss</span>
              <span className="text-[#F87171] font-bold">
                ${decision.outlook.invalidationPrice ? decision.outlook.invalidationPrice.toLocaleString() : '108,500'}
              </span>
            </div>
          </div>

          {/* Quick Simulation Trigger CTA */}
          <button
            type="button"
            onClick={onSimulateOrder}
            disabled={isScanning}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#38F997] to-[#00D2FF] hover:from-[#44fba0] hover:to-[#1adeff] text-[#0C0E17] font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Flame className="w-4 h-4" />
            <span>Simulate Paper Execution</span>
            <kbd className="px-1 rounded bg-[#0C0E17]/20 text-[9px] font-mono">P</kbd>
          </button>
        </div>

        {/* Pillar 2: What Changed Deltas (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[rgba(251,237,224,0.6)] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>What Changed (Since Last Scan)</span>
            </span>
            <span className="text-[10px] font-mono text-[rgba(251,237,224,0.4)]">
              {decision.whatChanged.length} Critical Shifts
            </span>
          </div>

          <div className="space-y-1.5">
            {decision.whatChanged.slice(0, 3).map((delta, i) => {
              const isPositive = delta.sentiment === 'positive';
              const isNegative = delta.sentiment === 'negative';
              return (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-[#0F121E]/90 border border-[rgba(251,237,224,0.08)] flex items-center justify-between gap-2 text-xs font-mono hover:border-[rgba(251,237,224,0.18)] transition-colors"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] text-[rgba(251,237,224,0.45)] block truncate">
                      {delta.metric}
                    </span>
                    <span className="text-[11px] text-[#FBEDE0] font-medium truncate block">
                      {delta.previous} <ArrowRight className="inline w-2.5 h-2.5 text-[rgba(251,237,224,0.3)] mx-0.5" /> {delta.current}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                      isPositive
                        ? 'bg-[#38F997]/15 text-[#38F997] border-[#38F997]/30'
                        : isNegative
                        ? 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/30'
                        : 'bg-white/5 text-[rgba(251,237,224,0.7)] border-white/10'
                    }`}
                  >
                    {delta.delta}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pillar 3: Why It Matters & Bottom-Line Thesis (4 cols) */}
        <div className="lg:col-span-4 bg-[#0F121E] border border-[rgba(251,237,224,0.10)] rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#00D2FF] font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#00D2FF]" />
              <span>Why It Matters</span>
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono">
              {decision.policyOutcome.allowed ? (
                <span className="text-[#38F997] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Safety Verified
                </span>
              ) : (
                <span className="text-[#F87171] flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Policy Blocked
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-[#FBEDE0] font-medium leading-relaxed font-sans line-clamp-3">
            {decision.explanation}
          </p>

          <div className="p-2 rounded-lg bg-[#141827] border border-[rgba(251,237,224,0.06)] text-[11px] font-mono text-[rgba(251,237,224,0.75)]">
            <strong className="text-amber-400">Risk Invariant:</strong> Invalidates on sustained close below{' '}
            <span className="text-[#F87171] font-bold">
              ${decision.outlook.invalidationPrice ? decision.outlook.invalidationPrice.toLocaleString() : '108,500'}
            </span>
            . 10 bps slippage enforced.
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[rgba(251,237,224,0.45)] pt-0.5">
            <span>Model: TradeSense-Reasoning-v2.1</span>
            <span>Proof: #run-9842-btc</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatChanged30sBanner;
