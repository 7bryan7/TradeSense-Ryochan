const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function formatCompactNumber(value: number): string {
  const absolute = Math.abs(value);
  const scale = absolute >= 1e12 ? [1e12, "T"] : absolute >= 1e9 ? [1e9, "B"] : absolute >= 1e6 ? [1e6, "M"] : absolute >= 1e3 ? [1e3, "K"] : [1, ""];
  return `${number.format(value / (scale[0] as number))}${scale[1]}`;
}

export function formatCompactUsd(value: number): string {
  return `$${formatCompactNumber(value)}`;
}

export function formatMoney(value?: string | number | null): string {
  if (value === undefined || value === null) return "missing data";
  const numeric = Number(value);
  return Number.isFinite(numeric) ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numeric) : "missing data";
}

export function formatDateTime(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "Unknown time";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" }).format(date);
}
