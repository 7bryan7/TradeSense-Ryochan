import { formatMoney } from "./format";

const sessionStorageKey = "tradesense.session.v1";
export const conversationStorageKey = "tradesense.conversation.v1";
export const dataModeStorageKey = "tradesense.data-mode.v1";
export type DataMode = "live";

export const sessionId = localStorage.getItem(sessionStorageKey) ?? crypto.randomUUID();
localStorage.setItem(sessionStorageKey, sessionId);
let dataMode: DataMode = "live";
localStorage.removeItem(dataModeStorageKey);

export function selectedDataMode(): DataMode { return dataMode; }
export function selectDataMode(mode: DataMode): void {
  dataMode = mode;
  localStorage.setItem(dataModeStorageKey, mode);
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", "X-TradeSense-Session": sessionId, "X-TradeSense-Mode": dataMode, ...(options?.headers ?? {}) },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function observedLabel(timestamp?: string): string {
  if (!timestamp) return "missing data";
  const elapsed = Date.now() - Date.parse(timestamp);
  if (!Number.isFinite(elapsed)) return "missing data";
  if (elapsed < 60_000) return "Observed <1m ago";
  if (elapsed < 3_600_000) return `Observed ${Math.floor(elapsed / 60_000)}m ago`;
  if (elapsed < 86_400_000) return `Observed ${Math.floor(elapsed / 3_600_000)}h ago`;
  return `Observed ${Math.floor(elapsed / 86_400_000)}d ago`;
}

export const prettyOutcome = (value?: string) => {
  if (value === "BLOCKED_STALE_PRICE") return "No paper fill · expired legacy quote";
  if (value === "SKIPPED_QUOTE_UNAVAILABLE") return "No paper fill · quote unavailable";
  return value?.replaceAll("_", " ") ?? "Not applied";
};
export const money = (value?: string) => formatMoney(value);
