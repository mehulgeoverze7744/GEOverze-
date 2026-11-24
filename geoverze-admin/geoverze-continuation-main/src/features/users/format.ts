const DATE_FALLBACK = "—";

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  timeZone: "UTC",
});

const dateTimeFmt = new Intl.DateTimeFormat("en-IN", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

/** Parse an ISO or Date value without throwing; returns null when unusable. */
export function parseIsoDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : null;
  }
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  return Number.isFinite(date.getTime()) ? date : null;
}

/** Numeric sort key for date columns (`0` when the value is missing or invalid). */
export function dateSortKey(value: unknown): number {
  return parseIsoDate(value)?.getTime() ?? 0;
}

export function formatDate(value: unknown, fallback = DATE_FALLBACK): string {
  const date = parseIsoDate(value);
  if (!date) return fallback;
  try {
    return dateFmt.format(date);
  } catch {
    return fallback;
  }
}

export function formatDateTime(value: unknown, fallback = DATE_FALLBACK): string {
  const date = parseIsoDate(value);
  if (!date) return fallback;
  try {
    return `${dateTimeFmt.format(date)} UTC`;
  } catch {
    return fallback;
  }
}

export function relativeDays(days: number) {
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}