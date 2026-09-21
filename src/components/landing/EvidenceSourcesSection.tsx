import React from 'react';
import { Database, FileText, Share2, LineChart, ShieldCheck } from 'lucide-react';

export const EvidenceSourcesSection: React.FC = () => {
  const sources = [
    {
      title: 'On-Chain Activity',
      desc: 'Whale transfers, exchange inflows/outflows, and network gas burn velocity.',
      icon: Database,
      badge: 'RYO Indexer',
    },
    {
      title: 'News Intelligence',
      desc: 'Institutional ETF flows, regulatory filings, and tier-1 market catalysts.',
      icon: FileText,
      badge: 'Financial Feeds',
    },
    {
      title: 'Social Sentiment',
      desc: 'Aggregated community sentiment and discussion spikes across crypto socials.',
      icon: Share2,
      badge: 'Social Aggregators',
    },
    {
      title: 'Technical Indicators',
      desc: 'Multi-timeframe RSI, MACD divergence, Moving Average envelopes, and spot volume.',
      icon: LineChart,
      badge: 'Quantitative TA',
    },
    {
      title: 'Contract Safety',
      desc: 'Automated honeypot detection, liquidity locks, mint authorities, and tax rules.',
      icon: ShieldCheck,
      badge: 'Safety Engine',
    },
  ];

  return (
    <section className="py-20 px-6 border-t border-[rgba(80,160,255,0.1)] bg-[#050B14]/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
            Section 06 — Evidence Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Multi-source verified inputs
          </h2>
          <p className="text-sm text-slate-400 mt-2 font-mono">
            Never trust a single metric. TradeSense cross-verifies multiple signals before proposing action.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((src, idx) => {
            const Icon = src.icon;
            return (
              <div
                key={idx}
                className="bg-[#091522] border border-[rgba(80,160,255,0.12)] rounded-2xl p-5 hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {src.badge}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white mb-1">{src.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{src.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

