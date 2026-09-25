import React, { useState } from 'react';
import { RefreshCw, ArrowRight, FileText } from 'lucide-react';
import { useMarket } from '../hooks/useMarket';
import { useAgentRun } from '../hooks/useAgentRun';
import { PageIntro } from '../components/common/PageIntro';
import { AssetStatCards } from '../components/dashboard/AssetStatCards';
import { TradeExecutionWidget } from '../components/dashboard/TradeExecutionWidget';
import { SafetyRiskPanel } from '../components/dashboard/SafetyRiskPanel';
import { AskTradeSenseDrawer } from '../components/chat/AskTradeSenseDrawer';

export const AnalysisPage: React.FC = () => {
  const { tokens, currentToken, selectedTokenId, setSelectedTokenId } = useMarket('btc');
  const { runs, isScanning, executeAnalysis } = useAgentRun();
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState<string>();
  const [error, setError] = useState('');
  const run = runs.find(item => item.tokenId === selectedTokenId && item.decision.tokenId === selectedTokenId);
  const canScan = ['btc', 'eth', 'sol'].includes(selectedTokenId);
  const scan = async () => {
    setError('');
    try { await executeAnalysis(selectedTokenId); } catch { setError('The demo scan could not finish. Try again.'); }
  };
  if (!currentToken) return <div className="studio-page" role="status">Loading sample analysis…</div>;
  return (
    <div className="studio-page">
      <PageIntro eyebrow="FROM SIGNAL TO UNDERSTANDING" title="Behind the decision." description="Follow what changed, the evidence that supports the call, and the risks that could change it.">
        <button type="button" disabled={isScanning || !canScan} onClick={() => void scan()} className="studio-primary"><RefreshCw size={15} className={isScanning ? 'animate-spin' : ''} />{isScanning ? 'Running demo…' : 'Run demo analysis'}</button>
      </PageIntro>
      <AssetStatCards tokens={tokens} selectedTokenId={selectedTokenId} onSelectToken={setSelectedTokenId} />
      <p role="status" className="text-xs text-amber-200">{error || (isScanning ? 'Running demo analysis. The previous sample remains visible.' : 'Sample analysis · Evidence and decisions below are fixtures.')}</p>
      {run ? <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
        <div className="space-y-5">
          <section className="dashboard-glass-card p-6"><h2 className="text-base font-semibold">What changed for {currentToken.symbol}?</h2><p className="mt-2 text-xs text-slate-400">Sample as of {run.decision.asOf}</p><div className="mt-5 grid sm:grid-cols-2 gap-4">{run.decision.whatChanged.map(item => <div key={item.metric} className="rounded-xl border border-white/10 bg-white/[0.02] p-4"><p className="text-xs text-slate-400">{item.metric}</p><p className="mt-3 text-xl font-medium text-[#4ce07a]">{item.delta}</p><p className="mt-2 flex items-center gap-2 text-xs text-slate-400">{item.previous}<ArrowRight size={12} />{item.current}</p><p className="mt-3 text-[10px] text-slate-500">Sample reference: {item.evidenceRefId}</p></div>)}</div></section>
          <section className="dashboard-glass-card p-6"><h2 className="flex items-center gap-2 text-base font-semibold"><FileText size={17} className="text-[#4ce07a]" />Read the evidence</h2><p className="mt-4 text-sm leading-7 text-slate-300">{run.decision.explanation}</p><div className="mt-6 grid sm:grid-cols-2 gap-6"><div><h3 className="text-xs font-semibold text-sky-200">Supports the decision</h3><ul className="mt-3 space-y-3 text-xs leading-6 text-slate-400">{run.decision.supportingEvidence.map(item => <li key={item}>{item}</li>)}</ul></div><div><h3 className="text-xs font-semibold text-amber-200">Reasons to be cautious</h3><ul className="mt-3 space-y-3 text-xs leading-6 text-slate-400">{run.decision.contraryEvidence.map(item => <li key={item}>{item}</li>)}</ul></div></div></section>
        </div>
        <aside className="space-y-5"><TradeExecutionWidget token={currentToken} decision={run.decision} simulation={run.simulation} fillStatus={run.simulatedFillStatus} onInterrogateInChat={prompt => { setChatPrompt(prompt); setIsChatDrawerOpen(true); }} /><SafetyRiskPanel safety={run.safety} /></aside>
      </div> : <div className="studio-empty">No matching decision fixture for {currentToken.name}. Choose Bitcoin, Ethereum, or Solana to explore an analysis.</div>}
      <AskTradeSenseDrawer isOpen={isChatDrawerOpen} onClose={() => { setIsChatDrawerOpen(false); setChatPrompt(undefined); }} initialPrompt={chatPrompt} contextTokenId={['btc', 'eth', 'sol'].includes(selectedTokenId) ? selectedTokenId : 'btc'} />
    </div>
  );
};
export default AnalysisPage;
