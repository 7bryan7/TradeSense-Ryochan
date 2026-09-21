import React from 'react';
import { Search, Brain, TrendingUp, Zap, Layout } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Analyse',
      desc: 'Gather real-time data, news, and on-chain signals using RYO tools.',
      icon: Search,
    },
    {
      num: '02',
      title: 'Reason',
      desc: 'The AI evaluates the evidence, checks risks and applies risk policies.',
      icon: Brain,
    },
    {
      num: '03',
      title: 'Predict',
      desc: 'Forecasts possible outcomes using advanced models and market context.',
      icon: TrendingUp,
    },
    {
      num: '04',
      title: 'Simulate',
      desc: 'Runs a paper trade to show potential results and portfolio impact.',
      icon: Zap,
    },
    {
      num: '05',
      title: 'Visualize',
      desc: 'See the full story — charts, explanation, simulation and more.',
      icon: Layout,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-6 border-t border-[rgba(80,160,255,0.1)] bg-[#050B14]/40">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
              Section 02 — How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              From market data to smart decisions
            </h2>
          </div>
          <p className="text-sm text-slate-400 font-mono">
            Autonomous execution in 5 simple steps.
          </p>
        </div>

        {/* 5 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="bg-[#091522] border border-[rgba(80,160,255,0.14)] rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-200"
              >
                {/* Step Number Top */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-cyan-400 transition-colors">
                    {s.num}. {s.title}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

