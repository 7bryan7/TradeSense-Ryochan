export type Decision = {
  action: "BUY" | "HOLD" | "SELL";
  summary: string;
  confidence: string;
  supportingEvidence: string[];
  counterEvidence: string[];
  risks: string[];
  missingData: string[];
  outlook: { direction: string; horizon: string; invalidation: string };
};

export type Evidence = {
  id: string;
  tool: string;
  symbol?: string;
  status: string;
  dataMode: string;
  asOf: string;
  retrievedAt: string;
  data: Record<string, unknown>;
  summary: { headline: string; keyPoints?: string[] };
  warnings: string[];
};

export type ResearchTimelineStep = {
  ordinal: number;
  role: string;
  tool: string;
  args: Record<string, unknown>;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  attemptCount: number;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  evidenceId: string | null;
  providerStatus: string | null;
  failure: null | { code: string; message: string };
};

export type Run = {
  id: string;
  symbol: string;
  mode: string;
  researchPlanVersion: string | null;
  status: string;
  createdAt: string;
  completedAt: string | null;
  attemptCount: number;
  failure: null | { stage: string; code: string; message: string };
  decision: Decision | null;
  simulation: null | { action: string; outcome: string; quantity: string; fillPriceUsd: string; feeUsd: string; cashDeltaUsd: string; reason: string };
  researchTimeline: ResearchTimelineStep[];
  evidence: Evidence[];
};

export type Replay = {
  runId: string;
  matches: boolean;
  portfolioMutated: boolean;
  saved: ReplayResult;
  replayed: ReplayResult;
};

export type ReplayResult = {
  outcome: string;
  quantityMicros: string;
  fillPriceCents: string;
  feeCents: string;
  cashDeltaCents: string;
  reason: string;
};

export type Portfolio = {
  cashUsd: string;
  realizedPnlUsd: string;
  mode: string;
  version: number;
  holdings: Array<{
    symbol: string; quantity: string; costBasisUsd: string; marketValueUsd: string | null; unrealizedPnlUsd: string | null;
    mark: null | { priceUsd: string; evidenceId: string; asOf: string; retrievedAt: string; ageSeconds: number | null; freshness: "fresh" | "stale" };
  }>;
  valuation: { status: "complete" | "partial" | "unavailable"; valuedAt: string; missingMarks: number; holdingsValueUsd: string | null; totalEquityUsd: string | null; unrealizedPnlUsd: string | null };
};

export type DashboardComparison = {
  status: "comparable" | "incompatible" | "unavailable";
  reason: string | null;
  previousRunId: string | null;
  identity?: { symbol: string; network: string | null; address: string | null; window: string | null };
  observedAt?: { current: string; previous: string };
  price?: null | { currentUsd: string; previousUsd: string; deltaUsd: string; deltaPercent: number | null };
  change24h?: null | { current: number; previous: number; deltaPoints: number };
  decision?: { current: string | null; previous: string | null; changed: boolean };
  simulation?: { current: string | null; previous: string | null; changed: boolean };
};

export type DashboardSummary = {
  symbol: string;
  mode: string;
  generatedAt: string;
  latestRun: Run | null;
  comparison: DashboardComparison;
  portfolio: Portfolio;
  chart: { status: "unavailable"; reason: string };
};

export type MarketOverview = {
  mode: string;
  generatedAt: string;
  maxAgeSeconds: number;
  snapshot: Evidence | null;
  ageSeconds: number | null;
  freshness: "fresh" | "stale" | "unknown";
  latestAttempt: null | {
    status: "FETCHING" | "COMPLETED" | "FAILED";
    startedAt: string;
    completedAt: string | null;
    evidenceId: string | null;
    failure: null | { code: string; message: string };
  };
};

export type Schedule = {
  id: string;
  mode: string;
  symbols: string[];
  cadenceMinutes: number;
  maxRunsPerDay: number;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  nextSlotAt: string;
  lastSlotAt: string | null;
  lastRunId: string | null;
  workerEnabled: boolean;
  latestSlot: null | { symbol: string; slotAt: string; status: string; runId: string | null; errorMessage: string | null };
};

export type Health = { status: string; mode: string; trading: string; schedulerEnabled: boolean };
export type ChatSource = { evidenceId: string; kind: "ryo" | "web"; title: string; url?: string; publishedAt?: string | null; retrievedAt: string };
export type ChatMessage = { id: string; role: string; text: string; symbol?: string | null; runId?: string | null; status: string; citations: string[]; sources: ChatSource[]; attemptCount?: number; failure?: null | { stage: string; code: string; message: string }; createdAt?: string; updatedAt?: string };
export type Chat = { id: string; mode: string; symbol: string | null; messages: ChatMessage[] };
export type ViewName = "dashboard" | "analysis" | "chat" | "portfolio" | "history";
