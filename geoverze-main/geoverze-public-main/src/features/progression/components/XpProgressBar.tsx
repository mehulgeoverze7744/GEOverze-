import { AnimatedCounter } from "@/components/shared";
import { cn } from "@/lib/utils";
import { ProgressBarFill } from "./ProgressBarFill";

/** XP progress toward the next level. */
export function XpProgressBar({
  xpIntoLevel,
  xpForLevel,
  nextLevelLabel,
  className,
}: {
  xpIntoLevel: number;
  xpForLevel: number;
  nextLevelLabel?: string | undefined;
  className?: string;
}) {
  const pct = Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100));
  const remaining = Math.max(0, xpForLevel - xpIntoLevel);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end justify-between gap-4">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
          Experience
        </p>
        <p className="text-xs text-foreground/60">
          <AnimatedCounter value={xpIntoLevel} className="text-bronze-glow" /> /{" "}
          {xpForLevel.toLocaleString()} XP
        </p>
      </div>
      <ProgressBarFill
        className="mt-3"
        size="lg"
        value={pct}
        label="XP toward next level"
        valueText={`${xpIntoLevel} of ${xpForLevel} XP`}
      />
      <p className="mt-3 text-xs text-foreground/50">
        {remaining.toLocaleString()} XP to {nextLevelLabel ?? "the next level"}
      </p>
    </div>
  );
}
