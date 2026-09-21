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
    <div className="bg-[#161926]/90 backdrop-blur-xl border border-[rgba(251,237,224,0.12)] rounded-2xl p-5 shadow-xl">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[rgba(251,237,224,0.08)]">
        <div>
          <h3 className="text-base font-bold text-[#FBEDE0] tracking-tight">
            Run Trace & Decision Audit History
          </h3>
          <p className="text-xs text-[rgba(251,237,224,0.5)] font-mono mt-0.5">
            Durable audit trail of autonomous agent scans, evidence citations & deterministic execution
          </p>
        </div>

        {/* Filter dropdowns (ethonline-main style) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#10131F] border border-[rgba(251,237,224,0.12)] rounded-xl px-3 py-1.5 text-xs font-mono text-[#FBEDE0]">
            <Filter className="w-3.5 h-3.5 text-[rgba(251,237,224,0.5)]" />
            <select
              aria-label="Filter runs by token"
              value={tokenFilter}
              onChange={e => setTokenFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-[#FBEDE0]"
            >
              <option value="ALL" className="bg-[#161926] text-[#FBEDE0]">All Tokens</option>
              <option value="BTC" className="bg-[#161926] text-[#FBEDE0]">BTC</option>
              <option value="ETH" className="bg-[#161926] text-[#FBEDE0]">ETH</option>
              <option value="SOL" className="bg-[#161926] text-[#FBEDE0]">SOL</option>
              <option value="BNB" className="bg-[#161926] text-[#FBEDE0]">BNB</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#10131F] border border-[rgba(251,237,224,0.12)] rounded-xl px-3 py-1.5 text-xs font-mono text-[#FBEDE0]">
            <select
              aria-label="Filter runs by action"
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-[#FBEDE0]"
            >
              <option value="ALL" className="bg-[#161926] text-[#FBEDE0]">All Actions</option>
              <option value="BUY" className="bg-[#161926] text-[#FBEDE0]">BUY</option>
              <option value="HOLD" className="bg-[#161926] text-[#FBEDE0]">HOLD</option>
              <option value="SELL" className="bg-[#161926] text-[#FBEDE0]">SELL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[rgba(251,237,224,0.08)] text-[rgba(251,237,224,0.5)] text-[11px] uppercase tracking-wider">
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
          <tbody className="divide-y divide-[rgba(251,237,224,0.05)]">
            {filteredRuns.map(run => {
              const isBuy = run.decisionAction === 'BUY';
              const isSell = run.decisionAction === 'SELL';
              const isPassed = run.policyResult === 'Passed';

              return (
                <tr
                  key={run.id}
                  className="hover:bg-[rgba(251,237,224,0.03)] transition-colors group"
                >
                  <td className="py-3 px-3 text-[rgba(251,237,224,0.7)] whitespace-nowrap">
                    {run.timestamp}
                  </td>
                  <td className="py-3 px-3 font-bold text-[#FBEDE0]">
                    {run.tokenSymbol}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                        isBuy
                          ? 'bg-[#38F997]/15 text-[#38F997] border-[#38F997]/30'
                          : isSell
                          ? 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/30'
                          : 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30'
                      }`}
                    >
                      {run.decisionAction} ({run.confidenceLevel})
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {run.decisionChanged === 'UP' && (
                      <span className="text-[#38F997] font-bold inline-flex items-center">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {run.decisionChanged === 'DOWN' && (
                      <span className="text-[#F87171] font-bold inline-flex items-center">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {run.decisionChanged === 'SAME' && (
                      <span className="text-[rgba(251,237,224,0.3)] inline-flex items-center">
                        <Minus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[rgba(251,237,224,0.6)] font-mono text-[11px] whitespace-nowrap">
                    {run.toolTrace}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        isPassed ? 'text-[#38F997]' : 'text-[#F87171]'
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
                    <span className="text-[rgba(251,237,224,0.7)] font-medium">
                      {run.simulatedFillStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onReplayRun(run)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#FBEDE0] text-[#0C0E17] hover:bg-[#FBEDE0]/90 transition-all text-[11px] font-bold shadow-xs hover:scale-105 active:scale-95"
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
