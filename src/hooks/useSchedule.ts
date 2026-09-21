import { useState, useEffect } from 'react';
import { ScanSchedule, ScheduleCadence } from '../types/schedule';
import { scheduleService } from '../services/scheduleService';
import { mockSchedule } from '../data/schedules';

export function useSchedule() {
  const [schedule, setSchedule] = useState<ScanSchedule>(mockSchedule);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(270); // ~4.5m remaining

  useEffect(() => {
    async function load() {
      const data = await scheduleService.getSchedule();
      setSchedule(data);
    }
    load();
  }, []);

  useEffect(() => {
    if (!schedule.enabled) return;
    const interval = setInterval(() => {
      setCountdownSeconds(prev => (prev <= 1 ? 300 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [schedule.enabled]);

  const toggleEnabled = async () => {
    const updated = await scheduleService.toggleSchedule(!schedule.enabled);
    setSchedule(updated);
  };

  const setCadence = async (cadence: ScheduleCadence) => {
    const updated = await scheduleService.updateCadence(cadence);
    setSchedule(updated);
  };

  const formatCountdown = () => {
    const mins = Math.floor(countdownSeconds / 60);
    const secs = countdownSeconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return {
    schedule,
    countdownSeconds,
    formatCountdown,
    toggleEnabled,
    setCadence,
  };
}

