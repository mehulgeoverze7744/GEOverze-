import { useEffect, useState } from "react";

/** Milliseconds until the next local midnight. */
function msUntilMidnight() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

function format(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { hours: pad(h), minutes: pad(m), seconds: pad(s) };
}

/**
 * Countdown to the next midnight reset. Renders `--:--:--` until hydration so
 * server and client markup agree.
 */
export function useMidnightCountdown() {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    setMs(msUntilMidnight());
    const id = window.setInterval(() => setMs(msUntilMidnight()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (ms === null) return { hours: "--", minutes: "--", seconds: "--", ready: false };
  return { ...format(ms), ready: true };
}
