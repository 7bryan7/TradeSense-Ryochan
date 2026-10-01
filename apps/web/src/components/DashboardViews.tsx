import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, BarChart3, Bot, CheckCircle2, Clock3, Database, FileSearch, History as HistoryIcon, LineChart, Play, RefreshCw, ShieldAlert, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { money, observedLabel, prettyOutcome } from "../api";
import type { DashboardComparison, MarketOverview, Portfolio, Replay, Run, Schedule } from "../types";
import { EvidenceLedger } from "./EvidenceLedger";
import { PaperLedger } from "./PaperLedger";
import { RunWorkflow } from "./RunWorkflow";
import { PageIntro } from "./StudioShell";
import { ToolTimeline } from "./ToolTimeline";
import { LoadingSkeleton, MetricCard, StatePanel, StatusBadge } from "./UiPrimitives";
import { MarketOverviewPanel } from "./MarketOverviewPanel";

const symbols = ["SOL", "BTC", "ETH"];

function RunControl({ symbol, setSymbol, analyze, busy }: { symbol: string; setSymbol: (symbol: string) => void; analyze: () => void; busy: boolean }) {
  return <div className="run-control"><label htmlFor="token-select"><span>Selected asset</span><select id="token-select" value={symbol} onChange={(event) => setSymbol(event.target.value)}>{symbols.map((item) => <option key={item}>{item}</option>)}</select></label><button className="button button-primary" onClick={analyze} disabled={busy}>{busy ? <RefreshCw className="spin" /> : <Play />} {busy ? "Analyzing…" : "Analyze & simulate"}</button></div>;
}

function TokenRail({ symbol, setSymbol }: { symbol: string; setSymbol: (symbol: string) => void }) {
  return <div className="token-rail">{symbols.map((item, index) => <button key={item} onClick={() => setSymbol(item)} className={symbol === item ? "token-card selected" : "token-card"}><span className={`coin coin-${item.toLowerCase()}`}>{item.slice(0, 1)}</span><span><small>{index === 0 ? "Momentum candidate" : index === 1 ? "Market benchmark" : "Comparable asset"}</small><strong>{item} / USD</strong></span><i>{symbol === item ? "SELECTED" : "VIEW"}</i></button>)}</div>;
}

function signed(value: number | string | null | undefined, suffix = "") {
  if (value === null || value === undefined) return "Unavailable";
  const numeric = Number(value);
  return `${numeric > 0 ? "+" : ""}${value}${suffix}`;
}

function ComparisonStrip({ comparison }: { comparison: DashboardComparison | null }) {
  if (!comparison || comparison.status !== "comparable") {
    return <section className="comparison-strip"><div><p className="eyebrow">CHANGED SINCE PREVIOUS RUN</p><strong>{comparison?.status === "incompatible" ? "Comparison blocked" : "No comparable run yet"}</strong></div><p>{comparison?.reason ?? "Run the selected asset twice to reveal measured changes."}</p></section>;
  }
  return <section className="comparison-strip comparable"><div><p className="eyebrow">CHANGED SINCE PREVIOUS RUN</p><strong>Compatible {comparison.identity?.window ?? "saved"} evidence</strong></div><dl>
    <div><dt>Reference price</dt><dd>{comparison.price ? `${signed(comparison.price.deltaUsd, " USD")} · ${signed(comparison.price.deltaPercent, "%")}` : "Unavailable"}</dd></div>
    <div><dt>24h movement</dt><dd>{comparison.change24h ? signed(comparison.change24h.deltaPoints, " pts") : "Unavailable"}</dd></div>
    <div><dt>Decision</dt><dd>{comparison.decision ? `${comparison.decision.previous ?? "—"} → ${comparison.decision.current ?? "—"}` : "Unavailable"}</dd></div>
    <div><dt>Simulation</dt><dd>{comparison.simulation?.changed ? "Outcome changed" : "Outcome unchanged"}</dd></div>
  </dl></section>;
}

