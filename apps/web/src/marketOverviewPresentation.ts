import { formatCompactUsd } from "./format";

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

function display(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return value.toLocaleString();
  if (typeof value === "string" && value.trim()) return value;
  return "missing data";
}

function percent(value: unknown, fraction = false): string {
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(numeric)) return "missing data";
  const normalized = fraction && Math.abs(numeric) <= 1 ? numeric * 100 : numeric;
  return `${normalized.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}

function usd(value: unknown): string {
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(numeric)) return "missing data";
  return formatCompactUsd(numeric);
}

function movers(value: unknown): string[] {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const groups = value as Record<string, unknown>;
    return [...movers(groups.gainers), ...movers(groups.losers)].slice(0, 6);
  }
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

export function extractMarketOverview(data: Record<string, unknown>) {
  const topMovers = movers(first(data, ["topMovers", "top_movers", "movers"]));
  const sentimentLabel = first(data, ["sentiment.label"]);
  const fearGreed = display(first(data, ["fearGreed", "fear_greed", "sentiment.fear_greed", "sentiment.fear_greed_index"]));
  const metrics = [
    ["Market regime", display(first(data, ["regime", "market_regime"]))],
    ["Fear & greed", sentimentLabel && fearGreed !== "missing data" ? `${fearGreed} · ${String(sentimentLabel)}` : fearGreed],
    ["Market breadth", percent(first(data, ["breadthPercent", "breadth_percent", "breadth.percent", "market.breadth"]), true)],
    ["BTC dominance", percent(first(data, ["btcDominance", "btc_dominance", "dominance.btc", "market.btc_dominance_pct"]))],
    ["Total market cap", usd(first(data, ["totalMarketCapUsd", "total_market_cap_usd", "market_cap_usd", "totals.market_cap_usd", "market.total_market_cap_usd"]))],
    ["24h volume", usd(first(data, ["volume24hUsd", "volume_24h_usd", "total_volume_24h_usd", "totals.volume_24h_usd", "market.total_volume_24h_usd"]))],
  ] as Array<[string, string]>;
  return { topMovers, metrics };
}
