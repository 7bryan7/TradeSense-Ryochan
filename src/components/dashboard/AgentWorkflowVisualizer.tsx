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
    { id: 'ingest', label: '01 Ingest', sub: 'RYO Evidence', icon: Database, stage: 'FETCHING' },
    { id: 'reason', label: '02 Reason', sub: 'LLM Synthesis', icon: Brain, stage: 'ANALYZING' },
    { id: 'predict', label: '03 Predict', sub: 'Bull/Bear Thesis', icon: TrendingUp, stage: 'ANALYZING' },
    { id: 'policy', label: '04 Gate', sub: 'Safety Policy', icon: ShieldCheck, stage: 'APPLYING' },
    { id: 'simulate', label: '05 Simulate', sub: '10 bps Engine', icon: Zap, stage: 'APPLYING' },
    { id: 'visualize', label: '06 Visualize', sub: 'Telemetry', icon: Layout, stage: 'COMPLETED' },
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
    <div className="bg-[#161926]/90 backdrop-blur-xl border border-[rgba(251,237,224,0.10)] rounded-2xl p-4.5 shadow-xl">
      <div className="flex items-center justify-between mb-3 text-xs font-mono">
        <span className="text-[rgba(251,237,224,0.65)] uppercase flex items-center gap-2 font-bold tracking-wider">
          <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-[#00D2FF] animate-ping' : 'bg-[#38F997]'}`} />
          <span>AUTONOMOUS AGENT PIPELINE</span>
        </span>
        <span className="text-[#38F997] text-[11px] font-mono flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isScanning ? currentStepName || 'Executing reasoning pipeline...' : 'System Verified • Autonomous Ready'}</span>
        </span>
      </div>

      {/* Pipeline Nodes */}
      <div className="flex items-center justify-between overflow-x-auto py-2 gap-2 scrollbar-none">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const state = getStepState(idx, step.stage);
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              {/* Step Node */}
              <div className="flex flex-col items-center shrink-0 min-w-[90px]">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    state === 'active'
                      ? 'bg-[#38F997] text-[#0C0E17] shadow-glow-green scale-110'
                      : state === 'completed'
                      ? 'bg-[#1C2030] border border-[rgba(251,237,224,0.15)] text-[#38F997]'
                      : 'bg-[#12141F] border border-[rgba(251,237,224,0.06)] text-[rgba(251,237,224,0.35)]'
                  }`}
                >
                  {state === 'active' ? (
                    <Icon className="w-4 h-4 animate-spin text-[#0C0E17]" />
                  ) : state === 'completed' && !isScanning ? (
                    <CheckCircle2 className="w-4 h-4 text-[#38F997]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-mono mt-1.5 font-bold ${
                    state === 'active'
                      ? 'text-[#38F997]'
                      : state === 'completed'
                      ? 'text-[#FBEDE0]'
                      : 'text-[rgba(251,237,224,0.35)]'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[10px] font-mono text-[rgba(251,237,224,0.5)] whitespace-nowrap">
                  {step.sub}
                </span>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div className="flex-1 h-[2px] min-w-[20px] bg-[rgba(251,237,224,0.10)] relative mx-1">
                  <div
                    className={`h-full transition-all duration-500 ${
                      state === 'completed' ? 'bg-[#38F997]/60' : 'bg-transparent'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default AgentWorkflowVisualizer;
