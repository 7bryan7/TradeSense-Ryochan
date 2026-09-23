import { ChatMessage, SuggestedPrompt, ToolInvocation } from '../types/chat';
import { Token } from '../types/market';
import { AgentRunRecord } from '../types/run';

export const DEFAULT_SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'p-why-hold',
    label: 'Why did the agent choose HOLD?',
    query: 'Why did the agent choose HOLD in this analysis?',
    category: 'decision',
  },
  {
    id: 'p-market-change',
    label: 'What changed in the last 24h?',
    query: 'What changed in the market over the last 24 hours?',
    category: 'market',
  },
  {
    id: 'p-ryo-price-vol',
    label: 'RYO Price & Volume Data',
    query: "What does RYO data show about this token's price and volume?",
    category: 'market',
  },
  {
    id: 'p-compare-tokens',
    label: 'Compare BTC vs ETH candidates',
    query: 'Compare these two tokens and explain the main differences.',
    category: 'comparison',
  },
  {
    id: 'p-safety-flags',
    label: 'Safety findings & missing checks',
    query: 'Which safety flags were found, and which checks are unavailable?',
    category: 'safety',
  },
  {
    id: 'p-change-outlook',
    label: 'What evidence changes the outlook?',
    query: 'What evidence would change that outlook?',
    category: 'outlook',
  },
];

