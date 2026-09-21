import React from 'react';
import { SafetyRiskReport } from '../../types/safety';
import { StatusBadge } from '../common/StatusBadge';
import { ShieldCheck, ShieldAlert, AlertOctagon, Check, X } from 'lucide-react';

interface SafetyRiskPanelProps {
  safety: SafetyRiskReport;
}

export const SafetyRiskPanel: React.FC<SafetyRiskPanelProps> = ({ safety }) => {
  const isBlocked = safety.overallSafety === 'Blocked' || !safety.isExecutionAllowed;

  return (
    <div
      className={`bg-[#161926]/90 border rounded-2xl p-5 shadow-panel transition-colors ${
        isBlocked ? 'border-rose-500/50 bg-rose-950/20' : 'border-[rgba(251,237,224,0.10)]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(251,237,224,0.08)] mb-3">
        <div className="flex items-center gap-2">
          {isBlocked ? (
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-[#38F997]" />
          )}
          <h3 className="text-xs font-bold text-[#FBEDE0] uppercase font-mono tracking-wider">
            Safety & Risk Assessment
          </h3>
        </div>
        <StatusBadge status={safety.overallStatus} label={safety.overallSafety} />
      </div>

      {/* Blocked Alert Banner if applicable */}
      {isBlocked && (
        <div className="mb-3 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block uppercase font-mono tracking-wide">
              Simulated Execution Blocked
            </span>
            <span>{safety.blockReason || 'Critical safety invariants failed.'}</span>
          </div>
        </div>
      )}

      {/* 5 Key Safety Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
        <div className="bg-[#10131F]/80 border border-[rgba(251,237,224,0.08)] rounded-xl p-3">
          <div className="text-[10px] text-[rgba(251,237,224,0.5)] font-mono">Risk Level</div>
          <div className="text-xs font-bold font-mono mt-0.5 text-[#38F997]">
            {safety.riskLevel}
          </div>
        </div>

        <div className="bg-[#10131F]/80 border border-[rgba(251,237,224,0.08)] rounded-xl p-3">
          <div className="text-[10px] text-[rgba(251,237,224,0.5)] font-mono">Liquidity Depth</div>
          <div className="text-xs font-bold font-mono mt-0.5 text-[#38F997]">
            {safety.liquidity}
          </div>
        </div>

        <div className="bg-[#10131F]/80 border border-[rgba(251,237,224,0.08)] rounded-xl p-3">
          <div className="text-[10px] text-[rgba(251,237,224,0.5)] font-mono">Honeypot Flag</div>
          <div className="text-xs font-bold font-mono mt-0.5 flex items-center gap-1">
            {safety.honeypot ? (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <X className="w-3 h-3" /> Yes (Flagged)
              </span>
            ) : (
              <span className="text-[#38F997] font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> No (Clean)
              </span>
            )}
          </div>
        </div>

        <div className="bg-[#10131F]/80 border border-[rgba(251,237,224,0.08)] rounded-xl p-3">
          <div className="text-[10px] text-[rgba(251,237,224,0.5)] font-mono">Contract Risk</div>
          <div className="text-xs font-bold font-mono mt-0.5 text-[#FBEDE0]">
            {safety.contractRisk}
          </div>
        </div>

        <div className="bg-[#10131F]/80 border border-[rgba(251,237,224,0.08)] rounded-xl p-3">
          <div className="text-[10px] text-[rgba(251,237,224,0.5)] font-mono">Data Coverage</div>
          <div className="text-xs font-bold font-mono mt-0.5 text-[#00D2FF]">
            {safety.dataCoverage}% Verified
          </div>
        </div>

        <div className="bg-[#10131F]/80 border border-[rgba(251,237,224,0.08)] rounded-xl p-3">
          <div className="text-[10px] text-[rgba(251,237,224,0.5)] font-mono">Overall Safety</div>
          <div className="text-xs font-bold font-mono mt-0.5 text-[#38F997]">
            {safety.overallSafety}
          </div>
        </div>
      </div>

      {/* Detailed findings breakdown */}
      <div className="space-y-1.5">
        {safety.findings.map(f => (
          <div
            key={f.id}
            className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#10131F]/60 border border-[rgba(251,237,224,0.06)]"
          >
            <span className="text-[rgba(251,237,224,0.8)] font-medium">{f.name}</span>
            <StatusBadge status={f.status} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SafetyRiskPanel;
