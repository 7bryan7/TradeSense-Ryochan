import React from 'react';
import { AgentRunRecord } from '../../types/run';
import { Modal } from '../common/Modal';
import { FileText } from 'lucide-react';

interface ReplayModalProps { run: AgentRunRecord | null; isOpen: boolean; onClose: () => void; }
export const ReplayModal: React.FC<ReplayModalProps> = ({ run, isOpen, onClose }) => {
  if (!run) return null;
  const matchingOrder = run.simulation.order.tokenId === run.tokenId && run.simulation.order.action === run.decision.action;
  const filled = run.decision.policyOutcome.allowed && run.simulatedFillStatus === 'APPLIED' && matchingOrder;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${run.tokenSymbol} · Sample decision details`} maxWidth="xl">
      <div className="space-y-5 text-sm">
        <div className="studio-note flex items-center gap-2"><FileText size={16} />Sample record · Viewing these details does not place a trade.</div>
        <div className="grid grid-cols-2 gap-4"><div><p className="text-xs text-slate-400">Proposed action</p><p className="mt-1 text-2xl font-semibold text-[#4ce07a]">{run.decision.action}</p></div><div><p className="text-xs text-slate-400">Evidence confidence</p><p className="mt-1 text-2xl font-semibold">{run.decision.confidenceScore}%</p></div></div>
        <p className="leading-7 text-slate-300">{run.decision.rationale}</p>
        <div className="border-t border-white/10 pt-4"><h3 className="font-semibold">Simulation outcome</h3><p className="mt-2 text-xs leading-6 text-slate-400">{!run.decision.policyOutcome.allowed ? run.decision.policyOutcome.message : run.simulatedFillStatus === 'SKIPPED' ? run.simulation.order.statusReason || 'No eligible position to sell.' : run.decision.action === 'HOLD' ? 'No trade placed. The sample decision is to wait.' : filled ? `Sample fill: ${run.simulation.order.quantity} ${run.tokenSymbol} at $${run.simulation.order.fillPrice.toLocaleString()}.` : 'Matching order details are unavailable in this fixture.'}</p></div>
        <div className="rounded-xl border border-amber-200/10 bg-amber-200/[0.03] p-4"><h3 className="text-xs font-semibold text-amber-200">Main risk</h3><p className="mt-2 text-xs leading-6 text-slate-300">{run.decision.risks[0] || 'Risk coverage unavailable.'}</p></div>
        <details className="text-xs text-slate-400"><summary className="cursor-pointer py-2 text-slate-200">Record and source details</summary><div className="space-y-2 mt-3 break-words"><p>Run: {run.id}</p><p>Sample as of: {run.decision.asOf}</p><p>Tool sequence: {run.toolTrace}</p><p>{run.decision.explanation}</p></div></details>
        <div className="flex justify-end"><button type="button" onClick={onClose} className="studio-secondary">Close details</button></div>
      </div>
    </Modal>
  );
};
export default ReplayModal;