function SnapshotChart({ run }: { run: Run | null }) {
  const evidence = run?.evidence.find((item) => item.tool === "analyze_token");
  const price = evidence && typeof evidence.data?.price === "number" ? evidence.data.price : null;
  const change = evidence && typeof evidence.data?.change24h === "number" ? evidence.data.change24h : null;
  return <section className="glass-card chart-card" aria-labelledby="snapshot-chart-title">
    <div className="card-heading"><div><p className="eyebrow">MARKET SNAPSHOT</p><h2 id="snapshot-chart-title">{run?.symbol ?? "Selected asset"} evidence</h2></div><span className="subtle-pill">No candle series</span></div>
    <div className="chart-placeholder">
      <div className="chart-grid" aria-hidden="true"><span /><span /><span /><span /><div className="evidence-line" /></div>
      <StatePanel compact kind="unavailable" icon={LineChart} title={price === null ? "Chart data unavailable" : `$${price.toLocaleString()} reference price`} text={change === null ? "The saved RYO snapshot does not contain historical candles. TradeSense will not invent a price series." : `${change >= 0 ? "+" : ""}${change}% over the saved 24-hour evidence window. Historical candles remain unavailable.`} />
    </div>
    <footer><span>{evidence ? `${evidence.tool} · ${evidence.status}` : "Waiting for analysis"}</span><span>{observedLabel(evidence?.asOf)}</span></footer>
  </section>;
}

function DecisionBrief({ run, replay, onReplay }: { run: Run | null; replay: Replay | null; onReplay: () => void }) {
  const evidence = run?.evidence.find((item) => item.tool === "analyze_token");
  const risk = run?.decision?.risks[0] ?? evidence?.warnings[0] ?? "Risk coverage is not available yet.";
  return <section className="glass-card decision-brief" aria-labelledby="decision-heading">
    <div className="card-heading"><div><p className="eyebrow">{run ? "LATEST EVIDENCE TRAIL" : "READY FOR RESEARCH"}</p><h2 id="decision-heading">{run?.decision?.action ?? (run?.status === "FAILED" ? "Analysis failed" : "No decision yet")}</h2></div>{run && <StatusBadge value={run.status} />}</div>
    <p className="decision-summary">{run?.decision?.summary ?? run?.failure?.message ?? "Choose an asset and run an analysis to create the first persisted paper decision."}</p>
    <div className="brief-grid">
      <article><small>01 / WHAT CHANGED</small><strong>{evidence?.summary.headline ?? "No comparable evidence yet"}</strong><p>{observedLabel(evidence?.asOf)}</p></article>
      <article><small>02 / WHAT IT SUGGESTS</small><strong>{run?.decision ? `${run.decision.action} · ${run.decision.confidence} confidence` : "Awaiting evidence"}</strong><p>{run?.decision?.outlook ? `${run.decision.outlook.direction} · ${run.decision.outlook.horizon}` : "The agent has not formed an outlook."}</p></article>
      <article><small>03 / WHAT HAPPENED</small><strong>{prettyOutcome(run?.simulation?.outcome)}</strong><p>{run?.simulation?.reason ?? "No paper simulation has been applied."}</p></article>
    </div>
    <div className="risk-line"><AlertTriangle /><span><small>STRONGEST RISK</small><strong>{risk}</strong></span></div>
    {run?.failure && <div role="alert" className="failure-banner"><ShieldAlert /><span><strong>Stopped during {run.failure.stage}</strong><small>{run.failure.code} · attempt {run.attemptCount}</small><p>{run.failure.message}</p></span></div>}
    <div className="audit-line"><span><CheckCircle2 /> Deterministic replay</span><span><strong>{replay ? replay.matches ? "Verified — saved result matches" : "Mismatch — review required" : run?.simulation ? "Loading verification" : "Waiting"}</strong><button type="button" className="audit-button" onClick={onReplay} disabled={!run?.simulation}>View replay <ArrowRight /></button></span></div>
  </section>;
}

