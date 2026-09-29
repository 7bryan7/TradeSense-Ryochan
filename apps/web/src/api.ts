const sessionStorageKey = "tradesense.session.v1";
export const conversationStorageKey = "tradesense.conversation.v1";
export const demoEntryStorageKey = "tradesense.demo-entry.v1";

export const sessionId = localStorage.getItem(sessionStorageKey) ?? crypto.randomUUID();
localStorage.setItem(sessionStorageKey, sessionId);

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", "X-TradeSense-Session": sessionId, ...(options?.headers ?? {}) },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function observedLabel(timestamp?: string): string {
  if (!timestamp) return "No evidence timestamp";
  const elapsed = Date.now() - Date.parse(timestamp);
  if (!Number.isFinite(elapsed)) return "Unknown evidence time";
  if (elapsed < 60_000) return "Observed <1m ago";
  if (elapsed < 3_600_000) return `Observed ${Math.floor(elapsed / 60_000)}m ago`;
  if (elapsed < 86_400_000) return `Observed ${Math.floor(elapsed / 3_600_000)}h ago`;
  return `Observed ${Math.floor(elapsed / 86_400_000)}d ago`;
}

export const prettyOutcome = (value?: string) => value?.replaceAll("_", " ") ?? "Not applied";
export const money = (value?: string) => value === undefined ? "—" : `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
