import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, BarChart3, Keyboard, Loader2, MessageCircle, Play, Sparkles } from 'lucide-react';
import { useMarket } from '../hooks/useMarket';
import { useAgentRun, DemoStateMode } from '../hooks/useAgentRun';
import { usePortfolio } from '../hooks/usePortfolio';
import { AgentRunRecord } from '../types/run';
import { AssetStatCards } from '../components/dashboard/AssetStatCards';
import { CandleChart } from '../components/dashboard/CandleChart';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import { AccountBalanceWidget } from '../components/dashboard/AccountBalanceWidget';
import { TradeExecutionWidget } from '../components/dashboard/TradeExecutionWidget';
import { MyPortfolioWidget } from '../components/dashboard/MyPortfolioWidget';
import { ReplayModal } from '../components/dashboard/ReplayModal';
import { AskTradeSenseDrawer } from '../components/chat/AskTradeSenseDrawer';
import './dashboard.css';

export const DashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { tokens, currentToken, selectedTokenId, setSelectedTokenId, timeframe, setTimeframe, candles, candleError } = useMarket(searchParams.get('asset') || 'btc');
  useEffect(() => {
    const asset = searchParams.get('asset');
    if (asset && tokens.some(token => token.id === asset)) setSelectedTokenId(asset);
  }, [searchParams, tokens, setSelectedTokenId]);
  const { runs, isScanning, demoState, setDemoState, executeAnalysis } = useAgentRun();
  const { portfolio } = usePortfolio();
  const [replayRun, setReplayRun] = useState<AgentRunRecord | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>();
  const [scanError, setScanError] = useState('');
  const selectedRun = runs.find(run => run.tokenId === selectedTokenId && run.decision.tokenId === selectedTokenId);
  const canAnalyze = ['btc', 'eth', 'sol'].includes(selectedTokenId);
  const handleRunAnalysis = async () => {
    if (isScanning || !canAnalyze) return;
    setScanError('');
    try { await executeAnalysis(selectedTokenId); }
    catch { setScanError('The demo scan could not finish. Please try again.'); }
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || (e.target as HTMLElement)?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === 'Escape') { setIsShortcutsOpen(false); setReplayRun(null); setIsChatDrawerOpen(false); return; }
      if (isChatDrawerOpen || replayRun) return;
      const index = Number(e.key) - 1;
      if (index >= 0 && index < 5 && tokens[index]) setSelectedTokenId(tokens[index].id);
      else if (e.key.toLowerCase() === 'r') void handleRunAnalysis();
      else if (e.key.toLowerCase() === 'c') setIsChatDrawerOpen(true);
      else if (e.key === '?') setIsShortcutsOpen(value => !value);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tokens, selectedTokenId, isScanning, demoState, isChatDrawerOpen, replayRun, executeAnalysis]);

  if (!currentToken) return <div className="p-8 text-slate-400" role="status">Loading your market overview…</div>;
  const decision = selectedRun?.decision;
  const changed = decision?.whatChanged[0];
  const filled = selectedRun?.simulatedFillStatus === 'APPLIED' && decision?.policyOutcome.allowed && selectedRun.simulation.order.tokenId === selectedTokenId && selectedRun.simulation.order.action === decision.action;
  const ask = (prompt: string) => { setChatInitialPrompt(prompt); setIsChatDrawerOpen(true); };

  return (
    <div className="dashboard-page relative isolate min-h-screen text-white">
      <header className="dashboard-glass-header relative z-10 border-b px-5 py-4 sm:px-7">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm"><BarChart3 className="h-4 w-4 text-[#4ce07a]" /><span className="font-semibold">Market workspace</span><span className="hidden sm:inline text-slate-600">/</span><span className="hidden sm:inline text-slate-400">Overview</span></div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Keyboard shortcuts" aria-expanded={isShortcutsOpen} onClick={() => setIsShortcutsOpen(value => !value)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"><Keyboard className="h-4 w-4" /></button>
            <button type="button" onClick={() => setIsChatDrawerOpen(true)} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/5"><MessageCircle className="h-4 w-4" />Ask TradeSense</button>
          </div>
        </div>
        {isShortcutsOpen && <p className="mx-auto mt-3 max-w-[1500px] text-xs leading-6 text-slate-300">Shortcuts: 1–5 select an asset · R run demo scan · C open chat · ? show shortcuts · Escape close panels</p>}
      </header>

      <div className="dashboard-content relative z-10 mx-auto w-full max-w-[1500px] space-y-6 px-4 py-6 sm:px-7 sm:py-8">
        <section className="dashboard-hero flex flex-wrap items-end justify-between gap-5">
          <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4ce07a]">A clearer view of the market</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Market overview<span className="dashboard-title-dot" aria-hidden="true">.</span></h1><p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">Choose an asset. Review the signal. Understand the risk.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="dashboard-scenario">Demo scenario</label>
            <select id="dashboard-scenario" value={demoState} disabled={isScanning} onChange={e => setDemoState(e.target.value as DemoStateMode)} className="rounded-xl border border-white/10 bg-[#1a2025] px-3 py-3 text-xs text-slate-300">
              <option value="NORMAL_BUY">Default scenario</option><option value="HOLD">Wait / hold</option><option value="SELL_NO_POSITION">Sell without holdings</option><option value="BLOCKED_SAFETY">Safety block</option>
            </select>
            <button type="button" disabled={isScanning || !canAnalyze} onClick={() => void handleRunAnalysis()} className="flex items-center gap-2 rounded-xl bg-[#4ce07a] px-4 py-3 text-sm font-semibold text-[#08110b] hover:bg-[#76ec9a] disabled:cursor-not-allowed disabled:opacity-50">{isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}{isScanning ? 'Running demo…' : 'Run demo scan'}</button>
          </div>
        </section>

        <section aria-labelledby="watchlist-heading">
          <div className="mb-3 flex items-center justify-between gap-3"><h2 id="watchlist-heading" className="text-sm font-semibold">Market watchlist</h2><p className="text-xs text-slate-400">Select an asset to explore</p></div>
          <AssetStatCards tokens={tokens} selectedTokenId={selectedTokenId} onSelectToken={setSelectedTokenId} />
        </section>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-5">
            <section aria-label="Sample price chart">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">{currentToken.name} price overview</h2>
                  <span className="rounded-full bg-[#4ce07a]/10 border border-[#4ce07a]/20 px-2.5 py-0.5 text-[11px] font-medium text-[#4ce07a]">Illustrative candles</span>
                </div>
                <span className="text-xs text-slate-400">Not live market history</span>
              </div>
              <CandleChart key={`${selectedTokenId}-${timeframe}`} candles={candles} timeframe={timeframe} onTimeframeChange={setTimeframe} pairName={currentToken.pair} simulatedFillPrice={filled ? selectedRun?.simulation.order.fillPrice : undefined} takeProfitPrice={undefined} stopLossPrice={undefined} />
              {candleError && <p role="alert" className="mt-2 text-xs text-amber-200">{candleError}</p>}
              <p className="mt-2 text-xs leading-relaxed text-slate-400">Each candle shows the open, high, low, and close. Bars below show volume. Green means the price rose; red means it fell.</p>
            </section>

            <section className="dashboard-brief dashboard-glass-surface rounded-2xl p-5 sm:p-6" aria-labelledby="brief-heading" aria-busy={isScanning}>
              <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="brief-heading" className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-[#4ce07a]" />{currentToken.symbol} in 30 seconds</h2><span className="text-xs text-slate-400">Sample analysis{decision ? ` · ${decision.asOf}` : ''}</span></div>
              <div role="status" className="text-xs text-amber-200">{isScanning && <p className="mt-3">Running a demo scenario. The previous sample remains visible until it finishes.</p>}{scanError && <p className="mt-3">{scanError}</p>}</div>
              {decision ? <div className="dashboard-brief-grid mt-5 grid gap-3 md:grid-cols-3">
                <div><p className="brief-label">01 / What changed</p><p className="mt-2 text-lg font-medium">{changed ? `${changed.metric}: ${changed.delta}` : 'No changes reported'}</p><p className="mt-2 text-sm text-slate-400">{changed ? `${changed.previous} → ${changed.current}` : 'The sample has no comparison data.'}</p></div>
                <div className="md:border-l md:border-white/10 md:pl-5"><p className="brief-label">02 / What it suggests</p><p className="mt-2 text-lg font-medium">{decision.action === 'BUY' ? 'Look for a buying opportunity' : decision.action === 'SELL' ? 'Consider reducing the position' : 'Wait for a clearer signal'}</p><p className="mt-2 text-sm leading-relaxed text-slate-400">{decision.rationale}</p></div>
                <div className="md:border-l md:border-white/10 md:pl-5"><p className="brief-label">03 / What happened</p><p className="mt-2 text-lg font-medium">{!decision.policyOutcome.allowed ? 'Simulation blocked' : selectedRun?.simulatedFillStatus === 'SKIPPED' ? 'No position to sell' : decision.action === 'HOLD' ? 'No trade placed' : filled ? 'Sample paper trade filled' : 'Trade details unavailable'}</p><p className="mt-2 text-sm leading-relaxed text-slate-400">{!decision.policyOutcome.allowed ? decision.policyOutcome.message : 'This is a fixture preview. No real money moves.'}</p></div>
              </div> : <p className="mt-4 text-sm text-slate-300">No matching analysis is available for {currentToken.name}. Explore its sample chart, or choose Bitcoin, Ethereum, or Solana for a demo decision.</p>}
              {decision && <p className="mt-4 border-t border-white/[0.07] pt-3 text-xs leading-relaxed text-slate-400"><span className="text-amber-200 font-medium">Watch out: </span>{decision.risks[0] || decision.contraryEvidence[0] || 'Risk coverage unavailable.'}</p>}
            </section>

            <RecentTransactionsTable runs={runs} onReplayRun={setReplayRun} />
          </div>
          <aside className="min-w-0 space-y-5">
            {selectedRun && decision && <TradeExecutionWidget token={currentToken} decision={decision} simulation={selectedRun.simulation} fillStatus={selectedRun.simulatedFillStatus} onInterrogateInChat={ask} />}
            <AccountBalanceWidget portfolio={portfolio} />
            <MyPortfolioWidget portfolio={portfolio} tokens={tokens} selectedTokenId={selectedTokenId} onSelectToken={setSelectedTokenId} />
          </aside>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-4 text-xs text-slate-500"><span>Practice mode · Sample data · No real orders</span><button type="button" onClick={() => ask('Explain how to read this dashboard in simple terms.')} className="flex items-center gap-1 text-slate-400 hover:text-[#4ce07a]">Need a walkthrough?<ArrowRight className="h-3 w-3" /></button></footer>
      </div>
      <AskTradeSenseDrawer isOpen={isChatDrawerOpen} onClose={() => { setIsChatDrawerOpen(false); setChatInitialPrompt(undefined); }} initialPrompt={chatInitialPrompt} contextTokenId={['btc', 'eth', 'sol'].includes(selectedTokenId) ? selectedTokenId : 'btc'} />
      <ReplayModal run={replayRun} isOpen={Boolean(replayRun)} onClose={() => setReplayRun(null)} />
    </div>
  );
};
export default DashboardPage;
