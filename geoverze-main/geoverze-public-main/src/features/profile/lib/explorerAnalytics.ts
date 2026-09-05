import { LEARNING_PROGRESS } from "@/features/dashboard/data/dashboard";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";

import { PROFILE_STATS, RECORD_STATS, STREAK } from "../data/stats";

/** Aggregated explorer analytics from existing placeholder progression sources. */
export function useExplorerAnalytics() {
  const player = useProgressionStore(selectPlayer);

  const hoursLearned = PROFILE_STATS.find((s) => s.id === "hours");
  const questionsAnswered = RECORD_STATS.find((s) => s.id === "questions");
  const averageScore = RECORD_STATS.find((s) => s.id === "average-score");
  const winRate = RECORD_STATS.find((s) => s.id === "win-rate");
  const soloWins = RECORD_STATS.find((s) => s.id === "solo-wins");
  const pvpWins = RECORD_STATS.find((s) => s.id === "pvp-wins");
  const multiplayerWins = RECORD_STATS.find((s) => s.id === "multiplayer-wins");

  const countriesRemaining = player.countriesTotal - player.countriesExplored;
  const explorationPct = Math.round((player.countriesExplored / player.countriesTotal) * 100);

  return {
    hero: {
      totalQuizzes: player.totalQuizzes,
      accuracy: player.accuracy,
      countriesExplored: player.countriesExplored,
      countriesTotal: player.countriesTotal,
      currentStreak: player.currentStreak,
    },
    performanceHistory: [] as readonly { label: string; accuracy: number; quizzes: number }[],
    categories: LEARNING_PROGRESS.map((track) => ({
      id: track.id,
      label: track.label,
      value: track.value,
      detail: track.detail,
    })),
    exploration: {
      explored: player.countriesExplored,
      total: player.countriesTotal,
      remaining: countriesRemaining,
      pct: explorationPct,
    },
    gameModes: [
      { id: "solo", label: "Solo", wins: soloWins?.value ?? 0 },
      { id: "pvp", label: "PvP", wins: pvpWins?.value ?? 0 },
      { id: "multiplayer", label: "Multiplayer", wins: multiplayerWins?.value ?? 0 },
    ],
    winRate: winRate?.value ?? 0,
    consistency: {
      current: STREAK.current,
      longest: STREAK.longest,
      recentActivity: STREAK.week,
    },
    supporting: {
      hoursLearned: hoursLearned?.value ?? 0,
      hoursDecimals: hoursLearned?.decimals ?? 1,
      questionsAnswered: questionsAnswered?.value ?? 0,
      averageScore: averageScore?.value ?? 0,
    },
  };
}

export type ExplorerAnalytics = ReturnType<typeof useExplorerAnalytics>;
