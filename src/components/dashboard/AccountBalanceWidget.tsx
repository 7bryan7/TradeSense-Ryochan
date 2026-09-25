import React from 'react';
import { Wallet } from 'lucide-react';
import { PaperPortfolio } from '../../types/portfolio';

interface AccountBalanceWidgetProps { portfolio: PaperPortfolio; onResetPortfolio?: () => void; }
const money = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
export const AccountBalanceWidget: React.FC<AccountBalanceWidgetProps> = ({ portfolio }) => (
  <section className="dashboard-glass-card rounded-2xl p-5 space-y-5" aria-label="Practice account">
    <div className="flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-sm font-semibold"><Wallet className="h-4 w-4 text-[#4ce07a]" />Practice account</h2><span className="text-xs text-slate-400">Virtual USD</span></div>
    <div><p className="text-xs text-slate-400">Portfolio value</p><p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{money(portfolio.totalValue)}</p><p className={`mt-2 text-xs ${portfolio.totalUnrealizedPnl >= 0 ? 'text-[#4ce07a]' : 'text-rose-400'}`}>{portfolio.totalUnrealizedPnl >= 0 ? '+' : ''}{money(portfolio.totalUnrealizedPnl)} unrealized profit / loss</p></div>
    <div className="h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true"><div className="h-full rounded-full bg-[#4ce07a]" style={{ width: `${Math.max(0, Math.min(100, portfolio.cashExposurePct))}%` }} /></div>
    <dl className="flex justify-between gap-3 text-xs"><div><dt className="text-slate-400">Available cash</dt><dd className="mt-1 font-medium">{money(portfolio.virtualCash)}</dd></div><div className="text-right"><dt className="text-slate-400">Invested in crypto</dt><dd className="mt-1 font-medium">{portfolio.cryptoExposurePct}%</dd></div></dl>
    <p className="border-t border-white/[0.06] pt-3 text-xs leading-relaxed text-slate-400">Sample portfolio. Demo scans do not update this balance.</p>
  </section>
);
export default AccountBalanceWidget;
