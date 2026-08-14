import { Globe2, MapPinned, Milestone } from "lucide-react";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { ProgressRing } from "@/components/shared/ProgressRing";

import { WORLD_PROGRESS, WORLD_REMAINING } from "../data/mastery";

const ROWS = [
  {
    id: "visited",
    label: "Visited",
    value: WORLD_PROGRESS.visited,
    hint: "Appeared in at least one quiz",
    icon: MapPinned,
  },
  {
    id: "completed",
    label: "Completed",
    value: WORLD_PROGRESS.completed,
    hint: "Every question type answered",
    icon: Globe2,
  },
  {
    id: "remaining",
    label: "Remaining",
    value: WORLD_REMAINING,
    hint: "Still to master",
    icon: Milestone,
  },
] as const;

/** Big-picture world completion: one ring plus three counts. */
export function WorldProgressPanel() {
  const pct = Math.round((WORLD_PROGRESS.completed / WORLD_PROGRESS.total) * 100);

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:gap-10">
      <ProgressRing value={pct} label="World completion" size={148}>
        <span className="text-3xl font-light text-gradient-bronze">{pct}%</span>
        <span className="text-[0.55rem] uppercase tracking-[0.24em] text-foreground/50">world</span>
      </ProgressRing>

      <ul className="w-full flex-1 space-y-5">
        {ROWS.map((row) => (
          <li key={row.id} className="flex items-center gap-4">
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-bronze/22 bg-bronze/5 text-bronze"
              aria-hidden="true"
            >
              <row.icon className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-foreground/80">{row.label}</span>
              <span className="mt-1 block text-xs text-foreground/50">{row.hint}</span>
            </span>
            <span className="shrink-0 text-lg font-light text-gradient-bronze">
              <AnimatedCounter value={row.value} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
