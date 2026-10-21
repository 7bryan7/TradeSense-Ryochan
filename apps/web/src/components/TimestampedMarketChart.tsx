import { useMemo, useState } from "react";
import { BarChart3, LineChart } from "lucide-react";
import { money, observedLabel } from "../api";
import { formatCompactNumber, formatDateTime } from "../format";
import type { MarketChart, Portfolio } from "../types";
import { StatePanel } from "./UiPrimitives";

const WIDTH = 760;
const HEIGHT = 320;
const PRICE_TOP = 24;
const PRICE_BOTTOM = 218;
const VOLUME_TOP = 242;
const VOLUME_BOTTOM = 294;

function duration(seconds: number) {
  if (seconds % 86_400 === 0) return `${seconds / 86_400}d`;
  if (seconds % 3_600 === 0) return `${seconds / 3_600}h`;
  if (seconds % 60 === 0) return `${seconds / 60}m`;
  return `${seconds}s`;
}

function price(value: number, currency: string) {
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: value < 1 ? 6 : 2 }).format(value); }
  catch { return `${value.toLocaleString()} ${currency}`; }
}

const compactValue = (value: number, unit: string | null) => `${formatCompactNumber(value)}${unit ? ` ${unit}` : ""}`;

export function TimestampedMarketChart({ chart, symbol, portfolio = null, compact = false }: { chart: MarketChart | null; symbol: string; portfolio?: Portfolio | null; compact?: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const geometry = useMemo(() => {
    if (!chart || chart.status !== "available") return null;
    const closes = chart.points.map((point) => point.close);
    const rawMin = Math.min(...closes);
    const rawMax = Math.max(...closes);
    const padding = Math.max((rawMax - rawMin) * 0.08, rawMax * 0.002, 0.000001);
    const min = rawMin - padding;
    const max = rawMax + padding;
    const maxVolume = Math.max(...chart.points.map((point) => point.volume ?? 0), 0);
    const x = (index: number) => 20 + index / Math.max(1, chart.points.length - 1) * (WIDTH - 40);
    const y = (value: number) => PRICE_BOTTOM - (value - min) / (max - min) * (PRICE_BOTTOM - PRICE_TOP);
    const pricePath = chart.points.map((point, index) => `${index ? "L" : "M"}${x(index).toFixed(2)},${y(point.close).toFixed(2)}`).join(" ");
    const areaPath = `${pricePath} L${x(chart.points.length - 1).toFixed(2)},${PRICE_BOTTOM} L${x(0).toFixed(2)},${PRICE_BOTTOM} Z`;
    return { min, max, rawMin, rawMax, maxVolume, x, y, pricePath, areaPath };
  }, [chart]);

  const portfolioValue = portfolio?.valuation.totalEquityUsd ?? undefined;

  if (!chart || chart.status === "unavailable" || !geometry) {
    const unavailableReason = !chart ? "Run an analysis to load persisted timestamped evidence." : chart.status === "unavailable" ? chart.reason : "The saved series could not be rendered.";
    return <section className={`glass-card chart-card chart-card-unavailable${compact ? " overview-market-card" : ""}`} aria-labelledby="snapshot-chart-title">
      <div className="card-heading"><div><p className="eyebrow">TIMESTAMPED MARKET CHART</p><h2 id="snapshot-chart-title">{symbol} price and volume</h2></div><span className="subtle-pill">missing data</span></div>
      <div className={compact ? "overview-chart-body" : undefined}>
        <div className="chart-placeholder"><div className="chart-grid" aria-hidden="true"><span /><span /><span /><span /></div><StatePanel compact kind="unavailable" icon={LineChart} title="missing data" text={unavailableReason} /></div>
        {compact && <aside className="overview-live-values" aria-label="Current saved values"><article><small>Total simulated value</small><strong>{money(portfolioValue)}</strong><span>{portfolio ? `${portfolio.valuation.status} paper valuation` : "missing data"}</span></article><article><small>{symbol} live asset value</small><strong>missing data</strong><span>No saved live series</span></article></aside>}
      </div>
    </section>;
  }

  const selectedIndex = Math.min(hovered ?? chart.points.length - 1, chart.points.length - 1);
  const selected = chart.points[selectedIndex]!;
  const first = chart.points[0]!;
  const last = chart.points.at(-1)!;
  const change = ((last.close - first.close) / first.close) * 100;
  const barWidth = Math.max(2, Math.min(14, (WIDTH - 40) / chart.points.length * 0.58));
  const priceTicks = Array.from({ length: 5 }, (_, index) => geometry.max - index / 4 * (geometry.max - geometry.min));
  const miniPoints = chart.points.slice(-18);
  const miniMin = Math.min(...miniPoints.map((point) => point.close));
  const miniMax = Math.max(...miniPoints.map((point) => point.close));
  const miniRange = Math.max(miniMax - miniMin, miniMax * .001, .000001);
  const miniPath = miniPoints.map((point, index) => `${index ? "L" : "M"}${(index / Math.max(1, miniPoints.length - 1) * 108 + 1).toFixed(2)},${(31 - (point.close - miniMin) / miniRange * 27).toFixed(2)}`).join(" ");

  return <section className={`glass-card chart-card market-chart${compact ? " overview-market-card" : ""}`} aria-labelledby="snapshot-chart-title">
    <div className="card-heading"><div><p className="eyebrow">TIMESTAMPED MARKET CHART</p><h2 id="snapshot-chart-title">{chart.symbol} price and volume</h2></div><span className="subtle-pill">{chart.points.length} × {duration(chart.intervalSeconds)} points</span></div>
    {!compact && <div className="chart-summary" aria-label="Chart summary"><div><small>WINDOW</small><strong>{duration(chart.windowSeconds)}</strong></div><div><small>PERIOD CHANGE</small><strong className={change >= 0 ? "positive" : "negative"}>{change >= 0 ? "+" : ""}{change.toFixed(2)}%</strong></div><div><small>CLOSE LOW / HIGH</small><strong>{price(geometry.rawMin, chart.currency)} / {price(geometry.rawMax, chart.currency)}</strong></div><div><small>VOLUME COVERAGE</small><strong>{chart.volumeCoverage}</strong></div></div>}
    <div className={compact ? "overview-chart-body" : undefined}>
    <div className="market-chart-frame">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby="market-chart-svg-title market-chart-svg-desc" onMouseLeave={() => setHovered(null)}>
        <title id="market-chart-svg-title">{chart.symbol} timestamped close price and volume</title>
        <desc id="market-chart-svg-desc">{chart.points.length} saved observations from {formatDateTime(first.timestamp)} through {formatDateTime(last.timestamp)}, priced in {chart.currency}. Period change is {change.toFixed(2)} percent.</desc>
        <defs><linearGradient id={`price-area-${chart.evidenceId}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#4ce07a" stopOpacity=".22" /><stop offset="1" stopColor="#4ce07a" stopOpacity="0" /></linearGradient></defs>
        <g className="market-chart-grid">{priceTicks.map((tick, index) => <g key={tick}><line x1="20" x2={WIDTH - 20} y1={PRICE_TOP + index / 4 * (PRICE_BOTTOM - PRICE_TOP)} y2={PRICE_TOP + index / 4 * (PRICE_BOTTOM - PRICE_TOP)} /><text x="25" y={PRICE_TOP + index / 4 * (PRICE_BOTTOM - PRICE_TOP) - 5}>{price(tick, chart.currency)}</text></g>)}</g>
        <path className="market-chart-area" d={geometry.areaPath} fill={`url(#price-area-${chart.evidenceId})`} />
        <path className="market-chart-line" d={geometry.pricePath} />
        <g className="market-volume-bars" aria-hidden="true">{chart.points.map((point, index) => {
          const height = point.volume !== null && geometry.maxVolume > 0 ? point.volume / geometry.maxVolume * (VOLUME_BOTTOM - VOLUME_TOP) : 0;
          return <rect key={point.timestamp} x={geometry.x(index) - barWidth / 2} y={VOLUME_BOTTOM - height} width={barWidth} height={height} />;
        })}</g>
        <text className="volume-label" x="25" y={VOLUME_TOP - 7}>VOLUME · {chart.volumeUnit ?? "UNIT UNAVAILABLE"}</text>
        <line className="chart-cursor" x1={geometry.x(selectedIndex)} x2={geometry.x(selectedIndex)} y1={PRICE_TOP} y2={VOLUME_BOTTOM} />
        <circle className="chart-selected-point" cx={geometry.x(selectedIndex)} cy={geometry.y(selected.close)} r="4" />
        {chart.points.map((point, index) => <circle className="chart-hit-point" key={`hit-${point.timestamp}`} cx={geometry.x(index)} cy={geometry.y(point.close)} r="11" tabIndex={0} role="button" aria-label={`${formatDateTime(point.timestamp)}: close ${price(point.close, chart.currency)}${point.volume === null ? "" : `, volume ${compactValue(point.volume, chart.volumeUnit)}`}`} onMouseEnter={() => setHovered(index)} onFocus={() => setHovered(index)} />)}
      </svg>
      {!compact && <div className="chart-inspector" aria-live="polite"><span><small>TIME</small><strong>{formatDateTime(selected.timestamp)}</strong></span><span><small>CLOSE</small><strong>{price(selected.close, chart.currency)}</strong></span><span><small>OHLC</small><strong>{selected.open === null ? "missing data" : `${price(selected.open, chart.currency)} · ${price(selected.high!, chart.currency)} · ${price(selected.low!, chart.currency)}`}</strong></span><span><small>VOLUME</small><strong>{selected.volume === null ? "missing data" : compactValue(selected.volume, chart.volumeUnit)}</strong></span></div>}
    </div>
    {compact && <aside className="overview-live-values" aria-label="Current saved values">
      <article><small>Total simulated value</small><strong>{money(portfolioValue)}</strong><span>{portfolio ? `${portfolio.valuation.status} · ${formatDateTime(portfolio.valuation.valuedAt)}` : "missing data"}</span></article>
      <article><div><small>{chart.symbol} live asset value</small><strong>{price(last.close, chart.currency)}</strong><span>{observedLabel(chart.asOf)} · saved live evidence</span></div><svg viewBox="0 0 110 34" role="img" aria-label={`${chart.symbol} recent saved price trend`}><path d={miniPath} /></svg></article>
    </aside>}
    </div>
    <footer><span><BarChart3 /> Saved {chart.sourcePath} · {chart.dataMode} · evidence {chart.evidenceId.slice(0, 8)}</span><span>{formatDateTime(first.timestamp)} → {formatDateTime(last.timestamp)}</span></footer>
  </section>;
}
