import { DecisionReport } from '../types/decision';

export const mockBtcDecision: DecisionReport = {
  id: 'dec-btc-20260920-1432',
  runId: 'run-9842-btc-01',
  tokenId: 'btc',
  asOf: '20 Sep 2026, 14:32 UTC',
  action: 'BUY',
  confidenceScore: 82,
  confidenceLevel: 'HIGH',
  rationale: 'Strong momentum with healthy volume and positive market sentiment.',
  explanation: 'BTC shows strong upward momentum with increasing volume and bullish technical indicators. Recent positive news sentiment and on-chain activity suggest continued upside in the short term.',
  whatChanged: [
    {
      metric: 'Volume (24h vs Avg)',
      previous: '$34.2B',
      current: '$48.7B',
      delta: '+42% surge',
      sentiment: 'positive',
      evidenceRefId: 'ev-vol-01',
    },
    {
      metric: 'RSI Momentum (14)',
      previous: '58.1',
      current: '62.3',
      delta: '+4.2 pts (bullish)',
      sentiment: 'positive',
      evidenceRefId: 'ev-tech-01',
    },
    {
      metric: 'News Sentiment Score',
      previous: '5.2 / 10',
      current: '7.0 / 10',
      delta: '+1.8 pts',
      sentiment: 'positive',
      evidenceRefId: 'ev-news-01',
    },
    {
      metric: 'Whale Net Holdings',
      previous: '+120 BTC',
      current: '+4,120 BTC',
      delta: '+3,333%',
      sentiment: 'positive',
      evidenceRefId: 'ev-onchain-01',
    },
  ],
  supportingEvidence: [
    'Spot volume increased 42% above 24h baseline',
    'Positive news sentiment following ETF institutional inflows',
    'RSI momentum steady at 62.3 with MACD bull crossover',
    'On-chain whale wallets accumulated 4,120 BTC',
  ],
  contraryEvidence: [
    'Oversold/overbought near-term resistance zone at $115,000',
    'Macro volatility risk ahead of FOMC minutes in 48 hours',
    'Short-term funding rate slightly elevated at +0.028%',
  ],
  risks: [
    'Orderbook resistance wall of $38M between $114,800 - $115,200',
    'Fast rejection risk if total market volume fails to sustain >$45B',
  ],
  outlook: {
    bias: 'Bullish',
    timeframe: '24h - 72h horizon',
    targetPrice: 116200,
    invalidationPrice: 108500,
    summary: 'Short-term bullish expansion targeting $116,200. Invalidation on breakdown below $108,500.',
  },
  policyOutcome: {
    allowed: true,
    reasonCode: 'POLICY_PASSED',
    message: 'All critical evidence verified. Execution bounded to 10% portfolio equity with 10 bps slippage.',
  },
  modelMetadata: {
    provider: 'Configured Research LLM',
    model: 'TradeSense-Reasoning-v2.1',
    promptVersion: '2026.09-crypto-evidence-v1',
    policyVersion: 'sim-policy-v1.0',
  },
};

export const mockEthDecision: DecisionReport = {
  id: 'dec-eth-20260920-1205',
  runId: 'run-9840-eth-02',
  tokenId: 'eth',
  asOf: '20 Sep 2026, 12:05 UTC',
  action: 'HOLD',
  confidenceScore: 65,
  confidenceLevel: 'MEDIUM',
  rationale: 'Neutral consolidation within tight trading range with balanced buyer/seller pressure.',
  explanation: 'ETH is consolidating in the $4,120 – $4,350 range with declining volatility. L2 network activity remains robust, but short-term momentum indicators lack directional conviction.',
  whatChanged: [
    {
      metric: 'Trading Volatility',
      previous: '4.8%',
      current: '3.85%',
      delta: '-0.95% compression',
      sentiment: 'neutral',
      evidenceRefId: 'ev-eth-01',
    },
    {
      metric: 'Gas Fees & L2 Burn',
      previous: '18 Gwei',
      current: '14 Gwei',
      delta: '-22%',
      sentiment: 'neutral',
      evidenceRefId: 'ev-eth-02',
    },
  ],
  supportingEvidence: [
    'L2 daily active addresses up +6.4%',
    'Staking ratio reached new all-time high of 29.2%',
  ],
  contraryEvidence: [
    'Spot ETF demand was flat over the prior 48 hours',
    'Resistance cluster at $4,350 remains unbroken',
  ],
  risks: [
    'Range breakdown risk if BTC loses $110,000 support',
  ],
  outlook: {
    bias: 'Neutral',
    timeframe: '12h - 48h horizon',
    targetPrice: 4400,
    invalidationPrice: 4050,
    summary: 'Rangebound consolidation. Recommend HOLD with no new simulated order allocation.',
  },
  policyOutcome: {
    allowed: true,
    reasonCode: 'NO_TRADE_HOLD',
    message: 'HOLD decision completed. No paper order generated.',
  },
  modelMetadata: {
    provider: 'Configured Research LLM',
    model: 'TradeSense-Reasoning-v2.1',
    promptVersion: '2026.09-crypto-evidence-v1',
    policyVersion: 'sim-policy-v1.0',
  },
};

export const mockSolDecision: DecisionReport = {
  id: 'dec-sol-20260920-0918',
  runId: 'run-9838-sol-03',
  tokenId: 'sol',
  asOf: '20 Sep 2026, 09:18 UTC',
  action: 'SELL',
  confidenceScore: 74,
  confidenceLevel: 'HIGH',
  rationale: 'Overextended technical indicators with bearish divergences near $204 local top.',
  explanation: 'SOL reached the upper boundary of its ascending channel with 4h RSI printing 78 (overbought). Model recommends realizing profit on existing simulated position.',
  whatChanged: [
    {
      metric: 'RSI Indicator (4h)',
      previous: '68.2',
      current: '78.4',
      delta: '+10.2 (Overbought)',
      sentiment: 'negative',
      evidenceRefId: 'ev-sol-01',
    },
    {
      metric: 'DEX Volume Velocity',
      previous: '$1.4B',
      current: '$920M',
      delta: '-34% slowdown',
      sentiment: 'negative',
      evidenceRefId: 'ev-sol-02',
    },
  ],
  supportingEvidence: [
    'Take-profit threshold reached on simulated position at $198',
    'Bearish divergence on 1h and 4h stochastic oscillators',
  ],
  contraryEvidence: [
    'Ecosystem memecoin frenzy still generating strong transaction fees',
  ],
  risks: [
    'Potential continuation rally toward $210 if market breadth remains high',
  ],
  outlook: {
    bias: 'Bearish',
    timeframe: '6h - 24h horizon',
    targetPrice: 185,
    invalidationPrice: 206,
    summary: 'Pullback anticipated toward $185 support. Policy closes simulated holdings.',
  },
  policyOutcome: {
    allowed: true,
    reasonCode: 'POLICY_PASSED',
    message: 'Full simulated position closed at market reference price with 10 bps fee.',
  },
  modelMetadata: {
    provider: 'Configured Research LLM',
    model: 'TradeSense-Reasoning-v2.1',
    promptVersion: '2026.09-crypto-evidence-v1',
    policyVersion: 'sim-policy-v1.0',
  },
};