function PortfolioAside({ portfolio }: { portfolio: Portfolio | null }) {
  return <section className="glass-card portfolio-card"><div className="card-heading"><div><p className="eyebrow">PAPER PORTFOLIO</p><h2>{money(portfolio?.cashUsd)}</h2></div><Wallet /></div>{!portfolio ? <LoadingSkeleton label="Loading paper portfolio" lines={4} /> : <><p className="muted">Virtual cash · version {portfolio.version}</p><div className="valuation-list"><div><span>Total paper equity</span><strong>{money(portfolio.valuation.totalEquityUsd ?? undefined)}</strong></div><div><span>Unrealized P&amp;L</span><strong>{money(portfolio.valuation.unrealizedPnlUsd ?? undefined)}</strong></div><div><span>Realized P&amp;L</span><strong>{money(portfolio.realizedPnlUsd)}</strong></div></div><StatusBadge value={portfolio.valuation.status} label={`Valuation ${portfolio.valuation.status}${portfolio.valuation.missingMarks ? ` · ${portfolio.valuation.missingMarks} missing mark(s)` : ""}`} /><div className="holding-list">{portfolio.holdings.length ? portfolio.holdings.map((holding) => <div key={holding.symbol}><span className="coin">{holding.symbol[0]}</span><span><strong>{holding.symbol}</strong><small>{holding.mark ? `${money(holding.mark.priceUsd)} mark · ${observedLabel(holding.mark.asOf)}` : "Mark unavailable"}</small></span><strong>{money(holding.marketValueUsd ?? undefined)}</strong></div>) : <p>No simulated holdings yet.</p>}</div></>}</section>;
}

function SimulationAside({ run, onChat }: { run: Run | null; onChat: () => void }) {
  return <section className="glass-card simulation-card"><div className="card-heading"><div><p className="eyebrow">SIMULATION OUTCOME</p><h2>{run?.decision?.action ?? "—"}</h2></div>{run?.simulation?.outcome?.startsWith("BLOCKED") ? <ShieldAlert /> : <ShieldCheck />}</div>{run?.simulation ? <><StatusBadge value={run.simulation.outcome} /><dl><div><dt>Quantity</dt><dd>{run.simulation.quantity}</dd></div><div><dt>Fill price</dt><dd>{money(run.simulation.fillPriceUsd)}</dd></div><div><dt>Fee</dt><dd>{money(run.simulation.feeUsd)}</dd></div></dl><p>{run.simulation.reason}</p></> : <p className="muted">No simulation result is available for the selected run.</p>}<button className="text-button" onClick={onChat}>Ask why this decision <ArrowRight /></button></section>;
}

export function DashboardView({ symbol, setSymbol, analyze, busy, run, replay, portfolio, comparison, marketOverview, marketLoading, marketBusy, refreshMarket, onChat, onReplay }: { symbol: string; setSymbol: (symbol: string) => void; analyze: () => void; busy: boolean; run: Run | null; replay: Replay | null; portfolio: Portfolio | null; comparison: DashboardComparison | null; marketOverview: MarketOverview | null; marketLoading: boolean; marketBusy: boolean; refreshMarket: () => void; onChat: () => void; onReplay: () => void }) {
  return <div className="studio-page">
    <PageIntro eyebrow="A CLEARER VIEW OF THE MARKET" title="Market overview" description="Choose an asset. Review the evidence. Understand the paper outcome."><RunControl symbol={symbol} setSymbol={setSymbol} analyze={analyze} busy={busy} /></PageIntro>
    <div className="practice-notice"><ShieldCheck /><span><strong>Practice environment</strong>No wallet. No real funds. All fills are simulated.</span></div>
    <MarketOverviewPanel overview={marketOverview} loading={marketLoading} busy={marketBusy} onRefresh={refreshMarket} />
    <RunWorkflow run={run} requestPending={busy} />
    <TokenRail symbol={symbol} setSymbol={setSymbol} />
    <ComparisonStrip comparison={comparison} />
    <div className="dashboard-layout"><div className="dashboard-main"><SnapshotChart run={run} /><DecisionBrief run={run} replay={replay} onReplay={onReplay} /></div><aside className="dashboard-aside"><SimulationAside run={run} onChat={onChat} /><PortfolioAside portfolio={portfolio} /></aside></div>
  </div>;
}

