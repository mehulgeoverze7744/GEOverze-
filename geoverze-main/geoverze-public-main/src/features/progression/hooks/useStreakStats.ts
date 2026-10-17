import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId } from "react";

import { supabase } from "@/lib/supabase/client";
import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";
import { useProgressionStore } from "@/stores/progressionStore";

import { fetchStreakStats, streakStatsQueryKey } from "../data/fetchStreakStats";
import { EMPTY_STREAK_STATS, type StreakStats } from "../lib/streakStats";

/** Shared live streak for Streak page, dashboard, and lobby pills. */
export function useStreakStats() {
  const signedIn = useAuthStore(selectIsSignedIn);
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const channelId = useId();

  const query = useQuery({
    queryKey: [...streakStatsQueryKey, userId] as const,
    queryFn: () => fetchStreakStats(userId as string),
    enabled: signedIn && Boolean(userId),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    placeholderData: undefined,
  });

  useEffect(() => {
    const stats = query.data;
    if (!stats) return;
    const store = useProgressionStore.getState();
    const current = store.player;
    if (current.currentStreak === stats.current && current.longestStreak === stats.longest) {
      return;
    }
    store.setPlayer({
      ...current,
      currentStreak: stats.current,
      longestStreak: stats.longest,
    });
  }, [query.data]);

  useEffect(() => {
    if (!signedIn || !userId) return;

    const channel = supabase
      .channel(`streak-stats:${userId}:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "quiz_attempts",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: streakStatsQueryKey });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_progression",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: streakStatsQueryKey });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [channelId, queryClient, signedIn, userId]);

  const stats: StreakStats = query.data ?? EMPTY_STREAK_STATS;

  return {
    stats,
    loading: signedIn && query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
  };
}
