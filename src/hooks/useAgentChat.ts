import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, SuggestedPrompt, ToolInvocation } from '../types/chat';
import { Token } from '../types/market';
import { AgentRunRecord } from '../types/run';
import { DEFAULT_SUGGESTED_PROMPTS, generateAgentResponse } from '../data/agentChatKnowledge';

const STORAGE_KEY = 'tradesense_chat_messages_v1';

const INITIAL_AGENT_MESSAGE: ChatMessage = {
  id: 'msg-init-001',
  sender: 'agent',
  timestamp: '14:32:00 UTC',
  content: 'Hello! I am TradeSense, your autonomous market research copilot. I analyze multi-venue RYO tool evidence, synthesize BUY/HOLD/SELL theses, and track simulated execution outcomes. Ask me anything about current token metrics, why a decision was reached, safety disclosures, or candidate comparisons.',
  status: 'complete',
  context: {
    tokenId: 'btc',
    tokenSymbol: 'BTC',
    runId: 'run-20260920-001',
    dataMode: 'FIXTURE',
    asOf: '2026-09-20 14:32 UTC',
  },
  retrievedFacts: [
    {
      source: 'RYO Unified Ingestion Gateway',
      value: 'BTC/USD $111,850 • Volume $24.8B',
      timestamp: '2026-09-20 14:32 UTC',
      tool: 'scan_market',
    },
  ],
  toolInvocations: [
    { toolName: 'scan_market', durationMs: 14, status: 'ok', observationSnippet: 'Market universe live & verified' },
  ],
  suggestedFollowUps: [
    'Why did the agent choose HOLD in this analysis?',
    'What changed in the market over the last 24 hours?',
    'Which safety flags were found, and which checks are unavailable?',
  ],
};

export function useAgentChat(
  currentToken: Token,
  currentRun: AgentRunRecord,
  dataMode: 'LIVE' | 'FIXTURE'
) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return [INITIAL_AGENT_MESSAGE];
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const generation = useRef(0);
  useEffect(() => () => { generation.current += 1; }, []);
  const [currentToolTelemetry, setCurrentToolTelemetry] = useState<ToolInvocation[]>([]);
  const [suggestedPrompts] = useState<SuggestedPrompt[]>(DEFAULT_SUGGESTED_PROMPTS);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignore quota issues
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const cleanText = text.trim();
      if (!cleanText || isProcessing || !currentToken) return;
      const requestGeneration = ++generation.current;

      const userMsgId = `msg-user-${Date.now()}`;
      const agentMsgId = `msg-agent-${Date.now() + 1}`;
      const timeStr = new Date().toTimeString().slice(0, 8) + ' UTC';

      const userMsg: ChatMessage = {
        id: userMsgId,
        sender: 'user',
        timestamp: timeStr,
        content: cleanText,
        status: 'complete',
        context: {
          tokenId: currentToken?.id || 'btc',
          tokenSymbol: currentToken?.symbol || 'BTC',
          runId: currentRun?.id || 'run-20260920-001',
          dataMode,
          asOf: currentRun?.decision?.asOf || '2026-09-20 14:32 UTC',
        },
      };

      // Add user message & create pending agent placeholder
      const pendingAgentMsg: ChatMessage = {
        id: agentMsgId,
        sender: 'agent',
        timestamp: timeStr,
        content: '',
        status: 'fetching_tools',
        context: {
          tokenId: currentToken?.id || 'btc',
          tokenSymbol: currentToken?.symbol || 'BTC',
          runId: currentRun?.id || 'run-20260920-001',
          dataMode,
          asOf: currentRun?.decision?.asOf || '2026-09-20 14:32 UTC',
        },
        toolInvocations: [
          { toolName: 'analyze_token', durationMs: 0, status: 'ok', observationSnippet: 'Querying RYO data...' },
        ],
      };

      setMessages(prev => [...prev, userMsg, pendingAgentMsg]);
      setIsProcessing(true);

      // Phase 1: Tool invocation simulation
      setTimeout(() => {
        if (requestGeneration !== generation.current) return;
        setMessages(prev =>
          prev.map(m =>
            m.id === agentMsgId
              ? {
                  ...m,
                  status: 'synthesizing',
                  toolInvocations: [
                    { toolName: 'scan_market', durationMs: 22, status: 'ok', observationSnippet: 'Market snapshot fresh' },
                    { toolName: 'analyze_token', durationMs: 31, status: 'ok', observationSnippet: 'Evidence calibrated' },
                  ],
                }
              : m
          )
        );
      }, 450);

      // Phase 2: Full structured synthesis
      setTimeout(() => {
        if (requestGeneration !== generation.current) return;
        const fullResponse = generateAgentResponse(cleanText, currentToken, currentRun, dataMode);

        setMessages(prev =>
          prev.map(m =>
            m.id === agentMsgId
              ? {
                  ...m,
                  ...fullResponse,
                  id: agentMsgId,
                  timestamp: new Date().toTimeString().slice(0, 8) + ' UTC',
                  status: 'complete',
                }
              : m
          )
        );
        setIsProcessing(false);
        setCurrentToolTelemetry([]);
      }, 1000);
    },
    [isProcessing, currentToken, currentRun, dataMode]
  );

  const clearConversation = useCallback(() => {
    generation.current += 1;
    setIsProcessing(false);
    setCurrentToolTelemetry([]);
    setMessages([INITIAL_AGENT_MESSAGE]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    messages,
    isProcessing,
    currentToolTelemetry,
    suggestedPrompts,
    sendMessage,
    clearConversation,
  };
}
