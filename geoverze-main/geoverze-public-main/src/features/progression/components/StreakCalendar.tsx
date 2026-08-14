import { Check, Flame, X } from "lucide-react";

import { GameCard } from "@/features/play/components/GameCard";
import { cn } from "@/lib/utils";
import { STREAK_DATA } from "../data/streak";

const STATE_STYLE: Record<string, string> = {
  done: "border-bronze/55 bg-gradient-bronze text-background",
  missed: "border-bronze/15 bg-[oklch(0.2_0.008_60)] text-foreground/50",
  today: "border-bronze/70 bg-bronze/18 text-bronze-glow shadow-[var(--glow-bronze)]",
  upcoming: "border-bronze/12 bg-[oklch(0.185_0.008_62)] text-foreground/50",
};

/** Mon–Sun streak calendar with a weekly goal readout. */
export function StreakCalendar() {
  const done = STREAK_DATA.week.filter((day) => day.state === "done").length;
  const goalPct = Math.min(100, Math.round((done / STREAK_DATA.weeklyGoal) * 100));

  return (
    <GameCard interactive={false} raised>
      <div className="p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="inline-flex items-center gap-2 text-base font-semibold text-foreground">
            <Flame className="h-4 w-4 text-bronze/90" strokeWidth={2} aria-hidden="true" />
            This week
          </h3>
          <p className="text-xs text-foreground/50">
            {done} of {STREAK_DATA.weeklyGoal} day goal ({goalPct}%)
          </p>
        </div>

        <ul className="mt-6 grid grid-cols-7 gap-2">
          {STREAK_DATA.week.map((day) => (
            <li key={day.day} className="flex flex-col items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-11 w-full items-center justify-center rounded-xl border",
                  STATE_STYLE[day.state],
                )}
                aria-hidden="true"
              >
                {day.state === "done" ? (
                  <Check className="h-4 w-4" strokeWidth={2.6} />
                ) : day.state === "missed" ? (
                  <X className="h-4 w-4" strokeWidth={2.4} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </span>
              <span className="text-[0.6rem] uppercase tracking-[0.14em] text-foreground/50">
                {day.day}
                <span className="sr-only"> — {day.state}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </GameCard>
  );
}
