import { useEffect, useRef } from "react";
import { ArrowUp, Bot, BrainCircuit, Clock3, Database, Globe2, LoaderCircle, MessageSquare, MessagesSquare, Plus, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { observedLabel } from "../api";
import { formatDateTime } from "../format";
import type { Chat, ChatClassification, ChatDerivation, ChatEvidenceClaim, ChatSource, ConversationSummary, Run } from "../types";
import type { GoogleUser } from "../auth";
import { StatePanel, StatusBadge } from "./UiPrimitives";

const suggestions = [
  { icon: TrendingUp, title: "Analyze the evidence", text: "What does the saved evidence show about this token?" },
  { icon: BrainCircuit, title: "Explain the decision", text: "Why did the agent choose this decision?" },
  { icon: Database, title: "Check data coverage", text: "Which data is present, missing, or stale?" },
  { icon: ShieldAlert, title: "Explore the risk", text: "What could invalidate the current outlook?" },
];

const isDerivation = (claim: ChatEvidenceClaim | ChatDerivation): claim is ChatDerivation => "method" in claim && "inputs" in claim;

function ResearchEvidenceCards({ run, observedFacts, sources }: { run: Run | null; observedFacts: ChatEvidenceClaim[]; sources: ChatSource[] }) {
  const evidence = run?.evidence ?? [];
  const facts = observedFacts.slice(0, 3).map((claim) => claim.text);
  const evidenceItems = evidence.slice(0, 3).map((item) => `${item.tool} · ${item.status.toLowerCase()}`);
  const decisionItems = run?.decision ? [`${run.decision.action} · ${run.decision.summary}`, `Confidence: ${run.decision.confidence}`] : [];
  const riskItems = run?.decision ? [...run.decision.risks, ...run.decision.missingData].slice(0, 3) : [];
  const sourceItems = sources.slice(0, 2).map((source) => `${source.kind === "web" ? "Web" : "RYO"} · ${source.title}`);
  const cards = [
    { key: "facts", label: "OBSERVED FACTS", title: "What the evidence reports", items: facts.length ? facts : evidence.flatMap((item) => item.summary.keyPoints ?? [item.summary.headline]).slice(0, 3), empty: "No saved observed facts yet." },
    { key: "evidence", label: "EVIDENCE PACKET", title: "Sources in this workspace", items: evidenceItems.length ? evidenceItems : sourceItems, empty: "No evidence packet is attached." },
    { key: "decision", label: "DECISION CONTEXT", title: "Saved agent conclusion", items: decisionItems, empty: "Select a saved decision to see its conclusion." },
    { key: "risks", label: "RISKS & DATA GAPS", title: "What could change the view", items: riskItems, empty: "No saved risks or data gaps are available." },
  ];
  return <section className="research-evidence-cards" aria-label="Saved observed facts and evidence">{cards.map((card) => <article className={`research-evidence-card research-evidence-card-${card.key}`} key={card.key}><span>{card.label}</span><h2>{card.title}</h2>{card.items.length ? <ul>{card.items.map((item, index) => <li key={`${card.key}-${index}`}>{item}</li>)}</ul> : <p>{card.empty}</p>}</article>)}</section>;
}

function AnswerClassification({ classification, sources }: { classification: ChatClassification; sources: ChatSource[] }) {
  const sections = [
    { key: "facts", title: "Observed facts", label: "Directly reported by saved evidence", empty: "No directly observed fact was classified for this answer.", icon: Database, claims: classification.observedFacts },
    { key: "calculations", title: "Derived calculations", label: "Computed from stated inputs", empty: "No derived calculation was needed for this answer.", icon: TrendingUp, claims: classification.derivedCalculations },
    { key: "interpretations", title: "AI interpretation", label: "Model reading of the evidence", empty: "No model interpretation was classified for this answer.", icon: BrainCircuit, claims: classification.interpretations },
  ];
  const sourceLabel = (id: string) => {
    const source = sources.find((item) => item.evidenceId === id);
    return source ? `${source.kind === "web" ? "Web" : "RYO"} · ${source.title}` : `Evidence ${id.slice(0, 8)}`;
  };
  return <section className="answer-classification" aria-label="Answer fact classification">{sections.map(({ key, title, label, empty, icon: Icon, claims }) => <article className={`classification-${key}`} key={key}><header><Icon /><span><strong>{title}</strong><small>{label}</small></span></header>{claims.length ? <ul>{claims.map((claim, index) => <li key={`${key}-${index}`}><p>{claim.text}</p>{isDerivation(claim) && <dl><div><dt>Method</dt><dd>{claim.method}</dd></div><div><dt>Inputs</dt><dd>{claim.inputs.join(" · ")}</dd></div></dl>}<span>{claim.evidenceIds.map((id) => <span className="classification-source" title={id} key={id}>{sourceLabel(id)}</span>)}</span></li>)}</ul> : <p className="classification-empty">{empty}</p>}</article>)}</section>;
}

export function ChatView({ chat, conversations, loading, run, runs, user, symbol, question, setQuestion, submit, busy, onSelectConversation, onNewConversation, onSelectRun }: {
  chat: Chat | null; conversations: ConversationSummary[]; loading: boolean; run: Run | null; runs: Run[]; user: GoogleUser; symbol: string; question: string; setQuestion: (value: string) => void; submit: (event: React.FormEvent) => void; busy: boolean; onSelectConversation: (id: string) => void; onNewConversation: () => void; onSelectRun: (run: Run) => void;
}) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const messageEnd = useRef<HTMLDivElement>(null);
  const latestMessage = useRef<HTMLElement>(null);
  const previousConversation = useRef<string | null>(null);
  const previousMessageCount = useRef(0);
  const contextualRun = run?.symbol === symbol ? run : null;
  const compatibleRuns = runs.filter((item) => item.symbol === symbol);
  const latestClassifiedMessage = chat?.messages.slice().reverse().find((message) => message.role === "assistant" && message.classification) ?? null;
  const latestClassification = latestClassifiedMessage?.classification ?? null;
  const observedFacts = latestClassification?.observedFacts ?? [];
  const initials = user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "YOU";
  const applySuggestion = (text: string) => {
    setQuestion(text);
    requestAnimationFrame(() => textarea.current?.focus());
  };

  useEffect(() => {
    if (!chat) return;
    const opened = previousConversation.current !== chat.id;
    const received = chat.messages.length > previousMessageCount.current;
    previousConversation.current = chat.id;
    previousMessageCount.current = chat.messages.length;
    requestAnimationFrame(() => {
      if ((opened || received) && chat.messages.length) latestMessage.current?.scrollIntoView({ block: "start" });
      else if (busy) messageEnd.current?.scrollIntoView({ block: "end" });
    });
  }, [chat?.id, chat?.messages.length, busy]);

  const integrityWarnings = [...new Set(chat?.messages.flatMap((message) => message.integrityWarning ? [message.integrityWarning] : []) ?? [])];

  return <div className="chat-page">
    <aside className="conversation-sidebar" aria-label="Research conversations">
      <header><span><MessagesSquare /><strong>Conversations</strong><small>{conversations.length} saved in this session</small></span><button type="button" aria-label="Start new conversation" title="Start new conversation" disabled={busy || loading} onClick={onNewConversation}><Plus /></button></header>
      <nav aria-label="Saved research conversations">{conversations.map((conversation) => <button type="button" className={conversation.id === chat?.id ? "conversation-item active" : "conversation-item"} aria-current={conversation.id === chat?.id ? "page" : undefined} disabled={busy || loading} onClick={() => onSelectConversation(conversation.id)} key={conversation.id}><span><i>{conversation.symbol?.slice(0, 1) ?? "M"}</i><strong>{conversation.title}</strong></span><small>{conversation.symbol ?? "MARKET"} · {conversation.messageCount} message{conversation.messageCount === 1 ? "" : "s"}</small><p>{conversation.latestMessage?.text ?? "New research conversation"}</p><time dateTime={conversation.updatedAt}>{formatDateTime(conversation.updatedAt)}</time></button>)}</nav>
      {!conversations.length && !loading && <StatePanel compact kind="empty" title="No conversations" text="Start a research chat for the selected market." />}
      <footer>Local session for {user.name} · {chat?.mode?.toUpperCase() ?? "FIXED MODE"}</footer>
    </aside>
    <section className="chat-thread">
    <header className="chat-header"><div><span className="chat-icon"><Sparkles /></span><span><strong>Ask TradeSense</strong><small>{symbol} · {chat?.mode?.toUpperCase() ?? run?.mode?.toUpperCase() ?? "LOADING"} · research only</small></span></div><span className="subtle-pill"><i /> Evidence-linked answers</span></header>
    <div className="chat-canvas">
      {chat && <section className="chat-context-strip" aria-label="Chat research context"><div><small>SELECTED MARKET</small><strong>{symbol}</strong><span>Conversation research target</span></div><div><small>DATA MODE</small><strong>{chat.mode.toUpperCase()}</strong><span>Fixed for this conversation</span></div><label><small>DECISION CONTEXT</small><select aria-label="Select saved decision context" value={contextualRun?.id ?? ""} onChange={(event) => { const selected = compatibleRuns.find((item) => item.id === event.target.value); if (selected) onSelectRun(selected); }}><option value="">No saved decision</option>{compatibleRuns.map((item) => <option key={item.id} value={item.id}>{item.decision?.action ?? item.status} · {formatDateTime(item.createdAt)}</option>)}</select><span>{contextualRun ? "Used when the question asks about a decision" : `No saved ${symbol} run selected`}</span></label><div><small>EVIDENCE AGE</small><strong>{contextualRun?.evidence[0] ? observedLabel(contextualRun.evidence[0].asOf).replace("Observed ", "") : "missing data"}</strong><span>RYO first; Tavily only for public web context</span></div></section>}
      {integrityWarnings.map((warning) => <div className="chat-integrity-warning" role="alert" key={warning}><ShieldAlert /><span><strong>Legacy evidence-mode mismatch</strong>{warning}</span></div>)}
      {loading || !chat ? <StatePanel kind="loading" title="Opening your research conversation" text="Loading the saved conversation and its evidence context." /> : !chat.messages.length ? <section className="chat-welcome"><p className="eyebrow"><Bot /> SAVED RESEARCH SNAPSHOT</p><h1>Evidence at a glance.</h1><p>Review the observed facts, evidence packet, decision context, and known risks before asking a follow-up question.</p><ResearchEvidenceCards run={contextualRun} observedFacts={observedFacts} sources={chat.messages.flatMap((message) => message.sources)} /></section> : <div className="message-list" aria-live="polite">{chat.messages.map((message, index) => <article ref={index === chat.messages.length - 1 ? latestMessage : undefined} key={message.id} className={`message ${message.role}`}><span className="message-avatar">{message.role === "user" ? initials : <Bot />}</span><div><header><strong>{message.role === "user" ? user.name : "TradeSense"}</strong><StatusBadge value={message.status} /><span className="message-time">{message.createdAt ? formatDateTime(message.createdAt) : "Saved message"}{message.runId ? " · decision linked" : ""}</span></header>            <p>{message.text}</p>{message.failure && <div className="message-error"><strong>{message.failure.code}</strong><span>{message.failure.stage}: {message.failure.message}</span>{message.role === "user" && <button type="button" onClick={() => applySuggestion(message.text)}>Prepare retry</button>}</div>}{message.citations.length > 0 && <div className="citation-row"><Database /> {message.citations.length} saved evidence reference(s)</div>}{message.sources.length > 0 && <div className="source-list">{message.sources.map((source, index) => {
          const content = <><span className="source-icon">{source.kind === "web" ? <Globe2 /> : <Database />}</span><span className="source-copy"><strong>{source.title}</strong><small>{source.kind === "web" ? "Tavily web source" : "RYO evidence"} · {source.dataMode.toUpperCase()} · retrieved {formatDateTime(source.retrievedAt)}{source.publishedAt ? ` · published ${formatDateTime(source.publishedAt)}` : ""}</small><code>{source.evidenceId}</code></span></>;
          return source.url ? <a key={`${source.evidenceId}-${index}`} href={source.url} target="_blank" rel="noreferrer" aria-label={`Open source: ${source.title}`}>{content}</a> : <span key={`${source.evidenceId}-${index}`}>{content}</span>;
        })}</div>}</div></article>)}<section className="chat-followups" aria-label="Suggested follow-up questions"><span>Continue the research</span><div>{suggestions.slice(1).map(({ title, text }) => <button type="button" key={title} disabled={busy} onClick={() => applySuggestion(text)}>{title}</button>)}</div></section></div>}
      {busy && <div className="chat-progress" role="status"><LoaderCircle className="spin" /><span><strong>Researching the saved context</strong><small>Checking permitted evidence and preparing a cited answer…</small></span></div>}
      <div ref={messageEnd} />
    </div>
    <form className="chat-composer" onSubmit={submit} aria-busy={busy}><div><MessageSquare /><textarea ref={textarea} aria-label="Ask about the market" rows={1} value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder={`Ask about ${symbol}, its evidence, or the selected decision…`} /><button aria-label={busy ? "Research in progress" : "Send question"} disabled={loading || busy || !question.trim()}>{busy ? <LoaderCircle className="spin" /> : <ArrowUp />}</button></div><p><Clock3 /> Research only · RYO evidence first · Tavily for additional public web context when required · no portfolio changes.</p></form>
    </section>
    <aside className="chat-evidence-panel" aria-label="Answer classification">
      <header><span className="chat-evidence-icon"><Database /></span><span><strong>Answer classification</strong><small>Structured results from the latest answer</small></span></header>
      {latestClassification ? <AnswerClassification classification={latestClassification} sources={latestClassifiedMessage?.sources ?? []} /> : <p className="chat-evidence-empty">Ask a question to see observed facts, derived calculations, and AI interpretation here.</p>}
    </aside>
  </div>;
}
