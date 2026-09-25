import React, { useState } from 'react';
import { Plus, PanelLeftClose, MessageSquare, ArrowUpRight } from 'lucide-react';
import { useMarket } from '../hooks/useMarket';
import { AskTradeSensePanel } from '../components/chat/AskTradeSensePanel';

export const ChatPage: React.FC = () => {
  const { tokens, currentToken, selectedTokenId, setSelectedTokenId } = useMarket('btc');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  if (!currentToken) return <div className="studio-page text-slate-400" role="status">Preparing your research space…</div>;

  return (
    <div className="studio-chat-page relative flex h-full min-h-0 w-full overflow-hidden">
      {isSidebarOpen && (
        <aside className="studio-chat-context flex shrink-0 flex-col p-4 z-20">
          <div className="flex items-center justify-between mb-5">
            <span className="studio-eyebrow text-[#4ce07a]">RESEARCH CONTEXT</span>
            <button
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close research context"
              onClick={() => setIsSidebarOpen(false)}
            >
              <PanelLeftClose size={17} />
            </button>
          </div>
          <button
            type="button"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#4ce07a]/40 text-xs font-semibold text-white hover:bg-[#4ce07a]/10 transition-all cursor-pointer"
            onClick={() => { setResetKey(key => key + 1); setIsSidebarOpen(false); }}
          >
            <Plus size={15} className="text-[#4ce07a]" />
            <span>New conversation</span>
          </button>
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-6 mb-2.5">
            Select Asset
          </p>
          <div className="space-y-2">
            {tokens.filter(token => ['btc', 'eth', 'sol'].includes(token.id)).map(token => {
              const active = selectedTokenId === token.id;
              return (
                <button
                  type="button"
                  key={token.id}
                  aria-pressed={active}
                  onClick={() => { setSelectedTokenId(token.id); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between p-3 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                    active
                      ? 'border-[#4ce07a]/50 bg-[#4ce07a]/10 text-white shadow-[0_0_15px_rgba(76,224,122,0.12)]'
                      : 'border-white/[0.06] bg-white/[0.02] text-slate-300 hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <span>
                    <strong className="block text-white font-bold">{token.symbol}</strong>
                    <span className="text-[11px] text-slate-400">{token.name}</span>
                  </span>
                  <ArrowUpRight size={14} className={active ? 'text-[#4ce07a]' : 'text-slate-500'} />
                </button>
              );
            })}
          </div>
          <div className="studio-note mt-auto bg-[#4ce07a]/[0.03] border-[#4ce07a]/15 text-slate-400 text-xs">
            <MessageSquare size={16} className="text-[#4ce07a] mb-2" />
            <p>Ask about signals, risks, or live metrics. Answers ground into verified sample telemetry.</p>
          </div>
        </aside>
      )}

      <div className="flex flex-1 min-w-0 flex-col min-h-0">
        <div className="flex-1 min-h-0">
          <AskTradeSensePanel
            contextTokenId={selectedTokenId}
            resetKey={resetKey}
            onToggleSidebar={() => setIsSidebarOpen(value => !value)}
            isSidebarOpen={isSidebarOpen}
            onNewChat={() => setResetKey(key => key + 1)}
          />
        </div>
      </div>
    </div>
  );
};
export default ChatPage;