export function AnalysisView({ run, onChat }: { run: Run | null; onChat: () => void }) {
  const evidence = run?.evidence.find((item) => item.tool === "deep_analysis");
  const safety = evidence?.data?.safety && typeof evidence.data.safety === "object" ? evidence.data.safety as Record<string, unknown> : null;
  return <div className="studio-page"><PageIntro eyebrow="FROM SIGNAL TO UNDERSTANDING" title="Behind the decision" description="Follow the evidence, the opposing case, and the conditions that could change the outlook." />
    {!run ? <StatePanel kind="empty" icon={FileSearch} title="No analysis selected" text="Run an analysis from the overview to inspect its evidence trail." /> : <div className="analysis-layout"><div className="analysis-main">
      <section className="glass-card"><div className="card-heading"><div><p className="eyebrow">AI EXPLANATION</p><h2>{run.symbol} · {run.decision?.action ?? run.status}</h2></div><StatusBadge value={run.status} /></div><p className="analysis-copy">{run.decision?.summary ?? run.failure?.message}</p><div className="evidence-columns"><div><h3>Supports the decision</h3><ul>{run.decision?.supportingEvidence.length ? run.decision.supportingEvidence.map((item) => <li key={item}>{item}</li>) : <li>No supporting evidence was saved.</li>}</ul></div><div><h3>Reasons for caution</h3><ul>{run.decision?.counterEvidence.length ? run.decision.counterEvidence.map((item) => <li key={item}>{item}</li>) : <li>No contrary evidence was reported.</li>}</ul></div></div></section>
      <ToolTimeline steps={run.researchTimeline} planVersion={run.researchPlanVersion} />
      <EvidenceLedger key={run.id} items={run.evidence} />
    </div><aside className="analysis-aside"><section className="glass-card"><p className="eyebrow">SAFETY &amp; COVERAGE</p><h2>{safety && typeof safety.status === "string" ? safety.status : evidence?.status === "ok" ? "Coverage available" : "Unknown"}</h2><p>{safety && typeof safety.coverage === "string" ? `Coverage: ${safety.coverage}` : evidence ? `deep_analysis returned ${evidence.status}; inspect its saved warnings and fields before relying on the result.` : "No deep_analysis observation was saved for this run."}</p></section><section className="glass-card"><p className="eyebrow">OUTLOOK</p><h2>{run.decision?.outlook.direction ?? "Unavailable"}</h2><p>{run.decision?.outlook.horizon ?? "No horizon"}</p><div className="warning-note"><strong>Invalidation</strong><br />{run.decision?.outlook.invalidation ?? "Not supplied"}</div><button className="button button-secondary" onClick={onChat}><Bot /> Ask TradeSense</button></section></aside></div>}
  </div>;
}

export function PortfolioView({ portfolio, runs }: { portfolio: Portfolio | null; runs: Run[] }) {
  return <div className="studio-page"><PageIntro eyebrow="PRACTICE ACCOUNT" title="Paper portfolio" description="Review virtual cash, positions, fees, and persisted simulation outcomes." />
    <div className="metric-grid"><MetricCard label="VIRTUAL CASH" value={money(portfolio?.cashUsd)} detail={`Version ${portfolio?.version ?? "—"}`} loading={!portfolio} /><MetricCard label="TOTAL PAPER EQUITY" value={money(portfolio?.valuation.totalEquityUsd ?? undefined)} detail={`${portfolio?.valuation.status ?? "Loading"} valuation`} tone={portfolio?.valuation.status === "complete" ? "success" : "warning"} loading={!portfolio} /><MetricCard label="UNREALIZED P&L" value={money(portfolio?.valuation.unrealizedPnlUsd ?? undefined)} detail="Latest saved marks" loading={!portfolio} /><MetricCard label="REALIZED P&L" value={money(portfolio?.realizedPnlUsd)} detail="Paper results only" loading={!portfolio} /></div>
    <section className="glass-card table-card holdings-table"><div className="card-heading"><div><p className="eyebrow">CURRENT HOLDINGS</p><h2>Virtual positions</h2></div><Wallet /></div>{!portfolio ? <LoadingSkeleton label="Loading virtual positions" lines={3} /> : portfolio.holdings.length ? <div className="data-table"><div className="table-row table-head"><span>Asset</span><span>Quantity</span><span>Cost basis</span><span>Market value</span><span>Unrealized P&amp;L</span></div>{portfolio.holdings.map((holding) => <div className="table-row" key={holding.symbol}><strong>{holding.symbol}<small>{holding.mark ? ` ${holding.mark.freshness} · ${observedLabel(holding.mark.asOf)}` : " mark unavailable"}</small></strong><span>{holding.quantity}</span><span>{money(holding.costBasisUsd)}</span><span>{money(holding.marketValueUsd ?? undefined)}</span><span>{money(holding.unrealizedPnlUsd ?? undefined)}</span></div>)}</div> : <StatePanel kind="empty" icon={Wallet} title="No open positions" text="Applied paper buys will appear here." />}</section>
    <PaperLedger runs={runs} />
  </div>;
}

