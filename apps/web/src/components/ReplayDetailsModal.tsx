import { CheckCircle2, Database, RefreshCw, ShieldCheck, TriangleAlert } from "lucide-react";
import { prettyOutcome } from "../api";
import { formatDateTime } from "../format";
import type { Replay, ReplayResult, Run } from "../types";
import { Modal, StatePanel, StatusBadge } from "./UiPrimitives";

function scaled(value: string, places: number) {
  const negative = value.startsWith("-");
  const digits = (negative ? value.slice(1) : value).padStart(places + 1, "0");
  const whole = digits.slice(0, -places);
  const fraction = digits.slice(-places).replace(/0+$/, "");
  return `${negative ? "-" : ""}${BigInt(whole).toLocaleString()}${fraction ? `.${fraction}` : ""}`;
}

function cents(value: string) {
  const negative = value.startsWith("-");
  const amount = scaled(negative ? value.slice(1) : value, 2);
  return `${negative ? "-" : ""}$${amount}`;
}

function ReplayColumn({ title, result, matches }: { title: string; result: ReplayResult; matches?: boolean }) {
  return <section className="replay-result">
    <header><div><small>{title}</small><StatusBadge value={result.outcome} label={prettyOutcome(result.outcome)} /></div>{matches && <CheckCircle2 aria-label="Matches saved result" />}</header>
    <dl>
      <div><dt>Quantity</dt><dd>{scaled(result.quantityMicros, 6)}</dd></div>
      <div><dt>Fill price</dt><dd>{cents(result.fillPriceCents)}</dd></div>
      <div><dt>Fee</dt><dd>{cents(result.feeCents)}</dd></div>
      <div><dt>Cash change</dt><dd>{cents(result.cashDeltaCents)}</dd></div>
    </dl>
    <p>{result.reason}</p>
  </section>;
}

export function ReplayDetailsModal({ open, onClose, run, replay, loading, error, onRetry }: {
  open: boolean;
  onClose: () => void;
  run: Run | null;
  replay: Replay | null;
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  return <Modal open={open} onClose={onClose} size="large" title="Deterministic replay" description="Recompute the saved paper outcome from its immutable policy inputs without changing the portfolio.">
    {loading ? <StatePanel kind="loading" title="Recomputing the paper outcome" text="TradeSense is applying the saved deterministic policy inputs again." /> : error ? <StatePanel kind="unavailable" title="Replay unavailable" text={error}><button className="button button-secondary" type="button" onClick={onRetry}><RefreshCw /> Try again</button></StatePanel> : !run?.simulation || !replay ? <StatePanel kind="unavailable" title="No replay result" text="A completed decision and saved simulation result are required for deterministic replay." /> : <div className="replay-details">
      <div className={`replay-verdict ${replay.matches ? "match" : "mismatch"}`}>
        {replay.matches ? <ShieldCheck /> : <TriangleAlert />}
        <span><small>REPLAY VERDICT</small><strong>{replay.matches ? "Saved and recomputed results match" : "Mismatch requires review"}</strong><p>{replay.portfolioMutated ? "Unexpected portfolio mutation was reported." : "Read-only verification · the paper portfolio was not changed."}</p></span>
      </div>
      <div className="replay-grid"><ReplayColumn title="SAVED RESULT" result={replay.saved} /><ReplayColumn title="RECOMPUTED RESULT" result={replay.replayed} matches={replay.matches} /></div>
      <div className="replay-meta"><span><Database /> Run {run.id}</span><span>{run.symbol} · {run.decision?.action ?? run.status}</span><span>{formatDateTime(run.createdAt)}</span></div>
    </div>}
  </Modal>;
}
