import { useQuery } from "@tanstack/react-query";

import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";

import { fetchMyBilling } from "../data/fetchMyBilling";

export function billingQueryKey(userId: string | undefined) {
  return ["billing", userId ?? "anon"] as const;
}

/** Live billing snapshot for the signed-in user. */
export function useMyBilling() {
  const signedIn = useAuthStore(selectIsSignedIn);
  const userId = useAuthStore((s) => s.user?.id);
  const authReady = useAuthStore((s) => s.status !== "unknown");

  const query = useQuery({
    queryKey: billingQueryKey(userId),
    queryFn: fetchMyBilling,
    enabled: authReady && signedIn && Boolean(userId),
    staleTime: 30_000,
    // Retry once after 2 s for transient mobile network errors, then surface.
    retry: (failureCount, err) => {
      const msg = err instanceof Error ? err.message : "";
      // Never retry auth errors — they require user action, not a re-fetch.
      if (msg.startsWith("UNAUTHENTICATED:")) return false;
      return failureCount < 1;
    },
    retryDelay: 2_000,
  });

  const rawError = query.error instanceof Error
    ? query.error.message
    : query.error
      ? String(query.error)
      : null;

  return {
    data: query.data ?? null,
    /**
     * True while the query is actively fetching AND the user is signed in.
     * Also true during the auth check phase (authReady = false) to show
     * a skeleton while we wait for the session to settle — prevents the
     * "empty cards" flash on Android before auth resolves.
     */
    loading: !authReady || (authReady && signedIn && query.isPending),
    /** Raw error message; null on success or while still loading. */
    error: rawError,
    /**
     * True when the error is an auth error (not a data error).
     * SubscriptionScreen uses this to show "Sign in required" instead of
     * the generic "Unable to load" message.
     */
    isAuthError: rawError?.startsWith("UNAUTHENTICATED:") ?? false,
    /** True once the authStore knows the signed-in/signed-out state. */
    authReady,
    /** True when the user is confirmed signed in by the authStore. */
    signedIn,
    refetch: () => {
      void query.refetch();
    },
  };
}
