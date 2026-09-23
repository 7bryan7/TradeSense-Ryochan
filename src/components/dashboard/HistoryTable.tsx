import React, { useState } from 'react';
import { AgentRunRecord } from '../../types/run';
import { Play, Filter, ArrowUp, ArrowDown, Minus, CheckCircle, XCircle } from 'lucide-react';

interface HistoryTableProps {
  runs: AgentRunRecord[];
  onReplayRun: (run: AgentRunRecord) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ runs, onReplayRun }) => {
  const [tokenFilter, setTokenFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filteredRuns = runs.filter(r => {
    if (tokenFilter !== 'ALL' && r.tokenSymbol !== tokenFilter) return false;
    if (actionFilter !== 'ALL' && r.decisionAction !== actionFilter) return false;
    return true;
  });

  return (
    <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-5 shadow-sm">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Run Trace & Decision Audit History
          </h3>
          <p className="text-xs text-[#8F9CAE] font-mono mt-0.5">
            Durable audit trail of autonomous agent scans, evidence citations & deterministic execution
          </p>
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#15171C] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs font-mono text-white">
            <Filter className="w-3.5 h-3.5 text-[#8F9CAE]" />
            <select
              aria-label="Filter runs by token"
              value={tokenFilter}
              onChange={e => setTokenFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-white"
            >
              <option value="ALL" className="bg-[#1E222B] text-white">All Tokens</option>
              <option value="BTC" className="bg-[#1E222B] text-white">BTC</option>
              <option value="ETH" className="bg-[#1E222B] text-white">ETH</option>
              <option value="SOL" className="bg-[#1E222B] text-white">SOL</option>
              <option value="BNB" className="bg-[#1E222B] text-white">BNB</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#15171C] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs font-mono text-white">
            <select
              aria-label="Filter runs by action"
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-white"
            >
              <option value="ALL" className="bg-[#1E222B] text-white">All Actions</option>
              <option value="BUY" className="bg-[#1E222B] text-white">BUY</option>
              <option value="HOLD" className="bg-[#1E222B] text-white">HOLD</option>
              <option value="SELL" className="bg-[#1E222B] text-white">SELL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-white/[0.06] text-[#8F9CAE] text-[11px] uppercase tracking-wider">
              <th className="py-3 px-3 font-bold">Timestamp</th>
              <th className="py-3 px-3 font-bold">Token</th>
              <th className="py-3 px-3 font-bold">Decision</th>
              <th className="py-3 px-3 font-bold text-center">Delta</th>
              <th className="py-3 px-3 font-bold">Tools</th>
              <th className="py-3 px-3 font-bold">Policy Result</th>
              <th className="py-3 px-3 font-bold text-right">Simulation</th>
              <th className="py-3 px-3 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {filteredRuns.map(run => {
              const isBuy = run.decisionAction === 'BUY';
              const isSell = run.decisionAction === 'SELL';
              const isPassed = run.policyResult === 'Passed';

              return (
                <tr
                  key={run.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="py-3 px-3 text-[#8F9CAE] whitespace-nowrap">
                    {run.timestamp}
                  </td>
                  <td className="py-3 px-3 font-bold text-white">
                    {run.tokenSymbol}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                        isBuy
                          ? 'bg-[#4ce07a]/15 text-[#4ce07a] border-[#4ce07a]/30'
                          : isSell
                          ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                          : 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                      }`}
                    >
                      {run.decisionAction} ({run.confidenceLevel})
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {run.decisionChanged === 'UP' && (
                      <span className="text-[#4ce07a] font-bold inline-flex items-center">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {run.decisionChanged === 'DOWN' && (
                      <span className="text-[#EF4444] font-bold inline-flex items-center">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {run.decisionChanged === 'SAME' && (
                      <span className="text-[#5E6A7D] inline-flex items-center">
                        <Minus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[#8F9CAE] font-mono text-[11px] whitespace-nowrap">
                    {run.toolTrace}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        isPassed ? 'text-[#4ce07a]' : 'text-[#EF4444]'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {run.policyResult}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-[#8F9CAE] font-medium">
                      {run.simulatedFillStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onReplayRun(run)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-ryo-gradient text-[#050806] hover:opacity-90 transition-all text-[11px] font-bold shadow-ryo-sm hover:scale-105 active:scale-95"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
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

export default HistoryTable;
