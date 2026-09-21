import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, ShieldAlert, Clock, Ban } from 'lucide-react';
import { SafetyStatus } from '../../types/safety';

interface StatusBadgeProps {
  status: SafetyStatus;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const displayLabel = label || status;

  const config = {
    SAFE: {
      bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      icon: <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    WARNING: {
      bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
      icon: <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    UNKNOWN: {
      bg: 'bg-slate-700/30 border-slate-600/40 text-slate-400',
      icon: <HelpCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    BLOCKED: {
      bg: 'bg-rose-500/20 border-rose-500/50 text-rose-400 font-bold animate-pulse',
      icon: <ShieldAlert className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    STALE: {
      bg: 'bg-orange-500/15 border-orange-500/40 text-orange-400',
      icon: <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    UNAVAILABLE: {
      bg: 'bg-slate-800/60 border-slate-700/50 text-slate-400',
      icon: <Ban className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
  }[status] || {
    bg: 'bg-slate-800 border-slate-700 text-slate-300',
    icon: <HelpCircle className="w-3 h-3" />,
  };

  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border font-mono uppercase tracking-wider font-semibold ${config.bg} ${sizeClass}`}
    >
      {config.icon}
      <span>{displayLabel}</span>
    </span>
  );
};

