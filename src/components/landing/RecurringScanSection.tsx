import React from 'react';
import { Clock, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecurringScanSection: React.FC = () => {
  return (
    <section className="py-20 px-6 border-t border-[rgba(80,160,255,0.1)]">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-cyan-950/40 via-[#091522] to-blue-950/40 border border-cyan-500/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-panel">
          {/* Subtle background ring */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              Section 09 — Recurring Autonomous Agent
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Continuous market surveillance on your schedule
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Configure bounded scans every 5 minutes with automatic safety validation, configurable exposure limits, and instant paper execution.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider rounded-xl shadow-glow-cyan transition-all"
              >
                OPEN RECURRING SCANNER
              </Link>
              <span className="text-xs font-mono text-slate-400">
                Safe demo mode • Client-side simulation
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

