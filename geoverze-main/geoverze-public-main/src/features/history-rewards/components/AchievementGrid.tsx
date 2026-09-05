import { useState } from "react";

import { ProgressBarFill } from "@/features/progression/components/ProgressBarFill";
import {
  ACHIEVEMENT_FILTERS,
  ACHIEVEMENTS,
  type AchievementFilterId,
} from "@/features/profile/data/achievements";
import { cn } from "@/lib/utils";

import { useHistoryRewardsSummary } from "../lib/useHistoryRewardsSummary";
import { AchievementTile } from "./AchievementTile";

/** Achievement catalogue with compact summary and filters. */
export function AchievementGrid() {
  const [filter, setFilter] = useState<AchievementFilterId>("all");
  const summary = useHistoryRewardsSummary();

  const visible =
    filter === "all" ? ACHIEVEMENTS : ACHIEVEMENTS.filter((item) => item.status === filter);

  return (
    <div>
      <div className="hr-achievement-summary">
        <div className="hr-achievement-summary-text">
          <p className="hr-achievement-summary-title">Achievements</p>
          <p className="hr-achievement-summary-count">
            {summary.badgesUnlocked} / {summary.badgesTotal} unlocked · {summary.badgeCompletion}%
            complete
          </p>
        </div>
        <div className="hr-achievement-summary-bar">
          <ProgressBarFill
            size="sm"
            value={summary.badgeCompletion}
            label="Achievement completion"
            valueText={`${summary.badgeCompletion}% complete`}
          />
        </div>
      </div>

      <div className="hr-chip-row" role="group" aria-label="Filter achievements">
        {ACHIEVEMENT_FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={filter === option.id}
            data-active={filter === option.id}
            onClick={() => setFilter(option.id)}
            className={cn(
              "hr-chip focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="hr-achievement-grid">
        {visible.map((achievement) => (
          <AchievementTile key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
