import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";

import { fetchLibrarySubscriptionTier } from "../data/fetchLibrarySubscriptionTier";
import { libraryTierLabel, type LibraryAccessTier } from "../lib/access-tier";
import {
  librarySubscriptionTierQueryKey,
  syncLibrarySubscriptionTier,
  useLibraryAuthScope,
} from "../lib/library-query-scope";

const EXPLORER_FALLBACK = {
  tier: "explorer" as LibraryAccessTier,
  displayName: libraryTierLabel("explorer"),
};

/** Current user's public subscription tier for GEOlibrary access UI. */
export function useLibrarySubscriptionTier() {
  const signedIn = useAuthStore(selectIsSignedIn);
  const { scope, authReady } = useLibraryAuthScope();

  const query = useQuery({
    queryKey: librarySubscriptionTierQueryKey(scope),
    queryFn: fetchLibrarySubscriptionTier,
    enabled: authReady && signedIn,
    staleTime: 60_000,
  });

  const snapshot = signedIn && query.data ? query.data : EXPLORER_FALLBACK;

  useEffect(() => {
    if (!authReady) return;
    syncLibrarySubscriptionTier(snapshot.tier);
  }, [authReady, snapshot.tier]);

  return {
    tier: snapshot.tier,
    displayName: snapshot.displayName,
    signedIn,
    authReady,
    tierReady: authReady && (!signedIn || !query.isPending),
    loading: authReady && signedIn && query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
  };
}
