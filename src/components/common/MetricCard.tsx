import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  trend,
  trendValue,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`bg-[#0c1a29]/80 border border-[rgba(80,160,255,0.14)] rounded-xl p-4 transition-all duration-200 hover:border-[rgba(80,160,255,0.28)] hover:bg-[#102235]/90 ${className}`}
    >
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
        <span className="font-medium tracking-wide uppercase">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xl font-bold font-mono text-slate-100 tracking-tight">
          {value}
        </span>
        {trend && trendValue && (
          <span
            className={`flex items-center text-xs font-semibold ${
              trend === 'up'
                ? 'text-emerald-400'
                : trend === 'down'
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
            {trendValue}
          </span>
        )}
      </div>
      {subValue && (
        <div className="text-[11px] text-slate-400 mt-1 truncate">{subValue}</div>
      )}
    </div>
  );
};

