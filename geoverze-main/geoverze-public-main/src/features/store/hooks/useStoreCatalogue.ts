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
    select: (rows) => {
      const products = mergeServerCatalogue(rows);
      return {
        products,
        rewardProducts: rewardShelfProducts(products),
      };
    },
    staleTime: 60_000,
  });

  return {
    products: query.data?.products ?? [],
    rewardProducts: query.data?.rewardProducts ?? [],
    loading: query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
