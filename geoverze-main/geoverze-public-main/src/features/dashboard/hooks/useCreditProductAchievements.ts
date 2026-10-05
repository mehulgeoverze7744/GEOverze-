import { useQuery } from "@tanstack/react-query";

import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";

import { fetchCreditProductAchievements } from "../data/fetchCreditProductAchievements";

export const creditProductAchievementsQueryKey = ["creditProductAchievements"] as const;

/** Live GeoCredit product achievements for the authenticated explorer. */
export function useCreditProductAchievements() {
  const signedIn = useAuthStore(selectIsSignedIn);
  const userId = useAuthStore((s) => s.user?.id);

  const query = useQuery({
    queryKey: [...creditProductAchievementsQueryKey, userId] as const,
    queryFn: fetchCreditProductAchievements,
    enabled: signedIn && Boolean(userId),
    staleTime: 30_000,
  });

  return {
    achievements: query.data ?? [],
    loading: signedIn && query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
  };
}
