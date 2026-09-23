import React, { useState } from 'react';
import { useAgentRun } from '../hooks/useAgentRun';
import { HistoryTable } from '../components/dashboard/HistoryTable';
import { ReplayModal } from '../components/dashboard/ReplayModal';
import { AgentRunRecord } from '../types/run';
import { History, ShieldCheck, Database } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { runs } = useAgentRun();
  const [replayRun, setReplayRun] = useState<AgentRunRecord | null>(null);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-[#4ce07a]" />
            Autonomous Run History & Replay Log
          </h1>
          <p className="text-xs text-[#8F9CAE] font-mono mt-1">
            Persisted research runs with tool traces, evidence references & deterministic replay verification
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-[#1E222B] border border-[#4ce07a]/30 text-[#4ce07a] flex items-center gap-1.5 font-medium shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            Idempotent Records
          </span>
          <span className="px-3 py-1 rounded-full bg-[#1E222B] border border-white/[0.08] text-white flex items-center gap-1.5 shadow-sm">
            <Database className="w-3.5 h-3.5 text-[#4ce07a]" />
            Fixture Mode
          </span>
        </div>
      </div>

      {/* History Table */}
      <HistoryTable runs={runs} onReplayRun={setReplayRun} />

      {/* Replay Modal */}
      <ReplayModal
        run={replayRun}
        isOpen={Boolean(replayRun)}
        onClose={() => setReplayRun(null)}
      />
    </div>
  );
};

export default HistoryPage;
