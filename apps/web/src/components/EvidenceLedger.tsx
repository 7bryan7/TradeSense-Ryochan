import { useId, useMemo, useState } from "react";
import { ChevronDown, Clock3, Database, ShieldAlert } from "lucide-react";
import { observedLabel } from "../api";
import { formatDateTime } from "../format";
import type { Evidence } from "../types";
import { StatePanel, StatusBadge } from "./UiPrimitives";

function exactTime(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? formatDateTime(timestamp) : "Unknown timestamp";
}

export function EvidenceLedger({ items, title = "Saved evidence ledger" }: { items: Evidence[]; title?: string }) {
  const titleId = useId();
  const [toolFilter, setToolFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const tools = useMemo(() => [...new Set(items.map((item) => item.tool))].sort(), [items]);
  const statuses = useMemo(() => [...new Set(items.map((item) => item.status))].sort(), [items]);
  const visible = items.filter((item) => (toolFilter === "all" || item.tool === toolFilter) && (statusFilter === "all" || item.status === statusFilter));

  return <section className="glass-card evidence-ledger" aria-labelledby={titleId}>
    <header className="evidence-ledger-header">
      <div><p className="eyebrow">PERSISTED RESEARCH</p><h2 id={titleId}>{title}</h2><p>{items.length} owned observation{items.length === 1 ? "" : "s"} tied to this run.</p></div>
      <Database />
    </header>
    {items.length === 0 ? <StatePanel compact kind="unavailable" title="missing data" text="This run does not contain an accessible evidence snapshot." /> : <>
      <div className="evidence-filters">
        <label><span>Tool</span><select aria-label="Filter evidence by tool" value={toolFilter} onChange={(event) => setToolFilter(event.target.value)}><option value="all">All tools</option>{tools.map((tool) => <option key={tool} value={tool}>{tool}</option>)}</select></label>
        <label><span>Status</span><select aria-label="Filter evidence by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
        <span className="evidence-count">Showing {visible.length} of {items.length}</span>
      </div>
      <div className="evidence-list">
        {visible.map((item) => <details className="evidence-entry" id={`evidence-${item.id}`} key={item.id}>
          <summary>
            <span className="evidence-entry-icon"><Database /></span>
            <span className="evidence-entry-copy"><small>{item.purpose === "execution_quote" ? "EXECUTION QUOTE · " : ""}{item.tool}{item.symbol ? ` · ${item.symbol}` : ""}</small><strong>{item.summary.headline}</strong><span><Clock3 /> {observedLabel(item.asOf)} · {item.dataMode}</span></span>
            <StatusBadge value={item.status} />
            <ChevronDown className="evidence-chevron" />
          </summary>
          <div className="evidence-entry-details">
            <dl>
              <div><dt>Observed at</dt><dd>{exactTime(item.asOf)}</dd></div>
              <div><dt>Retrieved at</dt><dd>{exactTime(item.retrievedAt)}</dd></div>
              <div><dt>Data mode</dt><dd>{item.dataMode}</dd></div>
              <div><dt>Purpose</dt><dd>{item.purpose === "execution_quote" ? "Post-decision execution quote" : "Decision research"}</dd></div>
              <div><dt>Evidence ID</dt><dd>{item.id}</dd></div>
            </dl>
            <div className="evidence-detail-columns">
              <div><h3>Provider summary</h3>{item.summary.keyPoints?.length ? <ul>{item.summary.keyPoints.map((point, index) => <li key={`${item.id}-point-${index}`}>{point}</li>)}</ul> : <p>No additional provider summary points were saved.</p>}</div>
              <div><h3>Warnings and limitations</h3>{item.warnings.length ? <ul className="evidence-warnings">{item.warnings.map((warning, index) => <li key={`${item.id}-warning-${index}`}><ShieldAlert />{warning}</li>)}</ul> : <p>No provider warnings were saved with this observation.</p>}</div>
            </div>
          </div>
        </details>)}
        {visible.length === 0 && <StatePanel compact kind="empty" title="No matching evidence" text="Change the tool or status filter to see the saved observations." />}
      </div>
    </>}
  </section>;
}
