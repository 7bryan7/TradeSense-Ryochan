import { ArrowUp, Bot, BrainCircuit, Database, Globe2, MessageSquare, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import type { Chat, Run } from "../types";

const suggestions = [
  { icon: TrendingUp, title: "Analyze the evidence", text: "What does the saved evidence show about this token?" },
  { icon: BrainCircuit, title: "Explain the decision", text: "Why did the agent choose this decision?" },
  { icon: Database, title: "Check data coverage", text: "Which data is present, missing, or stale?" },
  { icon: ShieldAlert, title: "Explore the risk", text: "What could invalidate the current outlook?" },
];

export function ChatView({ chat, run, symbol, question, setQuestion, submit, busy }: {
  chat: Chat | null; run: Run | null; symbol: string; question: string; setQuestion: (value: string) => void; submit: (event: React.FormEvent) => void; busy: boolean;
}) {
  return <div className="chat-page">
    <header className="chat-header"><div><span className="chat-icon"><Sparkles /></span><span><strong>Ask TradeSense</strong><small>{symbol} · {chat?.mode?.toUpperCase() ?? run?.mode?.toUpperCase() ?? "LOADING"} · research only</small></span></div><span className="subtle-pill"><i /> Evidence-linked answers</span></header>
    <div className="chat-canvas">
      {!chat?.messages.length ? <section className="chat-welcome"><p className="eyebrow"><Bot /> YOUR RESEARCH COMPANION</p><h1>Make sense of the market.</h1><p>Ask about saved RYO-derived evidence, the selected decision, safety coverage, or the paper outcome. Current public news may add clearly labeled Tavily sources.</p><div className="suggestion-grid">{suggestions.map(({ icon: Icon, title, text }) => <button key={title} onClick={() => setQuestion(text)}><span><strong>{title}</strong><small>{text}</small></span><Icon /></button>)}</div></section> : <div className="message-list" aria-live="polite">{chat.messages.map((message) => <article key={message.id} className={`message ${message.role}`}><span className="message-avatar">{message.role === "user" ? "DT" : <Bot />}</span><div><header><strong>{message.role === "user" ? "Demo trader" : "TradeSense"}</strong><small>{message.status !== "complete" ? message.status : "complete"}</small></header><p>{message.text}</p>{message.failure && <div className="message-error">{message.failure.stage}: {message.failure.message}</div>}{message.citations.length > 0 && <div className="citation-row"><Database /> {message.citations.length} saved evidence reference(s)</div>}{message.sources.length > 0 && <div className="source-list">{message.sources.map((source, index) => source.url ? <a key={`${source.evidenceId}-${index}`} href={source.url} target="_blank" rel="noreferrer"><Globe2 />{source.title}<small>Tavily web source</small></a> : <span key={`${source.evidenceId}-${index}`}><Database />{source.title}<small>RYO evidence</small></span>)}</div>}</div></article>)}</div>}
    </div>
    <form className="chat-composer" onSubmit={submit}><div><MessageSquare /><textarea aria-label="Ask about the market" rows={1} value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder={`Ask about ${symbol}, its evidence, or the selected decision…`} /><button aria-label="Send question" disabled={busy || !question.trim()}><ArrowUp /></button></div><p>Research only · chat cannot place trades, change policy, or enable schedules.</p></form>
  </div>;
}
