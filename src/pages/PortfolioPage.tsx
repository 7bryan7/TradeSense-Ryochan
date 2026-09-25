import { PageIntro } from '../components/common/PageIntro';
import React from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { Wallet, ArrowUpRight, ArrowDownRight, RotateCcw, ShieldCheck, History } from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const { portfolio, handleReset } = usePortfolio();

  return (
    <div className="studio-page">
      <PageIntro eyebrow="YOUR PRACTICE ACCOUNT" title="Paper portfolio" description="See where your virtual money sits, what changed, and how each sample trade contributed.">
        <button type="button" onClick={handleReset} className="studio-secondary"><RotateCcw size={14} />Reset sample account</button>
      </PageIntro>
      <div className="studio-note">Sample portfolio · Virtual USD only. Demo scans do not update this balance.</div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-mono text-[#8F9CAE] uppercase">Virtual Cash Balance</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            ${portfolio.virtualCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] font-mono text-[#5E6A7D] mt-0.5 block">Available to practice with</span>
        </div>

        <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-mono text-[#8F9CAE] uppercase">Total Portfolio Equity</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] font-mono text-[#4ce07a] flex items-center mt-0.5 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> +{portfolio.change24hPct}% (24h)
          </span>
        </div>

        <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-mono text-[#8F9CAE] uppercase">Simulated Return</span>
          <div className="text-2xl font-bold font-mono text-[#4ce07a] mt-1">
            +${portfolio.totalPnlUsd.toFixed(2)}
          </div>
          <span className="text-[11px] font-mono text-[#5E6A7D] mt-0.5 block">
            Realized: ${portfolio.totalRealizedPnl.toFixed(2)}
          </span>
        </div>

        <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-mono text-[#8F9CAE] uppercase">Simulated Fees</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            ${portfolio.totalFeesPaid.toFixed(2)}
          </div>
          <span className="text-[11px] font-mono text-[#5E6A7D] mt-0.5 block">
            0.10% per sample execution
          </span>
        </div>
      </div>

      {/* Active Holdings Table */}
      <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4">
          Your open positions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.06] text-[#8F9CAE] text-[11px] uppercase">
                <th className="py-3 px-3">Asset</th>
                <th className="py-3 px-3 text-right">Holdings</th>
                <th className="py-3 px-3 text-right">Avg Cost</th>
                <th className="py-3 px-3 text-right">Current Price</th>
                <th className="py-3 px-3 text-right">Value (USD)</th>
                <th className="py-3 px-3 text-right">Unrealized P&L</th>
                <th className="py-3 px-3 text-right">Portfolio Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {portfolio.holdings.map(h => (
                <tr key={h.symbol} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-3 font-bold text-white flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#15171C] border border-white/[0.08] flex items-center justify-center text-xs text-[#4ce07a]">
                      {h.icon}
                    </span>
                    <span>{h.name} ({h.symbol})</span>
                  </td>
                  <td className="py-3.5 px-3 text-right text-[#8F9CAE]">{h.amount}</td>
                  <td className="py-3.5 px-3 text-right text-[#8F9CAE]">
                    ${h.avgCostPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-3 text-right text-white font-semibold">
                    ${h.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-3 text-right text-white font-bold">
                    ${h.currentValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-3 text-right text-[#4ce07a] font-semibold">
                    +${h.unrealizedPnlUsd.toFixed(2)} (+{h.unrealizedPnlPct}%)
                  </td>
                  <td className="py-3.5 px-3 text-right text-white font-semibold">
                    {h.allocationPct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Ledger Audit History */}
      <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-[#4ce07a]" />
          Sample transaction ledger
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.06] text-[#8F9CAE] text-[11px] uppercase">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Run ID</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Asset</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-right">Exec Price</th>
                <th className="py-3 px-3 text-right">Fees</th>
                <th className="py-3 px-3 text-right">Ending Cash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {portfolio.ledgerHistory.map(evt => (
                <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 text-[#5E6A7D]">{evt.timestamp}</td>
                  <td className="py-3 px-3 text-[#4ce07a] font-medium">{evt.runId}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        evt.action === 'BUY'
                          ? 'bg-[#4ce07a]/15 text-[#4ce07a] border border-[#4ce07a]/30'
                          : evt.action === 'SELL'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-white/[0.06] text-[#8F9CAE]'
                      }`}
                    >
                      {evt.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">{evt.symbol}</td>
                  <td className="py-3 px-3 text-right text-[#8F9CAE]">{evt.amount}</td>
                  <td className="py-3 px-3 text-right text-white font-mono">
                    ${evt.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right text-[#5E6A7D]">${evt.fees.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right text-[#4ce07a] font-bold">
                    ${evt.cashAfter.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
