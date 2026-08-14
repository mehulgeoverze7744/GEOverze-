/** Small community formatting helpers. */

/** Compact relative time, e.g. "4h", "2d". Stable across SSR (no locale). */
export function relativeTime(iso: string, now: Date = new Date("2026-08-06T06:00:00Z")): string {
  const then = new Date(iso).getTime();
  const seconds = Math.max(0, Math.round((now.getTime() - then) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w`;
  return `${Math.round(days / 30)}mo`;
}

/** 12_400 -> "12.4k". */
export function compactCount(n: number): string {
  if (n < 1_000) return String(n);
  if (n < 1_000_000) return `${(n / 1_000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, "")}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function duration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

/** Splits body text into plain and @mention segments for styled rendering. */
export function mentionSegments(text: string): { text: string; mention: boolean }[] {
  return text
    .split(/(@[a-z0-9_]+)/gi)
    .filter((part) => part.length > 0)
    .map((part) => ({ text: part, mention: part.startsWith("@") }));
}
