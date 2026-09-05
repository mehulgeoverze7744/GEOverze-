import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { XpProgressBar } from "@/features/progression/components/XpProgressBar";
import { cn } from "@/lib/utils";

/** Gamified level and XP readout for the dashboard hero. */
export function PlayerProgressHud({
  level,
  levelTitle,
  xpIntoLevel,
  xpForLevel,
  nextRank,
  className,
}: {
  level: number;
  levelTitle: string;
  xpIntoLevel: number;
  xpForLevel: number;
  nextRank: { level: number; title: string } | null;
  className?: string;
}) {
  const xpPct = Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100));
  const levelLabel = String(level).padStart(2, "0");

  return (
    <div
      className={cn(
        "dashboard-hud rounded-2xl border border-bronze/22 bg-charcoal/40 p-5 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-5">
        <ProgressRing value={xpPct} label="XP toward next level" size={88} thickness={4}>
          <span className="text-lg font-semibold text-gradient-bronze">{levelLabel}</span>
        </ProgressRing>

        <div className="min-w-0 flex-1">
          <p className="dashboard-section-label">Level {level}</p>
          <p className="mt-1 text-xl font-light tracking-wide text-foreground">{levelTitle}</p>
          {nextRank ? (
            <p className="mt-2 text-xs text-foreground/50">
              Next rank{" "}
              <span className="text-bronze/90">
                {nextRank.title}
                <span className="text-foreground/40"> · Lv {nextRank.level}</span>
              </span>
            </p>
          ) : null}
        </div>

        <div className="w-full sm:w-auto sm:min-w-[140px] sm:text-right">
          <p className="dashboard-section-label">Experience</p>
          <p className="mt-1 text-sm text-foreground/70">
            <AnimatedCounter value={xpIntoLevel} className="text-bronze-glow" /> /{" "}
            {xpForLevel.toLocaleString()} XP
          </p>
        </div>
      </div>

      <XpProgressBar
        className="mt-5"
        xpIntoLevel={xpIntoLevel}
        xpForLevel={xpForLevel}
        nextLevelLabel={
          nextRank ? `Level ${nextRank.level} · ${nextRank.title}` : undefined
        }
      />
    </div>
  );
}
