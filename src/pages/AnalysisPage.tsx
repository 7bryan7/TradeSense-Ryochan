import React, { useState } from 'react';
import { useMarket } from '../hooks/useMarket';
import { useAgentRun } from '../hooks/useAgentRun';
import { AIDecisionCard } from '../components/dashboard/AIDecisionCard';
import { EvidencePanel } from '../components/dashboard/EvidencePanel';
import { SafetyRiskPanel } from '../components/dashboard/SafetyRiskPanel';
import { TokenComparisonCard } from '../components/dashboard/TokenComparisonCard';
import { AgentWorkflowVisualizer } from '../components/dashboard/AgentWorkflowVisualizer';
import { AskTradeSenseDrawer } from '../components/chat/AskTradeSenseDrawer';
import { BrainCircuit, RefreshCw, MessageSquareCode } from 'lucide-react';

export const AnalysisPage: React.FC = () => {
  const { tokens, currentToken, setSelectedTokenId } = useMarket('btc');
  const { currentRun, isScanning, scanStep, scanStatus, executeAnalysis } = useAgentRun();
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState<string | undefined>(undefined);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <BrainCircuit className="w-6 h-6 text-[#4ce07a]" />
            Autonomous Analysis Workspace
          </h1>
          <p className="text-xs text-[#8F9CAE] font-mono mt-1">
            Deep multi-modal research synthesis, evidence attribution, and hypothesis evaluation
          </p>
        </div>

        <button
          type="button"
          onClick={() => executeAnalysis(currentToken.id)}
          disabled={isScanning}
          className="flex items-center gap-2 px-5 py-2.5 bg-ryo-gradient text-[#050806] hover:opacity-90 font-bold text-xs rounded-full shadow-ryo-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Synthesizing Pipeline...' : 'Run Autonomous Analysis'}</span>
        </button>
      </div>

      {/* Workflow Visualizer */}
      <AgentWorkflowVisualizer
        isScanning={isScanning}
        status={scanStatus}
        currentStepName={scanStep}
      />

      {/* Main Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <AIDecisionCard
            decision={currentRun.decision}
            isScanning={isScanning}
            onInterrogateInChat={(prompt) => {
              setChatPrompt(prompt);
              setIsChatDrawerOpen(true);
            }}
          />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <SafetyRiskPanel safety={currentRun.safety} />
          <TokenComparisonCard tokens={tokens} onSelectToken={setSelectedTokenId} />
        </div>
      </div>

      {/* Comprehensive Evidence Inspector */}
      <EvidencePanel items={currentRun.evidence} />

      {/* Persistent Chat Drawer */}
      <AskTradeSenseDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => {
          setIsChatDrawerOpen(false);
          setChatPrompt(undefined);
        }}
        initialPrompt={chatPrompt}
      />
    </div>
  );
};

export default AnalysisPage;
