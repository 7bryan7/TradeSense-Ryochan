import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { api, conversationStorageKey, demoEntryStorageKey } from "./api";
import { ChatView } from "./components/ChatView";
import { AnalysisView, DashboardView, HistoryView, PortfolioView, ScheduleCard } from "./components/DashboardViews";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { LandingPage } from "./components/LandingPage";
import { ReplayDetailsModal } from "./components/ReplayDetailsModal";
import { StudioShell } from "./components/StudioShell";
import { ErrorNotice } from "./components/UiPrimitives";
import type { Chat, DashboardSummary, Health, MarketOverview, Portfolio, Replay, Run, Schedule, ViewName } from "./types";
import "./styles.css";

const viewNames = new Set<ViewName>(["dashboard", "analysis", "chat", "portfolio", "history"]);
const viewTitles: Record<ViewName, string> = { dashboard: "Market overview", analysis: "AI reasoning", chat: "Ask TradeSense", portfolio: "Paper portfolio", history: "Decision history" };

function readNavigationLocation(): { view: ViewName; runId: string | null } {
  const params = new URLSearchParams(window.location.search);
  const requestedView = params.get("view") as ViewName | null;
  const requestedRun = params.get("run");
  return {
    view: requestedView && viewNames.has(requestedView) ? requestedView : "dashboard",
    runId: requestedRun && /^[0-9a-f-]{36}$/i.test(requestedRun) ? requestedRun : null,
  };
}

function navigationHref(view: ViewName, runId?: string | null): string {
  const url = new URL(window.location.href);
  url.searchParams.set("view", view);
  if ((view === "analysis" || view === "history") && runId) url.searchParams.set("run", runId);
  else url.searchParams.delete("run");
  return `${url.pathname}${url.search}${url.hash}`;
}

