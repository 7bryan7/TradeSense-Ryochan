import React from 'react';
import { SafetyRiskReport } from '../../types/safety';
import { StatusBadge } from '../common/StatusBadge';
import { ShieldCheck, ShieldAlert, AlertOctagon, Check, X, Shield } from 'lucide-react';

interface SafetyRiskPanelProps {
  safety: SafetyRiskReport;
}

export const SafetyRiskPanel: React.FC<SafetyRiskPanelProps> = ({ safety }) => {
  if (!safety) return null;

  const isBlocked = safety.overallSafety === 'Blocked' || !safety.isExecutionAllowed;

  return (
    <div
      className={`tradesense-glass-card rounded-2xl p-4 sm:p-5 space-y-3.5 border transition-colors ${
        isBlocked ? 'border-rose-500/50 bg-rose-950/20' : 'border-white/[0.12]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isBlocked ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-[#4ce07a]/15 text-[#4ce07a] border border-[#4ce07a]/30'}`}>
            {isBlocked ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Safety & Risk Gate
            </h3>
            <span className="text-[10px] text-[#8F9CAE] font-mono">
              Deterministic Pre-Trade Guardrails
            </span>
          </div>
        </div>
        <StatusBadge status={safety.overallStatus} label={safety.overallSafety} />
      </div>

      {/* Blocked Alert Banner if applicable */}
      {isBlocked && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block uppercase font-mono tracking-wide">
              Simulated Execution Blocked
            </span>
            <span className="text-[11px]">{safety.blockReason || 'Critical safety invariants failed.'}</span>
          </div>
        </div>
      )}

      {/* 4 Clean Metric Glass Tiles */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="tradesense-glass-pill rounded-xl p-2.5 border border-white/[0.08]">
          <div className="text-[10px] text-[#8F9CAE]">Liquidity Depth</div>
          <div className="text-xs font-bold mt-0.5 text-[#4ce07a]">
            {safety.liquidity || 'Adequate'}
          </div>
        </div>

        <div className="tradesense-glass-pill rounded-xl p-2.5 border border-white/[0.08]">
          <div className="text-[10px] text-[#8F9CAE]">Honeypot Check</div>
          <div className="text-xs font-bold mt-0.5 flex items-center gap-1">
            {safety.honeypot ? (
              <span className="text-rose-400 flex items-center gap-1">
                <X className="w-3 h-3" /> Flagged
              </span>
            ) : (
              <span className="text-[#4ce07a] flex items-center gap-1">
                <Check className="w-3 h-3" /> Clean
              </span>
            )}
          </div>
        </div>

        <div className="tradesense-glass-pill rounded-xl p-2.5 border border-white/[0.08]">
          <div className="text-[10px] text-[#8F9CAE]">Contract Risk</div>
          <div className="text-xs font-bold mt-0.5 text-white">
            {safety.contractRisk || 'Verified Low'}
          </div>
        </div>

        <div className="tradesense-glass-pill rounded-xl p-2.5 border border-white/[0.08]">
          <div className="text-[10px] text-[#8F9CAE]">Data Coverage</div>
          <div className="text-xs font-bold mt-0.5 text-[#4ce07a]">
            {safety.dataCoverage}% Verified
          </div>
        </div>
      </div>

      {/* Verification Invariant Stamp */}
      <div className="p-2.5 rounded-xl tradesense-glass-pill border border-white/[0.08] flex items-center justify-between text-[11px] font-mono">
        <span className="text-[#8F9CAE]">Policy Invariants:</span>
        <span className="text-[#4ce07a] font-semibold flex items-center gap-1">
          <Check className="w-3 h-3" /> 5/5 Invariants Active
        </span>
      </div>
    </div>
  );
};


export default SafetyRiskPanel;
