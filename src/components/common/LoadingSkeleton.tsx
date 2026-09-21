import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = 'h-6 w-full',
  count = 1,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse bg-slate-800/60 rounded-lg ${className}`}
        />
      ))}
    </>
  );
};

export const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="bg-[#091522] border border-[rgba(80,160,255,0.12)] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <LoadingSkeleton className="h-5 w-32" />
        <LoadingSkeleton className="h-4 w-16" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, idx) => (
          <LoadingSkeleton key={idx} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
};

