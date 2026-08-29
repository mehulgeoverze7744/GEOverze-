import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";

import { fetchUserEntitlements } from "../data/fetchUserEntitlements";

export const entitlementsQueryKey = ["userEntitlements"] as const;

export type UseEntitlementsResult = {
  ownedSlugs: ReadonlySet<string>;
  ownedProductIds: ReadonlySet<string>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

/** Server-authoritative digital ownership from user_entitlements. */
export function useEntitlements(): UseEntitlementsResult {
  const signedIn = useAuthStore(selectIsSignedIn);

  const query = useQuery({
    queryKey: entitlementsQueryKey,
    queryFn: fetchUserEntitlements,
    enabled: signedIn,
    staleTime: 30_000,
  });

  const ownedSlugs = useMemo(
    () => new Set((query.data ?? []).map((row) => row.product_slug)),
    [query.data],
  );

  const ownedProductIds = useMemo(
    () =>
      new Set(
        (query.data ?? []).map((row) => row.product_id).filter((id): id is string => Boolean(id)),
      ),
    [query.data],
  );

  return {
    ownedSlugs,
    ownedProductIds,
    loading: signedIn && query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: () => {
      void query.refetch();
    },
  };
}

export function isProductOwned(
  entitlements: Pick<UseEntitlementsResult, "ownedSlugs">,
  slug: string,
): boolean {
  return entitlements.ownedSlugs.has(slug);
}