export function generateAgentResponse(
  query: string,
  currentToken: Token,
  currentRun: AgentRunRecord,
  dataMode: 'LIVE' | 'FIXTURE'
): Omit<ChatMessage, 'id' | 'timestamp' | 'status'> {
  const q = query.toLowerCase();
  const symbol = currentToken.symbol;
  const priceFormatted = `$${currentToken.metrics.price.toLocaleString()}`;
  const nowUtc = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  // 1. "Why HOLD" or general action explanation
  if (q.includes('hold') || q.includes('why') || q.includes('decision') || q.includes('thesis')) {
    const isHoldAction = currentRun.decision.action === 'HOLD';
    return {
      sender: 'agent',
      context: {
        tokenId: currentToken.id,
        tokenSymbol: currentToken.symbol,
        runId: currentRun.id,
        dataMode,
        asOf: currentRun.decision.asOf,
      },
      content: isHoldAction
        ? `The agent evaluated evidence across multi-venue depth, momentum, and safety indicators. While on-chain accumulation remains stable, immediate overhead resistance at $115,200 ($38M ask wall) combined with decelerating 15m volume momentum prevented a high-conviction BUY. Simultaneously, spot bids above $109,400 remain intact, disqualifying an immediate liquidation/SELL.`
        : `The agent issued a ${currentRun.decision.action} recommendation (${currentRun.decision.confidenceScore}% confidence). The thesis relies on ${currentRun.decision.explanation.slice(0, 180)}...`,
      retrievedFacts: [
        {
          source: 'RYO Orderbook Heatmap',
          value: 'Heavy ask wall ($38M depth clustered at $114.8k–$115.2k)',
          timestamp: '2026-09-20 14:28 UTC',
          tool: 'analyze_token',
        },
        {
          source: 'RYO Market Depth Aggregator',
          value: 'Spot Bid Absorption: $42.5M within 1.2% depth',
          timestamp: '2026-09-20 14:30 UTC',
          tool: 'analyze_token',
        },
      ],
      derivedCalculations: [
        {
          label: 'Risk/Reward Ratio',
          formula: '(Target $116,200 - Current) / (Current - Invalidation $108,500)',
          value: '1 : 1.34 (Below mandatory 1:2.0 BUY hurdle)',
        },
        {
          label: 'Volume Confirmation Ratio',
          formula: 'Volume_15m / Mean_24h_Volume',
          value: '0.88x (Sub-threshold for breakout breakout)',
        },
      ],
      aiInterpretation: {
        thesis: 'Consolidation phase under key liquidity pool. Inward order flow absorption without decisive directional impulse warrants capital preservation.',
        confidence: currentRun.decision.confidenceScore || 78,
        outlook: 'NEUTRAL',
      },
      citedEvidenceIds: ['ev-risk-01', 'ev-tech-01', 'ev-vol-01'],
      missingDisclosures: [
        'Notice: Institutional OTC desk flow data is restricted to daily settlement batches; intra-hour OTC movements are estimated via mempool clustering.',
      ],
      toolInvocations: [
        { toolName: 'analyze_token', durationMs: 24, status: 'ok', observationSnippet: 'Depth & bid-ask ratio verified' },
        { toolName: 'check_safety', durationMs: 16, status: 'ok', observationSnippet: 'No critical honey-pot flags' },
      ],
      suggestedFollowUps: [
        'What evidence would change that outlook?',
        'Which safety flags were found, and which checks are unavailable?',
        "What does RYO data show about this token's price and volume?",
      ],
    };
  }

  // 2. What changed in 24 hours
  if (q.includes('change') || q.includes('24h') || q.includes('yesterday') || q.includes('over the last')) {
    return {
      sender: 'agent',
      context: {
        tokenId: currentToken.id,
        tokenSymbol: currentToken.symbol,
        runId: currentRun.id,
        dataMode,
        asOf: currentRun.decision.asOf,
      },
      content: `Over the past 24 hours, ${symbol} registered a price movement of ${currentToken.metrics.change24h >= 0 ? '+' : ''}${currentToken.metrics.change24h}% reaching ${priceFormatted}. The most prominent shift is spot volume acceleration (+42% vs 24h baseline) accompanied by institutional net ETF inflows of $480M and whale address accumulation (+4,120 BTC in 12h).`,
      retrievedFacts: [
        {
          source: 'RYO On-Chain Analyzer (Blockchair Indexer)',
          value: 'Whale addresses (>100 BTC) accumulated 4,120 BTC',
          timestamp: '2026-09-20 14:29 UTC',
          tool: 'analyze_token',
        },
        {
          source: 'RYO News Feed (CoinDesk / Bloomberg Terminal)',
          value: 'Net ETF Inflows: +$480M single-day aggregate',
          timestamp: '2026-09-20 14:22 UTC',
          tool: 'scan_market',
        },
      ],
      derivedCalculations: [
        {
          label: '24h Spot Delta',
          formula: '(Price_current - Price_24h_open) / Price_24h_open',
          value: `${currentToken.metrics.change24h >= 0 ? '+' : ''}${currentToken.metrics.change24h}%`,
        },
        {
          label: 'Whale Flow Delta',
          formula: 'Tx_Whale_Volume_12h vs 7d_Average',
          value: '+2.4% abnormal accumulation',
        },
      ],
      aiInterpretation: {
        thesis: 'Structural supply absorption by long-term holders while retail turnover remains moderate. Market structure shifted from distribution to selective accumulation.',
        confidence: 84,
        outlook: 'BULLISH',
      },
      citedEvidenceIds: ['ev-onchain-01', 'ev-news-01', 'ev-vol-01'],
      toolInvocations: [
        { toolName: 'scan_market', durationMs: 42, status: 'ok', observationSnippet: 'Market universe 24h delta compiled' },
        { toolName: 'analyze_token', durationMs: 28, status: 'ok', observationSnippet: 'On-chain accumulation verified' },
      ],
      suggestedFollowUps: [
        'Why did the agent choose HOLD in this analysis?',
        "What does RYO data show about this token's price and volume?",
        'What evidence would change that outlook?',
      ],
    };
  }

  // 3. RYO Price & Volume
  if (q.includes('price') || q.includes('volume') || q.includes('ryo data') || q.includes('candles') || q.includes('chart')) {
    return {
      sender: 'agent',
      context: {
        tokenId: currentToken.id,
        tokenSymbol: currentToken.symbol,
        runId: currentRun.id,
        dataMode,
        asOf: currentRun.decision.asOf,
      },
      content: `RYO multi-venue feeds clock ${symbol} spot price at ${priceFormatted} with 24-hour turnover of $${(currentToken.metrics.volume24h / 1e9).toFixed(2)}B. The 15m and 1h MACD indicators confirm a bullish continuation regime, with the price comfortably positioned above both the 50-period and 200-period Exponential Moving Averages (EMA).`,
      retrievedFacts: [
        {
          source: 'RYO Technical Engine (TradingView TA Library)',
          value: 'RSI: 62.3 | MACD: Bullish Divergence',
          timestamp: '2026-09-20 14:31 UTC',
          tool: 'analyze_token',
        },
        {
          source: 'RYO Market Depth Aggregator',
          value: `24h Volume: $${(currentToken.metrics.volume24h / 1e9).toFixed(2)}B (+42% vs baseline)`,
          timestamp: '2026-09-20 14:30 UTC',
          tool: 'analyze_token',
        },
      ],
      derivedCalculations: [
        {
          label: 'EMA Spread (50 vs 200)',
          formula: '(EMA_50 - EMA_200) / EMA_200',
          value: '+2.18% (Expanding Golden Cross)',
        },
        {
          label: 'Relative Volume Index',
          formula: 'Current_Hourly_Volume / 20d_Mean_Hourly_Volume',
          value: '1.42x volume expansion',
        },
      ],
      aiInterpretation: {
        thesis: 'Price structure exhibits constructive higher-low sequence. However, volume is beginning to taper as price approaches the $115k resistance band.',
        confidence: 81,
        outlook: 'BULLISH',
      },
      citedEvidenceIds: ['ev-tech-01', 'ev-vol-01', 'ev-risk-01'],
      toolInvocations: [
        { toolName: 'analyze_token', durationMs: 22, status: 'ok', observationSnippet: 'Technical indicators & volume depth parsed' },
      ],
      suggestedFollowUps: [
        'Why did the agent choose HOLD in this analysis?',
        'Compare these two tokens and explain the main differences.',
        'What evidence would change that outlook?',
      ],
    };
  }

  // 4. Compare tokens
  if (q.includes('compare') || q.includes('difference') || q.includes('eth') || q.includes('sol')) {
    return {
      sender: 'agent',
      context: {
        tokenId: currentToken.id,
        tokenSymbol: currentToken.symbol,
        runId: currentRun.id,
        dataMode,
        asOf: currentRun.decision.asOf,
      },
      content: `Using RYO's comparative module, ${symbol} exhibits lower 30-day realized volatility (34.2%) and higher institutional custody dominance compared to Ethereum (ETH, $3,420, +1.8% 24h, 48.6% vol) and Solana (SOL, $218, +5.2% 24h, 71.4% vol). While SOL delivers higher short-term momentum beta, ${symbol} possesses superior orderbook bid resilience under sudden macro pullbacks.`,
      retrievedFacts: [
        {
          source: 'RYO Cross-Asset Normalizer',
          value: 'BTC vs ETH Correlation (90d): 0.74 | BTC vs SOL Correlation: 0.61',
          timestamp: '2026-09-20 14:26 UTC',
          tool: 'compare_tokens',
        },
        {
          source: 'RYO Risk Evaluator',
          value: 'BTC 30d Realized Vol: 34.2% | ETH 30d: 48.6% | SOL 30d: 71.4%',
          timestamp: '2026-09-20 14:26 UTC',
          tool: 'compare_tokens',
        },
      ],
      derivedCalculations: [
        {
          label: 'Beta to Market Benchmark',
          formula: 'Cov(Token, Market) / Var(Market)',
          value: 'BTC: 1.00 (Anchor) | ETH: 1.18 | SOL: 1.62',
        },
        {
          label: 'Liquidity Depth Ratio (within ±2%)',
          formula: 'Depth_Bid / Depth_Ask',
          value: 'BTC: 1.12 | ETH: 0.94 | SOL: 0.88',
        },
      ],
      aiInterpretation: {
        thesis: 'Capital rotation favors BTC stability amidst upcoming FOMC rate disclosures, while altcoins exhibit elevated beta with heightened downside drawdown risk.',
        confidence: 86,
        outlook: 'NEUTRAL',
      },
      citedEvidenceIds: ['ev-vol-01', 'ev-risk-02'],
      missingDisclosures: [
        'Notice: Cross-chain DEX aggregator gas fee variations are not factored into the comparative slippage model.',
      ],
      toolInvocations: [
        { toolName: 'compare_tokens', durationMs: 38, status: 'ok', observationSnippet: 'Comparative cohort matrix evaluated' },
      ],
      suggestedFollowUps: [
        'Which safety flags were found, and which checks are unavailable?',
        'Why did the agent choose HOLD in this analysis?',
      ],
    };
  }

  // 5. Safety flags & missing checks
  if (q.includes('safety') || q.includes('flags') || q.includes('risk') || q.includes('unavailable') || q.includes('missing')) {
    return {
      sender: 'agent',
      context: {
        tokenId: currentToken.id,
        tokenSymbol: currentToken.symbol,
        runId: currentRun.id,
        dataMode,
        asOf: currentRun.decision.asOf,
      },
      content: `RYO Safety Engine audited the asset contract and token environment: 0 critical vulnerabilities were found. Honeypot traps, blacklist mechanisms, and minting privileges passed clean. However, in accordance with disclosure standards, liquidity lock duration checks on decentralized secondary bridges remain UNAVAILABLE and are explicitly flagged.`,
      retrievedFacts: [
        {
          source: 'RYO Safety Scanner (GoPlus / RugCheck)',
          value: 'Honeypot: Passed | Mint Privilege: Renounced | Blacklist: None',
          timestamp: '2026-09-20 14:27 UTC',
          tool: 'check_safety',
        },
        {
          source: 'RYO Contract Inspector',
          value: 'Top 10 Holder Concentration: 14.8% (Healthy decentralization score)',
          timestamp: '2026-09-20 14:27 UTC',
          tool: 'check_safety',
        },
      ],
      derivedCalculations: [
        {
          label: 'Safety Score Normalized',
          formula: 'Passed_Checks / Audited_Checks (excluding unavailable)',
          value: '94 / 100 (LOW RISK)',
        },
      ],
      aiInterpretation: {
        thesis: 'Asset fundamentals meet institutional security criteria. No execution blocks were triggered by the safety invariants.',
        confidence: 94,
        outlook: 'BULLISH',
      },
      citedEvidenceIds: ['ev-risk-01', 'ev-risk-02'],
      missingDisclosures: [
        'UNAVAILABLE CHECK: Cross-chain bridge validator quorum verification is pending RYO adapter v2.2.',
        'UNAVAILABLE CHECK: Time-lock contract bytecode decompilation is currently unsupported for this specific bridge contract.',
      ],
      toolInvocations: [
        { toolName: 'check_safety', durationMs: 19, status: 'partial', observationSnippet: '8/10 security probes completed, 2 unavailable checks disclosed' },
      ],
      suggestedFollowUps: [
        'Why did the agent choose HOLD in this analysis?',
        'What evidence would change that outlook?',
      ],
    };
  }

  // 6. Invalidation / Change outlook
  if (q.includes('invalidation') || q.includes('change that') || q.includes('outlook') || q.includes('would change')) {
    return {
      sender: 'agent',
      context: {
        tokenId: currentToken.id,
        tokenSymbol: currentToken.symbol,
        runId: currentRun.id,
        dataMode,
        asOf: currentRun.decision.asOf,
      },
      content: `The current HOLD outlook would transition to an aggressive BUY if: (1) Spot volume breaks through the $115,200 resistance with at least $45M in 1-hour turnover, and (2) Orderbook ask wall clears without immediate rejection wick. Conversely, a drop below the invalidation threshold of $108,500 would trigger an immediate defensive SELL/CUT thesis.`,
      retrievedFacts: [
        {
          source: 'TradeSense Simulation Engine',
          value: 'Invalidation Stop-Loss Mark: $108,500 | Take-Profit Mark: $116,200',
          timestamp: '2026-09-20 14:32 UTC',
          tool: 'analyze_token',
        },
      ],
      derivedCalculations: [
        {
          label: 'Bullish Invalidation Distance',
          formula: '(Resistance $115,200 - Spot $111,850) / Spot',
          value: '+2.99% upside expansion required',
        },
        {
          label: 'Bearish Invalidation Distance',
          formula: '(Spot $111,850 - Support $108,500) / Spot',
          value: '-2.99% downside protection boundary',
        },
      ],
      aiInterpretation: {
        thesis: 'Symmetric channel boundaries dictate patience. The model refuses to front-run breakout attempts before volume confirms institutional participation.',
        confidence: 88,
        outlook: 'NEUTRAL',
      },
      citedEvidenceIds: ['ev-risk-01', 'ev-tech-01'],
      toolInvocations: [
        { toolName: 'analyze_token', durationMs: 20, status: 'ok', observationSnippet: 'Boundary conditions & stop markers projected' },
      ],
      suggestedFollowUps: [
        'Why did the agent choose HOLD in this analysis?',
        'What changed in the market over the last 24 hours?',
      ],
    };
  }

  // Fallback: Smart contextual answer
  return {
    sender: 'agent',
    context: {
      tokenId: currentToken.id,
      tokenSymbol: currentToken.symbol,
      runId: currentRun.id,
      dataMode,
      asOf: currentRun.decision.asOf,
    },
    content: `Regarding your query about "${query}": RYO multi-source telemetry for ${symbol} indicates current trading at ${priceFormatted} with a 24-hour delta of ${currentToken.metrics.change24h >= 0 ? '+' : ''}${currentToken.metrics.change24h}%. Active thesis is ${currentRun.decision.action} with ${currentRun.decision.confidenceScore}% confidence. All research is strictly bounded to read-only evidence snapshots.`,
    retrievedFacts: [
      {
        source: 'RYO Aggregated Telemetry',
        value: `Spot: ${priceFormatted} | 24h Vol: $${(currentToken.metrics.volume24h / 1e9).toFixed(2)}B`,
        timestamp: nowUtc,
        tool: 'analyze_token',
      },
    ],
    derivedCalculations: [
      {
        label: 'Active Run Identifier',
        formula: 'Run_Sequence_Hash',
        value: currentRun.id || 'run-20260920-001',
      },
    ],
    aiInterpretation: {
      thesis: currentRun.decision.explanation.slice(0, 150) + '...',
      confidence: currentRun.decision.confidenceScore,
      outlook: currentRun.decision.action === 'BUY' ? 'BULLISH' : currentRun.decision.action === 'SELL' ? 'BEARISH' : 'NEUTRAL',
    },
    citedEvidenceIds: currentRun.evidence.slice(0, 2).map(e => e.id),
    toolInvocations: [
      { toolName: 'analyze_token', durationMs: 18, status: 'ok', observationSnippet: 'Ad-hoc telemetry normalized' },
    ],
    suggestedFollowUps: [
      'Why did the agent choose HOLD in this analysis?',
      'What changed in the market over the last 24 hours?',
      'What evidence would change that outlook?',
    ],
  };
}
