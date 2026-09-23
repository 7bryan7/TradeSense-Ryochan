import React, { useState, useEffect } from 'react';
import { useMarket } from '../hooks/useMarket';
import { useAgentRun, DemoStateMode } from '../hooks/useAgentRun';
import { usePortfolio } from '../hooks/usePortfolio';
import { useSchedule } from '../hooks/useSchedule';
import { AgentRunRecord } from '../types/run';

import { TopBar } from '../components/dashboard/TopBar';
import { AssetStatCards } from '../components/dashboard/AssetStatCards';
import { CandleChart } from '../components/dashboard/CandleChart';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import { AccountBalanceWidget } from '../components/dashboard/AccountBalanceWidget';
import { TradeExecutionWidget } from '../components/dashboard/TradeExecutionWidget';
import { MyPortfolioWidget } from '../components/dashboard/MyPortfolioWidget';
import { ReplayModal } from '../components/dashboard/ReplayModal';
import { KeyboardShortcutsModal } from '../components/dashboard/KeyboardShortcutsModal';
import { AskTradeSenseDrawer } from '../components/chat/AskTradeSenseDrawer';

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
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);

  const handleRunAnalysis = () => {
    executeAnalysis(selectedTokenId);
  };

  const handleToggleDataMode = () => {
    setDataMode(prev => (prev === 'FIXTURE' ? 'LIVE' : 'FIXTURE'));
  };

  // Keyboard navigation listener
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
      } else if (e.key === 'c' || e.key === 'C') {
        setIsChatDrawerOpen(prev => !prev);
      } else if (e.key === '?') {
        setIsShortcutsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setReplayRun(null);
        setIsChatDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tokens, isScanning, demoState, selectedTokenId, setSelectedTokenId, setDemoState, setDataMode, executeAnalysis]);

  if (!currentToken) return null;

  return (
    <div className="min-h-screen bg-[#15171C] text-white flex flex-col pb-12 relative overflow-hidden">
      {/* ── Dashboard Exclusive Ambient Gloss Backlights ── */}
      <div className="absolute -top-36 left-1/4 w-[720px] h-[480px] bg-[#4ce07a]/[0.08] rounded-full blur-[150px] pointer-events-none -translate-x-1/4" />
      <div className="absolute top-1/4 -right-28 w-[620px] h-[580px] bg-[#22c55e]/[0.05] rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[720px] h-[520px] bg-[#3b82f6]/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-2/3 right-1/4 w-[500px] h-[400px] bg-[#4ce07a]/[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* ── Subtle Precision Mesh Pattern ── */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* ── Specular Sheen Top Overlay ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.025] via-transparent to-transparent pointer-events-none" />

      {/* ── Top Bar (Greeting, Search Bar, Profile & Actions) ── */}
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
        onOpenChat={() => setIsChatDrawerOpen(true)}
      />

      {/* ── Main Dashboard Content (2 Columns: Left 70%, Right 30%) ── */}
      <div className="p-3 sm:p-5 max-w-[1700px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* ── LEFT COLUMN (70% - Cards, Chart, Transactions) ── */}
          <div className="lg:col-span-8 space-y-4">
            {/* 1. Top Horizontal Asset Stat Cards (Active is RYO Green Gradient) */}
            <AssetStatCards
              tokens={tokens}
              selectedTokenId={selectedTokenId}
              onSelectToken={setSelectedTokenId}
            />

            {/* 2. Candlestick Chart Card */}
            <CandleChart
              candles={candles}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              pairName={currentToken.pair}
              simulatedFillPrice={currentRun.simulation.order.fillPrice}
              takeProfitPrice={currentRun.simulation.order.takeProfitPrice}
              stopLossPrice={currentRun.simulation.order.stopLossPrice}
            />

            {/* 3. Transaction & Audited Decisions Table Card */}
            <RecentTransactionsTable
              runs={runs}
              onReplayRun={setReplayRun}
            />
          </div>

          {/* ── RIGHT COLUMN (30% - Balance, Execution, Portfolio) ── */}
          <div className="lg:col-span-4 space-y-4">
            {/* 1. Account & Balance Widget */}
            <AccountBalanceWidget
              portfolio={portfolio}
              onResetPortfolio={handleReset}
            />

            {/* 2. Paper Trade Execution & Decision Widget (with RYO Green Action Button) */}
            <TradeExecutionWidget
              token={currentToken}
              decision={currentRun.decision}
              simulation={currentRun.simulation}
              onInterrogateInChat={(prompt) => {
                setChatInitialPrompt(prompt);
                setIsChatDrawerOpen(true);
              }}
            />

            {/* 3. My Portfolio Holdings Widget */}
            <MyPortfolioWidget
              portfolio={portfolio}
              tokens={tokens}
              selectedTokenId={selectedTokenId}
              onSelectToken={setSelectedTokenId}
            />
          </div>
        </div>
      </div>

      {/* Persistent Slide-Over Chat Drawer */}
      <AskTradeSenseDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => {
          setIsChatDrawerOpen(false);
          setChatInitialPrompt(undefined);
        }}
        initialPrompt={chatInitialPrompt}
      />

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
