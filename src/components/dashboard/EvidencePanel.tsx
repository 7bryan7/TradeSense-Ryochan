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
    <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#4ce07a]/10 text-[#4ce07a] border border-[#4ce07a]/20 shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              RYO Evidence Inspector
            </h3>
            <p className="text-[11px] text-[#8F9CAE] font-mono">
              Provenance, freshness & verified multi-source observations
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-[#15171C] p-1 rounded-xl border border-white/[0.06]">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-ryo-gradient text-[#050806] shadow-ryo-sm'
                  : 'text-[#8F9CAE] hover:text-white'
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
            className="p-3.5 rounded-xl bg-[#15171C] border border-white/[0.06] hover:border-white/[0.12] transition-colors duration-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{item.title}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-white/[0.06] text-[#8F9CAE] rounded-md border border-white/[0.08]">
                    {item.category}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-[#4ce07a]">
                  {item.value}
                </div>
                <p className="text-xs text-[#8F9CAE] leading-relaxed">
                  {item.interpretation}
                </p>
              </div>

              {/* Status Badge & Age */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <StatusBadge
                  status={item.status === 'fresh' ? 'SAFE' : item.status === 'stale' ? 'STALE' : 'UNKNOWN'}
                  label={item.status}
                />
                <span className="text-[10px] font-mono text-[#8F9CAE] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#5E6A7D]" />
                  {item.age}
                </span>
              </div>
            </div>

            {/* Source Provenance Footer */}
            <div className="mt-2.5 text-[10px] font-mono text-[#5E6A7D] flex items-center justify-between border-t border-white/[0.06] pt-2">
              <span>Source: <strong className="text-[#8F9CAE]">{item.source}</strong></span>
              <span>Timestamp: {item.sourceTimestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvidencePanel;
