import { Timer as TimerIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { formatDuration } from "../lib/session";

/**
 * Run clock. Counts elapsed time from `startedAt`; the per-question limit in the
 * settings panel is a placeholder, so the clock never forces an answer yet.
 */
export function Timer({
  startedAt,
  paused = false,
  className,
}: {
  startedAt: number | null;
  paused?: boolean;
  className?: string;
}) {
  const [elapsed, setElapsed] = useState(0);
  const frame = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (startedAt === null || paused) return;
    const tick = () => setElapsed(Date.now() - startedAt);
    tick();
    frame.current = setInterval(tick, 500);
    return () => {
      if (frame.current) clearInterval(frame.current);
    };
  }, [startedAt, paused]);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-[0.72rem] font-semibold tabular-nums text-[#111827]",
        className,
      )}
    >
      <TimerIcon className="h-3.5 w-3.5 text-[#2b74c4]" strokeWidth={1.8} aria-hidden />
      <span className="sr-only">Time elapsed</span>
      {formatDuration(elapsed)}
    </span>
  );
}
