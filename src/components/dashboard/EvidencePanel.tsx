import React, { useState } from 'react';
import { EvidenceItem } from '../../types/evidence';
import { StatusBadge } from '../common/StatusBadge';
import { Database, FileText, Share2, LineChart, Shield, Clock, ExternalLink } from 'lucide-react';

interface EvidencePanelProps {
  items: EvidenceItem[];
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ items = [] }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Observations', icon: <Database className="w-3 h-3" /> },
    { id: 'on-chain', label: 'On-Chain', icon: <Database className="w-3 h-3" /> },
    { id: 'technical', label: 'Technical', icon: <LineChart className="w-3 h-3" /> },
    { id: 'news', label: 'News Feed', icon: <FileText className="w-3 h-3" /> },
    { id: 'social', label: 'Sentiment', icon: <Share2 className="w-3 h-3" /> },
  ];

  const safeItems = items || [];
  const filteredItems = activeCategory === 'all'
    ? safeItems
    : safeItems.filter(i => i.category === activeCategory);

  return (
    <div className="tradesense-glass-card rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 border border-white/[0.12]">
      {/* Header with Category Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#4ce07a]/15 text-[#4ce07a] border border-[#4ce07a]/30 shadow-ryo-sm">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Verified Evidence Ledger
            </h3>
            <p className="text-[10px] text-[#8F9CAE] font-mono">
              Deterministic provenance, timestamp proofs &amp; freshness verification
            </p>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 tradesense-glass-pill p-1 rounded-xl border border-white/[0.08]">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-ryo-gradient text-[#050806] shadow-ryo-sm font-black'
                  : 'text-[#8F9CAE] hover:text-white'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Streamlined Evidence Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="p-3 rounded-xl tradesense-glass-pill border border-white/[0.08] hover:border-[#4ce07a]/40 transition-all flex flex-col justify-between text-xs font-mono space-y-2"
          >

            {/* Top row: Title, Category, Status Badge */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{item.title}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/[0.06] text-[#8F9CAE] border border-white/[0.08]">
                    {item.category}
                  </span>
                </div>
                <div className="text-xs font-bold text-[#4ce07a] mt-0.5">
                  {item.value}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <StatusBadge
                  status={item.status === 'fresh' ? 'SAFE' : item.status === 'stale' ? 'STALE' : 'UNKNOWN'}
                  label={item.status}
                  size="sm"
                />
                <span className="text-[10px] text-[#5E6A7D] flex items-center gap-0.5">
                  <Clock className="w-3 h-3 text-[#5E6A7D]" />
                  {item.age}
                </span>
              </div>
            </div>

            {/* Concise observation (1 line) */}
            <p className="text-[11px] text-[#8F9CAE] font-sans leading-tight line-clamp-2">
              {item.interpretation}
            </p>

            {/* Provenance footer */}
            <div className="text-[9px] text-[#5E6A7D] flex items-center justify-between border-t border-white/[0.04] pt-1.5">
              <span>Source: <strong className="text-[#8F9CAE]">{item.source}</strong></span>
              <span className="text-[#5E6A7D]">{item.sourceTimestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvidencePanel;
