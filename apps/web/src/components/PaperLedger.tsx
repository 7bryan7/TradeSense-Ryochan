import { useMemo, useState } from "react";
import { History as HistoryIcon } from "lucide-react";
import type { Run } from "../types";
import { StatePanel, StatusBadge } from "./UiPrimitives";

type LedgerFilter = "all" | "applied" | "nonfills";

function usdToCents(value: string): bigint {
  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return 0n;
  const fraction = (match[3] ?? "").padEnd(2, "0");
  const cents = BigInt(match[2]) * 100n + BigInt(fraction || "0");
  return match[1] ? -cents : cents;
}

function formatCents(value: bigint, signed = false): string {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const dollars = (absolute / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fraction = (absolute % 100n).toString().padStart(2, "0");
  const sign = negative ? "-" : signed && value > 0n ? "+" : "";
  return `${sign}$${dollars}.${fraction}`;
}

export function PaperLedger({ runs }: { runs: Run[] }) {
  const [filter, setFilter] = useState<LedgerFilter>("all");
  const simulations = useMemo(() => runs
    .filter((run): run is Run & { simulation: NonNullable<Run["simulation"]> } => Boolean(run.simulation))
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)), [runs]);
  const visible = simulations.filter((run) => filter === "all" || (filter === "applied" ? run.simulation.outcome === "APPLIED" : run.simulation.outcome !== "APPLIED")).slice(0, 10);
  const applied = simulations.filter((run) => run.simulation.outcome === "APPLIED");
  const fees = applied.reduce((total, run) => total + usdToCents(run.simulation.feeUsd), 0n);
  const cashFlow = applied.reduce((total, run) => total + usdToCents(run.simulation.cashDeltaUsd), 0n);

  return <section className="glass-card paper-ledger" aria-labelledby="paper-ledger-title">
    <header className="paper-ledger-header">
      <div><p className="eyebrow">PAPER LEDGER</p><h2 id="paper-ledger-title">Recent simulated transactions</h2><p>Saved practice outcomes only. No wallet or real funds are involved.</p></div>
      <HistoryIcon />
    </header>
    {!simulations.length ? <StatePanel kind="empty" icon={HistoryIcon} title="No simulation records" text="Completed paper decisions will appear here with their saved fill or non-fill outcome." /> : <>
      <div className="paper-ledger-summary" aria-label="Paper ledger summary">
        <div><small>SIMULATION RECORDS</small><strong>{simulations.length}</strong><span>Owned run history</span></div>
        <div><small>APPLIED FILLS</small><strong>{applied.length}</strong><span>{simulations.length - applied.length} non-fill outcome(s)</span></div>
        <div><small>FEES PAID</small><strong>{formatCents(fees)}</strong><span>Applied fills only</span></div>
        <div><small>NET CASH FLOW</small><strong className={cashFlow < 0n ? "cash-out" : cashFlow > 0n ? "cash-in" : undefined}>{formatCents(cashFlow, true)}</strong><span>Applied buys and sells</span></div>
      </div>
      <div className="paper-ledger-toolbar">
        <label><span>Show</span><select aria-label="Filter paper ledger" value={filter} onChange={(event) => setFilter(event.target.value as LedgerFilter)}><option value="all">All outcomes</option><option value="applied">Applied fills</option><option value="nonfills">Non-fill outcomes</option></select></label>
        <span>{visible.length} of {simulations.length} records shown</span>
      </div>
      {visible.length ? <div className="paper-transaction-list">
        {visible.map((run) => {
          const simulation = run.simulation;
          const appliedFill = simulation.outcome === "APPLIED";
          const cashDelta = usdToCents(simulation.cashDeltaUsd);
          return <article className="paper-transaction" key={run.id}>
            <div className={`transaction-action action-${simulation.action.toLowerCase()}`} aria-hidden="true">{simulation.action[0]}</div>
            <div className="transaction-title"><strong>{run.symbol} · {simulation.action}</strong><span>{new Date(run.createdAt).toLocaleString()}</span></div>
            <StatusBadge value={simulation.outcome} />
            <dl>
              <div><dt>Quantity</dt><dd>{appliedFill ? simulation.quantity : "—"}</dd></div>
              <div><dt>Fill price</dt><dd>{appliedFill ? `$${Number(simulation.fillPriceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}</dd></div>
              <div><dt>Fee</dt><dd>{formatCents(usdToCents(simulation.feeUsd))}</dd></div>
              <div><dt>Cash effect</dt><dd className={cashDelta < 0n ? "cash-out" : cashDelta > 0n ? "cash-in" : undefined}>{formatCents(cashDelta, true)}</dd></div>
            </dl>
            <p>{simulation.reason}</p>
          </article>;
        })}
      </div> : <StatePanel compact kind="empty" title="No matching simulation records" text="Choose another ledger filter to see the saved paper outcomes." />}
    </>}
  </section>;
}