export function HistoryView({ runs, selected, onSelect, onReplay }: { runs: Run[]; selected: Run | null; onSelect: (run: Run) => void; onReplay: (run: Run) => void }) {
  const [symbolFilter, setSymbolFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const symbols = useMemo(() => [...new Set(runs.map((item) => item.symbol))].sort(), [runs]);
  const actions = ["BUY", "HOLD", "SELL"] as const;
  const statuses = useMemo(() => [...new Set(runs.map((item) => item.status))].sort(), [runs]);
  const filteredRuns = runs.filter((item) => (symbolFilter === "all" || item.symbol === symbolFilter) && (actionFilter === "all" || item.decision?.action === actionFilter) && (statusFilter === "all" || item.status === statusFilter));
  const filtersActive = symbolFilter !== "all" || actionFilter !== "all" || statusFilter !== "all";
  const selectedVisible = selected && filteredRuns.some((item) => item.id === selected.id) ? selected : null;
  const completed = runs.filter((item) => item.status === "COMPLETED").length;
  const blocked = runs.filter((item) => item.simulation?.outcome.startsWith("BLOCKED")).length;
  const failed = runs.filter((item) => item.status === "FAILED").length;
  const actionCount = (action: "BUY" | "HOLD" | "SELL") => runs.filter((item) => item.decision?.action === action).length;
  const clearFilters = () => { setSymbolFilter("all"); setActionFilter("all"); setStatusFilter("all"); };

  return <div className="studio-page"><PageIntro eyebrow="THE DECISION TRAIL" title="Decision history" description="Inspect saved evidence, decisions, policy outcomes, and deterministic replay inputs." />
    <div className="metric-grid history-metrics"><MetricCard label="TOTAL ANALYSES" value={runs.length} detail={`${symbols.length} owned asset${symbols.length === 1 ? "" : "s"}`} /><MetricCard label="COMPLETED DECISIONS" value={completed} detail={`${actionCount("BUY")} BUY · ${actionCount("HOLD")} HOLD · ${actionCount("SELL")} SELL`} tone="success" /><MetricCard label="POLICY BLOCKS" value={blocked} detail="No paper-ledger mutation" tone={blocked ? "warning" : "neutral"} /><MetricCard label="FAILED RUNS" value={failed} detail="Stopped before completion" tone={failed ? "danger" : "neutral"} /></div>
    <section className="glass-card table-card history-card"><div className="card-heading"><div><p className="eyebrow">OWNED RUNS</p><h2>{filteredRuns.length} of {runs.length} persisted analyses</h2></div><HistoryIcon /></div>{runs.length ? <><div className="history-filters"><label><span>Token</span><select aria-label="Filter history by token" value={symbolFilter} onChange={(event) => setSymbolFilter(event.target.value)}><option value="all">All tokens</option>{symbols.map((symbol) => <option key={symbol}>{symbol}</option>)}</select></label><label><span>Decision</span><select aria-label="Filter history by decision" value={actionFilter} onChange={(event) => setActionFilter(event.target.value)}><option value="all">All decisions</option>{actions.map((action) => <option key={action}>{action}</option>)}</select></label><label><span>Run status</span><select aria-label="Filter history by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label>{filtersActive && filteredRuns.length > 0 && <button type="button" className="button button-ghost" onClick={clearFilters}>Clear filters</button>}</div>{filteredRuns.length ? <div className="history-table"><div className="history-row history-head"><span>Timestamp</span><span>Token</span><span>Decision</span><span>Simulation</span><span /></div>{filteredRuns.map((item) => <button className={selected?.id === item.id ? "history-row selected" : "history-row"} key={item.id} onClick={() => onSelect(item)}><span>{new Date(item.createdAt).toLocaleString()}</span><strong>{item.symbol}</strong><StatusBadge value={item.decision?.action ?? item.status} /><span>{prettyOutcome(item.simulation?.outcome)}</span><i>View details <ArrowRight /></i></button>)}</div> : <StatePanel compact kind="empty" title="No matching decisions" text="Change or clear the filters to see other owned run records."><button type="button" className="button button-secondary" onClick={clearFilters}>Clear filters</button></StatePanel>}</> : <StatePanel kind="empty" icon={HistoryIcon} title="No decisions yet" text="Completed and failed analyses will appear here without being deleted." />}</section>
    {selectedVisible && <><section className="glass-card selected-record"><div className="card-heading"><div><p className="eyebrow">SELECTED RECORD</p><h2>{selectedVisible.symbol} · {selectedVisible.decision?.action ?? selectedVisible.status}</h2></div><StatusBadge value={selectedVisible.status} /></div><p>{selectedVisible.decision?.summary ?? selectedVisible.failure?.message}</p><div className="record-meta"><span><Clock3 /> {new Date(selectedVisible.createdAt).toLocaleString()}</span><span><Database /> {selectedVisible.evidence.length} evidence record(s)</span><span><BarChart3 /> {prettyOutcome(selectedVisible.simulation?.outcome)}</span></div><button type="button" className="button button-secondary" disabled={!selectedVisible.simulation} onClick={() => onReplay(selectedVisible)}><RefreshCw /> View deterministic replay</button></section><ToolTimeline steps={selectedVisible.researchTimeline} planVersion={selectedVisible.researchPlanVersion} /><EvidenceLedger key={selectedVisible.id} items={selectedVisible.evidence} title="Evidence for selected record" /></>}
  </div>;
}

export function ScheduleCard({ schedules, symbol, healthEnabled, busy, addSchedule, changeSchedule }: { schedules: Schedule[]; symbol: string; healthEnabled: boolean; busy: boolean; addSchedule: () => void; changeSchedule: (id: string, status: Schedule["status"]) => void }) {
  const current = schedules.find((item) => item.status !== "CANCELLED") ?? schedules[0];
  return <section className="glass-card schedule-card"><div className="card-heading"><div><p className="eyebrow">AUTONOMOUS SCANS</p><h2>Recurring paper analysis</h2></div><Sparkles /></div><div className="schedule-meta"><span>{healthEnabled ? "WORKER ENABLED" : "WORKER DISABLED"}</span><span>5m minimum</span><span>3 tokens maximum</span></div>{current ? <div className="schedule-current"><div><strong>{current.symbols.join(", ")}</strong><StatusBadge value={current.status} /></div><p>{current.cadenceMinutes} minute cadence · max {current.maxRunsPerDay} runs/day</p><small>Next slot: {new Date(current.nextSlotAt).toLocaleString()}</small><div className="button-row">{current.status === "PAUSED" && <button className="button button-primary" disabled={busy || !healthEnabled} onClick={() => changeSchedule(current.id, "ACTIVE")}>Resume</button>}{current.status === "ACTIVE" && <button className="button button-secondary" disabled={busy} onClick={() => changeSchedule(current.id, "PAUSED")}>Pause</button>}{current.status !== "CANCELLED" && <button className="button button-ghost" disabled={busy} onClick={() => changeSchedule(current.id, "CANCELLED")}>Cancel</button>}</div></div> : <button className="button button-secondary" disabled={busy} onClick={addSchedule}>Add 5m {symbol} schedule</button>}</section>;
}
