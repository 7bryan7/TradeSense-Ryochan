import React, { useState } from 'react';
import { AgentRunRecord } from '../../types/run';
import { ChevronDown, ExternalLink, ShieldCheck, ShieldAlert, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface RecentTransactionsTableProps {
  runs: AgentRunRecord[];
  onReplayRun?: (run: AgentRunRecord) => void;
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({
  runs,
  onReplayRun,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'Week' | 'Month' | 'All'>('Week');

  // Display top 5 most recent runs/transactions
  const displayRuns = runs.slice(0, 5);

  return (
    <div className="dashboard-glass-card rounded-2xl p-4 sm:p-5 space-y-3">
      {/* Header (matching template Transaction + Week dropdown) */}
      <div className="flex items-center justify-between pb-1">
        <h4 className="text-sm font-bold text-white tracking-tight">
          Transaction &amp; Audited Decisions
        </h4>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#15171C]/75 backdrop-blur-md border border-white/[0.06] text-xs font-mono text-[#8F9CAE]">
          <span>{filterPeriod}</span>
          <select
            value={filterPeriod}
            onChange={e => setFilterPeriod(e.target.value as any)}
            className="opacity-0 absolute w-16 cursor-pointer"
            aria-label="Filter Period"
          >
            <option value="Week">Week</option>
            <option value="Month">Month</option>
            <option value="All">All</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Table (matching template columns) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-white/[0.06] text-[#8F9CAE] text-[10px] uppercase font-semibold">
              <th className="pb-2.5 font-medium">Type</th>
              <th className="pb-2.5 font-medium">Price</th>
              <th className="pb-2.5 font-medium">%</th>
              <th className="pb-2.5 font-medium hidden sm:table-cell">24h Volume</th>
              <th className="pb-2.5 font-medium hidden md:table-cell">Policy Status</th>
              <th className="pb-2.5 font-medium text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {displayRuns.map((run) => {
              const action = run.decision.action;
              const isPositive = run.decisionChanged === 'UP' || action === 'BUY';

              return (
                <tr
                  key={run.id}
                  onClick={() => onReplayRun?.(run)}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  {/* Token & Action */}
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {run.tokenSymbol[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white leading-tight font-sans">
                            {run.tokenSymbol}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              action === 'BUY'
                                ? 'bg-emerald-500/15 text-[#10B981]'
                                : action === 'SELL'
                                ? 'bg-rose-500/15 text-[#EF4444]'
                                : 'bg-amber-500/15 text-[#F59E0B]'
                            }`}
                          >
                            {action}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8F9CAE]">
                          {run.timestamp}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3 text-white font-medium">
                    ${run.executionPrice ? run.executionPrice.toLocaleString() : '112,482'}
                  </td>

                  {/* Delta */}
                  <td className="py-3">
                    <span
                      className={`flex items-center gap-0.5 font-bold ${
                        isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {isPositive ? '+2.84%' : '-1.20%'}
                    </span>
                  </td>

                  {/* 24h Volume */}
                  <td className="py-3 text-[#8F9CAE] hidden sm:table-cell">
                    $24,800,000,000
                  </td>

                  {/* Policy Status */}
                  <td className="py-3 hidden md:table-cell">
                    {run.policyResult === 'Passed' ? (
                      <span className="text-[11px] text-[#10B981] flex items-center gap-1 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Passed
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#EF4444] flex items-center gap-1 font-semibold">
                        <ShieldAlert className="w-3.5 h-3.5" /> {run.policyResult}
                      </span>
                    )}
                  </td>

                  {/* Replay Action */}
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReplayRun?.(run);
                      }}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#8F9CAE] hover:text-white transition-colors text-[10px] font-semibold"
                    >
                      Replay
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactionsTable;
