import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

export const FooterSection: React.FC = () => {
  return (
    <footer id="footer" className="border-t border-[rgba(251,237,224,0.08)] bg-[#0C0E17] py-8 px-6 text-xs font-mono text-[rgba(251,237,224,0.65)]">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
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
  );
};

export default FooterSection;
