import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";

import { fetchCreditLedgerEntries } from "../data/fetchCreditLedgerEntries";
import { mapCreditLedgerBundle } from "../lib/mapCreditLedgerEntry";

export const creditHistoryQueryKey = ["creditHistory"] as const;

export function useCreditHistory() {
  const signedIn = useAuthStore(selectIsSignedIn);

  const query = useQuery({
    queryKey: creditHistoryQueryKey,
    queryFn: fetchCreditLedgerEntries,
    enabled: signedIn,
    staleTime: 30_000,
  });

  const mapped = useMemo(
    () => (query.data ? mapCreditLedgerBundle(query.data) : null),
    [query.data],
  );

  return {
    entries: mapped?.entries ?? [],
    expiringLots: mapped?.expiringLots ?? [],
    monthlyEarned: mapped?.monthlyEarned ?? 0,
    loading: signedIn && query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
