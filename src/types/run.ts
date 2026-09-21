import { DecisionReport } from './decision';
import { EvidenceItem } from './evidence';
import { SafetyRiskReport } from './safety';
import { SimulationResult } from './simulation';

export type RunStatus = 'QUEUED' | 'FETCHING' | 'ANALYZING' | 'APPLYING' | 'COMPLETED' | 'BLOCKED' | 'FAILED';

export interface AgentRunRecord {
  id: string;
  timestamp: string;
  tokenId: string;
  tokenSymbol: string;
  decisionAction: 'BUY' | 'HOLD' | 'SELL';
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  decisionChanged: 'UP' | 'DOWN' | 'SAME'; // ↑, ↓, —
  toolTrace: string; // e.g. "RYO → News → TA → LLM → Sim"
  policyResult: 'Passed' | 'Blocked' | 'Skipped';
  status: RunStatus;
  mode: 'LIVE' | 'FIXTURE';
  executionPrice: number;
  simulatedFillStatus: 'APPLIED' | 'SKIPPED' | 'BLOCKED' | 'HOLD';
  decision: DecisionReport;
  evidence: EvidenceItem[];
  safety: SafetyRiskReport;
  simulation: SimulationResult;
}