function App() {
  const initialNavigation = useRef(readNavigationLocation()).current;
  const [entered, setEntered] = useState(() => localStorage.getItem(demoEntryStorageKey) === "entered");
  const [view, setView] = useState<ViewName>(initialNavigation.view);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [symbol, setSymbol] = useState("SOL");
  const [run, setRun] = useState<Run | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [replay, setReplay] = useState<Replay | null>(null);
  const [replayOpen, setReplayOpen] = useState(false);
  const [replayLoading, setReplayLoading] = useState(false);
  const [replayError, setReplayError] = useState("");
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketBusy, setMarketBusy] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [health, setHealth] = useState<Health | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pendingChat = useRef<{ fingerprint: string; key: string } | null>(null);
  const replayRequest = useRef(0);
  const requestedRunId = useRef<string | null>(initialNavigation.runId);
  const currentView = useRef<ViewName>(initialNavigation.view);
  const ownedRuns = useRef<Run[]>([]);
  const shortcutPrefix = useRef(false);
  const shortcutTimer = useRef<number | null>(null);
  currentView.current = view;

  const refreshDashboard = (selectedSymbol = symbol) => api<DashboardSummary>(`/api/dashboard?symbol=${encodeURIComponent(selectedSymbol)}`).then((value) => { setDashboard(value); setPortfolio(value.portfolio); return value; });
  const refreshSchedules = () => api<Schedule[]>("/api/schedules").then(setSchedules);
  const loadMarketOverview = async () => {
    setMarketLoading(true);
    try { const value = await api<MarketOverview>("/api/market"); setMarketOverview(value); return value; }
    finally { setMarketLoading(false); }
  };
  const loadReplay = async (selected: Run) => {
    const request = ++replayRequest.current;
    setReplay(null); setReplayError("");
    if (!selected.simulation) { setReplayLoading(false); return; }
    setReplayLoading(true);
    try {
      const value = await api<Replay>(`/api/runs/${selected.id}/replay`);
      if (request === replayRequest.current) setReplay(value);
    } catch (value) {
      if (request === replayRequest.current) setReplayError(value instanceof Error ? value.message : "Replay could not be completed");
    } finally {
      if (request === replayRequest.current) setReplayLoading(false);
    }
  };
  const selectRun = (selected: Run) => { setRun(selected); setSymbol(selected.symbol); void loadReplay(selected); };
  const refreshRuns = async (preferredId?: string) => {
    const values = await api<Run[]>("/api/history");
    ownedRuns.current = values;
    setRuns(values);
    const requested = preferredId ?? requestedRunId.current ?? undefined;
    const requestedRun = values.find((value) => value.id === requested);
    const selected = requestedRun ?? values[0];
    if (selected) selectRun(selected);
    if (requestedRun) requestedRunId.current = requestedRun.id;
    else if (requestedRunId.current) {
      requestedRunId.current = null;
      window.history.replaceState({ view: currentView.current }, "", navigationHref(currentView.current));
    }
    return values;
  };

  const viewHref = (nextView: ViewName) => navigationHref(nextView, nextView === "analysis" || nextView === "history" ? run?.id : null);
  const navigateView = (nextView: ViewName, selectedRunId?: string | null) => {
    const nextRunId = selectedRunId ?? ((nextView === "analysis" || nextView === "history") ? run?.id : null);
    requestedRunId.current = nextRunId ?? null;
    const href = navigationHref(nextView, nextRunId);
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== href) window.history.pushState({ view: nextView, runId: nextRunId }, "", href);
    setView(nextView);
    setMobileOpen(false);
  };

  useEffect(() => {
    if (!entered) return;
    let active = true;
    const report = (value: unknown) => active && setError(value instanceof Error ? value.message : "Unable to load the workspace");
    void refreshSchedules().catch(report);
    void loadMarketOverview().catch(report);
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

  useEffect(() => {
    const restoreNavigation = () => {
      const next = readNavigationLocation();
      requestedRunId.current = next.runId;
      setView(next.view);
      setReplayOpen(false);
      if (next.runId) {
        const selected = ownedRuns.current.find((item) => item.id === next.runId);
        if (selected) selectRun(selected);
        else if (ownedRuns.current.length) {
          requestedRunId.current = null;
          window.history.replaceState({ view: next.view }, "", navigationHref(next.view));
        }
      }
    };
    window.addEventListener("popstate", restoreNavigation);
    return () => window.removeEventListener("popstate", restoreNavigation);
  }, []);

  useEffect(() => {
    document.title = entered ? `${viewTitles[view]} · TradeSense` : "TradeSense · Evidence-linked paper research";
    if (entered) requestAnimationFrame(() => document.getElementById("workspace-main")?.focus());
  }, [entered, view]);

  useEffect(() => {
    if (!entered) return;
    const clearPrefix = () => {
      shortcutPrefix.current = false;
      if (shortcutTimer.current !== null) window.clearTimeout(shortcutTimer.current);
      shortcutTimer.current = null;
    };
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.matches("input, textarea, select") || target?.isContentEditable || event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      const key = event.key.toLowerCase();
      if (key === "?" || (key === "/" && event.shiftKey)) {
        event.preventDefault();
        clearPrefix();
        setShortcutsOpen((value) => !value);
        return;
      }
      if (shortcutsOpen || replayOpen || mobileOpen) return;
      if (shortcutPrefix.current) {
        const destinations: Partial<Record<string, ViewName>> = { o: "dashboard", a: "analysis", c: "chat", p: "portfolio", h: "history" };
        const destination = destinations[key];
        clearPrefix();
        if (destination) { event.preventDefault(); navigateView(destination); }
        return;
      }
      if (key === "g") {
        event.preventDefault();
        shortcutPrefix.current = true;
        shortcutTimer.current = window.setTimeout(clearPrefix, 1200);
      } else if (key === "c") {
        event.preventDefault();
        navigateView("chat");
      } else if (key === "/") {
        event.preventDefault();
        navigateView("chat");
        window.setTimeout(() => document.querySelector<HTMLTextAreaElement>('textarea[aria-label="Ask about the market"]')?.focus(), 80);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => {
      window.removeEventListener("keydown", handleShortcut);
      clearPrefix();
    };
  }, [entered, shortcutsOpen, replayOpen, mobileOpen, run?.id]);

  const enterDemo = () => { localStorage.setItem(demoEntryStorageKey, "entered"); setEntered(true); };

  async function refreshMarket() {
    setMarketBusy(true); setError("");
    try {
      setMarketOverview(await api<MarketOverview>("/api/market/refresh", { method: "POST", body: "{}" }));
    } catch (value) {
      await loadMarketOverview().catch(() => undefined);
      setError(value instanceof Error ? value.message : "Market overview refresh failed");
    } finally {
      setMarketBusy(false);
    }
  }

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

  const openDecisionChat = () => { setQuestion("Why did the agent choose this decision?"); navigateView("chat"); };
  const selectHistoryRun = (selected: Run) => { selectRun(selected); navigateView("history", selected.id); };
  const openReplay = (selected = run) => {
    if (!selected) return;
    if (selected.id !== run?.id) { setRun(selected); setSymbol(selected.symbol); }
    setReplayOpen(true);
    if (replay?.runId !== selected.id && !replayLoading) void loadReplay(selected);
  };

  if (!entered) return <LandingPage onEnter={enterDemo} />;

  return <StudioShell view={view} onView={navigateView} viewHref={viewHref} onShortcuts={() => setShortcutsOpen(true)} portfolio={portfolio} health={health} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}>
    {error && <ErrorNotice message={error} onDismiss={() => setError("")} />}
    {view === "dashboard" && <><DashboardView symbol={symbol} setSymbol={setSymbol} analyze={analyze} busy={busy} run={run} replay={replay} portfolio={portfolio} comparison={dashboard?.symbol === symbol ? dashboard.comparison : null} marketOverview={marketOverview} marketLoading={marketLoading} marketBusy={marketBusy} refreshMarket={refreshMarket} onChat={openDecisionChat} onReplay={() => openReplay()} /><div className="studio-page schedule-wrap"><ScheduleCard schedules={schedules} symbol={symbol} healthEnabled={Boolean(health?.schedulerEnabled)} busy={busy} addSchedule={addSchedule} changeSchedule={changeSchedule} /></div></>}
    {view === "analysis" && <AnalysisView run={run} onChat={openDecisionChat} />}
    {view === "portfolio" && <PortfolioView portfolio={portfolio} runs={runs} />}
    {view === "history" && <HistoryView runs={runs} selected={run} onSelect={selectHistoryRun} onReplay={openReplay} />}
    {view === "chat" && <ChatView chat={chat} run={run} symbol={symbol} question={question} setQuestion={setQuestion} submit={ask} busy={busy} />}
    <ReplayDetailsModal open={replayOpen} onClose={() => setReplayOpen(false)} run={run} replay={replay} loading={replayLoading} error={replayError} onRetry={() => { if (run) void loadReplay(run); }} />
    <KeyboardShortcuts open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
  </StudioShell>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
