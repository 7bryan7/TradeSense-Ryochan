import { SafetyRiskReport } from '../types/safety';

export const mockBtcSafetyReport: SafetyRiskReport = {
  overallSafety: 'Good',
  overallStatus: 'SAFE',
  riskLevel: 'LOW',
  liquidity: 'High',
  honeypot: false,
  contractRisk: 'Low',
  volatilityRisk: 'Low',
  dataCoverage: 98,
  isExecutionAllowed: true,
  findings: [
    {
      id: 'safe-01',
      name: 'Liquidity Depth',
      status: 'SAFE',
      severity: 'low',
      detail: 'Deep orderbook liquidity ($1.85B 2% depth across major tier-1 venues). Slippage minimal.',
    },
    {
      id: 'safe-02',
      name: 'Honeypot & Transfer Taxes',
      status: 'SAFE',
      severity: 'low',
      detail: 'Native L1 asset, zero transfer restrictions, no blacklist or freeze authority.',
    },
    {
      id: 'safe-03',
      name: 'Contract Audit & Verification',
      status: 'SAFE',
      severity: 'low',
      detail: 'Core consensus protocol verified by extensive historical proof-of-work security.',
    },
    {
      id: 'safe-04',
      name: 'Data Freshness & Coverage',
      status: 'SAFE',
      severity: 'low',
      detail: '98% of requested feeds responded within <60s freshness tolerance window.',
    },
  ],
};

export const mockBlockedSafetyReport: SafetyRiskReport = {
  overallSafety: 'Blocked',
  overallStatus: 'BLOCKED',
  riskLevel: 'CRITICAL',
  liquidity: 'Low',
  honeypot: true,
  contractRisk: 'High',
  volatilityRisk: 'High',
  dataCoverage: 42,
  isExecutionAllowed: false,
  blockReason: 'Critical safety failure: Insufficient verified liquidity depth and missing audit contract verification.',
  findings: [
    {
      id: 'safe-blk-01',
      name: 'Contract Safety Gaps',
      status: 'BLOCKED',
      severity: 'high',
      detail: 'Honeypot detector flagged unverified proxy implementation with unrestricted mint capability.',
    },
    {
      id: 'safe-blk-02',
      name: 'Stale Price Feed',
      status: 'STALE',
      severity: 'high',
      detail: 'Last verified quote is 18 minutes old, exceeding the 60s execution limit.',
    },
  ],
};

