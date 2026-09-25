import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  BarChart3,
  Wallet,
  CheckCircle2,
  Cpu,
  Layers,
  Database,
  ExternalLink,
  Github,
} from 'lucide-react';
import { LandingNav, HexLogo } from '../components/landing/LandingNav';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const [activeStage, setActiveStage] = useState(0);
  const lowerVideoSection = useRef<HTMLDivElement>(null);
  const [loadLowerVideo, setLoadLowerVideo] = useState(false);

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
    }, { threshold: 0.01 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();

  const handleLaunchApp = (route = '/dashboard') => {
    if (isAuthenticated) {
      navigate(route);
    } else {
      openAuthModal(
        'Please sign in with Google first to receive your Unique Trader ID and access the terminal.',
        route
      );
    }
  };

  const pipelineStages = [
    {
      step: '01',
      title: 'Analyse',
      desc: 'Multi-source ingestion of live orderbook depth, funding rates, social sentiment, and volatility metrics.',
      tag: 'Data Ingestion',
      icon: Database,
      badge: '14ms Telemetry',
      accentColor: '#38F997',
      capabilities: [
        'Real-time Binance L2 orderbook depth streaming',
        'Cross-exchange funding rate & Open Interest monitoring',
        'CryptoPanic news sentiment & fear/greed ingestion',
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
        'Multi-modal LLM reasoning with cited timestamp proofs',
        'Structured Bullish vs Bearish attribution weighting',
        'Immutable cryptographic evidence hash validation',
      ],
      invariants: 'Zero hallucination constraint • Evidence cited provenance',
    },
    {
      step: '03',
      title: 'Predict',
      desc: 'Calibrated directional confidence (BUY / SELL / HOLD) with explicit Take-Profit and Stop-Loss boundaries.',
      tag: 'Probabilistic',
      icon: TrendingUp,
      badge: 'Calibrated Odds',
      accentColor: '#A78BFA',
      capabilities: [
        'Softmax multi-class calibrated probability scoring',
        'Dynamic Take-Profit (+1.53%) target calculation',
        'Stop-Loss (-1.14%) defensive invalidation threshold',
      ],
      invariants: 'Strict Risk/Reward ratio > 1:1.2 enforced',
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
        'Concentration (<20%) & honeypot safety guardrails',
      ],
      invariants: 'Zero real ledger mutations • 100% virtual paper fills',
    },
    {
      step: '05',
      title: 'Visualize',
      desc: 'Real-time candlestick charts with execution price markers, interactive telemetry, and deterministic replay.',
      tag: 'Observability',
      icon: BarChart3,
      badge: 'Replay Audit',
      accentColor: '#38F997',
      capabilities: [
        'Interactive candlestick chart with execution fill markers',
        'Deterministic step replay audit trail scrubber',
        'Complete telemetry logs & what-changed delta views',
      ],
      invariants: 'Immutable execution hash • Step-by-step verifiable replay',
    },
  ];

  const renderStageWidget = (index: number) => {
    switch (index) {
      case 0: // Analyse - Data Ingestion
        return (
          <div className="rounded-xl bg-[#090B12] border border-[rgba(251,237,224,0.12)] p-4 sm:p-5 font-mono text-xs space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(251,237,224,0.08)]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38F997] animate-pulse" />
                <span className="text-[#FBEDE0] font-bold">L2 ORDERBOOK DEPTH STREAM</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#38F997]/10 text-[#38F997] border border-[#38F997]/30">
                14ms LATENCY
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-rose-400/85">
                <span>$112,620.00</span>
                <span>28.45 BTC</span>
                <div className="w-24 bg-rose-500/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[65%]" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-rose-400">
                <span>$112,540.00</span>
                <span>14.20 BTC</span>
                <div className="w-24 bg-rose-500/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[40%]" />
                </div>
              </div>

              <div className="py-1 px-2.5 rounded bg-[#10131F] border border-[rgba(251,237,224,0.10)] flex items-center justify-between text-xs font-bold text-[#FBEDE0]">
                <span>MARK: $112,482.31</span>
                <span className="text-[#38F997] text-[10px] font-normal">Spread: 0.01%</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#38F997]">
                <span>$112,440.00</span>
                <span>32.80 BTC</span>
                <div className="w-24 bg-[#38F997]/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#38F997] h-full w-[80%]" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#38F997]/85">
                <span>$112,380.00</span>
                <span>49.10 BTC</span>
                <div className="w-24 bg-[#38F997]/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#38F997] h-full w-[95%]" />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[rgba(251,237,224,0.06)] grid grid-cols-2 gap-2 text-[10px] text-[rgba(251,237,224,0.6)]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38F997]" />
                <span>Binance L2 Depth</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38F997]" />
                <span>CryptoPanic RSS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38F997]" />
                <span>CoinGecko API</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38F997]" />
                <span>Fear & Greed (74)</span>
              </div>
            </div>
          </div>
        );

      case 1: // Reason - Attribution
        return (
          <div className="rounded-xl bg-[#090B12] border border-[rgba(251,237,224,0.12)] p-4 sm:p-5 font-mono text-xs space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(251,237,224,0.08)]">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-[#00D2FF]" />
                <span className="text-[#FBEDE0] font-bold">CHAIN-OF-THOUGHT ATTRIBUTION</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/30">
                PROVENANCE CITED
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-[#121522] border border-[rgba(251,237,224,0.08)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#38F997] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Bullish Factor #01
                  </span>
                  <span className="text-[10px] text-[rgba(251,237,224,0.4)]">Weight: +0.84</span>
                </div>
                <p className="text-[rgba(251,237,224,0.75)] font-sans text-xs">
                  Orderbook liquidity wall at $111,800 absorbs 82 BTC with aggressive limit absorption.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#121522] border border-[rgba(251,237,224,0.08)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#38F997] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Bullish Factor #02
                  </span>
                  <span className="text-[10px] text-[rgba(251,237,224,0.4)]">Weight: +0.79</span>
                </div>
                <p className="text-[rgba(251,237,224,0.75)] font-sans text-xs">
                  Spot Cumulative Volume Delta (CVD) expanded +14.2% over past 4 hours.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#121522] border border-[rgba(251,237,224,0.08)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-[9px]">!</span>
                    Contrary Counter-Evidence
                  </span>
                  <span className="text-[10px] text-[rgba(251,237,224,0.4)]">Weight: -0.31</span>
                </div>
                <p className="text-[rgba(251,237,224,0.75)] font-sans text-xs">
                  Perpetual futures funding rate slightly stretched (+0.028%), minor long-squeeze risk.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[rgba(251,237,224,0.06)] flex items-center justify-between text-[10px] text-[rgba(251,237,224,0.5)]">
              <span>Evidence Hash: 0x9b4a...e12d</span>
              <span className="text-[#38F997]">Net Verdict: STRONG BUY</span>
            </div>
          </div>
        );

      case 2: // Predict - Probabilistic
        return (
          <div className="rounded-xl bg-[#090B12] border border-[rgba(251,237,224,0.12)] p-4 sm:p-5 font-mono text-xs space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(251,237,224,0.08)]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#38F997]" />
                <span className="text-[#FBEDE0] font-bold">CALIBRATED PROBABILITY ODDS</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#38F997]/10 text-[#38F997] border border-[#38F997]/30">
                PROBABILISTIC GAUGE
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#38F997]">BUY: 82%</span>
                <span className="text-amber-400">HOLD: 12%</span>
                <span className="text-rose-400">SELL: 6%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#161824] overflow-hidden flex p-0.5 gap-0.5">
                <div className="bg-[#38F997] h-full rounded-l-full" style={{ width: '82%' }} />
                <div className="bg-amber-400 h-full" style={{ width: '12%' }} />
                <div className="bg-rose-400 h-full rounded-r-full" style={{ width: '6%' }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-[#10131F] border border-[#38F997]/25">
                <span className="text-[10px] text-[rgba(251,237,224,0.5)] block mb-1">TAKE-PROFIT TARGET</span>
                <span className="text-sm font-bold text-[#38F997] block">$114,200.00</span>
                <span className="text-[10px] text-[#38F997]/80">+1.53% Expected Gain</span>
              </div>
              <div className="p-3 rounded-xl bg-[#10131F] border border-rose-400/25">
                <span className="text-[10px] text-[rgba(251,237,224,0.5)] block mb-1">STOP-LOSS GUARDRAIL</span>
                <span className="text-sm font-bold text-rose-400 block">$111,200.00</span>
                <span className="text-[10px] text-rose-400/80">-1.14% Max Risk</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[rgba(251,237,224,0.06)] flex items-center justify-between text-[10px] text-[rgba(251,237,224,0.5)]">
              <span>Calibrated Odds Engine: v2.4</span>
              <span className="text-[#38F997]">Risk/Reward: 1 : 1.34</span>
            </div>
          </div>
        );

      case 3: // Simulate - Paper Execution
        return (
          <div className="rounded-xl bg-[#090B12] border border-[rgba(251,237,224,0.12)] p-4 sm:p-5 font-mono text-xs space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(251,237,224,0.08)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-[#FBEDE0] font-bold">10 BPS SIMULATED PAPER EXECUTION</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30">
                PAPER MODEL
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between py-1 border-b border-[rgba(251,237,224,0.06)]">
                <span className="text-[rgba(251,237,224,0.6)]">Execution Benchmark Price</span>
                <span className="font-bold text-[#FBEDE0]">$112,482.31</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[rgba(251,237,224,0.06)]">
                <span className="text-amber-400">Adverse Slippage Model (10 bps)</span>
                <span className="text-amber-400 font-bold">+$112.48</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[rgba(251,237,224,0.06)]">
                <span className="text-[#00D2FF]">Simulated Fill Price</span>
                <span className="text-[#00D2FF] font-bold">$112,594.79</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[rgba(251,237,224,0.6)]">Taker Execution Fee (10 bps)</span>
                <span className="text-[rgba(251,237,224,0.85)]">$11.26</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[rgba(251,237,224,0.06)] space-y-1 text-[10px]">
              <div className="flex items-center justify-between text-[#38F997]">
                <span>✓ Quote Freshness: 0.8s (Max 60s)</span>
                <span>PASSED</span>
              </div>
              <div className="flex items-center justify-between text-[#38F997]">
                <span>✓ Token Concentration: 8.5% (Max 20.0%)</span>
                <span>PASSED</span>
              </div>
              <div className="flex items-center justify-between text-[#38F997]">
                <span>✓ Honeypot Security Screening</span>
                <span>PASSED</span>
              </div>
            </div>
          </div>
        );

      case 4: // Visualize - Observability
        return (
          <div className="rounded-xl bg-[#090B12] border border-[rgba(251,237,224,0.12)] p-4 sm:p-5 font-mono text-xs space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(251,237,224,0.08)]">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#38F997]" />
                <span className="text-[#FBEDE0] font-bold">REAL-TIME TELEMETRY & REPLAY</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#38F997]/10 text-[#38F997] border border-[#38F997]/30">
                1M CANDLESTICK
              </span>
            </div>

            <div className="relative h-28 w-full bg-[#10131F] rounded-lg p-2 flex flex-col justify-between overflow-hidden border border-[rgba(251,237,224,0.06)]">
              <svg className="w-full h-full" viewBox="0 0 300 80" fill="none" preserveAspectRatio="none">
                <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(251,237,224,0.05)" strokeDasharray="3 3" />
                <line x1="0" y1="40" x2="300" y2="40" stroke="rgba(251,237,224,0.05)" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(251,237,224,0.05)" strokeDasharray="3 3" />

                <line x1="20" y1="45" x2="20" y2="65" stroke="#F87171" strokeWidth="1" />
                <rect x="17" y="50" width="6" height="12" fill="#F87171" />
                <line x1="45" y1="40" x2="45" y2="60" stroke="#38F997" strokeWidth="1" />
                <rect x="42" y="42" width="6" height="14" fill="#38F997" />
                <line x1="70" y1="35" x2="70" y2="55" stroke="#38F997" strokeWidth="1" />
                <rect x="67" y="38" width="6" height="12" fill="#38F997" />
                <line x1="95" y1="30" x2="95" y2="50" stroke="#F87171" strokeWidth="1" />
                <rect x="92" y="32" width="6" height="14" fill="#F87171" />
                <line x1="120" y1="25" x2="120" y2="48" stroke="#38F997" strokeWidth="1" />
                <rect x="117" y="28" width="6" height="16" fill="#38F997" />
                <line x1="150" y1="18" x2="150" y2="42" stroke="#38F997" strokeWidth="1" />
                <rect x="147" y="20" width="6" height="18" fill="#38F997" />
                <line x1="180" y1="15" x2="180" y2="35" stroke="#38F997" strokeWidth="1" />
                <rect x="177" y="16" width="6" height="14" fill="#38F997" />
                <line x1="210" y1="12" x2="210" y2="32" stroke="#F87171" strokeWidth="1" />
                <rect x="207" y="15" width="6" height="12" fill="#F87171" />
                <line x1="240" y1="8" x2="240" y2="28" stroke="#38F997" strokeWidth="1" />
                <rect x="237" y="10" width="6" height="15" fill="#38F997" />
                <line x1="270" y1="5" x2="270" y2="22" stroke="#38F997" strokeWidth="1" />
                <rect x="267" y="6" width="6" height="12" fill="#38F997" />

                <path d="M 20 58 Q 70 45, 120 35 T 210 20 T 270 12" fill="none" stroke="#00D2FF" strokeWidth="1.5" />
                <circle cx="150" cy="22" r="3.5" fill="#FBEDE0" stroke="#38F997" strokeWidth="1.5" />
              </svg>
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#38F997]/20 border border-[#38F997]/40 text-[9px] text-[#38F997] font-bold">
                BUY FILL @ $112,594.79
              </div>
            </div>

            <div className="pt-2 border-t border-[rgba(251,237,224,0.06)] flex items-center justify-between text-[10px] text-[rgba(251,237,224,0.6)]">
              <span>Deterministic Audit: #A904</span>
              <span className="text-[#38F997] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38F997]" /> Replay Active @ 1.0x
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0E17] text-[#FBEDE0] relative overflow-hidden font-sans">
      {/* Background ambient overlays */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-radial-glow pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#38F997]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-96 -left-40 w-96 h-96 bg-[#00D2FF]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Dynamic Glass Navbar (Hero Blending + Frosted Glass on Scroll) */}
      <LandingNav />

      {/* Hero Section (Fills full viewport height down to the bottom of the screen) */}
      <section className="relative z-10 isolate overflow-hidden min-h-screen min-h-[100dvh] flex flex-col justify-center pt-24 pb-14">
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
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0C0E17] to-transparent -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center my-auto">
          {/* Market Intelligence Pill */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[rgba(251,237,224,0.06)] border border-[rgba(251,237,224,0.15)] text-xs font-mono text-[rgba(251,237,224,0.85)] mb-5 animate-fade-in shadow-lg backdrop-blur-sm">
            <span>Autonomous Crypto Market Intelligence</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#FBEDE0] leading-[1.1] max-w-5xl mx-auto mb-5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            Analyse. Reason. Predict. Simulate. Visualize.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-[rgba(251,237,224,0.9)] max-w-2xl mx-auto mb-8 leading-relaxed font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            TradeSense replaces black-box crypto trading bots with explainable multi-modal evidence ingestion,
            transparent chain-of-thought thesis synthesis, and deterministic 10 bps paper simulation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => handleLaunchApp('/dashboard')}
              className="px-8 py-4 rounded-full bg-[#FBEDE0] hover:bg-white text-[#161823] font-bold text-sm tracking-wide shadow-2xl transition-all duration-200 flex items-center gap-2 hover:scale-105 cursor-pointer"
            >
              <span>Open Intelligence Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleLaunchApp('/markets')}
              className="px-8 py-4 rounded-full bg-[rgba(251,237,224,0.08)] hover:bg-[rgba(251,237,224,0.14)] border border-[rgba(251,237,224,0.20)] text-[#FBEDE0] font-semibold text-sm transition-all cursor-pointer"
            >
              Explore Market Candidates
            </button>
          </div>
        </div>
      </section>

      {/* Middle & Lower Sections with Cinematic Floating Crypto Video Background (5-Stage Architecture, Value Pillars, CTA Banner) */}
      <div ref={lowerVideoSection} className="relative isolate overflow-hidden border-t border-[rgba(251,237,224,0.08)]">
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0C0E17] via-[#0C0E17]/45 to-[#0C0E17]" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-[#0C0E17]/20 backdrop-blur-[1px]" aria-hidden="true" />

        {/* 5-Stage Autonomous Execution Pipeline (Dribbble & Awwwards Caliber Architectural Console) */}
        <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#FBEDE0] tracking-tight">
            5 Stages of Explainable AI
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[rgba(251,237,224,0.7)] mt-2.5 max-w-2xl mx-auto leading-relaxed">
            Every trading hypothesis moves sequentially through our deterministic reasoning pipeline before any virtual order is placed.
          </p>
        </div>

        {/* Interactive Step Navigator Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-6">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeStage === idx;
            return (
              <button
                key={stage.step}
                type="button"
                onClick={() => setActiveStage(idx)}
                className={`p-3 rounded-xl text-left font-mono transition-all duration-200 border flex flex-col justify-between gap-2 relative overflow-hidden group ${isActive
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
        <div className="rounded-2xl bg-[#101321]/90 border border-[rgba(251,237,224,0.12)] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
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
              <div className="p-3 rounded-xl bg-[#0B0D17] border border-[rgba(251,237,224,0.08)] flex items-center justify-between text-xs font-mono">
                <span className="text-[rgba(251,237,224,0.5)]">Deterministic Rule:</span>
                <span className="text-[#38F997] font-medium">{pipelineStages[activeStage].invariants}</span>
              </div>
            </div>

            {/* Right Pane: Live Telemetry Micro-Widget */}
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
              <h3 className="text-base font-bold text-[#FBEDE0]">Transparent Chain of Thought</h3>
              <p className="text-xs text-[rgba(251,237,224,0.65)] leading-relaxed">
                No black-box predictions. Every recommendation includes contrasting supporting vs contrary evidence, freshness timestamps, and verifiable source references.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#161926]/75 backdrop-blur-md border border-[rgba(251,237,224,0.12)] hover:border-[#00D2FF]/30 transition-all duration-300 shadow-2xl hover:-translate-y-1 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#00D2FF]/10 border border-[#00D2FF]/20 flex items-center justify-center text-[#00D2FF]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#FBEDE0]">Strict Policy Invariants</h3>
              <p className="text-xs text-[rgba(251,237,224,0.65)] leading-relaxed">
                Rigid risk guardrails automatically block trades when quotes exceed 60-second freshness, when token concentration exceeds 20%, or when honeypot indicators are detected.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#161926]/75 backdrop-blur-md border border-[rgba(251,237,224,0.12)] hover:border-amber-400/30 transition-all duration-300 shadow-2xl hover:-translate-y-1 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#FBEDE0]">Deterministic Replay</h3>
              <p className="text-xs text-[rgba(251,237,224,0.65)] leading-relaxed">
                Every autonomous run is assigned an immutable hash and saved to the audit log, enabling full deterministic step replay without ledger side-effects.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="pb-24 pt-4 px-4 sm:px-6 max-w-4xl mx-auto text-center relative z-10">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#161926]/90 via-[#1C2030]/90 to-[#141724]/90 backdrop-blur-xl border border-[rgba(251,237,224,0.18)] shadow-2xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FBEDE0]">
              Experience Autonomous Trading Intelligence
            </h2>
            <p className="text-sm text-[rgba(251,237,224,0.7)] max-w-xl mx-auto">
              Ready to test explainable AI models on Bitcoin, Ethereum, and Solana with live candle charts and 10 bps paper trading?
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleLaunchApp('/dashboard')}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#FBEDE0] hover:bg-white text-[#161823] font-bold text-sm shadow-xl transition-all hover:scale-105 cursor-pointer"
              >
                <span>Launch TradeSense Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
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
