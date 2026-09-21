import React, { useState } from 'react';
import { EvidenceItem } from '../../types/evidence';
import { StatusBadge } from '../common/StatusBadge';
import { Database, FileText, Share2, LineChart, Shield, Clock } from 'lucide-react';

interface EvidencePanelProps {
  items: EvidenceItem[];
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ items }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Evidence', icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'on-chain', label: 'On-Chain', icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'news', label: 'News Feed', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'social', label: 'Sentiment', icon: <Share2 className="w-3.5 h-3.5" /> },
    { id: 'technical', label: 'Technical', icon: <LineChart className="w-3.5 h-3.5" /> },
  ];

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter(i => i.category === activeCategory);

  return (
    <div className="bg-[#161926]/90 backdrop-blur-xl border border-[rgba(251,237,224,0.12)] rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[rgba(251,237,224,0.08)]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#38F997]/10 text-[#38F997] border border-[#38F997]/25 shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#FBEDE0] uppercase font-mono tracking-wider">
              RYO Evidence Inspector
            </h3>
            <p className="text-[11px] text-[rgba(251,237,224,0.5)] font-mono">
              Provenance, freshness & verified multi-source observations
            </p>
          </div>
        </div>

        {/* Category Tabs (ethonline-main pill style) */}
        <div className="flex items-center gap-1 bg-[#10131F] p-1 rounded-xl border border-[rgba(251,237,224,0.10)]">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#FBEDE0] text-[#0C0E17] shadow-xs'
                  : 'text-[rgba(251,237,224,0.6)] hover:text-[#FBEDE0]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Items List */}
      <div className="space-y-2 mt-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl bg-[#10131F]/70 border border-[rgba(251,237,224,0.06)] hover:border-[rgba(251,237,224,0.18)] hover:bg-[#10131F] transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#FBEDE0]">{item.title}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#FBEDE0]/10 text-[#FBEDE0] rounded-md border border-[rgba(251,237,224,0.15)]">
                    {item.category}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-[#38F997]">
                  {item.value}
                </div>
                <p className="text-xs text-[rgba(251,237,224,0.8)] leading-relaxed">
                  {item.interpretation}
                </p>
              </div>

              {/* Status Badge & Age */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <StatusBadge
                  status={item.status === 'fresh' ? 'SAFE' : item.status === 'stale' ? 'STALE' : 'UNKNOWN'}
                  label={item.status}
                />
                <span className="text-[10px] font-mono text-[rgba(251,237,224,0.5)] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[rgba(251,237,224,0.4)]" />
                  {item.age}
                </span>
              </div>
            </div>

            {/* Source Provenance Footer */}
            <div className="mt-2.5 text-[10px] font-mono text-[rgba(251,237,224,0.45)] flex items-center justify-between border-t border-[rgba(251,237,224,0.06)] pt-2">
              <span>Source: <strong className="text-[rgba(251,237,224,0.7)]">{item.source}</strong></span>
              <span>Timestamp: {item.sourceTimestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvidencePanel;
