export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SafetyStatus = 'SAFE' | 'WARNING' | 'UNKNOWN' | 'BLOCKED' | 'STALE' | 'UNAVAILABLE';

export interface SafetyFinding {
  id: string;
  name: string;
  status: SafetyStatus;
  severity: 'low' | 'medium' | 'high';
  detail: string;
}

export interface SafetyRiskReport {
  overallSafety: 'Good' | 'Fair' | 'At Risk' | 'Blocked';
  overallStatus: SafetyStatus;
  riskLevel: RiskLevel;
  liquidity: 'High' | 'Medium' | 'Low';
  honeypot: boolean;
  contractRisk: 'Low' | 'Medium' | 'High' | 'N/A';
  volatilityRisk: 'Low' | 'Medium' | 'High';
  dataCoverage: number; // e.g. 96%
  findings: SafetyFinding[];
  isExecutionAllowed: boolean;
  blockReason?: string;
}

