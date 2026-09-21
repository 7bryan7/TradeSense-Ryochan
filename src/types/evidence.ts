export type EvidenceCategory = 'on-chain' | 'news' | 'social' | 'technical' | 'safety';

export type EvidenceStatus = 'fresh' | 'stale' | 'unavailable' | 'partial' | 'unknown';

export interface EvidenceItem {
  id: string;
  category: EvidenceCategory;
  title: string;
  value: string;
  interpretation: string;
  source: string;
  sourceTimestamp: string;
  age: string;
  status: EvidenceStatus;
  weight: 'critical' | 'high' | 'medium' | 'low';
  supports: 'BUY' | 'SELL' | 'NEUTRAL';
}

export interface EvidenceSummary {
  overallCoverageScore: number; // e.g., 94%
  freshnessStatus: EvidenceStatus;
  items: EvidenceItem[];
  missingSources: string[];
}

