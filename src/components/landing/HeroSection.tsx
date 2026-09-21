import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Sparkles, TrendingUp, Brain, Shield, Zap, Eye } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const steps = [
    { label: 'Analyse', icon: Sparkles },
    { label: 'Reason', icon: Brain },
    { label: 'Predict', icon: TrendingUp },
    { label: 'Simulate', icon: Zap },
    { label: 'Visualize', icon: Eye },
  ];

  return (
    <section id="hero" className="relative pt-12 pb-24 px-6 overflow-hidden">
      {/* Background glow radial */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left 7 Cols: Typography & CTAs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            AI CRYPTO MARKET ANALYST
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Analyse. Reason. <br />
            Predict. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Simulate.</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Visualize.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
            TradeSense is your autonomous AI agent that scans the crypto market, analyses real-time data, explains its reasoning, predicts outcomes, simulates trades and visualizes the impact — all in one place.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide rounded-xl shadow-glow-cyan transition-all duration-200 active:scale-95"
            >
              <span>Launch TradeSense</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-6 py-3.5 bg-[#091522] hover:bg-[#0c1a29] border border-slate-700 hover:border-cyan-500/40 text-slate-200 font-semibold text-sm rounded-xl transition-all duration-200"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span>See how it works</span>
            </a>
          </div>

          {/* Track Badges */}
          <div className="flex items-center gap-4 pt-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Track 01: Autonomous Agents
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Track 02: Dashboards & Interfaces
            </span>
          </div>
        </div>

        {/* Right 5 Cols: Hologram 3D Glowing Card & Steps matching mockup */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          {/* Circular Pedestal Glow Effect */}
          <div className="absolute -bottom-10 w-72 h-72 rounded-full border border-cyan-500/20 bg-cyan-500/5 blur-sm" />
          <div className="absolute -bottom-4 w-60 h-20 rounded-full border border-cyan-500/40 bg-gradient-to-t from-cyan-500/20 to-transparent blur-md" />

          {/* Floating AI Analysis Card */}
          <div className="relative z-10 w-full max-w-sm bg-[#091522]/90 border border-cyan-500/40 rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(0,210,255,0.25)] backdrop-blur-xl transform hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Analysis
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                BTC / USD
              </span>
            </div>

            {/* Decision Pill */}
            <div className="bg-[#050B14] border border-emerald-500/40 rounded-2xl p-4 mb-4 flex items-center justify-between">
              <div>
                <span className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
                  BUY
                </span>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  High Evidence Strength
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30 inline-flex items-center gap-1">
                  82% confidence
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Mini glowing chart graphic */}
            <div className="h-24 w-full flex items-end justify-between gap-1 pt-4 border-t border-slate-800">
              {[35, 42, 38, 55, 62, 58, 72, 85, 80, 94, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    style={{ height: `${h}%` }}
                    className="w-full bg-gradient-to-t from-emerald-500/30 to-emerald-400 rounded-t-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Floating Steps Badges on right side */}
          <div className="hidden sm:flex flex-col gap-2.5 absolute -right-6 top-8 z-20">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-[#050B14]/90 border border-[rgba(80,160,255,0.2)] px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md text-xs font-mono text-slate-300"
                >
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

