import React, { useState } from 'react';
import { PageIntro } from '../components/common/PageIntro';
import { useAgentRun } from '../hooks/useAgentRun';
import { HistoryTable } from '../components/dashboard/HistoryTable';
import { ReplayModal } from '../components/dashboard/ReplayModal';
import { AgentRunRecord } from '../types/run';

export const HistoryPage: React.FC = () => {
  const { runs } = useAgentRun();
  const [replayRun, setReplayRun] = useState<AgentRunRecord | null>(null);

  const holdCount = runs.filter(run => run.decision.action === 'HOLD').length;
  const blockedCount = runs.filter(run => !run.decision.policyOutcome.allowed).length;

  return (
    <div className="studio-page">
      <PageIntro
        eyebrow="THE DECISION TRAIL"
        title="Decision history"
        description="Review sample analyses, compare their outcomes, and inspect the evidence behind each action."
      >
        <span className="studio-chip">Sample records</span>
      </PageIntro>

      <div className="studio-note">
        Sample decision history · Offline replay verified. Inspecting these records does not place live orders.
      </div>

      {/* Summary Metrics - Replicating Paper Portfolio's Exact Color Design & Structure */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-mono text-[#8F9CAE] uppercase">Sample analyses</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {runs.length}
          </div>
          <span className="text-[11px] font-mono text-[#5E6A7D] mt-0.5 block">
            Available in this demo
          </span>
        </div>

        <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-mono text-[#8F9CAE] uppercase">Decisions to wait</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {holdCount}
          </div>
          <span className="text-[11px] font-mono text-[#4ce07a] flex items-center mt-0.5 font-medium">
            HOLD is a completed decision
          </span>
        </div>

        <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-mono text-[#8F9CAE] uppercase">Policy blocks</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {blockedCount}
          </div>
          <span className="text-[11px] font-mono text-[#5E6A7D] mt-0.5 block">
            Reasons are available in details
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
