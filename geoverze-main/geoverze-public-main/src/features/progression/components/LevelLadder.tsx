import { Check, Lock } from "lucide-react";

import { GameCard } from "@/features/play/components/GameCard";
import { cn } from "@/lib/utils";
import { LEVELS } from "../data/levels";

/** Vertical level ladder with reward per tier. */
export function LevelLadder({ currentLevel }: { currentLevel: number }) {
  return (
    <ol className="grid gap-3">
      {LEVELS.map((tier) => {
        const reached = tier.level <= currentLevel;
        const current = tier.level === currentLevel;
        return (
          <li key={tier.level}>
            <GameCard interactive={false} className={cn(current && "ring-1 ring-bronze/50")}>
              <div className="flex flex-wrap items-center gap-4 p-5">
                <span
                  className={cn(
                    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold",
                    reached
                      ? "bg-gradient-bronze text-background"
                      : "border border-bronze/15 bg-[oklch(0.2_0.008_60)] text-foreground/50",
                  )}
                  aria-hidden="true"
                >
                  {tier.level}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Level {tier.level} · {tier.title}
                    {current ? (
                      <span className="ml-2 text-[0.6rem] uppercase tracking-[0.16em] text-bronze/90">
                        Current
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs text-foreground/50">
                    {tier.xpRequired.toLocaleString()} XP · {tier.reward}
                  </p>
                </div>
                {reached ? (
                  <Check
                    className="h-4 w-4 text-[oklch(0.78_0.13_150)]"
                    strokeWidth={2.4}
                    aria-label="Reached"
                  />
                ) : (
                  <Lock
                    className="h-4 w-4 text-foreground/50"
                    strokeWidth={2}
                    aria-label="Locked"
                  />
                )}
              </div>
            </GameCard>
          </li>
        );
      })}
    </ol>
  );
}
