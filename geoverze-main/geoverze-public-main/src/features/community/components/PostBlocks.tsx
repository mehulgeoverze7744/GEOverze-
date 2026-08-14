import { Trophy, Target, Timer, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

import { duration } from "../lib/format";

/** Score readout for a shared quiz result. */
export function QuizResultBlock({
  quiz,
  score,
  total,
  accuracy,
  xp,
  durationSeconds,
}: {
  quiz: string;
  score: number;
  total: number;
  accuracy: number;
  xp: number;
  durationSeconds: number;
}) {
  const perfect = score === total;
  const stats = [
    { icon: Target, label: "Accuracy", value: `${accuracy}%` },
    { icon: Zap, label: "XP earned", value: `+${xp}` },
    { icon: Timer, label: "Time", value: duration(durationSeconds) },
  ];

  return (
    <div className="mt-4 rounded-xl border border-bronze/15 bg-charcoal/50 p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="text-[0.6rem] uppercase tracking-[0.22em] text-foreground/50">
            Quiz result
          </p>
          <p className="mt-1 truncate text-sm font-medium text-foreground">{quiz}</p>
        </div>
        <div
          className={cn(
            "shrink-0 rounded-lg border px-4 py-2 text-center",
            perfect ? "border-bronze/50 bg-bronze/10" : "border-bronze/20",
          )}
        >
          <p className="text-lg font-semibold leading-none text-bronze-glow">
            {score}
            <span className="text-sm text-foreground/50">/{total}</span>
          </p>
          {perfect ? (
            <p className="mt-1 text-[0.55rem] uppercase tracking-[0.2em] text-bronze">Perfect</p>
          ) : null}
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-bronze/10 pt-4">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="flex items-center gap-1.5 text-[0.58rem] uppercase tracking-[0.18em] text-foreground/50">
              <s.icon className="h-3 w-3 shrink-0" strokeWidth={1.5} />
              <span className="truncate">{s.label}</span>
            </dt>
            <dd className="mt-1 text-sm text-foreground/85">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Unlocked-achievement showcase for a shared badge. */
export function AchievementBlock({
  achievement,
  note,
  rarity,
}: {
  achievement: string;
  note: string;
  rarity: string;
}) {
  return (
    <div className="mt-4 flex items-start gap-4 rounded-xl border border-bronze/25 bg-gradient-to-br from-bronze/12 to-transparent p-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-bronze/45 bg-bronze/10 text-bronze">
        <Trophy className="h-5 w-5" strokeWidth={1.4} />
      </span>
      <div className="min-w-0">
        <p className="text-[0.6rem] uppercase tracking-[0.22em] text-bronze/90">
          Achievement unlocked
        </p>
        <p className="mt-1 text-base font-medium text-foreground">{achievement}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">{note}</p>
        <p className="mt-2 text-[0.6rem] uppercase tracking-[0.2em] text-foreground/50">{rarity}</p>
      </div>
    </div>
  );
}
