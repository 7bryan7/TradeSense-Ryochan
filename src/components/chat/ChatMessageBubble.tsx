import React, { useState } from 'react';
import { ChatMessage } from '../../types/chat';
import {
  Sparkles,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Database,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Cpu,
} from 'lucide-react';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onFollowUpClick?: (query: string) => void;
  onEvidenceClick?: (evidenceId: string) => void;
  onRetryClick?: () => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onFollowUpClick,
  onEvidenceClick,
  onRetryClick,
}) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [showSources, setShowSources] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── USER MESSAGE ──
  if (isUser) {
    return (
      <div className="flex justify-end mb-6 group">
        <div className="max-w-[85%] sm:max-w-[70%] space-y-1">
          <div className="tradesense-glass-bubble-user text-white px-5 py-3.5 rounded-3xl rounded-tr-md">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="text-right text-[10px] font-mono text-[#8F9CAE] px-2">
            {message.timestamp}
          </div>
        </div>
      </div>
    );
  }

  // ── AGENT (GEMINI STYLE) MESSAGE ──
  const isPending = message.status === 'fetching_tools' || message.status === 'synthesizing';
  const hasSources =
    (message.retrievedFacts && message.retrievedFacts.length > 0) ||
    (message.toolInvocations && message.toolInvocations.length > 0);

  return (
    <div className="flex items-start gap-3 sm:gap-4 mb-8 group">
      {/* 4-Point Sparkle Avatar with Glass Glow */}
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#4ce07a]/25 via-[#38F997]/20 to-[#2ecc71]/20 border border-[#4ce07a]/40 backdrop-blur-md flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_15px_rgba(76,224,122,0.25)]">
        <Sparkles className="w-4 h-4 text-[#4ce07a]" />
      </div>

      {/* Main Response Stream Canvas */}
      <div className="flex-1 min-w-0 space-y-3.5">
        {/* Loading / Thinking State */}
        {isPending ? (
          <div className="py-2 flex items-center gap-3 text-sm text-[#8F9CAE]">
            <div className="w-4 h-4 rounded-full border-2 border-[#4ce07a] border-t-transparent animate-spin" />
            <span className="font-mono text-xs text-[#4ce07a]">
              {message.status === 'fetching_tools'
                ? 'Ingesting RYO multi-venue market telemetry...'
                : 'Synthesizing evidence and computing confidence...'}
            </span>
          </div>
        ) : (
          <>
            {/* Primary Text Prose */}
            <div className="text-[#E1E7EC] text-sm sm:text-[15px] leading-relaxed font-sans space-y-3">
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>

            {/* AI Outlook Callout in Translucent Glass Card */}
            {message.aiInterpretation && (
              <div className="my-2.5 p-3.5 sm:p-4 rounded-2xl tradesense-glass-card flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 max-w-[75%]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F9CAE] font-bold">
                    Agent Thesis
                  </span>
                  <p className="text-xs text-white/95 leading-snug">
                    {message.aiInterpretation.thesis}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-[#8F9CAE]">
                    {message.aiInterpretation.confidence}% CONF
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold flex items-center gap-1 border ${
                      message.aiInterpretation.outlook === 'BULLISH'
                        ? 'bg-[#4ce07a]/15 text-[#4ce07a] border-[#4ce07a]/40 shadow-[0_0_12px_rgba(76,224,122,0.2)]'
                        : message.aiInterpretation.outlook === 'BEARISH'
                        ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                        : 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    }`}
                  >
                    {message.aiInterpretation.outlook === 'BULLISH' && <TrendingUp className="w-3 h-3" />}
                    {message.aiInterpretation.outlook === 'BEARISH' && <TrendingDown className="w-3 h-3" />}
                    {message.aiInterpretation.outlook === 'NEUTRAL' && <Activity className="w-3 h-3" />}
                    <span>{message.aiInterpretation.outlook}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Grounded Evidence Accordion Pill */}
            {hasSources && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowSources(!showSources)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full tradesense-glass-pill text-[11px] font-mono text-[#8F9CAE] hover:text-white transition-all cursor-pointer"
                >
                  <Database className="w-3 h-3 text-[#4ce07a]" />
                  <span>
                    {message.retrievedFacts?.length || 0} RYO telemetry sources grounded
                  </span>
                  {showSources ? (
                    <ChevronUp className="w-3 h-3 ml-0.5" />
                  ) : (
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  )}
                </button>

                {showSources && (
                  <div className="mt-2.5 p-3.5 rounded-2xl bg-black/35 backdrop-blur-xl border border-white/[0.10] space-y-2 text-xs font-mono animate-fade-up shadow-inner">
                    {message.retrievedFacts?.map((fact, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06]"
                      >
                        <span className="text-white font-medium">{fact.value}</span>
                        <span className="text-[10px] text-[#8F9CAE] shrink-0">
                          {fact.source} • {fact.timestamp}
                        </span>
                      </div>
                    ))}
                    {message.toolInvocations && message.toolInvocations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {message.toolInvocations.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-[#4ce07a] border border-white/[0.08] backdrop-blur-sm flex items-center gap-1"
                          >
                            <Cpu className="w-2.5 h-2.5" />
                            <span>RYO {t.toolName} ({t.durationMs}ms)</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Missing Disclosures / Safety Checks (if any) */}
            {message.missingDisclosures && message.missingDisclosures.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-500/[0.08] backdrop-blur-xl border border-amber-500/25 text-xs font-mono text-amber-200 space-y-1 shadow-sm">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 text-[11px]">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Uncertainty &amp; Missing Checks</span>
                </div>
                {message.missingDisclosures.map((disc, idx) => (
                  <p key={idx} className="text-[11px] text-amber-200/90 pl-5">
                    • {disc}
                  </p>
                ))}
              </div>
            )}

            {/* Action Toolbar */}
            <div className="flex items-center gap-1 pt-1 text-[#8F9CAE]">
              {/* Copy */}
              <button
                type="button"
                onClick={handleCopy}
                title={copied ? 'Copied!' : 'Copy response'}
                className="p-1.5 rounded-lg hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#4ce07a]" />
                    <span className="text-[10px] text-[#4ce07a] font-mono">Copied</span>
                  </>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Thumbs Up */}
              <button
                type="button"
                onClick={() => setLiked(liked === true ? null : true)}
                title="Good response"
                className={`p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer ${
                  liked === true ? 'text-[#4ce07a]' : 'hover:text-white'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              {/* Thumbs Down */}
              <button
                type="button"
                onClick={() => setLiked(liked === false ? null : false)}
                title="Bad response"
                className={`p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer ${
                  liked === false ? 'text-rose-400' : 'hover:text-white'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>

              {/* Retry */}
              {onRetryClick && (
                <button
                  type="button"
                  onClick={onRetryClick}
                  title="Regenerate"
                  className="p-1.5 rounded-lg hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              <span className="text-[10px] font-mono text-[#5E6A7D] ml-auto">
                {message.timestamp}
              </span>
            </div>

            {/* Suggested Follow-up Pills in Glass styling */}
            {message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1.5">
                {message.suggestedFollowUps.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onFollowUpClick?.(prompt)}
                    className="px-3 py-1.5 rounded-full tradesense-glass-pill hover:border-[#4ce07a]/50 text-xs text-[#8F9CAE] hover:text-white transition-all text-left cursor-pointer flex items-center gap-1.5 group/btn shadow-xs"
                  >
                    <span>{prompt}</span>
                    <ArrowUpRight className="w-3 h-3 text-[#5E6A7D] group-hover/btn:text-[#4ce07a] shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessageBubble;



