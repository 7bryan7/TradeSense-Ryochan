import { useEffect, useId, useRef } from "react";
import { AlertTriangle, Ban, BarChart3, CircleHelp, Clock3, LoaderCircle, ShieldAlert, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";
type StateKind = "empty" | "loading" | "error" | "unavailable" | "stale" | "blocked";

function statusTone(value: string): StatusTone {
  const status = value.toUpperCase();
  if (["COMPLETED", "APPLIED", "ACTIVE", "BUY", "FRESH", "COMPLETE", "OK"].includes(status)) return "success";
  if (status.includes("BLOCKED") || ["FAILED", "CANCELLED", "ERROR"].includes(status)) return "danger";
  if (status.includes("SKIPPED") || ["HOLD", "PAUSED", "PARTIAL", "STALE", "UNAVAILABLE"].includes(status)) return "warning";
  if (["FETCHING", "ANALYZING", "APPLYING", "LOADING", "PENDING", "SYNTHESIZING"].includes(status)) return "info";
  return "neutral";
}

export function StatusBadge({ value, label }: { value: string; label?: string }) {
  const text = label ?? value.replaceAll("_", " ");
  return <span className={`ui-status ui-status-${statusTone(value)}`}><i aria-hidden="true" />{text}</span>;
}

const stateIcons: Record<StateKind, LucideIcon> = {
  empty: BarChart3,
  loading: LoaderCircle,
  error: AlertTriangle,
  unavailable: CircleHelp,
  stale: Clock3,
  blocked: Ban,
};

export function StatePanel({ kind, title, text, icon: Icon, compact = false, children }: {
  kind: StateKind;
  title: string;
  text: string;
  icon?: LucideIcon;
  compact?: boolean;
  children?: React.ReactNode;
}) {
  const StateIcon = Icon ?? stateIcons[kind];
  const role = kind === "error" || kind === "blocked" ? "alert" : "status";
  return <div className={`ui-state ui-state-${kind}${compact ? " compact" : ""}`} role={role} aria-live={kind === "loading" ? "polite" : undefined}>
    <span className="ui-state-icon"><StateIcon className={kind === "loading" ? "spin" : ""} /></span>
    <h3>{title}</h3>
    <p>{text}</p>
    {children && <div className="ui-state-action">{children}</div>}
  </div>;
}

export function LoadingSkeleton({ lines = 3, label = "Loading content" }: { lines?: number; label?: string }) {
  return <div className="ui-skeleton" role="status" aria-label={label}>
    <span className="ui-skeleton-title" />
    {Array.from({ length: lines }, (_, index) => <span className="ui-skeleton-line" key={index} />)}
    <span className="sr-only">{label}</span>
  </div>;
}

export function MetricCard({ label, value, detail, tone = "neutral", loading = false }: {
  label: string;
  value: React.ReactNode;
  detail: React.ReactNode;
  tone?: StatusTone;
  loading?: boolean;
}) {
  return <article className={`ui-metric-card ui-metric-${tone}`}>
    <small>{label}</small>
    {loading ? <span className="ui-metric-loading" aria-label={`Loading ${label.toLowerCase()}`} /> : <strong>{value}</strong>}
    <span>{detail}</span>
  </article>;
}

export function ErrorNotice({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return <div role="alert" className="ui-error-notice">
    <ShieldAlert />
    <span><strong>Something needs attention</strong><small>{message}</small></span>
    {onDismiss && <button type="button" aria-label="Dismiss error" onClick={onDismiss}><X /></button>}
  </div>;
}

export function Modal({ open, onClose, title, description, children, size = "medium" }: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { onCloseRef.current(); return; }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus();
    };
  }, [open]);

  if (!open) return null;
  return <div className="ui-modal-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} className={`ui-modal ui-modal-${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}>
      <header><div><h2 id={titleId}>{title}</h2>{description && <p id={descriptionId}>{description}</p>}</div><button ref={closeRef} type="button" onClick={onClose} aria-label="Close dialog"><X /></button></header>
      <div className="ui-modal-body">{children}</div>
    </section>
  </div>;
}
