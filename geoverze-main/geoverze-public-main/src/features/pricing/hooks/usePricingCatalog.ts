import { useQuery } from "@tanstack/react-query";

import { fetchSubscriptionCatalog } from "../data/fetchSubscriptionCatalog";
import type { ComparisonGroup } from "../data/comparison";
import type { PricingPlan } from "../data/plans";
import { buildComparisonGroups } from "../lib/buildComparisonGroups";
import { buildPricingPlans } from "../lib/buildPricingPlans";

export const pricingCatalogQueryKey = ["pricingCatalog"] as const;

export type PricingCatalogData = {
  plans: PricingPlan[];
  comparisonGroups: ComparisonGroup[];
};

export type UsePricingCatalogResult = PricingCatalogData & {
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

/** Server subscription catalog merged into pricing UI models. */
export function usePricingCatalog(): UsePricingCatalogResult {
  const query = useQuery({
    queryKey: pricingCatalogQueryKey,
    queryFn: fetchSubscriptionCatalog,
    select: ({ plans, promotions }): PricingCatalogData => ({
      plans: buildPricingPlans(plans, promotions),
      comparisonGroups: buildComparisonGroups(plans),
    }),
    staleTime: 60_000,
  });

  return {
    plans: query.data?.plans ?? [],
    comparisonGroups: query.data?.comparisonGroups ?? [],
    loading: query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
