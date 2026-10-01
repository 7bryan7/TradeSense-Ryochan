import { useEffect, useRef } from "react";
import { ArrowUp, Bot, BrainCircuit, Clock3, Database, Globe2, LoaderCircle, MessageSquare, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { observedLabel } from "../api";
import type { Chat, Run } from "../types";
import { StatePanel, StatusBadge } from "./UiPrimitives";

const suggestions = [
  { icon: TrendingUp, title: "Analyze the evidence", text: "What does the saved evidence show about this token?" },
  { icon: BrainCircuit, title: "Explain the decision", text: "Why did the agent choose this decision?" },
  { icon: Database, title: "Check data coverage", text: "Which data is present, missing, or stale?" },
  { icon: ShieldAlert, title: "Explore the risk", text: "What could invalidate the current outlook?" },
];

export function ChatView({ chat, run, symbol, question, setQuestion, submit, busy }: {
  chat: Chat | null; run: Run | null; symbol: string; question: string; setQuestion: (value: string) => void; submit: (event: React.FormEvent) => void; busy: boolean;
}) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const messageEnd = useRef<HTMLDivElement>(null);
  const contextualRun = run?.symbol === symbol ? run : null;
  const applySuggestion = (text: string) => {
    setQuestion(text);
    requestAnimationFrame(() => textarea.current?.focus());
  };

  useEffect(() => { messageEnd.current?.scrollIntoView({ block: "end" }); }, [chat?.messages.length, busy]);

  return <div className="chat-page">
    <header className="chat-header"><div><span className="chat-icon"><Sparkles /></span><span><strong>Ask TradeSense</strong><small>{symbol} · {chat?.mode?.toUpperCase() ?? run?.mode?.toUpperCase() ?? "LOADING"} · research only</small></span></div><span className="subtle-pill"><i /> Evidence-linked answers</span></header>
    <div className="chat-canvas">
      {chat && <section className="chat-context-strip" aria-label="Chat research context"><div><small>SELECTED MARKET</small><strong>{symbol}</strong><span>Conversation research target</span></div><div><small>DATA MODE</small><strong>{chat.mode.toUpperCase()}</strong><span>Fixed for this conversation</span></div><div><small>DECISION CONTEXT</small><strong>{contextualRun ? `${contextualRun.symbol} · ${contextualRun.decision?.action ?? contextualRun.status}` : "Not selected"}</strong><span>{contextualRun ? `Available run · ${new Date(contextualRun.createdAt).toLocaleString()}` : `No saved ${symbol} run selected`}</span></div><div><small>EVIDENCE AGE</small><strong>{contextualRun?.evidence[0] ? observedLabel(contextualRun.evidence[0].asOf).replace("Observed ", "") : "Unavailable"}</strong><span>RYO first; Tavily only for public web context</span></div></section>}
      {!chat ? <StatePanel kind="loading" title="Opening your research conversation" text="Loading the saved conversation and its evidence context." /> : !chat.messages.length ? <section className="chat-welcome"><p className="eyebrow"><Bot /> YOUR RESEARCH COMPANION</p><h1>Make sense of the market.</h1><p>Ask about saved RYO-derived evidence, the selected decision, safety coverage, or the paper outcome. Current public news may add clearly labeled Tavily sources.</p><div className="suggestion-grid">{suggestions.map(({ icon: Icon, title, text }) => <button type="button" key={title} disabled={busy} onClick={() => applySuggestion(text)}><span><strong>{title}</strong><small>{text}</small></span><Icon /></button>)}</div></section> : <div className="message-list" aria-live="polite">{chat.messages.map((message) => <article key={message.id} className={`message ${message.role}`}><span className="message-avatar">{message.role === "user" ? "DT" : <Bot />}</span><div><header><strong>{message.role === "user" ? "Demo trader" : "TradeSense"}</strong><StatusBadge value={message.status} /><span className="message-time">{message.createdAt ? new Date(message.createdAt).toLocaleString() : "Saved message"}{message.runId ? " · decision linked" : ""}</span></header><p>{message.text}</p>{message.failure && <div className="message-error"><strong>{message.failure.code}</strong><span>{message.failure.stage}: {message.failure.message}</span>{message.role === "user" && <button type="button" onClick={() => applySuggestion(message.text)}>Prepare retry</button>}</div>}{message.citations.length > 0 && <div className="citation-row"><Database /> {message.citations.length} saved evidence reference(s)</div>}{message.sources.length > 0 && <div className="source-list">{message.sources.map((source, index) => {
          const content = <><span className="source-icon">{source.kind === "web" ? <Globe2 /> : <Database />}</span><span className="source-copy"><strong>{source.title}</strong><small>{source.kind === "web" ? "Tavily web source" : "RYO evidence"} · retrieved {new Date(source.retrievedAt).toLocaleString()}{source.publishedAt ? ` · published ${new Date(source.publishedAt).toLocaleDateString()}` : ""}</small><code>{source.evidenceId}</code></span></>;
          return source.url ? <a key={`${source.evidenceId}-${index}`} href={source.url} target="_blank" rel="noreferrer" aria-label={`Open source: ${source.title}`}>{content}</a> : <span key={`${source.evidenceId}-${index}`}>{content}</span>;
        })}</div>}</div></article>)}<section className="chat-followups" aria-label="Suggested follow-up questions"><span>Continue the research</span><div>{suggestions.slice(1).map(({ title, text }) => <button type="button" key={title} disabled={busy} onClick={() => applySuggestion(text)}>{title}</button>)}</div></section></div>}
      {busy && <div className="chat-progress" role="status"><LoaderCircle className="spin" /><span><strong>Researching the saved context</strong><small>Checking permitted evidence and preparing a cited answer…</small></span></div>}
      <div ref={messageEnd} />
    </div>
    <form className="chat-composer" onSubmit={submit} aria-busy={busy}><div><MessageSquare /><textarea ref={textarea} aria-label="Ask about the market" rows={1} value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder={`Ask about ${symbol}, its evidence, or the selected decision…`} /><button aria-label={busy ? "Research in progress" : "Send question"} disabled={busy || !question.trim()}>{busy ? <LoaderCircle className="spin" /> : <ArrowUp />}</button></div><p><Clock3 /> Research only · RYO evidence first · Tavily for additional public web context when required · no portfolio changes.</p></form>
  </div>;
}
