import { StorefrontRewardsCatalog } from "./StorefrontRewardsCatalog";
import { useStoreCatalogue } from "../hooks/useStoreCatalogue";

/** Reward catalogue for Profile → Rewards (same source as GEOstore). */
export function RewardsCategoryShelf({ className }: { className?: string | undefined }) {
  const { rewardProducts } = useStoreCatalogue();

  return (
    <StorefrontRewardsCatalog
      className={className}
      presentation="categories"
      products={rewardProducts}
    />
  );
}
