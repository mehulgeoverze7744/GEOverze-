import { Link } from "@tanstack/react-router";
import { CalendarRange, Flame, Gift, Trophy } from "lucide-react";

import { GeoButton } from "@/components/shared";
import { PLAYER } from "@/features/progression";
import { MetaChip } from "./Badges";

const TASKS = [
  { label: "Finish four ranked rounds", done: 3, total: 4 },
  { label: "Score above 85% twice", done: 1, total: 2 },
  { label: "Play one map-select set", done: 1, total: 1 },
];

/**
 * Weekly challenge panel. Streak-aware copy, placeholder task progress — no
 * scoring logic behind it yet.
 */
export function WeeklyChallenge({ onPlay }: { onPlay: () => void }) {
  const done = TASKS.filter((t) => t.done >= t.total).length;

  return (
    <section className="game-surface rounded-2xl p-6 md:p-8" aria-label="This week's challenge">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <MetaChip tone="bronze">
              <CalendarRange className="h-3 w-3" strokeWidth={2.2} aria-hidden />
              Weekly challenge
            </MetaChip>
            <MetaChip>
              <Flame className="h-3 w-3 text-bronze" strokeWidth={2.2} aria-hidden />
              {PLAYER.currentStreak}-day streak
            </MetaChip>
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground md:text-xl">
            Expedition: Borders & Basins
          </h2>
          <p className="mt-2 max-w-xl text-[0.85rem] leading-relaxed text-foreground/55">
            A longer run with three objectives. Clear all three before Sunday midnight to keep your
            streak shield and bank the bonus credits.
          </p>
        </div>
        <GeoButton variant="solid" size="lg" className="shrink-0" onClick={onPlay}>
          Enter this week
        </GeoButton>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {TASKS.map((task) => {
          const pct = Math.round((Math.min(task.done, task.total) / task.total) * 100);
          return (
            <li key={task.label} className="game-surface-raised rounded-xl p-4">
              <p className="text-[0.8rem] font-medium text-foreground">{task.label}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[oklch(0.2_0.008_60)]">
                <span className="block h-full bg-gradient-bronze" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-[0.68rem] tabular-nums text-foreground/50">
                {Math.min(task.done, task.total)} / {task.total}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.72rem] text-foreground/50">
        <span className="inline-flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-bronze" strokeWidth={1.8} aria-hidden />
          {done} of {TASKS.length} objectives cleared
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Gift className="h-3.5 w-3.5 text-bronze" strokeWidth={1.8} aria-hidden />
          Reward: +600 XP, +12 credits
        </span>
        <Link
          to="/play/weekly-challenges"
          className="font-semibold uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
        >
          Challenge details
        </Link>
      </div>
    </section>
  );
}
