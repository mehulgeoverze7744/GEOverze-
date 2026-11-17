import { useQuery } from "@tanstack/react-query";

import { LEARNING_PROGRESS } from "@/features/dashboard/data/dashboard";
import { useStreakStats } from "@/features/progression/hooks/useStreakStats";
import { useEntitlements } from "@/hooks/useEntitlements";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";
import { selectUser, useAuthStore } from "@/stores/authStore";

import { fetchAdvancedAnalytics } from "../data/fetchAdvancedAnalytics";
import { PROFILE_STATS, RECORD_STATS } from "../data/stats";

/** Aggregated explorer analytics from live quiz attempts when Pro, else standard stats. */
export function useExplorerAnalytics() {
  const player = useProgressionStore(selectPlayer);
  const { stats: streak } = useStreakStats();
  const { can } = useEntitlements();
  const user = useAuthStore(selectUser);

  const advancedQuery = useQuery({
    queryKey: ["advanced-analytics", user?.id],
    queryFn: () => fetchAdvancedAnalytics(user!.id),
    enabled: Boolean(user?.id) && can.advancedAnalytics,
    staleTime: 30_000,
  });

  const hoursLearned = PROFILE_STATS.find((s) => s.id === "hours");
  const questionsAnswered = RECORD_STATS.find((s) => s.id === "questions");
  const averageScore = RECORD_STATS.find((s) => s.id === "average-score");
  const winRate = RECORD_STATS.find((s) => s.id === "win-rate");
  const soloWins = RECORD_STATS.find((s) => s.id === "solo-wins");
  const pvpWins = RECORD_STATS.find((s) => s.id === "pvp-wins");
  const multiplayerWins = RECORD_STATS.find((s) => s.id === "multiplayer-wins");

  const countriesRemaining = player.countriesTotal - player.countriesExplored;
  const explorationPct = Math.round((player.countriesExplored / player.countriesTotal) * 100);
  const advanced = advancedQuery.data;

  return {
    isPro: can.advancedAnalytics,
    advancedLoading: advancedQuery.isPending,
    hero: {
      totalQuizzes: advanced?.totalQuizzes ?? player.totalQuizzes,
      accuracy: advanced?.accuracy ?? player.accuracy,
      countriesExplored: player.countriesExplored,
      countriesTotal: player.countriesTotal,
      currentStreak: streak.current,
    },
    performanceHistory: (advanced?.trend ?? []) as readonly {
      label: string;
      accuracy: number;
      quizzes: number;
    }[],
    categories:
      advanced?.categories.map((track) => ({
        id: track.id,
        label: track.label,
        value: track.accuracy,
        detail: `${track.quizzes} quizzes · ${track.accuracy}%`,
      })) ??
      LEARNING_PROGRESS.map((track) => ({
        id: track.id,
        label: track.label,
        value: track.value,
        detail: track.detail,
      })),
    strengths: advanced?.strengths ?? [],
    weaknesses: advanced?.weaknesses ?? [],
    exploration: {
      explored: player.countriesExplored,
      total: player.countriesTotal,
      remaining: countriesRemaining,
      pct: explorationPct,
    },
    gameModes: [
      { id: "solo", label: "Solo", wins: advanced?.soloCount ?? soloWins?.value ?? 0 },
      { id: "pvp", label: "PvP", wins: advanced?.pvpCount ?? pvpWins?.value ?? 0 },
      {
        id: "multiplayer",
        label: "Multiplayer",
        wins: advanced?.multiplayerCount ?? multiplayerWins?.value ?? 0,
      },
    ],
    winRate: winRate?.value ?? 0,
    consistency: {
      current: streak.current,
      longest: streak.longest,
      recentActivity: streak.week.map((day) => day.done),
    },
    supporting: {
      hoursLearned: hoursLearned?.value ?? 0,
      hoursDecimals: hoursLearned?.decimals ?? 1,
      questionsAnswered: advanced?.answered ?? questionsAnswered?.value ?? 0,
      averageScore: advanced?.accuracy ?? averageScore?.value ?? 0,
    },
  };
}

export type ExplorerAnalytics = ReturnType<typeof useExplorerAnalytics>;
