import { Coins } from "lucide-react";

import { AnimatedCounter } from "@/components/shared";
import { cn } from "@/lib/utils";
import { creditProgress } from "../lib/progress";
import { ProgressBarFill } from "./ProgressBarFill";

/** Credits earned toward the monthly goal. */
export function CreditProgressBar({
  credits,
  goal,
  className,
}: {
  credits: number;
  goal: number;
  className?: string;
}) {
  const { pct, remaining, eligible } = creditProgress(credits, goal);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end justify-between gap-4">
        <p className="inline-flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
          <Coins className="h-3.5 w-3.5 text-bronze/90" strokeWidth={2} aria-hidden="true" />
          Credits this month
        </p>
        <p className="text-xs text-foreground/60">
          <AnimatedCounter value={credits} className="text-bronze-glow" /> / {goal}
        </p>
      </div>
      <ProgressBarFill
        className="mt-3"
        size="lg"
        value={pct}
        label="Credits toward the monthly goal"
        valueText={`${credits} of ${goal} credits`}
      />
      <p className="mt-3 text-xs text-foreground/50">
        {eligible
          ? "Goal reached — keep earning toward GEOverze rewards."
          : `${remaining} credits remaining to reach the goal.`}
      </p>
    </div>
  );
}
