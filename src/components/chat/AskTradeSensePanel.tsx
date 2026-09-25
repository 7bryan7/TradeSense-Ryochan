import React, { useState, useRef, useEffect } from 'react';
import { useMarket } from '../../hooks/useMarket';
import { useAgentRun } from '../../hooks/useAgentRun';
import { useAgentChat } from '../../hooks/useAgentChat';
import { ChatMessageBubble } from './ChatMessageBubble';
import {
  Sparkles,
  Send,
  TrendingUp,
  BrainCircuit,
  Database,
  ShieldAlert,
  ChevronDown,
  X,
  PanelLeft,
  Plus,
} from 'lucide-react';

interface AskTradeSensePanelProps {
  initialPrompt?: string;
  onCloseDrawer?: () => void;
  isCompact?: boolean;
  contextTokenId?: string;
  resetKey?: number;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onNewChat?: () => void;
}

export const AskTradeSensePanel: React.FC<AskTradeSensePanelProps> = ({
  initialPrompt,
  onCloseDrawer,
  isCompact = false,
  contextTokenId = 'btc',
  resetKey = 0,
  onToggleSidebar,
  isSidebarOpen = false,
  onNewChat,
}) => {
  const { currentToken, dataMode, setSelectedTokenId } = useMarket(contextTokenId);
  const { currentRun: defaultRun, runs } = useAgentRun();
  const currentRun = runs.find(run => run.tokenId === currentToken?.id && run.decision.tokenId === currentToken?.id) || defaultRun;
  const {
    messages,
    isProcessing,
    sendMessage,
    clearConversation,
  } = useAgentChat(currentToken, currentRun, dataMode);

  useEffect(() => { setSelectedTokenId(contextTokenId); }, [contextTokenId, setSelectedTokenId]);
  useEffect(() => { if (resetKey > 0) clearConversation(); }, [resetKey, clearConversation]);


  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sentInitialPrompt = useRef<string>();
  useEffect(() => { if (resetKey > 0) setInput(''); }, [resetKey]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [messages, isProcessing]);

  // Handle incoming initial prompt
  useEffect(() => {
    if (!initialPrompt) sentInitialPrompt.current = undefined;
    if (currentToken && !isProcessing && initialPrompt?.trim() && sentInitialPrompt.current !== initialPrompt) {
      sentInitialPrompt.current = initialPrompt;
      sendMessage(initialPrompt);
    }
  }, [initialPrompt, sendMessage, currentToken, isProcessing]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isProcessing) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isInitialState = messages.length <= 1;

  if (!currentToken) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-xs font-mono text-[#8F9CAE]">
        <div className="w-5 h-5 rounded-full border-2 border-[#4ce07a] border-t-transparent animate-spin mr-2" />
        <span>Loading market intelligence feed...</span>
      </div>
    );
  }

  return (
    <div className="studio-chat-panel flex flex-col h-full w-full bg-transparent text-white relative overflow-hidden">
      {/* Ambient Emerald Glass Optical Depth Elements */}
      <div className="pointer-events-none absolute -top-24 -right-20 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#4ce07a]/15 to-[#2ecc71]/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-[#4ce07a]/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-20 right-1/4 w-96 h-96 rounded-full bg-[#2e8a50]/12 blur-[140px]" />

      {/* ── Translucent Obsidian Glass Header Bar ── */}
      <div className="px-4 sm:px-6 py-3 bg-[#0C0E17]/85 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between gap-3 shrink-0 z-10 shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_-1px_0_rgba(255,255,255,0.04)]">
        {/* Left Section */}
        <div className="flex items-center gap-2.5">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Toggle research context"
              aria-expanded={isSidebarOpen}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                isSidebarOpen
                  ? 'border-[#4ce07a]/50 bg-[#4ce07a]/15 text-[#4ce07a]'
                  : 'border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <PanelLeft className="w-3.5 h-3.5 text-[#4ce07a]" />
              <span className="hidden sm:inline font-mono text-[11px]">Context</span>
            </button>
          )}

          {/* Model Selector Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full tradesense-glass-pill hover:border-[#4ce07a]/40 text-xs font-medium text-white transition-all cursor-pointer shadow-sm group">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#4ce07a] to-[#2ecc71] flex items-center justify-center shadow-[0_0_10px_rgba(76,224,122,0.4)] group-hover:scale-105 transition-transform">
              <Sparkles className="w-2.5 h-2.5 text-[#050806]" />
            </div>
            <span className="font-semibold tracking-tight">Ask TradeSense</span>
          </div>

          {/* Active Context Token Subtle Glass Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full tradesense-glass-pill text-[11px] font-mono text-[#8F9CAE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ce07a] animate-pulse" />
            <span className="text-white font-medium">{currentToken.symbol}</span>
            <span>•</span>
            <span className="text-[#4ce07a] font-semibold">{dataMode}</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#4ce07a]/40 text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#4ce07a]" />
              <span className="hidden sm:inline">New chat</span>
            </button>
          )}
          {onCloseDrawer && (
            <button
              type="button"
              onClick={onCloseDrawer}
              title="Close drawer"
              className="p-1.5 rounded-full tradesense-glass-pill hover:border-white/25 text-[#8F9CAE] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Main Conversation Canvas ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scrollbar-thin relative z-10">
        <div className="max-w-3xl mx-auto w-full">
          {/* Welcome Screen (when conversation is fresh) */}
          {isInitialState && (
            <div className="studio-chat-welcome py-6 sm:py-8 space-y-6">
              {/* Greeting */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full tradesense-glass-pill border-[#4ce07a]/35 text-xs font-mono text-[#4ce07a] shadow-[0_0_16px_rgba(76,224,122,0.15)]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Your research companion</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-sm">
                  Make sense of the market.
                </h1>
                <p className="text-sm sm:text-base text-slate-300 font-normal max-w-xl leading-relaxed">
                  Turn a question into a clearer picture. Explore the signals, understand the risks, and follow verified RYO evidence.
                </p>
              </div>

              {/* Glass Suggestion Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {[
                  {
                    icon: TrendingUp,
                    iconColor: 'text-[#4ce07a]',
                    title: 'Analyze market momentum',
                    desc: `Evaluate 24h trends and volume shifts for ${currentToken.symbol}`,
                    prompt: `Analyze the current market momentum, volume changes, and price trend for ${currentToken.symbol}.`,
                  },
                  {
                    icon: BrainCircuit,
                    iconColor: 'text-[#38F997]',
                    title: 'Explain the decision',
                    desc: 'Understand why the sample analysis chose this action',
                    prompt: 'Why did the agent choose this trade decision and what is the underlying thesis?',
                  },
                  {
                    icon: Database,
                    iconColor: 'text-[#4ce07a]',
                    title: 'Explore the evidence',
                    desc: 'Look at the sample price, volume, and source references',
                    prompt: `What does the sample evidence show about ${currentToken.symbol}'s price and volume?`,
                  },
                  {
                    icon: ShieldAlert,
                    iconColor: 'text-amber-400',
                    title: 'What could go wrong?',
                    desc: 'Check detected risk flags and conditions that change the outlook',
                    prompt: 'Which safety flags were found, and what conditions would invalidate this outlook?',
                  },
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => sendMessage(card.prompt)}
                      className="p-4 rounded-2xl tradesense-glass-card text-left transition-all cursor-pointer group flex flex-col justify-between gap-3 shadow-sm hover:scale-[1.015]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white group-hover:text-[#4ce07a] transition-colors">
                          {card.title}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-md flex items-center justify-center shrink-0 group-hover:border-[#4ce07a]/40 group-hover:scale-105 transition-all">
                          <Icon className={`w-4 h-4 ${card.iconColor}`} />
                        </div>
                      </div>
                      <p className="text-xs text-[#8F9CAE] leading-relaxed">
                        {card.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat Messages Stream */}
          {!isInitialState && (
            <div className="space-y-4">
              {messages.map(msg => (
                <ChatMessageBubble
                  key={msg.id}
                  message={msg}
                  onFollowUpClick={prompt => sendMessage(prompt)}
                  onRetryClick={() => sendMessage(msg.content)}
                />
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Translucent Floating Glass Capsule Input ── */}
      <div className="shrink-0 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 relative z-20">
        <div className="max-w-3xl mx-auto w-full">

          <div className="tradesense-glass-input rounded-3xl p-2 sm:p-2.5 focus-within:border-[#4ce07a]/60 focus-within:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_25px_rgba(76,224,122,0.22),inset_0_1px_0_rgba(255,255,255,0.22)]">
            <form onSubmit={handleSubmit} className="flex items-end gap-2 px-2">
              <div className="p-2 text-[#4ce07a] shrink-0 mb-0.5">
                <Sparkles className="w-4 h-4 drop-shadow-[0_0_8px_rgba(76,224,122,0.5)]" />
              </div>

              <textarea
                aria-label="Ask TradeSense a question"
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isProcessing}
                placeholder={`Ask TradeSense about ${currentToken.symbol} markets, reasoning, or metrics...`}
                className="w-full bg-transparent text-white placeholder-[#8F9CAE]/60 text-xs sm:text-sm py-2 px-1 focus:outline-none resize-none max-h-32 min-h-[2.25rem] leading-relaxed font-sans"
              />

              <button
                type="submit"
                disabled={!input.trim() || isProcessing}
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mb-0.5 transition-all ${
                  input.trim() && !isProcessing
                    ? 'bg-gradient-to-r from-[#4ce07a] to-[#2ecc71] text-[#050806] shadow-ryo-sm hover:brightness-110 hover:scale-105 active:scale-95 cursor-pointer'
                    : 'bg-white/[0.05] text-[#5E6A7D] border border-white/[0.06] cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>

          {/* Subtle Disclaimer */}
          <p className="text-center text-[10px] sm:text-[11px] text-[#5E6A7D] mt-2.5 font-mono">
            Demo responses use sample data. Chat does not place trades.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AskTradeSensePanel;
