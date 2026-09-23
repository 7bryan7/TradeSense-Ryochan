import React from 'react';
import { AgentRunRecord } from '../../types/run';
import { Modal } from '../common/Modal';
import { ShieldCheck, Play, ArrowRight, BrainCircuit } from 'lucide-react';

interface ReplayModalProps {
  run: AgentRunRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReplayModal: React.FC<ReplayModalProps> = ({ run, isOpen, onClose }) => {
  if (!run) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Deterministic Run Replay — ${run.tokenSymbol} (${run.timestamp})`}
      maxWidth="xl"
    >
      <div className="space-y-4 font-mono text-xs">
        {/* Replay Notice */}
        <div className="p-3.5 rounded-xl bg-[#4ce07a]/10 border border-[#4ce07a]/20 text-[#4ce07a] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Play className="w-4 h-4 fill-current" />
            <span className="font-semibold">Deterministic Replay Mode Active</span>
          </span>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-[#4ce07a]/20 text-[#4ce07a] rounded-full border border-[#4ce07a]/30">
            No Ledger Writes
          </span>
        </div>

        {/* Saved Decision Snapshot */}
        <div className="bg-[#15171C] p-4 rounded-xl border border-white/[0.06] space-y-2.5">
          <div className="flex items-center justify-between text-[#8F9CAE] text-[11px]">
            <span>Decision ID: {run.decision.id}</span>
            <span>Recorded As-Of: {run.decision.asOf}</span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                run.decisionAction === 'BUY'
                  ? 'bg-[#4ce07a]/15 text-[#4ce07a] border-[#4ce07a]/30'
                  : run.decisionAction === 'SELL'
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
            >
              {run.decisionAction} ({run.confidenceLevel})
            </span>
            <span className="text-white">
              Execution Mark: ${run.executionPrice.toLocaleString()}
            </span>
          </div>

          <p className="text-[#8F9CAE] font-sans text-xs pt-2 leading-relaxed">
            {run.decision.explanation}
          </p>
        </div>

        {/* Tool Trace & Policy Validation */}
        <div className="bg-[#15171C] p-4 rounded-xl border border-white/[0.06] space-y-2">
          <div className="text-[11px] text-[#5E6A7D] uppercase">Audit Verification Trace</div>
          <div className="text-white text-xs font-semibold">
            {run.toolTrace}
          </div>
          <div className="flex items-center gap-2 text-[#4ce07a] text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Policy Status: {run.policyResult} • Idempotency key verified</span>
          </div>
        </div>

        {/* Simulated Order Outcome */}
        <div className="bg-[#15171C] p-4 rounded-xl border border-white/[0.06] space-y-2">
          <div className="text-[11px] text-[#5E6A7D] uppercase">Historical Simulated Order</div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#8F9CAE]">
            <div>Position: ${run.simulation.order.positionSizeUsd.toFixed(2)}</div>
            <div>Fill Price: ${run.simulation.order.fillPrice.toFixed(2)}</div>
            <div className="text-[#4ce07a] font-semibold">Simulated P&L: +${run.simulation.totalPnlUsd.toFixed(2)}</div>
            <div>Status: {run.simulation.order.status}</div>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white rounded-xl text-xs font-semibold transition-all"
          >
            Close Replay
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReplayModal;
