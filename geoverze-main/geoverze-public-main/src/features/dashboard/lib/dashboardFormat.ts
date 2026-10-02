/** Short relative timestamp for dashboard lists. */
export function formatDashboardWhen(iso: string, now = Date.now()) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const delta = Math.max(0, now - then);
  const minutes = Math.floor(delta / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatPlayMode(mode: string) {
  if (mode === "pvp") return "PvP";
  if (mode === "multiplayer") return "Multiplayer";
  if (!mode) return "Solo";
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}
