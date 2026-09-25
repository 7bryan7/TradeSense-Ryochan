import React from 'react';
import { ArrowRight, ShieldCheck, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';
import { SimulationResult } from '../../types/simulation';
import { DecisionReport } from '../../types/decision';
import { Token } from '../../types/market';
import { AgentRunRecord } from '../../types/run';

interface TradeExecutionWidgetProps {
  token: Token;
  decision: DecisionReport;
  simulation: SimulationResult;
  fillStatus: AgentRunRecord['simulatedFillStatus'];
  onInterrogateInChat?: (prompt: string) => void;
}
export const TradeExecutionWidget: React.FC<TradeExecutionWidgetProps> = ({ token, decision, simulation, fillStatus, onInterrogateInChat }) => {
  const blocked = !decision.policyOutcome.allowed || fillStatus === 'BLOCKED';
  const skipped = fillStatus === 'SKIPPED';
  const hold = decision.action === 'HOLD' || fillStatus === 'HOLD';
  const matchingOrder = simulation.order.tokenId === token.id && simulation.order.action === decision.action;
  const outcome = blocked ? 'Trade blocked' : skipped ? 'Trade skipped' : hold ? 'No trade needed' : matchingOrder ? 'Sample trade filled' : 'Trade details unavailable';
  const color = decision.action === 'BUY' ? 'text-[#4ce07a]' : decision.action === 'SELL' ? 'text-rose-400' : 'text-amber-300';
  return (
    <section className="dashboard-glass-card rounded-2xl p-5 space-y-5" aria-label="Analysis explained">
      <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-[#4ce07a]" /><h2>The decision, explained</h2></div>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><span className={`text-2xl font-semibold ${color}`}>{decision.action === 'BUY' ? 'Consider buying' : decision.action === 'SELL' ? 'Consider selling' : 'Wait and watch'}</span><span className={`rounded-md bg-white/5 px-2 py-1 text-xs font-mono ${color}`}>{decision.action}</span></div>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{decision.rationale}</p>
        <div className="mt-4 flex justify-between text-xs"><span className="text-slate-400">Evidence confidence</span><span>{decision.confidenceScore}% · {decision.confidenceLevel.toLowerCase()}</span></div>
        <div className="mt-2 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-[#4ce07a]" style={{ width: `${Math.max(0, Math.min(100, decision.confidenceScore))}%` }} /></div>
        <p className="mt-2 text-[11px] text-slate-400">Strength of the sample evidence, not a chance of profit.</p>
      </div>
      <div><h3 className="text-xs font-semibold text-slate-200">Why this decision?</h3><p className="mt-2 text-sm leading-relaxed text-slate-400">{decision.supportingEvidence[0] || 'No supporting evidence available.'}</p></div>
      <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.04] p-3.5"><h3 className="flex items-center gap-2 text-xs font-semibold text-amber-300"><AlertTriangle className="h-3.5 w-3.5" />Main risk to watch</h3><p className="mt-2 text-sm leading-relaxed text-slate-300">{decision.risks[0] || decision.contraryEvidence[0] || 'Risk coverage unavailable.'}</p></div>
      <div className="border-t border-white/[0.08] pt-4"><h3 className="flex items-center gap-2 text-sm font-semibold">{blocked ? <ShieldAlert className="h-4 w-4 text-rose-400" /> : <ShieldCheck className="h-4 w-4 text-slate-400" />}{outcome}</h3><p className="mt-2 text-xs leading-relaxed text-slate-400">{blocked ? decision.policyOutcome.message : skipped ? simulation.order.statusReason || 'No eligible position to sell.' : hold ? 'The sample decision keeps the position unchanged.' : matchingOrder ? `${simulation.order.quantity} ${token.symbol} at $${simulation.order.fillPrice.toLocaleString()}. Sample fee: $${simulation.order.feeEstimatedUsd.toFixed(2)}.` : 'This fixture does not contain a matching order for this asset and action.'}</p></div>
      <details className="text-xs text-slate-400"><summary className="cursor-pointer py-1 text-slate-200">Outlook and contrary evidence</summary><p className="mt-3 leading-relaxed">{decision.outlook.summary}</p><p className="mt-2">Horizon: {decision.outlook.timeframe}</p><ul className="mt-3 list-disc space-y-2 pl-4">{decision.contraryEvidence.map(item => <li key={item}>{item}</li>)}</ul></details>
      {onInterrogateInChat && <button type="button" onClick={() => onInterrogateInChat(`Explain the ${token.symbol} ${decision.action} sample decision and its main risks in simple terms.`)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4ce07a] px-4 py-3 text-sm font-semibold text-[#08110b] transition-colors hover:bg-[#76ec9a]">Ask about this decision<ArrowRight className="h-4 w-4" /></button>}
    </section>
  );
};
export default TradeExecutionWidget;
