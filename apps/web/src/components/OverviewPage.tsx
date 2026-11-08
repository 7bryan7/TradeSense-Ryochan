import { useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Activity, ArrowRight, Clock3, Expand, Gauge, Minimize2, PieChart, Play, TrendingUp, Wallet } from "lucide-react";
import { money } from "../api";
import { formatCompactNumber, formatDateTime } from "../format";
import { extractMarketOverview } from "../marketOverviewPresentation";
import type { MarketChart, MarketChartRange, MarketOverview, Portfolio, Run, Schedule } from "../types";

const symbols = ["SOL", "BTC", "ETH"];
const assetNames: Record<string, string> = { SOL: "Solana", BTC: "Bitcoin", ETH: "Ethereum" };
const ranges: MarketChartRange[] = ["1D", "1W", "1M", "3M", "1Y"];

function nested(data: Record<string, unknown>, paths: string[]): unknown {
  for (const path of paths) {
    let value: unknown = data;
    for (const key of path.split(".")) value = value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined;
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return null;
}

function numeric(data: Record<string, unknown>, paths: string[]): number | null {
  const value = nested(data, paths);
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function compactUsd(value: number | null): string {
  return value === null ? "missing data" : `$${formatCompactNumber(value)}`;
}

function formatVolume(value: number | null, unit: string | null | undefined): string {
  if (value === null || !unit) return "missing data";
  return unit === "USD" ? compactUsd(value) : `${formatCompactNumber(value)} ${unit}`;
}

function percent(value: number | null): string {
  return value === null ? "missing data" : `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}

function formatPrice(value: number | null, currency = "USD") {
  if (value === null) return "missing data";
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: value < 1 ? 6 : 2 }).format(value); }
  catch { return `${value.toLocaleString()} ${currency}`; }
}

function AssetMark({ symbol }: { symbol: string }) {
  return <span className={`overview-template-asset-mark overview-template-asset-${symbol.toLowerCase()}`} aria-hidden="true">{symbol === "ETH" ? <svg viewBox="0 0 20 28" fill="currentColor"><path d="M10 1 1 15l9 5 9-5L10 1Zm0 21-9-5 9 10 9-10-9 5Z" /></svg> : symbol === "BTC" ? "₿" : "S"}</span>;
}

function chartIntervalLabel(seconds: number): string {
  if (seconds === 86_400) return "Daily intervals";
  if (seconds === 3_600) return "Hourly intervals";
  if (seconds >= 86_400) return `${seconds / 86_400} day intervals`;
  if (seconds >= 3_600) return `${seconds / 3_600} hour intervals`;
  return `${seconds / 60} minute intervals`;
}

function chartTimeLabel(timestamp: string, range: MarketChartRange): string {
  const value = new Date(timestamp);
  if (range === "1D") return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(value);
  if (range === "1W") return new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric" }).format(value);
  if (range === "1Y") return new Intl.DateTimeFormat(undefined, { month: "short", year: "2-digit" }).format(value);
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(value);
}

function chartInspectorTime(timestamp: string, range: MarketChartRange): string {
  const value = new Date(timestamp);
  return new Intl.DateTimeFormat(undefined, range === "1D" || range === "1W"
    ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric", year: "numeric" }).format(value);
}

function OverviewChart({ chart, symbol, marketCap, range, loading, onRange }: { chart: MarketChart | null; symbol: string; marketCap: number | null; range: MarketChartRange; loading: boolean; onRange: (range: MarketChartRange) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [inspectedIndex, setInspectedIndex] = useState<number | null>(null);
  const geometry = useMemo(() => {
    if (!chart || chart.status !== "available" || chart.points.length < 2) return null;
    const width = 820, top = 18, bottom = 210, left = 64, right = 20, volumeTop = 225, volumeBottom = 270;
    const closes = chart.points.map((point) => point.close);
    const rawMin = Math.min(...closes), rawMax = Math.max(...closes);
    const pad = Math.max((rawMax - rawMin) * .12, rawMax * .005, .000001);
    const min = rawMin - pad, max = rawMax + pad;
    const maxVolume = Math.max(...chart.points.map((point) => point.volume ?? 0), 0);
    const x = (index: number) => left + index / Math.max(1, chart.points.length - 1) * (width - left - right);
    const y = (value: number) => bottom - (value - min) / (max - min) * (bottom - top);
    const line = chart.points.map((point, index) => `${index ? "L" : "M"}${x(index).toFixed(2)},${y(point.close).toFixed(2)}`).join(" ");
    const area = `${line} L${x(chart.points.length - 1)},${bottom} L${x(0)},${bottom} Z`;
    return { width, top, bottom, left, right, volumeTop, volumeBottom, rawMin, rawMax, min, max, maxVolume, x, y, line, area };
  }, [chart]);

  const available = !loading && chart?.status === "available" && geometry ? chart : null;
  const points = available?.points ?? [];
  const first = points[0];
  const last = points.at(-1);
  const change = first && last ? (last.close - first.close) / first.close * 100 : null;
  const volume = available && available.volumeCoverage !== "unavailable" ? points.reduce((sum, point) => sum + (point.volume ?? 0), 0) : null;
  const high = points.length ? Math.max(...points.map((point) => point.high ?? point.close)) : null;
  const low = points.length ? Math.min(...points.map((point) => point.low ?? point.close)) : null;
  const xLabels = available ? [0, .25, .5, .75, 1].map((ratio) => Math.round((points.length - 1) * ratio)) : [];
  const yTicks = geometry ? Array.from({ length: 4 }, (_, index) => geometry.max - index / 3 * (geometry.max - geometry.min)) : [];
  const barWidth = geometry ? Math.max(2, Math.min(8, (geometry.width - geometry.left - geometry.right) / Math.max(1, points.length) * .58)) : 2;
  const selectedIndex = inspectedIndex === null ? null : Math.min(inspectedIndex, Math.max(0, points.length - 1));
  const selected = selectedIndex === null ? null : points[selectedIndex] ?? null;
  const selectedX = selectedIndex !== null && geometry ? geometry.x(selectedIndex) : null;
  const selectedY = selected && geometry ? geometry.y(selected.close) : null;
  const tooltipX = selectedX === null || !geometry ? 0 : selectedX > geometry.width - 225 ? selectedX - 204 : selectedX + 14;
  const tooltipY = selectedY === null ? 0 : selectedY < 92 ? selectedY + 14 : selectedY - 78;

  const inspectPointer = (event: PointerEvent<SVGSVGElement>) => {
    if (!geometry || !points.length) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = (event.clientX - bounds.left) / bounds.width * geometry.width;
    const ratio = (pointerX - geometry.left) / (geometry.width - geometry.left - geometry.right);
    setInspectedIndex(Math.max(0, Math.min(points.length - 1, Math.round(ratio * (points.length - 1)))));
  };
  const inspectKeyboard = (event: KeyboardEvent<SVGSVGElement>) => {
    if (!points.length || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const current = inspectedIndex ?? points.length - 1;
    if (event.key === "Home") setInspectedIndex(0);
    else if (event.key === "End") setInspectedIndex(points.length - 1);
    else setInspectedIndex(Math.max(0, Math.min(points.length - 1, current + (event.key === "ArrowLeft" ? -1 : 1))));
  };

  return <section className={`overview-template-chart${expanded ? " is-expanded" : ""}`} aria-labelledby="overview-template-chart-title">
    <header className="overview-template-chart-header"><div><h2 id="overview-template-chart-title">{symbol} price and volume</h2>{available && <small>{available.sourcePath} · {chartIntervalLabel(available.intervalSeconds)}</small>}</div><div className="overview-template-chart-tools" aria-label="Chart time range">{ranges.map((item) => <button type="button" key={item} className={item === range ? "active" : ""} aria-pressed={item === range} onClick={() => onRange(item)}>{item}</button>)}{available && <button type="button" className="overview-template-expand" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? "Exit expanded chart" : "Expand chart"}>{expanded ? <Minimize2 /> : <Expand />}</button>}</div></header>
    <div className="overview-template-chart-content">
      <div className="overview-template-chart-plot">
        {available && geometry && first && last ? <><svg viewBox={`0 0 ${geometry.width} 290`} role="group" tabIndex={0} aria-labelledby="overview-template-svg-title overview-template-svg-desc" onPointerMove={inspectPointer} onPointerLeave={() => setInspectedIndex(null)} onFocus={() => setInspectedIndex((value) => value ?? points.length - 1)} onBlur={() => setInspectedIndex(null)} onKeyDown={inspectKeyboard}>
          <title id="overview-template-svg-title">{symbol} saved live price and volume</title><desc id="overview-template-svg-desc">Saved live observations from {formatDateTime(first.timestamp)} to {formatDateTime(last.timestamp)}.</desc>
          <g className="overview-template-chart-grid">{yTicks.map((tick, index) => <g key={tick}><line x1={geometry.left} x2={geometry.width - geometry.right} y1={geometry.top + index / 3 * (geometry.bottom - geometry.top)} y2={geometry.top + index / 3 * (geometry.bottom - geometry.top)} /><text x="0" y={geometry.top + index / 3 * (geometry.bottom - geometry.top) + 5}>{formatPrice(tick, available.currency).replace(/\.00$/, "")}</text></g>)}{xLabels.map((pointIndex) => <line key={`x-${pointIndex}`} x1={geometry.x(pointIndex)} x2={geometry.x(pointIndex)} y1={geometry.top} y2={geometry.volumeBottom} />)}</g>
          <path className="overview-template-chart-area" d={geometry.area} /><path className="overview-template-chart-line" d={geometry.line} />
          <g className="overview-template-volume-bars">{points.map((point, index) => { const height = point.volume !== null && geometry.maxVolume ? point.volume / geometry.maxVolume * (geometry.volumeBottom - geometry.volumeTop) : 0; return <rect key={point.timestamp} x={geometry.x(index) - barWidth / 2} y={geometry.volumeBottom - height} width={barWidth} height={height} />; })}</g>
          {xLabels.map((pointIndex) => <text className="overview-template-x-label" key={`label-${pointIndex}`} x={geometry.x(pointIndex)} y="288" textAnchor="middle">{chartTimeLabel(points[pointIndex]!.timestamp, range)}</text>)}
          <g className="overview-template-current-price"><circle cx={geometry.x(points.length - 1)} cy={geometry.y(last.close)} r="4" /><rect x={geometry.width - 105} y={geometry.y(last.close) - 14} width="85" height="28" rx="5" /><text x={geometry.width - 62} y={geometry.y(last.close) + 5} textAnchor="middle">{formatPrice(last.close, available.currency)}</text></g>
          {selected && selectedX !== null && selectedY !== null && <g className="overview-template-chart-inspector" aria-hidden="true"><line x1={selectedX} x2={selectedX} y1={geometry.top} y2={geometry.volumeBottom} /><circle cx={selectedX} cy={selectedY} r="5" /><g transform={`translate(${tooltipX} ${tooltipY})`}><rect width="190" height="66" rx="7" /><text className="overview-template-tooltip-price" x="12" y="21">{formatPrice(selected.close, available.currency)}</text><text x="12" y="39">{chartInspectorTime(selected.timestamp, range)}</text><text x="12" y="55">Volume · {formatVolume(selected.volume, available.volumeUnit)}</text></g></g>}
          <rect className="overview-template-chart-hit-area" x={geometry.left} y={geometry.top} width={geometry.width - geometry.left - geometry.right} height={geometry.volumeBottom - geometry.top} />
        </svg><span className="sr-only" aria-live="polite">{selected ? `${chartInspectorTime(selected.timestamp, range)}, close ${formatPrice(selected.close, available.currency)}, volume ${formatVolume(selected.volume, available.volumeUnit)}` : "Use the mouse or arrow keys to inspect chart prices."}</span></> : <div className="overview-template-chart-empty" role="img" aria-label={loading ? `Loading ${range} live chart data` : `${range} live chart data unavailable`} />}
      </div>
      <aside className="overview-template-chart-stats">
        <div className="overview-template-price-stat"><small>{symbol} price</small><span><strong>{last && available ? formatPrice(last.close, available.currency) : "—"}</strong><b className={change === null ? undefined : change < 0 ? "negative" : "positive"}>{change === null ? "—" : `${change > 0 ? "+" : ""}${change.toFixed(2)}%${change < 0 ? " ↓" : " ↑"}`}</b></span></div>
        <dl><div><dt>{range} volume</dt><dd>{volume !== null && available ? formatVolume(volume, available.volumeUnit) : "—"}</dd></div><div><dt>Market cap</dt><dd>{compactUsd(marketCap)}</dd></div><div><dt>{range} high</dt><dd>{high !== null && available ? formatPrice(high, available.currency) : "—"}</dd></div><div><dt>{range} low</dt><dd>{low !== null && available ? formatPrice(low, available.currency) : "—"}</dd></div></dl>
      </aside>
    </div>
  </section>;
}

export function OverviewPage({ symbol, setSymbol, analyze, onMore, busy, run, portfolio, chart, chartRange, chartLoading, setChartRange, marketOverview, schedules }: {
  symbol: string; setSymbol: (symbol: string) => void; analyze: () => void; onMore: () => void; busy: boolean; run: Run | null; portfolio: Portfolio | null; chart: MarketChart | null; chartRange: MarketChartRange; chartLoading: boolean; setChartRange: (range: MarketChartRange) => void; marketOverview: MarketOverview | null; schedules: Schedule[];
}) {
  const tokenEvidence = run?.evidence.find((item) => item.tool === "analyze_token");
  const marketData = marketOverview?.snapshot?.data ?? {};
  const { metrics } = extractMarketOverview(marketData);
  const metric = (label: string) => metrics.find(([name]) => name === label)?.[1] ?? "missing data";
  const tokenData = tokenEvidence?.data ?? {};
  const dominance = numeric(marketData, [`dominance.${symbol.toLowerCase()}`, `market.${symbol.toLowerCase()}_dominance_pct`, `${symbol.toLowerCase()}Dominance`, `${symbol.toLowerCase()}_dominance`]);
  const marketCap = numeric(tokenData, ["marketCapUsd", "market_cap_usd", "market.market_cap_usd"]);
  const updatedAt = run?.completedAt ?? tokenEvidence?.retrievedAt ?? marketOverview?.snapshot?.retrievedAt ?? null;
  const currentSchedule = schedules.find((item) => item.status === "ACTIVE" && item.symbols.includes(symbol));
  const nextAnalysis = currentSchedule ? new Date(currentSchedule.nextSlotAt) : null;
  const pnl = portfolio?.valuation.unrealizedPnlUsd ?? undefined;
  const pnlNumber = pnl === undefined || !Number.isFinite(Number(pnl)) ? null : Number(pnl);
  const analysisLabel = tokenEvidence?.summary.headline ?? "No saved analysis yet";
  const analysisDetail = run?.decision?.summary ?? "Run an analysis to populate the decision context.";

  return <div className="overview-template-page">
    <header className="overview-template-header"><div><h1>Market Overview</h1><p>AI-powered research and paper trading for a clearer view of the market.</p></div><div className="overview-template-actions"><div className="overview-template-run-control"><div className="overview-template-symbol-select"><AssetMark symbol={symbol} /><label htmlFor="overview-template-token-select"><strong>{symbol}</strong><span>{assetNames[symbol] ?? symbol}</span></label><select id="overview-template-token-select" aria-label="Selected asset" value={symbol} onChange={(event) => setSymbol(event.target.value)}>{symbols.map((item) => <option key={item}>{item}</option>)}</select></div><button type="button" onClick={analyze} disabled={busy}><Play />{busy ? "Analyzing…" : "Analyze & Simulate"}</button></div><p className="overview-template-updated"><span>Last updated</span>{updatedAt ? formatDateTime(updatedAt) : "missing data"}</p></div></header>
    <section className="overview-template-summary" aria-label="Latest decision and market summary">
      <article className="overview-template-decision"><div className="overview-template-decision-title"><small>LATEST DECISION</small>{run && <span><i />{run.status}</span>}</div><strong className="overview-template-decision-action">{run?.decision?.action ?? (run?.status === "FAILED" ? "FAILED" : "NO DECISION")}</strong><p className="overview-template-confidence">{run?.decision ? `${run.decision.confidence} confidence` : "Awaiting analysis"}</p><div className="overview-template-decision-copy"><strong>{analysisLabel}</strong><span>{analysisDetail}</span></div><button type="button" className="overview-template-decision-more" onClick={onMore}>More <ArrowRight /></button></article>
      <div className="overview-template-metrics">
        <article><Activity className="blue" /><span><small>Market regime</small><strong>{metric("Market regime")}</strong></span></article>
        <article><Gauge className="amber" /><span><small>Fear &amp; Greed</small><strong>{metric("Fear & greed")}</strong></span></article>
        <article><PieChart className="blue" /><span><small>{symbol} dominance</small><strong>{percent(dominance)}</strong></span></article>
        <article><span className="overview-template-metric-icon"><Wallet /></span><span><small>Total portfolio equity</small><strong>{money(portfolio?.valuation.totalEquityUsd ?? undefined)}</strong></span></article>
        <article><span className="overview-template-metric-icon"><TrendingUp /></span><span><small>Unrealized P&amp;L</small><strong className={pnlNumber !== null && pnlNumber < 0 ? "negative" : "positive"}>{money(pnl)}</strong></span></article>
        <article><Clock3 className="green" /><span><small>Next analysis</small><strong>{nextAnalysis ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(nextAnalysis) : "missing data"}</strong>{nextAnalysis && <em>{new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(nextAnalysis)}</em>}</span></article>
      </div>
    </section>
    <OverviewChart chart={chart} symbol={symbol} marketCap={marketCap} range={chartRange} loading={chartLoading} onRange={setChartRange} />
  </div>;
}
