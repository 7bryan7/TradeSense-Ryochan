import React from 'react';
import { ScanSchedule, ScheduleCadence } from '../../types/schedule';
import { Clock, Play, Pause, RefreshCw, CheckCircle2 } from 'lucide-react';

interface RecurringScanCardProps {
  schedule: ScanSchedule;
  countdownFormatted: string;
  onToggle: () => void;
  onCadenceChange: (cadence: ScheduleCadence) => void;
}

export const RecurringScanCard: React.FC<RecurringScanCardProps> = ({
  schedule,
  countdownFormatted,
  onToggle,
  onCadenceChange,
}) => {
  return (
    <div className="bg-[#161926]/90 border border-[rgba(251,237,224,0.10)] rounded-2xl p-5 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#38F997]/10 text-[#38F997] border border-[#38F997]/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#FBEDE0] tracking-tight">
                Automated Market Scan
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#10131F] border border-[rgba(251,237,224,0.15)] text-[#00D2FF]">
                Autonomous Worker
              </span>
            </div>
            <p className="text-xs text-[rgba(251,237,224,0.6)] font-mono mt-0.5">
              The agent scans and reasons across active pairs based on your schedule.
            </p>
          </div>
        </div>

        {/* Status Toggle & Cadence */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Enabled Switch */}
          <div className="flex items-center gap-2.5 bg-[#10131F] px-3 py-1.5 rounded-xl border border-[rgba(251,237,224,0.12)]">
            <span className="text-xs font-mono font-semibold text-[rgba(251,237,224,0.8)]">
              {schedule.enabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              type="button"
              onClick={onToggle}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                schedule.enabled ? 'bg-[#38F997]' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-[#0C0E17] w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  schedule.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Cadence Dropdown */}
          <div className="bg-[#10131F] px-3 py-1.5 rounded-xl border border-[rgba(251,237,224,0.12)] text-xs font-mono">
            <span className="text-[rgba(251,237,224,0.5)] mr-2">Cadence:</span>
            <select
              aria-label="Scan cadence frequency"
              value={schedule.cadenceValue}
              onChange={e => onCadenceChange(e.target.value as ScheduleCadence)}
              className="bg-transparent text-[#00D2FF] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="1m" className="bg-[#161926]">Every 1 minute</option>
              <option value="5m" className="bg-[#161926]">Every 5 minutes</option>
              <option value="15m" className="bg-[#161926]">Every 15 minutes</option>
              <option value="1h" className="bg-[#161926]">Every 1 hour</option>
            </select>
          </div>

          {/* Last Run & Next Run timestamps */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono border-l border-[rgba(251,237,224,0.10)] pl-4">
            <div>
              <span className="text-[10px] text-[rgba(251,237,224,0.4)] uppercase block">Next Scan</span>
              <span className="text-[#38F997] font-semibold">{countdownFormatted}</span>
            </div>
            <div>
              <span className="text-[10px] text-[rgba(251,237,224,0.4)] uppercase block">Last Run</span>
              <span className="text-[rgba(251,237,224,0.7)]">{schedule.lastRunTimestamp}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={onToggle}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
              schedule.enabled
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
                : 'bg-[#38F997]/15 border border-[#38F997]/30 text-[#38F997] hover:bg-[#38F997]/25'
            }`}
          >
            {schedule.enabled ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Stop Scan</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Start Scan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecurringScanCard;
