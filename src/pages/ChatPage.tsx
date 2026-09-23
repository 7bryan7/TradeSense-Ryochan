import React, { useState } from 'react';
import { useMarket } from '../hooks/useMarket';
import { useAgentRun } from '../hooks/useAgentRun';
import { AskTradeSensePanel } from '../components/chat/AskTradeSensePanel';
import {
  Sparkles,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { tokens, currentToken, setSelectedTokenId, dataMode } = useMarket('btc');
  const { currentRun } = useAgentRun();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePrompt, setActivePrompt] = useState<string | undefined>(undefined);
  const [chatKey, setChatKey] = useState(0);

  const handleNewChat = () => {
    setActivePrompt(undefined);
    setChatKey(prev => prev + 1);
  };

  if (!currentToken) {
    return (
      <div className="flex items-center justify-center h-[70vh] p-8 text-xs font-mono text-[#8F9CAE]">
        <div className="w-5 h-5 rounded-full border-2 border-[#4ce07a] border-t-transparent animate-spin mr-2" />
        <span>Initializing Gemini intelligence session...</span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-[#15171C]">
      {/* ── Left Gemini Collapsible Sidebar ── */}
      {isSidebarOpen && (
        <aside className="w-64 sm:w-72 bg-[#15171C] border-r border-white/[0.06] flex flex-col justify-between shrink-0 p-3 z-20 animate-fade-up">
          <div className="space-y-4 overflow-y-auto">
            {/* Sidebar Header & Toggle */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#4ce07a]/15 border border-[#4ce07a]/30 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-[#4ce07a]" />
                </div>
                <span className="text-xs font-semibold text-white tracking-tight">
                  TradeSense Chat
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                title="Collapse sidebar"
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#8F9CAE] hover:text-white transition-colors cursor-pointer"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* New Chat Button */}
            <button
              type="button"
              onClick={handleNewChat}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-medium border border-white/[0.08] hover:border-[#4ce07a]/40 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#4ce07a]" />
              <span>New chat</span>
            </button>

            {/* Token Context Switcher */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#5E6A7D] font-bold px-2 block">
                Active Asset Context
              </span>
              <div className="space-y-1">
                {tokens.map(t => {
                  const isSelected = t.id === currentToken.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTokenId(t.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer border ${
                        isSelected
                          ? 'bg-[#1E222B] text-white border-[#4ce07a]/40 shadow-xs'
                          : 'bg-transparent text-[#8F9CAE] hover:text-white hover:bg-white/[0.03] border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#4ce07a]' : 'bg-transparent'}`} />
                        <span className="font-bold">{t.symbol}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span>${t.metrics.price.toLocaleString()}</span>
                        <span
                          className={
                            t.metrics.change24h >= 0 ? 'text-[#4ce07a]' : 'text-[#EF4444]'
                          }
                        >
                          {t.metrics.change24h >= 0 ? '+' : ''}
                          {t.metrics.change24h}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audited Run Context */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#5E6A7D] font-bold px-2 block">
                Telemetry Anchor
              </span>
              <div className="p-3 rounded-xl bg-[#1E222B]/60 border border-white/[0.04] space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center justify-between text-[#8F9CAE]">
                  <span>Run ID</span>
                  <span className="text-white font-bold">{currentRun.id}</span>
                </div>
                <div className="flex items-center justify-between text-[#8F9CAE]">
                  <span>Decision</span>
                  <span
                    className={`font-black ${
                      currentRun.decision.action === 'BUY'
                        ? 'text-[#4ce07a]'
                        : currentRun.decision.action === 'SELL'
                        ? 'text-[#EF4444]'
                        : 'text-[#F59E0B]'
                    }`}
                  >
                    {currentRun.decision.action} ({currentRun.decision.confidenceScore}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#5E6A7D] text-[10px]">
                  <span>Telemetry Mode</span>
                  <span className="text-[#4ce07a]">{dataMode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#5E6A7D]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ce07a]" />
              RYO Telemetry Online
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#4ce07a]" />
          </div>
        </aside>
      )}

      {/* ── Main Gemini Chat Area ── */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-[#15171C]">
        {/* Floating Sidebar Re-open Button (when sidebar is closed) */}
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            title="Expand sidebar"
            className="absolute top-3.5 left-4 z-20 p-2 rounded-xl bg-[#1E222B] hover:bg-[#242934] text-[#8F9CAE] hover:text-white border border-white/[0.08] transition-colors cursor-pointer shadow-md"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex-1 h-full overflow-hidden">
          <AskTradeSensePanel
            key={chatKey}
            initialPrompt={activePrompt}
          />
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
