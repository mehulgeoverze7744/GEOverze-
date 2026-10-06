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
  });

  return {
    data: query.data ?? null,
    loading: authReady && signedIn && query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
