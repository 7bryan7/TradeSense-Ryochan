import { AgentRunRecord, RunStatus } from '../types/run';
import { mockRunRecords } from '../data/runs';
import { mockBtcDecision, mockEthDecision, mockSolDecision } from '../data/decisions';
import { mockBtcEvidence } from '../data/evidence';
import { mockBtcSafetyReport } from '../data/safety';
import { mockBtcSimulationResult } from '../data/simulation';
import { mockTokens } from '../data/tokens';

export const runService = {
  async getRecentRuns(): Promise<AgentRunRecord[]> {
    // In future: return fetch('/api/history').then(r => r.json());
    return [...mockRunRecords];
  },

  async getRunById(id: string): Promise<AgentRunRecord | undefined> {
    // In future: return fetch(`/api/runs/${id}`).then(r => r.json());
    return mockRunRecords.find(r => r.id === id);
  },

  async triggerAnalysisRun(
    tokenId: string,
    onProgress?: (status: RunStatus, stepName: string) => void
  ): Promise<AgentRunRecord> {
    // Simulate real autonomous agent workflow:
    // 1. Fetching (RYO Evidence)
    onProgress?.('FETCHING', '1. Scanning RYO On-Chain, News & Sentiment Feeds...');
    await new Promise(r => setTimeout(r, 600));

    // 2. Analyzing (Evaluating evidence & policy)
    onProgress?.('ANALYZING', '2. Evaluating Evidence & Validating Risk Invariants...');
    await new Promise(r => setTimeout(r, 700));

    // 3. Applying (Paper simulation)
    onProgress?.('APPLYING', '3. Sizing Paper Trade & Applying Deterministic Policy...');
    await new Promise(r => setTimeout(r, 500));

    const token = mockTokens.find(t => t.id === tokenId) || mockTokens[0];
    const baseDecision = tokenId === 'eth' ? mockEthDecision : tokenId === 'sol' ? mockSolDecision : mockBtcDecision;

    const newRun: AgentRunRecord = {
      id: `run-${Date.now().toString().slice(-6)}-${token.symbol.toLowerCase()}`,
      timestamp: 'Just now',
      tokenId: token.id,
      tokenSymbol: token.symbol,
      decisionAction: baseDecision.action,
      confidenceLevel: baseDecision.confidenceLevel,
      decisionChanged: 'UP',
      toolTrace: 'RYO → News → TA → LLM → Sim',
      policyResult: 'Passed',
      status: 'COMPLETED',
      mode: 'FIXTURE',
      executionPrice: token.metrics.price,
      simulatedFillStatus: baseDecision.action === 'HOLD' ? 'HOLD' : 'APPLIED',
      decision: {
        ...baseDecision,
        id: `dec-${token.id}-${Date.now()}`,
        asOf: new Date().toUTCString(),
      },
      evidence: mockBtcEvidence,
      safety: mockBtcSafetyReport,
      simulation: mockBtcSimulationResult,
    };

    onProgress?.('COMPLETED', 'Completed. Decision & Paper Trade Applied.');
    return newRun;
  },
};

