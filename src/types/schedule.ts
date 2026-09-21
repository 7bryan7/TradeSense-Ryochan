export type ScheduleCadence = '1m' | '5m' | '15m' | '1h' | '4h';

export interface ScanSchedule {
  id: string;
  enabled: boolean;
  cadence: string; // e.g. "Every 5 minutes"
  cadenceValue: ScheduleCadence;
  lastRunTimestamp: string;
  nextRunTimestamp: string;
  targetTokens: string[];
  maxDailyRuns: number;
  completedRunsToday: number;
  autoPaperTrade: boolean;
}

