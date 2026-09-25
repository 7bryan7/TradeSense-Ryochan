import React from 'react';
import { RunStatus } from '../../types/run';
import {
  Database,
  Brain,
  TrendingUp,
  ShieldCheck,
  Zap,
  Layout,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface AgentWorkflowVisualizerProps {
  isScanning: boolean;
  status: RunStatus;
  currentStepName?: string;
}

export const AgentWorkflowVisualizer: React.FC<AgentWorkflowVisualizerProps> = ({
  isScanning,
  status,
  currentStepName,
}) => {
  const steps = [
    { id: 'ingest', label: '01 Ingest', icon: Database, stage: 'FETCHING' },
    { id: 'reason', label: '02 Synthesize', icon: Brain, stage: 'ANALYZING' },
    { id: 'predict', label: '03 Hypothesis', icon: TrendingUp, stage: 'ANALYZING' },
    { id: 'policy', label: '04 Policy Gate', icon: ShieldCheck, stage: 'APPLYING' },
    { id: 'simulate', label: '05 Paper Engine', icon: Zap, stage: 'APPLYING' },
    { id: 'visualize', label: '06 Audit Trail', icon: Layout, stage: 'COMPLETED' },
  ];

  const getStepState = (stepIndex: number, stepStage: string) => {
    if (!isScanning) return 'completed';
    if (status === stepStage) return 'active';
    const stageOrder = ['FETCHING', 'ANALYZING', 'APPLYING', 'COMPLETED'];
    const currentIdx = stageOrder.indexOf(status);
    const stepStageIdx = stageOrder.indexOf(stepStage);
    if (currentIdx > stepStageIdx) return 'completed';
    return 'pending';
  };

  return (
    <div className="tradesense-glass-card rounded-xl px-4 py-2.5 border border-white/[0.12] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">

      {/* Left: Autonomous status badge */}
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-[#4ce07a] animate-ping' : 'bg-[#4ce07a]'}`} />
        <span className="text-[11px] font-bold text-white uppercase tracking-wider">
          Reasoning Pipeline:
        </span>
        <span className="text-[11px] text-[#4ce07a] font-medium flex items-center gap-1">
          {isScanning ? (
            <>
              <Sparkles className="w-3 h-3 animate-spin" />
              <span>{currentStepName || 'Executing reasoning pipeline...'}</span>
            </>
          ) : (
            <span>Deterministic Proofs Active</span>
          )}
        </span>
      </div>

      {/* Right: Inline horizontal steps ribbon */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-0.5">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const state = getStepState(idx, step.stage);
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${
                  state === 'active'
                    ? 'bg-[#4ce07a]/20 text-[#4ce07a] border border-[#4ce07a]/40 shadow-ryo-sm'
                    : state === 'completed'
                    ? 'bg-white/[0.03] text-white/90 border border-white/[0.06]'
                    : 'text-[#8F9CAE]/40 border border-transparent'
                }`}
              >
                {state === 'active' ? (
                  <Icon className="w-3 h-3 animate-spin text-[#4ce07a]" />
                ) : state === 'completed' && !isScanning ? (
                  <CheckCircle2 className="w-3 h-3 text-[#4ce07a]" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
                <span className="text-[10px] font-bold whitespace-nowrap">
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <ChevronRight className="w-3 h-3 text-white/20 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default AgentWorkflowVisualizer;
