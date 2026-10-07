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
  purpose?: string;
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
  simulation: null | {
    action: string; outcome: string; quantity: string; fillPriceUsd: string; feeUsd: string; cashDeltaUsd: string; reason: string;
    decisionReference: null | { evidenceId: string | null; priceUsd: string; asOf: string };
    executionQuote: null | { evidenceId: string; referencePriceUsd: string; asOf: string; retrievedAt: string };
  };
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
  id: string;
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
  chart: MarketChart;
};

export type MarketChartPoint = { timestamp: string; open: number | null; high: number | null; low: number | null; close: number; volume: number | null };
export type MarketChart = { status: "unavailable"; reason: string } | {
  status: "available"; evidenceId: string; symbol: string; currency: string; volumeUnit: string | null;
  intervalSeconds: number; windowSeconds: number; sourcePath: string; dataMode: string; asOf: string; retrievedAt: string;
  points: MarketChartPoint[]; volumeCoverage: "complete" | "partial" | "unavailable";
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

export type Health = { status: string; mode: "live"; defaultMode: "live"; availableModes: Array<"live">; trading: string; schedulerEnabled: boolean; policy: { initialCashUsd: number; feeBps: number; slippageBps: number; maxBuyEquityBps: number; maxTokenExposureBps: number; maxPriceAgeSeconds: number } };
export type ChatSource = { evidenceId: string; kind: "ryo" | "web"; title: string; url?: string; publishedAt?: string | null; retrievedAt: string; dataMode: string };
export type ChatEvidenceClaim = { text: string; evidenceIds: string[] };
export type ChatDerivation = ChatEvidenceClaim & { method: string; inputs: string[] };
export type ChatClassification = { observedFacts: ChatEvidenceClaim[]; derivedCalculations: ChatDerivation[]; interpretations: ChatEvidenceClaim[] };
export type ChatMessage = { id: string; role: string; text: string; symbol?: string | null; runId?: string | null; status: string; citations: string[]; classification: ChatClassification | null; sources: ChatSource[]; integrityWarning?: string | null; attemptCount?: number; failure?: null | { stage: string; code: string; message: string }; createdAt?: string; updatedAt?: string };
export type Chat = { id: string; mode: string; symbol: string | null; messages: ChatMessage[] };
export type ConversationSummary = {
  id: string;
  mode: string;
  symbol: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  title: string;
  latestMessage: null | { role: string; text: string; status: string };
};
export type ViewName = "dashboard" | "analysis" | "chat" | "portfolio" | "history";
