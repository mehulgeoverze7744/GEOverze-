import { useQuery } from "@tanstack/react-query";

import { fetchSubscriptionCatalog } from "@/features/pricing/data/fetchSubscriptionCatalog";
import { pricingCatalogQueryKey } from "@/features/pricing/hooks/usePricingCatalog";

/** Raw subscription_plans rows, sharing the pricing catalog cache. */
export function useSubscriptionPlanRows() {
  const query = useQuery({
    queryKey: pricingCatalogQueryKey,
    queryFn: fetchSubscriptionCatalog,
    staleTime: 60_000,
    select: (data) => data.plans,
  });

  return { plans: query.data ?? [] };
}
