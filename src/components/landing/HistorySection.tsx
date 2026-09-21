import React from 'react';
import { History, CheckCircle, ArrowRight } from 'lucide-react';
import { mockRunRecords } from '../../data/runs';
import { Link } from 'react-router-dom';

export const HistorySection: React.FC = () => {
  return (
    <section className="py-20 px-6 border-t border-[rgba(80,160,255,0.1)] bg-[#050B14]/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
              Section 08 — History & Replay
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Audit-grade run trace & determinism
            </h2>
          </div>
          <Link
            to="/history"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            View all historical runs →
          </Link>
        </div>

        {/* Minimal Preview Table */}
        <div className="bg-[#091522] border border-[rgba(80,160,255,0.14)] rounded-2xl overflow-hidden shadow-panel">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#0c1a29]/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Token</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Tool Trace</th>
                  <th className="py-3 px-4">Policy Result</th>
                  <th className="py-3 px-4 text-right">Simulation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {mockRunRecords.slice(0, 4).map(run => (
                  <tr key={run.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-300">{run.timestamp}</td>
                    <td className="py-3 px-4 font-bold text-white">{run.tokenSymbol}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          run.decisionAction === 'BUY'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                            : run.decisionAction === 'SELL'
                            ? 'bg-rose-950 text-rose-400 border-rose-500/30'
                            : 'bg-amber-950 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {run.decisionAction} ({run.confidenceLevel})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{run.toolTrace}</td>
                    <td className="py-3 px-4 text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {run.policyResult}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      {run.simulatedFillStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

