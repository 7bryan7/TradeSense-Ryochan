import React from 'react';
import { Inbox, AlertCircle, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = <Inbox className="w-8 h-8 text-slate-500" />,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#091522]/50 border border-dashed border-slate-700/50 rounded-xl my-4">
      <div className="p-3 bg-slate-800/60 rounded-full mb-3 text-slate-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mt-1 mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 rounded-lg hover:bg-cyan-900/60 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Analysis Unavailable',
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-rose-950/20 border border-rose-500/30 rounded-xl my-4">
      <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-full mb-2.5">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-rose-300">{title}</h4>
      <p className="text-xs text-slate-300 max-w-md mt-1 mb-3">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Analysis
        </button>
      )}
    </div>
  );
};

