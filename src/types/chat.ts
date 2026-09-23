export type ChatSender = 'user' | 'agent';

export type ChatMessageStatus = 'pending' | 'fetching_tools' | 'synthesizing' | 'complete' | 'error';

export interface RetrievedFact {
  source: string;
  value: string;
  timestamp: string;
  tool: string;
}

export interface DerivedCalculation {
  label: string;
  formula: string;
  value: string;
}

export interface AIInterpretation {
  thesis: string;
  confidence: number;
  outlook: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface ToolInvocation {
  toolName: 'scan_market' | 'analyze_token' | 'check_safety' | 'compare_tokens';
  durationMs: number;
  status: 'ok' | 'partial' | 'error';
  observationSnippet?: string;
}

export interface ChatMessageContext {
  tokenId: string;
  tokenSymbol: string;
  runId?: string;
  dataMode: 'LIVE' | 'FIXTURE';
  asOf?: string;
}

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  timestamp: string;
  content: string;
  status: ChatMessageStatus;
  context: ChatMessageContext;
  retrievedFacts?: RetrievedFact[];
  derivedCalculations?: DerivedCalculation[];
  aiInterpretation?: AIInterpretation;
  citedEvidenceIds?: string[];
  missingDisclosures?: string[];
  toolInvocations?: ToolInvocation[];
  suggestedFollowUps?: string[];
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  dataMode: 'LIVE' | 'FIXTURE';
  messages: ChatMessage[];
}

export interface SuggestedPrompt {
  id: string;
  label: string;
  query: string;
  category: 'decision' | 'market' | 'comparison' | 'safety' | 'outlook';
}
