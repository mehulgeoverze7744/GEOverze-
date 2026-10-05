/** Aggregated summary metrics for the unified history & rewards page. */
import { useMemo } from "react";

import { useCreditProductAchievements } from "@/features/dashboard/hooks/useCreditProductAchievements";
import { QUIZ_RUNS } from "@/features/history/data/history";
import { summarise } from "@/features/history/lib/filter";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";

export function useHistoryRewardsSummary() {
  const player = useProgressionStore(selectPlayer);
  const { achievements } = useCreditProductAchievements();

  return useMemo(() => {
    const historyStats = summarise(QUIZ_RUNS);
    const badgesUnlocked = achievements.length;

    return {
      quizzesCompleted: player.totalQuizzes,
      accuracy: player.accuracy,
      wins: historyStats.wins,
      creditsEarned: historyStats.credits,
      badgesUnlocked,
      badgesTotal: badgesUnlocked,
      badgeCompletion: badgesUnlocked > 0 ? 100 : 0,
    };
  }, [achievements.length, player.accuracy, player.totalQuizzes]);
}
