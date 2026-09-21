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
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[rgba(251,237,224,0.08)]">
        <div>
          <h1 className="text-2xl font-bold text-[#FBEDE0] tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-[#00D2FF]" />
            Autonomous Run History & Replay Log
          </h1>
          <p className="text-xs text-[rgba(251,237,224,0.6)] font-mono mt-1">
            Persisted research runs with tool traces, evidence references & deterministic replay verification
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-[#10131F] border border-[#38F997]/30 text-[#38F997] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Idempotent Records
          </span>
          <span className="px-3 py-1 rounded-full bg-[#10131F] border border-[#00D2FF]/30 text-[#00D2FF] flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
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
