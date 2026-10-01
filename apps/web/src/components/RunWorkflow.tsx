import { CheckCircle2, Circle, LoaderCircle, XCircle } from "lucide-react";
import { prettyOutcome } from "../api";
import type { Run } from "../types";
import { StatusBadge } from "./UiPrimitives";

type StepState = "complete" | "active" | "failed" | "pending";

const stepDefinitions = [
  { title: "Saved evidence", idle: "Waiting for a persisted research observation" },
  { title: "AI decision", idle: "Waiting for a schema-valid saved decision" },
  { title: "Paper policy", idle: "Waiting for the deterministic simulation result" },
  { title: "Audit record", idle: "Waiting for the run to reach a terminal state" },
];

function activeStep(run: Run): number | null {
  if (run.status === "FETCHING" || run.status === "QUEUED") return 0;
  if (run.status === "ANALYZING") return 1;
  if (run.status === "APPLYING") return 2;
  return null;
}

function failedStep(run: Run): number | null {
  if (!run.failure && run.status !== "FAILED" && run.status !== "CANCELLED") return null;
  if (run.failure?.stage === "FETCHING") return 0;
  if (run.failure?.stage === "ANALYZING") return 1;
  if (run.failure?.stage === "APPLYING") return 2;
  return 3;
}

export function RunWorkflow({ run, requestPending }: { run: Run | null; requestPending: boolean }) {
  const facts = run ? [run.evidence.length > 0, Boolean(run.decision), Boolean(run.simulation), run.status === "COMPLETED"] : [false, false, false, false];
  const active = run ? activeStep(run) : null;
  const failed = run ? failedStep(run) : null;
  const details = run ? [
    run.evidence.length ? `${run.evidence.length} observation${run.evidence.length === 1 ? "" : "s"} persisted` : stepDefinitions[0].idle,
    run.decision ? `${run.decision.action} · ${run.decision.confidence} confidence` : stepDefinitions[1].idle,
    run.simulation ? `${prettyOutcome(run.simulation.outcome)} · ${run.simulation.action}` : stepDefinitions[2].idle,
    run.status === "COMPLETED" ? `Completed ${run.completedAt ? new Date(run.completedAt).toLocaleString() : "with a saved result"}` : run.failure ? `${run.failure.code} · stopped during ${run.failure.stage}` : `Run status: ${run.status.replaceAll("_", " ")}`,
  ] : stepDefinitions.map((step) => step.idle);

  return <section className="glass-card run-workflow" aria-labelledby="run-workflow-title">
    <header><div><p className="eyebrow">SAVED RUN WORKFLOW</p><h2 id="run-workflow-title">Research to audit trail</h2></div>{run ? <StatusBadge value={run.status} /> : <span className="subtle-pill">NO SAVED RUN</span>}</header>
    {requestPending && <div className="workflow-request" role="status"><LoaderCircle className="spin" /><span><strong>Analysis request in progress</strong><small>The latest saved run remains visible until the server returns. Exact live sub-stage telemetry is not streamed.</small></span></div>}
    <ol>{stepDefinitions.map((step, index) => {
      const state: StepState = facts[index] ? "complete" : failed === index ? "failed" : active === index ? "active" : "pending";
      const Icon = state === "complete" ? CheckCircle2 : state === "failed" ? XCircle : state === "active" ? LoaderCircle : Circle;
      return <li className={`workflow-step ${state}`} key={step.title}><span className="workflow-marker"><Icon className={state === "active" ? "spin" : ""} /></span><span><small>0{index + 1}</small><strong>{step.title}</strong><p>{details[index]}</p></span></li>;
    })}</ol>
    <footer><span>{run ? `${run.symbol} · ${run.mode.toUpperCase()} · ${run.researchPlanVersion ?? "legacy plan"} · run ${run.id.slice(0, 8)}` : "Create an analysis to begin a persisted evidence trail."}</span><span>Stages reflect saved records, not inferred provider activity.</span></footer>
  </section>;
}
