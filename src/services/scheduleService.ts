import { ScanSchedule, ScheduleCadence } from '../types/schedule';
import { mockSchedule } from '../data/schedules';

let currentSchedule: ScanSchedule = { ...mockSchedule };

export const scheduleService = {
  async getSchedule(): Promise<ScanSchedule> {
    return { ...currentSchedule };
  },

  async toggleSchedule(enabled: boolean): Promise<ScanSchedule> {
    currentSchedule = {
      ...currentSchedule,
      enabled,
      lastRunTimestamp: enabled ? currentSchedule.lastRunTimestamp : 'Stopped',
      nextRunTimestamp: enabled ? 'In 5 minutes' : 'Paused',
    };
    return { ...currentSchedule };
  },

  async updateCadence(cadence: ScheduleCadence): Promise<ScanSchedule> {
    const labelMap: Record<ScheduleCadence, string> = {
      '1m': 'Every 1 minute',
      '5m': 'Every 5 minutes',
      '15m': 'Every 15 minutes',
      '1h': 'Every 1 hour',
      '4h': 'Every 4 hours',
    };
    currentSchedule = {
      ...currentSchedule,
      cadenceValue: cadence,
      cadence: labelMap[cadence],
    };
    return { ...currentSchedule };
  },
};

