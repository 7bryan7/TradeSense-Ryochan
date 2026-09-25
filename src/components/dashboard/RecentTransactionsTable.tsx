import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AgentRunRecord } from '../../types/run';

interface RecentTransactionsTableProps {
  runs: AgentRunRecord[];
  onReplayRun?: (run: AgentRunRecord) => void;
}
export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ runs, onReplayRun }) => {
  const [filter, setFilter] = useState('ALL');
  const displayRuns = runs.filter(run => filter === 'ALL' || run.decision.action === filter).slice(0, 5);
  return (
    <section className="dashboard-glass-card rounded-2xl p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">Recent sample decisions</h2><p className="mt-1 text-xs text-slate-400">A record of the decision and its simulation outcome.</p></div><select aria-label="Filter decisions" value={filter} onChange={e => setFilter(e.target.value)} className="rounded-lg border border-white/10 bg-[#1a2025] px-3 py-2 text-xs text-slate-300"><option value="ALL">All decisions</option><option value="BUY">Buy</option><option value="HOLD">Hold</option><option value="SELL">Sell</option></select></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[440px] text-left text-xs">
        <thead className="border-b border-white/[0.08] text-slate-400"><tr><th className="pb-3 font-medium">Asset / time</th><th className="pb-3 font-medium">Decision</th><th className="pb-3 font-medium">Simulation</th><th className="pb-3 text-right font-medium">Details</th></tr></thead>
        <tbody className="divide-y divide-white/[0.05]">{displayRuns.map(run => {
          const blocked = !run.decision.policyOutcome.allowed || run.simulatedFillStatus === 'BLOCKED';
          const outcome = blocked ? 'Blocked' : run.simulatedFillStatus === 'SKIPPED' ? 'Skipped' : run.decision.action === 'HOLD' || run.simulatedFillStatus === 'HOLD' ? 'No trade' : run.simulation.order.tokenId !== run.tokenId || run.simulation.order.action !== run.decision.action ? 'Unavailable' : 'Sample fill';
          return <tr key={run.id} className="hover:bg-white/[0.02]"><td className="py-4"><span className="block text-sm font-medium">{run.tokenSymbol}</span><span className="mt-1 block text-[11px] text-slate-400">{run.timestamp}</span></td><td className="py-4"><span className={`rounded-md px-2 py-1 font-medium ${run.decision.action === 'BUY' ? 'bg-[#4ce07a]/10 text-[#4ce07a]' : run.decision.action === 'SELL' ? 'bg-rose-400/10 text-rose-400' : 'bg-amber-300/10 text-amber-300'}`}>{run.decision.action}</span></td><td className={`py-4 ${blocked ? 'text-rose-400' : 'text-slate-300'}`}>{outcome}</td><td className="py-4 text-right">{onReplayRun && <button type="button" aria-label={`View ${run.tokenSymbol} decision ${run.id}`} onClick={() => onReplayRun(run)} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-2 text-slate-300 hover:border-[#4ce07a]/40 hover:text-[#4ce07a]">View<ArrowUpRight className="h-3.5 w-3.5" /></button>}</td></tr>;
        })}</tbody>
      </table></div>
      {displayRuns.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No sample decisions match this filter.</p>}
    </section>
  );
};
export default RecentTransactionsTable;
