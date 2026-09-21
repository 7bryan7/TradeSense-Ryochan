import React from 'react';
import { ShieldCheck, ArrowUpRight, DollarSign, Percent } from 'lucide-react';

export const SimulationSection: React.FC = () => {
  return (
    <section className="py-20 px-6 border-t border-[rgba(80,160,255,0.1)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left 5 Cols: Copy */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              Section 05 — Simulation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Deterministic paper execution engine
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Validate research without putting real capital at risk. TradeSense models 10 bps fees, realistic adverse slippage, and strict risk caps before recording transactions to a durable ledger.
            </p>

            <div className="space-y-2 pt-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Default $10,000 starting virtual balance</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Max 5% equity allocation per decision</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Max 20% aggregate token exposure cap</span>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Mock Simulation Card Card Showcase */}
          <div className="lg:col-span-7 bg-[#091522] border border-[rgba(80,160,255,0.16)] rounded-3xl p-6 shadow-panel">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                Paper Trade Fill Confirmation
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                Virtual • No Real Funds
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="bg-[#050B14] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Virtual Cash</span>
                <span className="text-sm font-bold font-mono text-white mt-0.5 block">$9,842.31</span>
              </div>
              <div className="bg-[#050B14] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Position Size</span>
                <span className="text-sm font-bold font-mono text-white mt-0.5 block">0.0089 BTC</span>
              </div>
              <div className="bg-[#050B14] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Entry Fill</span>
                <span className="text-sm font-bold font-mono text-white mt-0.5 block">$112,482.31</span>
              </div>
              <div className="bg-[#050B14] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Simulated P&L</span>
                <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">+$42.18 (+4.2%)</span>
              </div>
            </div>

            <div className="p-3 bg-[#0c1a29]/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400">Take Profit: $116,200 (+3.3%)</span>
              <span className="text-rose-400">Stop Loss: $108,500 (-3.5%)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

