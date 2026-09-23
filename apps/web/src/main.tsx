import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Run = { id: string; symbol: string; mode: string; status: string; decision: null | { action: string; summary: string; confidence: string; risks: string[] }; simulation: null | { outcome: string; quantity: string; fillPriceUsd: string; cashDeltaUsd: string; reason: string }; evidence: Array<{ id: string; asOf: string; summary: { headline: string }; warnings: string[] }> };
type Portfolio = { cashUsd: string; mode: string; holdings: Array<{ symbol: string; quantity: string; costBasisUsd: string }> };
type Chat = { id: string; mode: string; messages: Array<{ id: string; role: string; text: string; citations: string[] }> };

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) } });
  if (!response.ok) throw new Error((await response.json()).message ?? `Request failed (${response.status})`);
  return response.json() as Promise<T>;
}

function App() {
  const [symbol, setSymbol] = useState("SOL");
  const [run, setRun] = useState<Run | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refreshPortfolio = () => api<Portfolio>("/api/portfolio").then(setPortfolio).catch((e) => setError(e.message));
  useEffect(() => { void refreshPortfolio(); void api<Chat>("/api/chat/conversations", { method: "POST", body: JSON.stringify({ symbol }) }).then(setChat).catch((e) => setError(e.message)); }, []);

  async function analyze() {
    setBusy(true); setError("");
    try { setRun(await api<Run>("/api/runs", { method: "POST", body: JSON.stringify({ symbol, idempotencyKey: crypto.randomUUID() }) })); await refreshPortfolio(); }
    catch (e) { setError(e instanceof Error ? e.message : "Analysis failed"); }
    finally { setBusy(false); }
  }

  async function ask(event: React.FormEvent) {
    event.preventDefault(); if (!chat || !question.trim()) return;
    setBusy(true); setError("");
    try {
      const asksAboutDecision = /\b(why|decision|buy|hold|sell)\b/i.test(question);
      const next = await api<Chat>(`/api/chat/conversations/${chat.id}/messages`, { method: "POST", body: JSON.stringify({ text: question, symbol, ...(run && asksAboutDecision ? { runId: run.id } : {}), idempotencyKey: crypto.randomUUID() }) });
      setChat(next); setQuestion("");
    } catch (e) { setError(e instanceof Error ? e.message : "Chat failed"); }
    finally { setBusy(false); }
  }

  return <main>
    <header>
      <div><p className="eyebrow">RYO-CHAN RESEARCH · PAPER ONLY</p><h1>TradeSense</h1><p>Evidence in. Explainable practice decision out.</p></div>
      <span className="mode">{portfolio?.mode?.toUpperCase() ?? "LOADING"}</span>
    </header>
    {error && <div role="alert" className="error">{error}</div>}
    <section className="controls card">
      <label>Token<select value={symbol} onChange={(e) => setSymbol(e.target.value)}><option>SOL</option><option>BTC</option><option>ETH</option></select></label>
      <button onClick={analyze} disabled={busy}>{busy ? "Working…" : "Analyze & simulate"}</button>
      <p>No wallet. No real funds. All fills are simulated.</p>
    </section>
    <div className="grid">
      <section className="card hero-card">
        <p className="eyebrow">LATEST DECISION</p>
        <h2>{run?.decision?.action ?? "Run an analysis"}</h2>
        <p>{run?.decision?.summary ?? "Choose a token to create the first evidence-linked practice decision."}</p>
        {run && <div className="meta"><span>{run.symbol}</span><span>{run.status}</span><span>{run.decision?.confidence} confidence</span></div>}
        {run?.evidence[0] && <aside><strong>Evidence</strong><br />{run.evidence[0].summary.headline}<br /><small>{new Date(run.evidence[0].asOf).toLocaleString()} · {run.mode}</small></aside>}
      </section>
      <section className="card">
        <p className="eyebrow">PAPER PORTFOLIO</p><h2>${portfolio?.cashUsd ?? "—"}</h2><p>Virtual cash</p>
        {(portfolio?.holdings.length ?? 0) === 0 ? <p className="muted">No simulated holdings yet.</p> : portfolio?.holdings.map((h) => <p key={h.symbol}><strong>{h.symbol}</strong> {h.quantity} · cost ${h.costBasisUsd}</p>)}
        {run?.simulation && <aside><strong>{run.simulation.outcome}</strong><br />{run.simulation.reason}<br /><small>{run.simulation.quantity} units at ${run.simulation.fillPriceUsd}</small></aside>}
      </section>
    </div>
    <section className="card chat">
      <div><p className="eyebrow">ASK TRADESENSE</p><h2>Market research chat</h2><p className="muted">Answers use the selected token and cite saved evidence. Chat never changes the paper portfolio.</p></div>
      <div className="messages" aria-live="polite">
        {chat?.messages.length ? chat.messages.map((m) => <article key={m.id} className={m.role}><strong>{m.role === "user" ? "You" : "TradeSense"}</strong><p>{m.text}</p>{m.citations.length > 0 && <small>Evidence: {m.citations.join(", ")}</small>}</article>) : <p className="muted">Try: “What does the data show?” or run an analysis and ask “Why this decision?”</p>}
      </div>
      <form onSubmit={ask}><label className="sr-only" htmlFor="question">Ask about the market</label><input id="question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={`Ask about ${symbol} or the latest decision…`} /><button disabled={busy || !question.trim()}>Ask</button></form>
    </section>
  </main>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
