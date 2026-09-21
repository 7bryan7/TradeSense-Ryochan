import { ScanSchedule } from '../types/schedule';

export const mockSchedule: ScanSchedule = {
  id: 'sched-primary-01',
  enabled: true,
  cadence: 'Every 5 minutes',
  cadenceValue: '5m',
  lastRunTimestamp: '20 Sep 2026, 14:54 UTC',
  nextRunTimestamp: '20 Sep 2026, 14:59 UTC',
  targetTokens: ['btc', 'eth', 'sol'],
  maxDailyRuns: 288,
  completedRunsToday: 178,
  autoPaperTrade: true,
};

