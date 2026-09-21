import { useState } from 'react';
import { AgentRunRecord, RunStatus } from '../types/run';
import { runService } from '../services/runService';
import { mockRunRecords } from '../data/runs';
import { mockBlockedSafetyReport } from '../data/safety';

export type DemoStateMode = 'NORMAL_BUY' | 'HOLD' | 'SELL_NO_POSITION' | 'BLOCKED_SAFETY' | 'STALE_DATA';

export function useAgentRun() {
  const [runs, setRuns] = useState<AgentRunRecord[]>(mockRunRecords);
  const [currentRun, setCurrentRun] = useState<AgentRunRecord>(mockRunRecords[0]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [scanStatus, setScanStatus] = useState<RunStatus>('COMPLETED');
  const [demoState, setDemoState] = useState<DemoStateMode>('NORMAL_BUY');

  const executeAnalysis = async (tokenId: string) => {
    setIsScanning(true);
    try {
      const newRun = await runService.triggerAnalysisRun(tokenId, (status, stepName) => {
        setScanStatus(status);
        setScanStep(stepName);
      });

      // Apply demo state adjustments if selected
      if (demoState === 'BLOCKED_SAFETY') {
        newRun.status = 'BLOCKED';
        newRun.policyResult = 'Blocked';
        newRun.simulatedFillStatus = 'BLOCKED';
        newRun.safety = mockBlockedSafetyReport;
        newRun.decision.policyOutcome = {
          allowed: false,
          reasonCode: 'BLOCKED_SAFETY',
          message: 'Simulation blocked: Data coverage fell below 70% threshold and safety check timed out.',
        };
      } else if (demoState === 'HOLD') {
        newRun.decisionAction = 'HOLD';
        newRun.decision.action = 'HOLD';
        newRun.simulatedFillStatus = 'HOLD';
        newRun.decision.rationale = 'Market consolidating within neutral range. No directional edge.';
      } else if (demoState === 'SELL_NO_POSITION') {
        newRun.decisionAction = 'SELL';
        newRun.decision.action = 'SELL';
        newRun.simulatedFillStatus = 'SKIPPED';
        newRun.simulation.order.status = 'SKIPPED_NO_POSITION';
        newRun.simulation.order.statusReason = 'SELL recommendation skipped — no active portfolio holdings.';
      }

      setCurrentRun(newRun);
      setRuns(prev => [newRun, ...prev]);
    } finally {
      setIsScanning(false);
      setScanStep('');
      setScanStatus('COMPLETED');
    }
  };

  const selectRun = (run: AgentRunRecord) => {
    setCurrentRun(run);
  };

  return {
    runs,
    currentRun,
    isScanning,
    scanStep,
    scanStatus,
    demoState,
    setDemoState,
    executeAnalysis,
    selectRun,
  };
}

