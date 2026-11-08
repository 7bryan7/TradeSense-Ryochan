import type { Evidence, NewsResponse } from "../types";

function newsItems(evidence: Evidence): Array<{ title: string; url: string; snippet: string; publishedAt?: string }> {
  const items = Array.isArray(evidence.data.results) ? evidence.data.results : [];
  return items.filter((item): item is { title: string; url: string; snippet: string; publishedAt?: string } => {
    if (!item || typeof item !== "object") return false;
    const value = item as Record<string, unknown>;
    return typeof value.title === "string" && typeof value.url === "string" && typeof value.snippet === "string";
  });
}

export function NewsView({ symbol, news, loading, onRefresh }: { symbol: string; news: NewsResponse | null; loading: boolean; onRefresh: () => void }) {
  const items = news?.evidence ? newsItems(news.evidence) : [];
  return <section className="news-page">
    <div className="page-heading"><div><p className="eyebrow">CURRENT CONTEXT</p><h1>Market news</h1><p className="muted">Recent public crypto coverage considered before each paper decision.</p></div><button className="button primary" type="button" onClick={onRefresh} disabled={loading}>{loading ? "Refreshing…" : "Refresh news"}</button></div>
    {!news || news.status === "unavailable" ? <div className="empty-state"><h2>No saved news yet</h2><p>{news?.reason ?? "Refresh to fetch current crypto-market coverage from Tavily."}</p></div> : <div className="news-grid">
      {items.map((item) => <article className="news-card" key={item.url}><div className="news-card-meta"><span>{symbol} · Tavily</span>{item.publishedAt && <time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString()}</time>}</div><h2><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a></h2><p>{item.snippet}</p><a className="news-source" href={item.url} target="_blank" rel="noreferrer">Read source</a></article>)}
    </div>}
    {news?.evidence && <p className="news-footnote">Retrieved {new Date(news.evidence.retrievedAt).toLocaleString()} · Latest saved snapshot</p>}
  </section>;
}
