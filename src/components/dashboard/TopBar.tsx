import React from 'react';
import { Play, Loader2, SlidersHorizontal, ArrowUpRight, Keyboard, ShieldCheck } from 'lucide-react';
import { Token } from '../../types/market';
import { DataModeBadge } from '../common/DataModeBadge';
import { DemoStateMode } from '../../hooks/useAgentRun';

interface TopBarProps {
  token: Token;
  dataMode: 'LIVE' | 'FIXTURE';
  onToggleDataMode: () => void;
  asOf: string;
  isScanning: boolean;
  scanStep: string;
  onRunAnalysis: () => void;
  nextRunCountdown: string;
  demoState: DemoStateMode;
  onSelectDemoState: (mode: DemoStateMode) => void;
  onOpenShortcuts?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  token,
  dataMode,
  onToggleDataMode,
  asOf,
  isScanning,
  scanStep,
  onRunAnalysis,
  nextRunCountdown,
  demoState,
  onSelectDemoState,
  onOpenShortcuts,
}) => {
  const isPositive = token.metrics.change24h >= 0;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0E101B]/95 backdrop-blur-xl border-b border-[rgba(251,237,224,0.08)] px-3 sm:px-6 py-2.5 transition-all">
      <div className="w-full flex items-center justify-between gap-3">
        {/* Left: Active Asset & Feed Status (Compact & Laptop-Optimized) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Token Card */}
          <div className="flex items-center gap-2 sm:gap-2.5 bg-[#161926]/90 border border-[rgba(251,237,224,0.12)] rounded-lg px-2.5 sm:px-3 py-1.5 shadow-sm">
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-[10px] sm:text-xs shrink-0">
              {token.icon}
            </span>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="font-bold text-xs sm:text-sm text-[#FBEDE0] tracking-tight">{token.pair}</span>
              <span className="font-mono text-xs sm:text-sm font-semibold text-[#FBEDE0]">
                ${token.metrics.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`inline-flex items-center text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded ${
                  isPositive ? 'text-[#38F997] bg-[#38F997]/15' : 'text-[#F87171] bg-[#F87171]/15'
                }`}
              >
                {isPositive ? '+' : ''}{token.metrics.change24h}%
                {isPositive ? <ArrowUpRight className="w-3 h-3 ml-0.5" /> : null}
              </span>
            </div>
          </div>

          {/* Data Mode */}
          <DataModeBadge mode={dataMode} interactive onToggle={onToggleDataMode} />
        </div>

        {/* Center: Live scanning progress tracker (only displayed during active scan) */}
        {isScanning && (
          <div className="hidden md:flex items-center justify-center flex-1 px-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#00D2FF]/10 border border-[#00D2FF]/35 rounded-full animate-pulse shadow-glow-cyan-sm">
              <Loader2 className="w-3.5 h-3.5 text-[#00D2FF] animate-spin shrink-0" />
              <span className="text-[11px] sm:text-xs text-[#00D2FF] font-mono font-medium truncate max-w-[280px] lg:max-w-md">
                {scanStep || 'Ingesting orderbook & social signals...'}
              </span>
            </div>
          </div>
        )}

        {/* Right: Scenario Selector, Shortcuts HUD, Primary Scan CTA */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Compact Scenario Selector */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#161926]/90 border border-[rgba(251,237,224,0.12)] rounded-lg px-2.5 py-1 text-xs shadow-sm">
            <SlidersHorizontal className="w-3 h-3 text-[rgba(251,237,224,0.5)] shrink-0" />
            <select
              aria-label="Simulation state scenario"
              value={demoState}
              onChange={e => onSelectDemoState(e.target.value as DemoStateMode)}
              className="bg-transparent text-[#FBEDE0] font-mono text-[11px] focus:outline-none cursor-pointer pr-1"
            >
              <option value="NORMAL_BUY" className="bg-[#161926] text-[#FBEDE0]">BUY (Normal)</option>
              <option value="HOLD" className="bg-[#161926] text-[#FBEDE0]">HOLD (Neutral)</option>
              <option value="SELL_NO_POSITION" className="bg-[#161926] text-[#FBEDE0]">SELL (Skip)</option>
              <option value="BLOCKED_SAFETY" className="bg-[#161926] text-[#F87171]">BLOCKED (Risk)</option>
            </select>
            <kbd className="hidden lg:inline px-1 py-0.2 rounded bg-black/40 border border-white/10 text-[9px] font-mono text-neutral-400" title="Press S to cycle scenario">
              S
            </kbd>
          </div>

          {/* Keyboard Shortcuts Trigger Button */}
          {onOpenShortcuts && (
            <button
              type="button"
              onClick={onOpenShortcuts}
              title="Keyboard Shortcuts Cheatsheet (?)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#161926]/80 hover:bg-[#1C2030] border border-[rgba(251,237,224,0.12)] text-xs font-mono text-[rgba(251,237,224,0.85)] transition-all shadow-sm group shrink-0"
            >
              <Keyboard className="w-3.5 h-3.5 text-[#00D2FF] group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-[11px]">Hotkeys</span>
              <kbd className="px-1 py-0.2 rounded bg-black/40 border border-white/10 text-[9px] font-mono text-neutral-300">
                ?
              </kbd>
            </button>
          )}

          {/* Primary CTA: Run Analysis */}
          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-[#FBEDE0] hover:bg-white text-[#10131F] font-bold text-xs font-mono tracking-wide rounded-lg shadow-glow-cream-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isScanning ? (
              <Loader2 className="w-3 h-3 animate-spin text-[#10131F]" />
            ) : (
              <Play className="w-3 h-3 fill-current text-[#10131F]" />
            )}
            <span className="whitespace-nowrap">{isScanning ? 'SCANNING...' : 'RUN SCAN'}</span>
            <kbd className="hidden sm:inline px-1 py-0.2 rounded bg-black/20 text-[9px] font-mono text-neutral-800">
              R
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
