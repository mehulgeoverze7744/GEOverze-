import { useQuery } from "@tanstack/react-query";

import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";

import { fetchDashboardQuizAttempts } from "../data/fetchDashboardQuizAttempts";

export const dashboardQuizAttemptsQueryKey = ["dashboardQuizAttempts"] as const;

export function useDashboardQuizAttempts() {
  const signedIn = useAuthStore(selectIsSignedIn);
  const userId = useAuthStore((s) => s.user?.id);

  const query = useQuery({
    queryKey: [...dashboardQuizAttemptsQueryKey, userId] as const,
    queryFn: () => fetchDashboardQuizAttempts(6),
    enabled: signedIn,
    staleTime: 30_000,
  });

  return {
    attempts: query.data ?? [],
    loading: signedIn && query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
  };
}
