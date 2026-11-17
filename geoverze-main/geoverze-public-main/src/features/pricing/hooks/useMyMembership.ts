import { useQuery } from "@tanstack/react-query";

import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";

import { fetchMyMembership, myMembershipQueryKey } from "../data/fetchMyMembership";
import {
  checkEntitlement,
  explorerMembershipFallback,
  getLibraryAccess,
  getMembershipDiscountBps,
  getRemainingQuizzes,
  type UserMembership,
} from "../lib/membership";

/** Signed-in membership snapshot. Anonymous callers get Explorer fallback. */
export function useMyMembership() {
  const signedIn = useAuthStore(selectIsSignedIn);
  const userId = useAuthStore((s) => s.user?.id);
  const authReady = useAuthStore((s) => s.status !== "unknown");

  const query = useQuery({
    queryKey: myMembershipQueryKey(userId),
    queryFn: fetchMyMembership,
    enabled: authReady && signedIn && Boolean(userId),
    staleTime: 30_000,
    retry: (failureCount, err) => {
      const msg = err instanceof Error ? err.message : "";
      if (msg.startsWith("UNAUTHENTICATED:")) return false;
      return failureCount < 1;
    },
    retryDelay: 2_000,
  });

  const membership: UserMembership | null = query.data ?? null;
  const fallback = explorerMembershipFallback();
  const remaining = membership ? getRemainingQuizzes(membership) : null;

  return {
    membership,
    remaining,
    loading: !authReady || query.isPending,
    error: query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: query.refetch,
    checkEntitlement: (feature: Parameters<typeof checkEntitlement>[1]) =>
      checkEntitlement(membership, feature),
    libraryAccess: getLibraryAccess(membership),
    discountBps: getMembershipDiscountBps(membership),
    display: membership ?? {
      ...fallback,
      userId: userId ?? "anon",
    },
    signedIn,
  };
}
