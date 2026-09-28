import { useQuery } from "@tanstack/react-query";

import { fetchStoreProducts } from "../data/fetchStoreProducts";
import {
  mergeServerCatalogue,
  rewardShelfProducts,
  type StoreCatalogueProduct,
} from "../lib/mergeCatalogue";

export const storeCatalogueQueryKey = ["storeCatalogue"] as const;

export type UseStoreCatalogueResult = {
  products: StoreCatalogueProduct[];
  rewardProducts: StoreCatalogueProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

/** Server catalogue merged with static presentation metadata. */
export function useStoreCatalogue(): UseStoreCatalogueResult {
  const query = useQuery({
    queryKey: storeCatalogueQueryKey,
    queryFn: fetchStoreProducts,
    select: (rows) => ({ products: mergeServerCatalogue(rows) }),
    staleTime: 60_000,
  });

  const products = query.data?.products ?? [];

  return {
    products,
    // Static prizes stay visible even while the server catalogue is loading or empty.
    rewardProducts: rewardShelfProducts(products),
    loading: query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
