import { Lock } from "lucide-react";

import { ProgressBarFill } from "@/features/progression/components/ProgressBarFill";
import type { Achievement } from "@/features/profile/data/achievements";
import { cn } from "@/lib/utils";

type AchievementTileProps = {
  achievement: Achievement;
};

/** Compact premium achievement milestone tile. */
export function AchievementTile({ achievement }: AchievementTileProps) {
  const locked = achievement.status === "locked";
  const unlocked = achievement.status === "unlocked";

  return (
    <article
      className={cn(
        "hr-achievement-tile motion-reduce:transform-none",
        unlocked && "hr-achievement-tile--unlocked",
        locked && "hr-achievement-tile--locked",
      )}
    >
      <div className="hr-achievement-tile-header">
        <span className="hr-achievement-icon" aria-hidden="true">
          {locked ? (
            <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
          ) : (
            <achievement.icon className="h-4 w-4" strokeWidth={1.35} />
          )}
        </span>
        {!locked && achievement.status === "progress" ? (
          <span className="text-[0.58rem] tabular-nums uppercase tracking-[0.14em] text-bronze/85">
            {achievement.progress}%
          </span>
        ) : null}
      </div>

      <h3 className="hr-achievement-name">{achievement.name}</h3>
      <p className="hr-achievement-desc">{achievement.description}</p>

      {achievement.status === "progress" ? (
        <ProgressBarFill
          className="mt-3"
          size="sm"
          value={achievement.progress}
          label={`${achievement.name} progress`}
          valueText={`${achievement.progress}% complete`}
        />
      ) : null}

      <p className="hr-achievement-footer">
        {unlocked
          ? (achievement.earnedOn ?? "Unlocked")
          : locked
            ? "Locked"
            : achievement.detail}
      </p>
    </article>
  );
}
