import { useQuery } from "@tanstack/react-query";

import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";

import { fetchQuizProgressStats } from "../data/fetchQuizProgressStats";

export const quizProgressStatsQueryKey = ["quizProgressStats"] as const;

const EMPTY_STATS = {
  gamesPlayed: 0,
  wins: 0,
  accuracy: 0,
  currentStreak: 0,
} as const;

/** Authenticated quiz performance for the Dashboard Quiz Progress card. */
export function useQuizProgressStats() {
  const signedIn = useAuthStore(selectIsSignedIn);
  const userId = useAuthStore((s) => s.user?.id);

  const query = useQuery({
    queryKey: [...quizProgressStatsQueryKey, userId] as const,
    queryFn: () => fetchQuizProgressStats(userId as string),
    enabled: signedIn && Boolean(userId),
    staleTime: 30_000,
  });

  return {
    stats: query.data ?? EMPTY_STATS,
    loading: signedIn && query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
  };
}
