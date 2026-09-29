import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AlertTriangle, X } from "lucide-react";
import { api, conversationStorageKey, demoEntryStorageKey } from "./api";
import { ChatView } from "./components/ChatView";
import { AnalysisView, DashboardView, HistoryView, PortfolioView, ScheduleCard } from "./components/DashboardViews";
import { LandingPage } from "./components/LandingPage";
import { StudioShell } from "./components/StudioShell";
import type { Chat, DashboardSummary, Health, Portfolio, Replay, Run, Schedule, ViewName } from "./types";
import "./styles.css";

function App() {
  const [entered, setEntered] = useState(() => localStorage.getItem(demoEntryStorageKey) === "entered");
  const [view, setView] = useState<ViewName>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [symbol, setSymbol] = useState("SOL");
  const [run, setRun] = useState<Run | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [replay, setReplay] = useState<Replay | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [health, setHealth] = useState<Health | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pendingChat = useRef<{ fingerprint: string; key: string } | null>(null);

  const refreshDashboard = (selectedSymbol = symbol) => api<DashboardSummary>(`/api/dashboard?symbol=${encodeURIComponent(selectedSymbol)}`).then((value) => { setDashboard(value); setPortfolio(value.portfolio); return value; });
  const refreshSchedules = () => api<Schedule[]>("/api/schedules").then(setSchedules);
  const loadReplay = async (selected: Run) => {
    if (!selected.simulation) { setReplay(null); return; }
    try { setReplay(await api<Replay>(`/api/runs/${selected.id}/replay`)); }
    catch { setReplay(null); }
  };
  const selectRun = (selected: Run) => { setRun(selected); setSymbol(selected.symbol); void loadReplay(selected); };
  const refreshRuns = async (preferredId?: string) => {
    const values = await api<Run[]>("/api/history");
    setRuns(values);
    const selected = values.find((value) => value.id === preferredId) ?? values[0];
    if (selected) selectRun(selected);
    return values;
  };

  useEffect(() => {
    if (!entered) return;
    let active = true;
    const report = (value: unknown) => active && setError(value instanceof Error ? value.message : "Unable to load the workspace");
    void refreshSchedules().catch(report);
    void api<Health>("/api/health").then((value) => active && setHealth(value)).catch(report);
    void refreshRuns().catch(report);
    const savedConversation = localStorage.getItem(conversationStorageKey);
    const create = () => api<Chat>("/api/chat/conversations", { method: "POST", body: JSON.stringify({ symbol }) }).then((value) => {
      localStorage.setItem(conversationStorageKey, value.id);
      if (active) setChat(value);
      return value;
    });
    void (savedConversation ? api<Chat>(`/api/chat/conversations/${savedConversation}`).then((value) => active && setChat(value)).catch(create) : create()).catch(report);
    return () => { active = false; };
  }, [entered]);

  useEffect(() => {
    if (!entered) return;
    void refreshDashboard(symbol).catch((value) => setError(value instanceof Error ? value.message : "Unable to load dashboard data"));
  }, [entered, symbol]);

  const enterDemo = () => { localStorage.setItem(demoEntryStorageKey, "entered"); setEntered(true); };

  async function analyze() {
    setBusy(true); setError("");
    try {
      const created = await api<Run>("/api/runs", { method: "POST", body: JSON.stringify({ symbol, idempotencyKey: crypto.randomUUID() }) });
      selectRun(created);
      await Promise.all([refreshDashboard(symbol), refreshRuns(created.id)]);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Analysis failed");
      await refreshRuns().catch(() => undefined);
    } finally { setBusy(false); }
  }

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    if (!chat || !question.trim()) return;
    setBusy(true); setError("");
    try {
      const asksAboutDecision = /\b(why|decision|buy|hold|sell)\b/i.test(question);
      const runId = run && asksAboutDecision ? run.id : undefined;
      const fingerprint = JSON.stringify({ conversationId: chat.id, text: question, symbol, runId });
      if (pendingChat.current?.fingerprint !== fingerprint) pendingChat.current = { fingerprint, key: crypto.randomUUID() };
      const next = await api<Chat>(`/api/chat/conversations/${chat.id}/messages`, { method: "POST", body: JSON.stringify({ text: question, symbol, ...(runId ? { runId } : {}), idempotencyKey: pendingChat.current.key }) });
      setChat(next); setQuestion(""); pendingChat.current = null;
    } catch (value) { setError(value instanceof Error ? value.message : "Chat failed"); }
    finally { setBusy(false); }
  }

  async function addSchedule() {
    setBusy(true); setError("");
    try {
      await api<Schedule>("/api/schedules", { method: "POST", body: JSON.stringify({ symbols: [symbol], cadenceMinutes: 5, maxRunsPerDay: 24 }) });
      await refreshSchedules();
    } catch (value) { setError(value instanceof Error ? value.message : "Schedule creation failed"); }
    finally { setBusy(false); }
  }

  async function changeSchedule(id: string, status: Schedule["status"]) {
    setBusy(true); setError("");
    try {
      await api<Schedule>(`/api/schedules/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await refreshSchedules();
    } catch (value) { setError(value instanceof Error ? value.message : "Schedule update failed"); }
    finally { setBusy(false); }
  }

  const openDecisionChat = () => { setQuestion("Why did the agent choose this decision?"); setView("chat"); };

  if (!entered) return <LandingPage onEnter={enterDemo} />;

  return <StudioShell view={view} onView={setView} portfolio={portfolio} health={health} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}>
    {error && <div role="alert" className="global-error"><AlertTriangle /><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError("")}><X /></button></div>}
    {view === "dashboard" && <><DashboardView symbol={symbol} setSymbol={setSymbol} analyze={analyze} busy={busy} run={run} replay={replay} portfolio={portfolio} comparison={dashboard?.symbol === symbol ? dashboard.comparison : null} onChat={openDecisionChat} /><div className="studio-page schedule-wrap"><ScheduleCard schedules={schedules} symbol={symbol} healthEnabled={Boolean(health?.schedulerEnabled)} busy={busy} addSchedule={addSchedule} changeSchedule={changeSchedule} /></div></>}
    {view === "analysis" && <AnalysisView run={run} onChat={openDecisionChat} />}
    {view === "portfolio" && <PortfolioView portfolio={portfolio} runs={runs} />}
    {view === "history" && <HistoryView runs={runs} selected={run} onSelect={selectRun} />}
    {view === "chat" && <ChatView chat={chat} run={run} symbol={symbol} question={question} setQuestion={setQuestion} submit={ask} busy={busy} />}
  </StudioShell>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
