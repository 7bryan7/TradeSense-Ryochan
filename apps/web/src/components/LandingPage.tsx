import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  BarChart3,
  CheckCircle2,
  Database,
  ExternalLink,
  Github,
} from 'lucide-react';
import type { GoogleUser } from '../auth';
import { LandingNav, HexLogo, type LandingDestination } from './landing/LandingNav';
import { LandingSignInModal } from './landing/LandingSignInModal';
import '../landing-reference.css';

export const LandingPage: React.FC<{ googleClientId: string; onSignedIn: (user: GoogleUser, destination: LandingDestination) => void }> = ({ googleClientId, onSignedIn }) => {
  const [activeStage, setActiveStage] = useState(0);
  const lowerVideoSection = useRef<HTMLDivElement>(null);
  const [loadLowerVideo, setLoadLowerVideo] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [destination, setDestination] = useState<LandingDestination>('dashboard');

  useEffect(() => {
    const section = lowerVideoSection.current;
    if (!section) return;
    if (!('IntersectionObserver' in window)) {
      setLoadLowerVideo(true);
      return;
    }
    // Keep the below-the-fold video from competing with the hero download.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.01) {
        setLoadLowerVideo(true);
        observer.disconnect();
      }
    }, { threshold: 0.01, rootMargin: '400px 0px' });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    document.documentElement.classList.add('reference-landing-active');
    return () => document.documentElement.classList.remove('reference-landing-active');
  }, []);

  const handleLaunchApp = (next: LandingDestination = 'dashboard') => { setDestination(next); setSignInOpen(true); };

  const pipelineStages = [
    {
      step: '01',
      title: 'Analyze',
      desc: 'Bounded RYO research gathers selected-token metrics, market context, comparisons, and coverage status.',
      tag: 'Data Ingestion',
      icon: Database,
      badge: 'Saved Evidence',
      accentColor: '#38F997',
      capabilities: [
        'RYO analyze_token selected-token evidence',
        'RYO deep_analysis risk and profile coverage',
        'RYO scan_market and compare_tokens context',
      ],
      invariants: 'Freshness < 60s required • Stale quote auto-reject',
    },
    {
      step: '02',
      title: 'Reason',
      desc: 'Autonomous cross-referencing of bullish vs contrary evidence with cited timestamps and source provenance.',
      tag: 'Attribution',
      icon: BrainCircuit,
      badge: 'Provenance Cited',
      accentColor: '#00D2FF',
      capabilities: [
        'Schema-validated Gemini output over saved evidence',
        'Structured Bullish vs Bearish attribution weighting',
        'Persisted evidence identifiers and provenance checks',
      ],
      invariants: 'Schema validation • Every cited evidence ID is verified',
    },
    {
      step: '03',
      title: 'Predict',
      desc: 'A structured BUY, SELL, or HOLD proposal with confidence, horizon, risks, and invalidation conditions.',
      tag: 'Decision',
      icon: TrendingUp,
      badge: 'Evidence Strength',
      accentColor: '#A78BFA',
      capabilities: [
        'Schema-valid BUY, SELL, or HOLD proposal',
        'Evidence-strength confidence and stated horizon',
        'Explicit risk and invalidation conditions',
      ],
      invariants: 'A proposal is never treated as promised profit',
    },
    {
      step: '04',
      title: 'Simulate',
      desc: 'Paper execution model enforcing 10 bps fees, 10 bps adverse slippage, and strict portfolio risk limits.',
      tag: 'Paper Execution',
      icon: ShieldCheck,
      badge: 'Deterministic',
      accentColor: '#F59E0B',
      capabilities: [
        'Deterministic 10 bps maker/taker fee accounting',
        'Adverse 10 bps simulated market slippage penalty',
        'Concentration (<20%) and evidence-coverage guardrails',
      ],
      invariants: 'Zero real ledger mutations • 100% virtual paper fills',
    },
    {
      step: '05',
      title: 'Visualize',
      desc: 'Timestamped charts when supplied, saved decisions, execution provenance, and deterministic replay.',
      tag: 'Observability',
      icon: BarChart3,
      badge: 'Replay Audit',
      accentColor: '#38F997',
      capabilities: [
        'Timestamped market chart with explicit unavailable states',
        'Deterministic saved-versus-recomputed replay',
        'Persisted tool timeline and what-changed views',
      ],
      invariants: 'Read-only replay • No duplicate ledger application',
    },
  ];

  const renderStageWidget = (index: number) => {
    const mockSnapshots = [
      { label: 'Selected asset', value: 'ETH / USD', detail: 'Market snapshot · 24h window' },
      { label: 'Evidence packet', value: '12 linked observations', detail: 'RYO + model-ready context' },
      { label: 'Proposed action', value: 'HOLD · 74% confidence', detail: '7-day outlook · downside invalidation' },
      { label: 'Paper outcome', value: 'BUY simulated', detail: '$500 virtual allocation · 10 bps fee' },
      { label: 'Dashboard state', value: 'Replay verified', detail: '5 sources · 3 decision reasons' },
    ];
    const snapshot = mockSnapshots[index] ?? mockSnapshots[0];
    return (
      <div className="rounded-xl bg-[#090B12]/95 border border-[#38F997]/25 p-6 text-left shadow-[0_0_30px_rgba(56,249,151,0.06)]">
        <div className="flex items-center justify-between gap-3 mb-5">
          <span className="text-[10px] font-mono font-bold tracking-[0.16em] text-[#38F997]">MOCK WALKTHROUGH</span>
          <span className="px-2 py-1 rounded-full bg-[#38F997]/10 border border-[#38F997]/20 text-[10px] font-mono text-[#38F997]">DEMO ONLY</span>
        </div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-[rgba(251,237,224,0.45)]">{snapshot.label}</p>
        <p className="mt-2 text-xl sm:text-2xl font-bold text-[#FBEDE0]">{snapshot.value}</p>
        <p className="mt-2 text-xs text-[rgba(251,237,224,0.6)]">{snapshot.detail}</p>
        <div className="mt-6 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#38F997] to-[#00D2FF]" />
        </div>
        <p className="mt-3 text-[10px] font-mono text-[rgba(251,237,224,0.4)]">Illustrative interface state · not provider evidence</p>
      </div>
    );
  };

  return (
    <div className="reference-landing min-h-screen bg-[#0C0E17] text-[#FBEDE0] relative overflow-hidden font-sans">
      <LandingSignInModal open={signInOpen} clientId={googleClientId} destination={destination} onClose={() => setSignInOpen(false)} onSignedIn={(user) => onSignedIn(user, destination)} />
      {/* Background ambient overlays */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-radial-glow pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#38F997]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-96 -left-40 w-96 h-96 bg-[#00D2FF]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Dynamic Glass Navbar (Hero Blending + Frosted Glass on Scroll) */}
      <LandingNav onSignIn={handleLaunchApp} />

      {/* Hero Section (Fills full viewport height down to the bottom of the screen) */}
      <section className="reference-hero relative z-10 isolate overflow-hidden flex flex-col justify-center pt-24 pb-14">
        <video
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-90"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/assets/video/hero-poster.jpg"
          aria-hidden="true"
        >
          <source src="/assets/video/hero-optimized.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-[#0C0E17]/35" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0C0E17] to-transparent -z-10 pointer-events-none" />

        <div className="landing-hero-content max-w-5xl mx-auto px-4 sm:px-6 text-center my-auto">
          {/* Market Intelligence Pill */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[rgba(251,237,224,0.06)] border border-[rgba(251,237,224,0.15)] text-xs font-mono text-[rgba(251,237,224,0.85)] mb-5 animate-fade-in shadow-lg backdrop-blur-sm">
            <span>Autonomous Crypto Market Intelligence</span>
          </div>

          {/* Hero Title */}
          <h1 className="landing-hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#FBEDE0] leading-[1.1] max-w-5xl mx-auto mb-5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            Analyze. Reason. Predict. Simulate. Visualize.
          </h1>

          {/* Subtitle */}
          <p className="landing-hero-subtitle text-sm sm:text-base md:text-lg text-[rgba(251,237,224,0.9)] max-w-2xl mx-auto mb-8 leading-relaxed font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            TradeSense turns saved RYO market evidence into concise AI explanations,
            structured practice decisions, and deterministic 10 bps paper simulation.
          </p>

          {/* CTA Buttons */}
          <div className="landing-hero-actions flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => handleLaunchApp('dashboard')}
              className="px-8 py-4 rounded-full bg-[#FBEDE0] hover:bg-white text-[#161823] font-bold text-sm tracking-wide shadow-2xl transition-all duration-200 flex items-center gap-2 hover:scale-105 cursor-pointer"
            >
              <span>Open Intelligence Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleLaunchApp('candidates')}
              className="px-8 py-4 rounded-full bg-[rgba(251,237,224,0.08)] hover:bg-[rgba(251,237,224,0.14)] border border-[rgba(251,237,224,0.20)] text-[#FBEDE0] font-semibold text-sm transition-all cursor-pointer"
            >
              Explore Market Candidates
            </button>
          </div>
        </div>
      </section>

      <section className="landing-flow-bridge" aria-label="Analyse, build, predict workflow">
        <img src="/assets/analyse-build-predict-flow.png" alt="Analyse, build, predict" />
        <div className="landing-flow-network" aria-hidden="true" />
      </section>

      {/* Middle & Lower Sections with Cinematic Floating Crypto Video Background (5-Stage Architecture, Value Pillars, CTA Banner) */}
      <div ref={lowerVideoSection} className="landing-lower landing-lower-video relative isolate overflow-hidden border-t border-[rgba(251,237,224,0.08)]">
        {/* Background Video: Floating 3D Golden Crypto Coins */}
        {loadLowerVideo && <video
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-90 pointer-events-none"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/assets/video/309316_medium.mp4" type="video/mp4" />
        </video>}
        {/* Cinematic dark gradients for legibility & subtle edge feathering */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0C0E17]/55 via-[#0C0E17]/35 to-[#0C0E17]" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-[#0C0E17]/20 backdrop-blur-[1px]" aria-hidden="true" />
        <div className="landing-video-edge landing-video-edge-top" aria-hidden="true" />
        <div className="landing-video-edge landing-video-edge-bottom" aria-hidden="true" />

        {/* 5-Stage Autonomous Execution Pipeline (Dribbble & Awwwards Caliber Architectural Console) */}
        <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex mb-4 px-3 py-1 rounded-full border border-amber-300/40 bg-amber-300/10 text-amber-200 text-[10px] font-mono font-bold tracking-[0.18em]">RESEARCH WORKFLOW</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#FBEDE0] tracking-tight">
            5 Stages of Explainable AI
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[rgba(251,237,224,0.7)] mt-2.5 max-w-2xl mx-auto leading-relaxed">
            Every trading hypothesis moves sequentially through our deterministic reasoning pipeline before any virtual order is placed.
          </p>
        </div>

        {/* Interactive Step Navigator Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-6 landing-stage-nav">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeStage === idx;
            return (
              <button
                key={stage.step}
                type="button"
                onClick={() => setActiveStage(idx)}
                aria-pressed={isActive}
                aria-controls="research-stage-panel"
                className={`workflow-stage landing-stage-card p-3 rounded-xl text-left font-mono transition-all duration-200 border flex flex-col justify-between gap-2 relative overflow-hidden group ${isActive
                  ? 'bg-[#161A29] border-[#38F997]/60 shadow-[0_0_24px_rgba(56,249,151,0.15)] ring-1 ring-[#38F997]/30'
                  : 'bg-[#10131F]/80 border-[rgba(251,237,224,0.08)] hover:border-[rgba(251,237,224,0.2)] hover:bg-[#141724]'
                  }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#38F997] to-[#00D2FF]" />
                )}
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-bold ${isActive ? 'text-[#38F997]' : 'text-[rgba(251,237,224,0.4)] group-hover:text-[rgba(251,237,224,0.7)]'}`}>
                    {stage.step}
                  </span>
                  <span className={`p-1 rounded-md ${isActive ? 'bg-[#38F997]/15 text-[#38F997]' : 'text-[rgba(251,237,224,0.5)]'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div>
                  <div className={`text-sm font-bold tracking-tight ${isActive ? 'text-[#FBEDE0]' : 'text-[rgba(251,237,224,0.8)]'}`}>
                    {stage.title}
                  </div>
                  <div className="text-[10px] text-[rgba(251,237,224,0.45)] truncate">
                    {stage.tag}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Master Architectural Cockpit Card */}
        <div id="research-stage-panel" role="region" aria-label={`${pipelineStages[activeStage].title} research stage`} className="workflow-panel rounded-2xl bg-[#101321]/90 border border-[rgba(251,237,224,0.12)] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#38F997]/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Pane: Architectural Dossier */}
            <div className="lg:col-span-6 space-y-5">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#FBEDE0] tracking-tight mb-3">
                  {pipelineStages[activeStage].title}
                </h3>
                <p className="text-xs sm:text-sm text-[rgba(251,237,224,0.75)] leading-relaxed font-light">
                  {pipelineStages[activeStage].desc}
                </p>
              </div>

              {/* Capabilities List */}
              <div className="space-y-2 pt-2 border-t border-[rgba(251,237,224,0.08)]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[rgba(251,237,224,0.4)] block mb-1">
                  Engine Capabilities & Guarantees
                </span>
                {pipelineStages[activeStage].capabilities.map((cap, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[rgba(251,237,224,0.85)] font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#38F997] shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>

              {/* Invariant Guarantee Box */}
              <div className="workflow-rule p-3 rounded-xl bg-[#0B0D17] border border-[rgba(251,237,224,0.08)] flex items-center justify-between text-xs font-mono">
                <span className="text-[rgba(251,237,224,0.5)]">Deterministic Rule:</span>
                <span className="text-[#38F997] font-medium">{pipelineStages[activeStage].invariants}</span>
              </div>
            </div>

            {/* Right Pane: clearly labeled landing-page walkthrough */}
            <div className="lg:col-span-6">
              {renderStageWidget(activeStage)}
            </div>
          </div>
        </div>
      </section>

        {/* Primary Value Pillars */}
        <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto relative z-10 border-t border-[rgba(251,237,224,0.08)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#161926]/75 backdrop-blur-md border border-[rgba(251,237,224,0.12)] hover:border-[#38F997]/30 transition-all duration-300 shadow-2xl hover:-translate-y-1 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#38F997]/10 border border-[#38F997]/20 flex items-center justify-center text-[#38F997]">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#FBEDE0]">Transparent Evidence Trail</h3>
              <p className="text-xs text-[rgba(251,237,224,0.65)] leading-relaxed">
                Every recommendation includes supporting and contrary evidence, freshness timestamps, missing-data notes, and saved source references.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#161926]/75 backdrop-blur-md border border-[rgba(251,237,224,0.12)] hover:border-[#00D2FF]/30 transition-all duration-300 shadow-2xl hover:-translate-y-1 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#00D2FF]/10 border border-[#00D2FF]/20 flex items-center justify-center text-[#00D2FF]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#FBEDE0]">Strict Policy Invariants</h3>
              <p className="text-xs text-[rgba(251,237,224,0.65)] leading-relaxed">
                Deterministic guardrails reject invalid execution quotes, enforce portfolio limits, and keep every order inside the paper ledger.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#161926]/75 backdrop-blur-md border border-[rgba(251,237,224,0.12)] hover:border-amber-400/30 transition-all duration-300 shadow-2xl hover:-translate-y-1 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#FBEDE0]">Deterministic Replay</h3>
              <p className="text-xs text-[rgba(251,237,224,0.65)] leading-relaxed">
                Every autonomous run keeps its evidence IDs and inputs in the audit log, enabling deterministic read-only replay without ledger side effects.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-[rgba(251,237,224,0.08)] text-xs font-mono text-[rgba(251,237,224,0.65)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <HexLogo className="w-5 h-5" />
            <span className="font-semibold text-[#FBEDE0]">RYO-CHAN Hackathon 2026</span>
          </div>
          <a
            href="https://github.com/7bryan7/TradeSense-Ryochan"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(251,237,224,0.06)] hover:bg-[rgba(251,237,224,0.12)] border border-[rgba(251,237,224,0.15)] hover:border-[#38F997]/50 text-xs font-mono text-[#FBEDE0] hover:text-[#38F997] transition-all duration-200 group shadow-sm"
          >
            <Github className="w-4 h-4 text-[#38F997] group-hover:scale-110 transition-transform" />
            <span className="font-medium">Git Source Code</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
