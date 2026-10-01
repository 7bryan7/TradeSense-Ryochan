import { AlertTriangle, Clock3, Globe2, RefreshCw } from "lucide-react";
import { observedLabel } from "../api";
import type { MarketOverview } from "../types";
import { StatePanel, StatusBadge } from "./UiPrimitives";

function atPath(data: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined, data);
}

function first(data: Record<string, unknown>, paths: string[]): unknown {
  for (const path of paths) {
    const value = atPath(data, path);
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return null;
}

function display(value: unknown, suffix = ""): string {
  if (typeof value === "number" && Number.isFinite(value)) return `${value.toLocaleString()}${suffix}`;
  if (typeof value === "string" && value.trim()) return suffix && value.trim().endsWith(suffix) ? value : `${value}${suffix}`;
  return "Unavailable";
}

function usd(value: unknown): string {
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(numeric)) return "Unavailable";
  return `$${Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 2 }).format(numeric)}`;
}

function movers(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 6).map((item) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;
      const symbol = record.symbol ?? record.token ?? record.name;
      if (typeof symbol === "string") return symbol;
    }
    return "Unknown asset";
  });
}

export function MarketOverviewPanel({ overview, loading, busy, onRefresh }: { overview: MarketOverview | null; loading: boolean; busy: boolean; onRefresh: () => void }) {
  const evidence = overview?.snapshot;
  const data = evidence?.data ?? {};
  const topMovers = movers(first(data, ["topMovers", "top_movers", "movers"]));
  const metrics = [
    ["Market regime", display(first(data, ["regime", "market_regime"]))],
    ["Fear & greed", display(first(data, ["fearGreed", "fear_greed", "sentiment.fear_greed"]))],
    ["Market breadth", display(first(data, ["breadthPercent", "breadth_percent", "breadth.percent"]), "%")],
    ["BTC dominance", display(first(data, ["btcDominance", "btc_dominance", "dominance.btc"]), "%")],
    ["Total market cap", usd(first(data, ["totalMarketCapUsd", "total_market_cap_usd", "market_cap_usd", "totals.market_cap_usd"]))],
    ["24h volume", usd(first(data, ["volume24hUsd", "volume_24h_usd", "total_volume_24h_usd", "totals.volume_24h_usd"]))],
  ];

  return <section className="glass-card market-overview-panel" aria-labelledby="market-overview-title">
    <header className="market-overview-header"><div><p className="eyebrow">RYO MARKET OVERVIEW</p><h2 id="market-overview-title">What is happening across the market?</h2><p>{evidence?.summary.headline ?? "Refresh to save the first broad-market observation for this demo session."}</p></div><div><span className={`market-freshness freshness-${overview?.freshness ?? "unknown"}`}>{overview?.freshness ?? "unknown"}</span><button type="button" className="button button-secondary" onClick={onRefresh} disabled={busy}>{busy ? <RefreshCw className="spin" /> : <Globe2 />}{busy ? "Fetching…" : evidence ? "Refresh overview" : "Fetch overview"}</button></div></header>
    {!evidence ? <StatePanel compact kind={loading || busy ? "loading" : overview?.latestAttempt?.status === "FAILED" ? "error" : "empty"} icon={Globe2} title={loading || busy ? "Loading market overview" : overview?.latestAttempt?.status === "FAILED" ? "Market refresh failed" : "No saved market overview"} text={loading || busy ? "Reading or refreshing the owned market snapshot." : overview?.latestAttempt?.failure?.message ?? "This read-only action calls RYO market_overview and does not create a decision or change the paper portfolio."} /> : <>
      <div className="market-overview-meta"><StatusBadge value={evidence.status} /><span>{evidence.dataMode.toUpperCase()}</span><span><Clock3 /> {observedLabel(evidence.asOf)}</span><span>{overview?.ageSeconds === null || overview?.ageSeconds === undefined ? "Age unavailable" : `${overview.ageSeconds}s old · ${overview.maxAgeSeconds}s freshness window`}</span></div>
      <div className="market-metric-grid">{metrics.map(([label, value]) => <article key={label}><small>{label}</small><strong>{value}</strong></article>)}</div>
      <div className="market-overview-details"><div><small>TOP MOVERS</small>{topMovers.length ? <div className="market-movers">{topMovers.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div> : <p>No mover list was supplied.</p>}</div><div><small>PROVENANCE</small><p>{evidence.tool} · retrieved {new Date(evidence.retrievedAt).toLocaleString()}</p><code>{evidence.id}</code></div></div>
      {(evidence.summary.keyPoints?.length || evidence.warnings.length) && <div className="market-notes">{evidence.summary.keyPoints?.map((point, index) => <p key={`point-${index}`}>{point}</p>)}{evidence.warnings.map((warning, index) => <p className="warning" key={`warning-${index}`}><AlertTriangle />{warning}</p>)}</div>}
    </>}
    {evidence && overview?.latestAttempt?.status === "FAILED" && <div className="market-refresh-failure"><AlertTriangle /><span><strong>{overview.latestAttempt.failure?.code ?? "REFRESH_FAILED"}</strong><p>{overview.latestAttempt.failure?.message}. The previously saved snapshot remains visible with its original age.</p></span></div>}
  </section>;
}
