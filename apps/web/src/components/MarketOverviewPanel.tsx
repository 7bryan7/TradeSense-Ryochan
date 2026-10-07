import { AlertTriangle, Clock3, Globe2, RefreshCw } from "lucide-react";
import { observedLabel } from "../api";
import { formatDateTime } from "../format";
import { extractMarketOverview } from "../marketOverviewPresentation";
import type { MarketOverview } from "../types";
import { StatePanel, StatusBadge } from "./UiPrimitives";

export function MarketOverviewPanel({ overview, loading, busy, onRefresh, onSelectSymbol }: { overview: MarketOverview | null; loading: boolean; busy: boolean; onRefresh: () => void; onSelectSymbol: (symbol: string) => void }) {
  const evidence = overview?.snapshot;
  const data = evidence?.data ?? {};
  const { topMovers, metrics } = extractMarketOverview(data);
  const availableMetrics = metrics;
  const unavailableCount = metrics.filter(([, value]) => value === "missing data").length;

  return <section className="glass-card market-overview-panel" aria-labelledby="market-overview-title">
    <header className="market-overview-header"><div><p className="eyebrow">RYO MARKET OVERVIEW</p><h2 id="market-overview-title">What is happening across the market?</h2><p>{evidence?.summary.headline ?? "Refresh to save the first broad-market observation for this session."}</p></div><div><span className={`market-freshness freshness-${overview?.freshness ?? "unknown"}`}>{overview?.freshness ?? "unknown"}</span><button type="button" className="button button-secondary" onClick={onRefresh} disabled={busy}>{busy ? <RefreshCw className="spin" /> : <Globe2 />}{busy ? "Fetching…" : evidence ? "Refresh overview" : "Fetch overview"}</button></div></header>
    {!evidence ? <StatePanel compact kind={loading || busy ? "loading" : overview?.latestAttempt?.status === "FAILED" ? "error" : "empty"} icon={Globe2} title={loading || busy ? "Loading market overview" : overview?.latestAttempt?.status === "FAILED" ? "Market refresh failed" : "missing data"} text={loading || busy ? "Reading or refreshing the owned market snapshot." : overview?.latestAttempt?.failure?.message ?? "This read-only action calls RYO market_overview and does not create a decision or change the paper portfolio."} /> : <>
      <div className="market-overview-meta"><StatusBadge value={evidence.status} /><span>{evidence.dataMode.toUpperCase()}</span><span><Clock3 /> {observedLabel(evidence.asOf)}</span><span>{overview?.ageSeconds === null || overview?.ageSeconds === undefined ? "missing data" : `${overview.maxAgeSeconds}s freshness limit`}</span></div>
      {availableMetrics.length ? <div className="market-metric-grid">{availableMetrics.map(([label, value]) => <article key={label}><small>{label}</small><strong>{value}</strong></article>)}</div> : <p className="market-coverage-note">RYO did not supply any recognized overview metrics in this snapshot.</p>}
      <div className="market-overview-details"><div><small>TOP MOVERS</small>{topMovers.length ? <div className="market-movers">{topMovers.map((item, index) => { const candidate = item.trim().toUpperCase(); return ["SOL", "BTC", "ETH"].includes(candidate) ? <button type="button" title={`Select ${candidate}`} onClick={() => onSelectSymbol(candidate)} key={`${item}-${index}`}>{item}</button> : <span title="Display only; this asset is outside the supported analysis list" key={`${item}-${index}`}>{item}</span>; })}</div> : <p>missing data</p>}</div>{unavailableCount > 0 && <p className="market-coverage-note">{unavailableCount} of {metrics.length} standard metrics have missing data.</p>}</div>
      {(evidence.summary.keyPoints?.length || evidence.warnings.length) && <div className="market-notes">{evidence.summary.keyPoints?.slice(0, 3).map((point, index) => <p key={`point-${index}`}>{point}</p>)}{evidence.warnings.map((warning, index) => <p className="warning" key={`warning-${index}`}><AlertTriangle />{warning}</p>)}</div>}
      <details className="market-provenance"><summary>Source and evidence details</summary><div><span>{evidence.tool} · retrieved {formatDateTime(evidence.retrievedAt)}</span><code>{evidence.id}</code>{(evidence.summary.keyPoints?.length ?? 0) > 3 && <ul>{evidence.summary.keyPoints?.slice(3).map((point, index) => <li key={`extra-${index}`}>{point}</li>)}</ul>}</div></details>
    </>}
    {evidence && overview?.latestAttempt?.status === "FAILED" && <div className="market-refresh-failure"><AlertTriangle /><span><strong>{overview.latestAttempt.failure?.code ?? "REFRESH_FAILED"}</strong><p>{overview.latestAttempt.failure?.message}. The previously saved snapshot remains visible with its original age.</p></span></div>}
  </section>;
}
