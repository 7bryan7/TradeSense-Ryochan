import { useEffect, useState } from "react";
import { Activity, CheckCircle2, ChevronDown, Clock3, Database, LoaderCircle, XCircle } from "lucide-react";
import { formatDateTime } from "../format";
import type { ResearchTimelineStep } from "../types";
import { StatePanel, StatusBadge } from "./UiPrimitives";

const roleLabels: Record<string, { title: string; description: string }> = {
  selected_token: { title: "Selected-token evidence", description: "Establishes current price and token metrics." },
  risk_coverage: { title: "Risk coverage", description: "Checks deep-analysis coverage before paper application." },
  market_context: { title: "Market context", description: "Places the selected asset in the current candidate scan." },
  benchmark_comparison: { title: "Benchmark comparison", description: "Compares the asset on the same stated intent." },
  execution_quote: { title: "Execution quote", description: "Refreshes and validates the paper fill reference after the AI decision." },
};

function timestamp(value: string | null): string {
  return value ? formatDateTime(value) : "Not recorded";
}

function duration(step: ResearchTimelineStep): string {
  if (step.durationMs === null) return step.status === "RUNNING" ? "In progress" : "Not completed";
  if (step.durationMs < 1_000) return `${step.durationMs} ms`;
  return `${(step.durationMs / 1_000).toFixed(2)} s`;
}

function argument(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value);
}

function StepIcon({ status }: { status: string }) {
  if (status === "COMPLETED") return <CheckCircle2 />;
  if (status === "FAILED") return <XCircle />;
  if (status === "RUNNING") return <LoaderCircle className="spin" />;
  return <Clock3 />;
}

export function ToolTimeline({ steps, planVersion }: { steps: ResearchTimelineStep[]; planVersion: string | null }) {
  const completed = steps.filter((step) => step.status === "COMPLETED").length;
  const attempts = steps.reduce((total, step) => total + step.attemptCount, 0);
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set(steps.filter((step) => step.status !== "COMPLETED").map((step) => step.ordinal)));
  useEffect(() => setExpanded(new Set(steps.filter((step) => step.status !== "COMPLETED").map((step) => step.ordinal))), [steps]);
  const toggle = (ordinal: number) => setExpanded((current) => {
    const next = new Set(current);
    if (next.has(ordinal)) next.delete(ordinal); else next.add(ordinal);
    return next;
  });

  return <section className="glass-card tool-timeline" aria-labelledby="tool-timeline-title">
    <header className="tool-timeline-header"><div><p className="eyebrow">PERSISTED TOOL TRACE</p><h2 id="tool-timeline-title">Research tool timeline</h2><p>{steps.length ? `${completed} of ${steps.length} steps completed · ${attempts} provider attempt${attempts === 1 ? "" : "s"}` : "No persisted tool steps are available for this run."}</p></div><Activity /></header>
    {!steps.length ? <StatePanel compact kind="unavailable" title="missing data" text="This record predates persisted per-tool execution tracking." /> : <ol className="tool-step-list">{steps.map((step) => {
      const role = roleLabels[step.role] ?? { title: step.role.replaceAll("_", " "), description: "Saved research-plan step." };
      return <li className={`tool-step tool-step-${step.status.toLowerCase()}`} key={`${step.ordinal}-${step.tool}`}>
        <div className="tool-step-marker"><StepIcon status={step.status} /></div>
        <article className={expanded.has(step.ordinal) ? "expanded" : "collapsed"}>
          <header><button type="button" className="tool-step-toggle" aria-expanded={expanded.has(step.ordinal)} onClick={() => toggle(step.ordinal)}><span><small>STEP {String(step.ordinal).padStart(2, "0")} · {role.title.toUpperCase()}</small><strong>{step.tool}</strong><p>{role.description}</p></span><ChevronDown /></button><StatusBadge value={step.status} /></header>
          <div className="tool-step-body" hidden={!expanded.has(step.ordinal)}>
          <div className="tool-arguments" aria-label={`${step.tool} saved arguments`}>{Object.entries(step.args).map(([key, value]) => <span key={key}><small>{key}</small><code>{argument(value)}</code></span>)}</div>
          <dl><div><dt>Attempts</dt><dd>{step.attemptCount}</dd></div><div><dt>Started</dt><dd>{timestamp(step.startedAt)}</dd></div><div><dt>Completed</dt><dd>{timestamp(step.completedAt)}</dd></div><div><dt>Elapsed</dt><dd>{duration(step)}</dd></div></dl>
          {step.evidenceId && <div className="tool-evidence-link"><Database /><span><small>Saved evidence · provider status {step.providerStatus ?? "unknown"}</small><a href={`#evidence-${step.evidenceId}`}>{step.evidenceId}</a></span></div>}
          {step.failure && <div className="tool-step-failure"><strong>{step.failure.code}</strong><p>{step.failure.message}</p></div>}
          </div>
        </article>
      </li>;
    })}</ol>}
    <footer><span>Plan {planVersion ?? "legacy / unavailable"}</span><span>Times and attempts come from saved server records.</span></footer>
  </section>;
}
