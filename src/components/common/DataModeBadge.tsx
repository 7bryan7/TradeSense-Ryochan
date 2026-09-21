import React from 'react';
import { Database, Zap } from 'lucide-react';

interface DataModeBadgeProps {
  mode?: 'LIVE' | 'FIXTURE';
  onToggle?: () => void;
  interactive?: boolean;
}

export const DataModeBadge: React.FC<DataModeBadgeProps> = ({
  mode = 'FIXTURE',
  onToggle,
  interactive = false,
}) => {
  const isLive = mode === 'LIVE';

  return (
    <button
      type="button"
      onClick={interactive ? onToggle : undefined}
      title={
        interactive
          ? 'Click to toggle between FIXTURE (safe mock) and LIVE simulation'
          : `Current data mode: ${mode}`
      }
      disabled={!interactive}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 border ${
        isLive
          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
          : 'bg-indigo-950/70 border-indigo-500/40 text-indigo-300 shadow-[0_0_12px_rgba(129,140,248,0.2)]'
      } ${interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`}
    >
      {isLive ? (
        <>
          <Zap className="w-3 h-3 text-emerald-400" />
          <span>LIVE</span>
        </>
      ) : (
        <>
          <Database className="w-3 h-3 text-indigo-400" />
          <span>FIXTURE</span>
        </>
      )}
    </button>
  );
};

