import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PaperPortfolio } from '../../types/portfolio';
import { Token } from '../../types/market';

interface MyPortfolioWidgetProps {
  portfolio: PaperPortfolio;
  tokens: Token[];
  selectedTokenId: string;
  onSelectToken: (id: string) => void;
}
export const MyPortfolioWidget: React.FC<MyPortfolioWidgetProps> = ({ portfolio, tokens, selectedTokenId, onSelectToken }) => (
  <section className="dashboard-glass-card rounded-2xl p-5">
    <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold">Your sample holdings</h2><Link to="/portfolio" className="flex items-center text-xs text-slate-400 hover:text-white">View all<ChevronRight className="h-3.5 w-3.5" /></Link></div>
    {portfolio.holdings.length === 0 ? <p className="text-sm text-slate-400">No open positions. Your virtual funds are held in cash.</p> :
      <div className="space-y-2">{portfolio.holdings.map(holding => (
        <button type="button" key={holding.tokenId} aria-pressed={holding.tokenId === selectedTokenId} disabled={!tokens.some(token => token.id === holding.tokenId)} onClick={() => onSelectToken(holding.tokenId)} className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors disabled:cursor-default ${holding.tokenId === selectedTokenId ? 'border-[#4ce07a]/30 bg-[#4ce07a]/5' : 'border-white/[0.05] hover:bg-white/[0.03]'}`}>
          <span><span className="block text-sm font-medium">{holding.symbol}</span><span className="mt-1 block text-xs text-slate-400">{holding.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} units</span></span>
          <span className="text-right"><span className="block text-sm tabular-nums">${holding.currentValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span><span className={`mt-1 block text-xs ${holding.unrealizedPnlPct >= 0 ? 'text-[#4ce07a]' : 'text-rose-400'}`}>{holding.unrealizedPnlPct >= 0 ? '+' : ''}{holding.unrealizedPnlPct.toFixed(2)}% unrealized</span></span>
        </button>
      ))}</div>}
  </section>
);
export default MyPortfolioWidget;
