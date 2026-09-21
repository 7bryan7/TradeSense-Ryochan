import React, { useState, useEffect } from 'react';
import { useMarket } from '../hooks/useMarket';
import { useAgentRun, DemoStateMode } from '../hooks/useAgentRun';
import { usePortfolio } from '../hooks/usePortfolio';
import { useSchedule } from '../hooks/useSchedule';
import { AgentRunRecord } from '../types/run';

import { TopBar } from '../components/dashboard/TopBar';
import { CandleChart } from '../components/dashboard/CandleChart';
import { AICoPilotDossier } from '../components/dashboard/AICoPilotDossier';
import { SimulationCard } from '../components/dashboard/SimulationCard';
import { PortfolioWidget } from '../components/dashboard/PortfolioWidget';
import { HistoryTable } from '../components/dashboard/HistoryTable';
import { SafetyRiskPanel } from '../components/dashboard/SafetyRiskPanel';
import { ReplayModal } from '../components/dashboard/ReplayModal';
import { KeyboardShortcutsModal } from '../components/dashboard/KeyboardShortcutsModal';
import { Wallet, History, Shield, Sliders } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    tokens,
    currentToken,
    selectedTokenId,
    setSelectedTokenId,
    timeframe,
    setTimeframe,
    candles,
    dataMode,
    setDataMode,
  } = useMarket('btc');

  const {
    runs,
    currentRun,
    isScanning,
    scanStep,
    scanStatus,
    demoState,
    setDemoState,
    executeAnalysis,
  } = useAgentRun();

  const { portfolio, handleReset } = usePortfolio();
  const { schedule, formatCountdown } = useSchedule();

  const [replayRun, setReplayRun] = useState<AgentRunRecord | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'portfolio' | 'history' | 'safety'>('portfolio');

  const handleRunAnalysis = () => {
    executeAnalysis(selectedTokenId);
  };

  const handleToggleDataMode = () => {
    setDataMode(prev => (prev === 'FIXTURE' ? 'LIVE' : 'FIXTURE'));
  };

  // Keyboard navigation listener (optimized for keyboard users)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        if (tokens[index]) {
          setSelectedTokenId(tokens[index].id);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (!isScanning) {
          executeAnalysis(selectedTokenId);
        }
      } else if (e.key === 'd' || e.key === 'D') {
        setDataMode(prev => (prev === 'FIXTURE' ? 'LIVE' : 'FIXTURE'));
      } else if (e.key === 's' || e.key === 'S') {
        const modes: DemoStateMode[] = ['NORMAL_BUY', 'HOLD', 'SELL_NO_POSITION', 'BLOCKED_SAFETY'];
        const nextIdx = (modes.indexOf(demoState) + 1) % modes.length;
        setDemoState(modes[nextIdx]);
      } else if (e.key === '?') {
        setIsShortcutsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setReplayRun(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tokens, isScanning, demoState, selectedTokenId, setSelectedTokenId, setDemoState, setDataMode, executeAnalysis]);

  if (!currentToken) return null;

  return (
    <div className="space-y-4 pb-12">
      {/* Sticky Compact TopBar */}
      <TopBar
        token={currentToken}
        dataMode={dataMode}
        onToggleDataMode={handleToggleDataMode}
        asOf={currentRun.decision.asOf}
        isScanning={isScanning}
        scanStep={scanStep}
        onRunAnalysis={handleRunAnalysis}
        nextRunCountdown={formatCountdown()}
        demoState={demoState}
        onSelectDemoState={setDemoState}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      <div className="px-3 sm:px-6 space-y-4 max-w-[1700px] mx-auto">
        {/* Sleek Asset Quick-Switcher Strip with [1..5] Hotkeys */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-2">
            {tokens.map((t, idx) => {
              const isSelected = t.id === selectedTokenId;
              const keyNum = idx + 1;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTokenId(t.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 shrink-0 ${
                    isSelected
                      ? 'bg-[#FBEDE0] text-[#0C0E17] shadow-glow-cream-sm scale-[1.02]'
                      : 'bg-[#161926]/90 text-[rgba(251,237,224,0.65)] hover:text-[#FBEDE0] hover:bg-[#1C2030] border border-[rgba(251,237,224,0.08)]'
                  }`}
                >
                  {keyNum <= 5 && (
                    <kbd
                      className={`px-1 py-0.2 rounded text-[9px] font-mono leading-none ${
                        isSelected ? 'bg-black/20 text-[#0C0E17]' : 'bg-black/40 text-[rgba(251,237,224,0.4)]'
                      }`}
                    >
                      {keyNum}
                    </kbd>
                  )}
                  <span>{t.symbol}</span>
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      isSelected
                        ? 'text-[#0C0E17]'
                        : t.metrics.change24h >= 0
                        ? 'text-[#38F997]'
                        : 'text-[#F87171]'
                    }`}
                  >
                    {t.metrics.change24h >= 0 ? '+' : ''}
                    {t.metrics.change24h}%
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-[rgba(251,237,224,0.4)]">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] text-[#38F997]">1</kbd>
            <span>-</span>
            <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] text-[#38F997]">5</kbd>
            <span>to switch</span>
          </div>
        </div>

        {/* PRIMARY PRO WORKSPACE (Unified 2-Column Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column (Chart & Execution Terminal - 62% width) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* Interactive Candlestick Chart */}
            <CandleChart
              candles={candles}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              pairName={currentToken.pair}
              simulatedFillPrice={currentRun.simulation.order.fillPrice}
              takeProfitPrice={currentRun.simulation.order.takeProfitPrice}
              stopLossPrice={currentRun.simulation.order.stopLossPrice}
            />

            {/* Paper Execution Terminal (Directly beneath the chart) */}
            <SimulationCard
              simulation={currentRun.simulation}
              status={currentRun.simulatedFillStatus}
            />
          </div>

          {/* Right Column (Single, Unified AI Co-Pilot Dossier - 38% width) */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-16 space-y-4">
            <AICoPilotDossier
              decision={currentRun.decision}
              isScanning={isScanning}
            />
          </div>
        </div>

        {/* BOTTOM PRO TERMINAL CONSOLE (Tabbed Drawer - No Infinite Scrolling!) */}
        <div className="bg-[#121522]/90 backdrop-blur-xl border border-[rgba(251,237,224,0.10)] rounded-2xl overflow-hidden shadow-xl mt-6">
          {/* Console Tab Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 pt-3 pb-0 border-b border-[rgba(251,237,224,0.08)] bg-[#0E101B]/80 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setActiveBottomTab('portfolio')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-mono font-semibold transition-all border-t border-x ${
                  activeBottomTab === 'portfolio'
                    ? 'bg-[#161926] border-[rgba(251,237,224,0.15)] text-[#FBEDE0] border-b-transparent'
                    : 'border-transparent text-[rgba(251,237,224,0.5)] hover:text-[#FBEDE0] hover:bg-white/[0.03]'
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-[#38F997]" />
                <span>Paper Portfolio ($10,000)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveBottomTab('history')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-mono font-semibold transition-all border-t border-x ${
                  activeBottomTab === 'history'
                    ? 'bg-[#161926] border-[rgba(251,237,224,0.15)] text-[#FBEDE0] border-b-transparent'
                    : 'border-transparent text-[rgba(251,237,224,0.5)] hover:text-[#FBEDE0] hover:bg-white/[0.03]'
                }`}
              >
                <History className="w-3.5 h-3.5 text-[#00D2FF]" />
                <span>Execution Audit Trail ({runs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveBottomTab('safety')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-mono font-semibold transition-all border-t border-x ${
                  activeBottomTab === 'safety'
                    ? 'bg-[#161926] border-[rgba(251,237,224,0.15)] text-[#FBEDE0] border-b-transparent'
                    : 'border-transparent text-[rgba(251,237,224,0.5)] hover:text-[#FBEDE0] hover:bg-white/[0.03]'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Risk &amp; Invariants</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-[rgba(251,237,224,0.4)]">
              <span>Deterministic Replay Enabled</span>
            </div>
          </div>

          {/* Console Tab Content */}
          <div className="p-4 sm:p-5">
            {activeBottomTab === 'portfolio' && (
              <PortfolioWidget portfolio={portfolio} onReset={handleReset} />
            )}

            {activeBottomTab === 'history' && (
              <HistoryTable runs={runs} onReplayRun={setReplayRun} />
            )}

            {activeBottomTab === 'safety' && (
              <SafetyRiskPanel safety={currentRun.safety} />
            )}
          </div>
        </div>
      </div>

      {/* Deterministic Replay Modal */}
      <ReplayModal
        run={replayRun}
        isOpen={Boolean(replayRun)}
        onClose={() => setReplayRun(null)}
      />

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
