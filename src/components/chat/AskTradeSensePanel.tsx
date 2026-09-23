import React, { useState, useRef, useEffect } from 'react';
import { useMarket } from '../../hooks/useMarket';
import { useAgentRun } from '../../hooks/useAgentRun';
import { useAgentChat } from '../../hooks/useAgentChat';
import { ChatMessageBubble } from './ChatMessageBubble';
import {
  Sparkles,
  Send,
  RotateCcw,
  TrendingUp,
  BrainCircuit,
  Database,
  ShieldAlert,
  ChevronDown,
  X,
} from 'lucide-react';

interface AskTradeSensePanelProps {
  initialPrompt?: string;
  onCloseDrawer?: () => void;
  isCompact?: boolean;
}

export const AskTradeSensePanel: React.FC<AskTradeSensePanelProps> = ({
  initialPrompt,
  onCloseDrawer,
  isCompact = false,
}) => {
  const { currentToken, dataMode } = useMarket('btc');
  const { currentRun } = useAgentRun();
  const {
    messages,
    isProcessing,
    sendMessage,
    clearConversation,
  } = useAgentChat(currentToken, currentRun, dataMode);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Handle incoming initial prompt
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      sendMessage(initialPrompt);
    }
  }, [initialPrompt, sendMessage]);

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
    <div className="flex flex-col h-full bg-[#15171C] text-white relative overflow-hidden">
      {/* ── Gemini Minimalist Header Bar ── */}
      <div className="px-4 sm:px-6 py-3 bg-[#15171C]/90 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between gap-3 shrink-0 z-10">
        {/* Gemini Model Selector Pill */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-white transition-all cursor-pointer"
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#4ce07a] to-[#38bdf8] flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-[#050806]" />
            </div>
            <span className="font-semibold tracking-tight">TradeSense 2.0 Flash</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8F9CAE]" />
          </button>

          {/* Active Context Token Subtle Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-[#8F9CAE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ce07a] animate-pulse" />
            <span className="text-white font-medium">{currentToken.symbol}</span>
            <span>•</span>
            <span>{dataMode}</span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearConversation}
            title="Start new conversation"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-[#8F9CAE] hover:text-white border border-white/[0.08] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {onCloseDrawer && (
            <button
              type="button"
              onClick={onCloseDrawer}
              title="Close drawer"
              className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#8F9CAE] hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Main Gemini Conversation Canvas ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scrollbar-thin">
        <div className="max-w-3xl mx-auto w-full">
          {/* Welcome Screen (when conversation is fresh) */}
          {isInitialState && (
            <div className="py-8 sm:py-14 space-y-8 animate-fade-up">
              {/* Gemini Greeting */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4ce07a]/10 border border-[#4ce07a]/25 text-xs font-mono text-[#4ce07a]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>TradeSense Intelligence Station</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-medium tracking-tight bg-gradient-to-r from-[#4ce07a] via-[#38bdf8] to-[#818cf8] bg-clip-text text-transparent">
                  Hello, Trader
                </h1>
                <p className="text-base sm:text-lg text-[#8F9CAE] font-normal max-w-xl">
                  How can TradeSense help you explore crypto markets and autonomous execution today?
                </p>
              </div>

              {/* Gemini Suggestion Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
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
                    iconColor: 'text-[#38bdf8]',
                    title: 'Explain trade thesis',
                    desc: 'Deep dive into why the agent chose the latest action',
                    prompt: 'Why did the agent choose this trade decision and what is the underlying thesis?',
                  },
                  {
                    icon: Database,
                    iconColor: 'text-[#a78bfa]',
                    title: 'Inspect RYO data grounding',
                    desc: 'Review multi-source telemetry and verified on-chain facts',
                    prompt: `What does verified RYO telemetry show about ${currentToken.symbol}'s price and volume depth?`,
                  },
                  {
                    icon: ShieldAlert,
                    iconColor: 'text-amber-400',
                    title: 'Audit safety & invalidation',
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
                      className="p-4 rounded-2xl bg-[#1E222B]/70 hover:bg-[#242934] border border-white/[0.08] hover:border-[#4ce07a]/40 text-left transition-all cursor-pointer group flex flex-col justify-between gap-3 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white group-hover:text-[#4ce07a] transition-colors">
                          {card.title}
                        </span>
                        <div className="w-7 h-7 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
                          <Icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
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

      {/* ── Gemini Floating Pill Input Area ── */}
      <div className="shrink-0 px-4 sm:px-6 pb-4 pt-2">
        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-[#1E222B]/95 backdrop-blur-xl border border-white/[0.12] rounded-3xl p-2 sm:p-2.5 shadow-2xl focus-within:border-[#4ce07a]/50 focus-within:ring-1 focus-within:ring-[#4ce07a]/30 transition-all">
            <form onSubmit={handleSubmit} className="flex items-end gap-2 px-2">
              <div className="p-2 text-[#4ce07a]/80 shrink-0 mb-0.5">
                <Sparkles className="w-4 h-4" />
              </div>

              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isProcessing}
                placeholder={`Ask TradeSense about ${currentToken.symbol} markets, reasoning, or metrics...`}
                className="w-full bg-transparent text-white placeholder-[#5E6A7D] text-xs sm:text-sm py-2 px-1 focus:outline-none resize-none max-h-32 min-h-[2.25rem] leading-relaxed font-sans"
              />

              <button
                type="submit"
                disabled={!input.trim() || isProcessing}
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mb-0.5 transition-all ${
                  input.trim() && !isProcessing
                    ? 'bg-[#4ce07a] text-[#050806] shadow-ryo-sm hover:opacity-90 cursor-pointer'
                    : 'bg-white/[0.06] text-[#5E6A7D] cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>

          {/* Gemini Subtle Disclaimer */}
          <p className="text-center text-[10px] sm:text-[11px] text-[#5E6A7D] mt-2.5 font-mono">
            TradeSense may display inaccurate market info. Always verify primary RYO telemetry.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AskTradeSensePanel;
