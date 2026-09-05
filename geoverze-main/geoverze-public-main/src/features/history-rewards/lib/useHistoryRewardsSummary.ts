/** Aggregated summary metrics for the unified history & rewards page. */
import { useMemo } from "react";

import { QUIZ_RUNS } from "@/features/history/data/history";
import { summarise } from "@/features/history/lib/filter";
import { ACHIEVEMENTS } from "@/features/profile/data/achievements";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";

export function useHistoryRewardsSummary() {
  const player = useProgressionStore(selectPlayer);

  return useMemo(() => {
    const historyStats = summarise(QUIZ_RUNS);
    const badgesUnlocked = ACHIEVEMENTS.filter((item) => item.status === "unlocked").length;

    return {
      quizzesCompleted: player.totalQuizzes,
      accuracy: player.accuracy,
      wins: historyStats.wins,
      creditsEarned: historyStats.credits,
      badgesUnlocked,
      badgesTotal: ACHIEVEMENTS.length,
      badgeCompletion: Math.round((badgesUnlocked / ACHIEVEMENTS.length) * 100),
    };
  }, [player.accuracy, player.totalQuizzes]);
}
