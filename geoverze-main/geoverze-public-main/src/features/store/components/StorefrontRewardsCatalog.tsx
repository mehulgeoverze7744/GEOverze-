import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ProductCard } from "./ProductCard";
import { rewardShelfImageForSlug } from "../data/productImages";
import { groupStorefrontRewards } from "../data/storefrontRewards";
import { useCreditPurchase } from "../hooks/useCreditPurchase";
import { isProductOwned, useEntitlements } from "../hooks/useEntitlements";
import { useStoreActions } from "../lib/useStoreActions";
import { useStoreCredits } from "../lib/useStoreCredits";
import type { StoreCatalogueProduct } from "../lib/mergeCatalogue";

/** Grouped Special Rewards / Themes / Avatars grid used on GEOstore and Profile. */
export function StorefrontRewardsCatalog({
  products,
  className,
}: {
  products: readonly StoreCatalogueProduct[];
  className?: string | undefined;
}) {
  const groups = groupStorefrontRewards(products);
  const renderCard = useStorefrontRewardCard();

  if (groups.length === 0) return null;

  return (
    <div className={cn("space-y-10", className)}>
      {groups.map((group) => (
        <section key={group.category.id}>
          <h3 className="mb-3 text-[0.58rem] font-medium uppercase tracking-[0.3em] text-bronze">
            {group.category.label}
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {group.products.map(renderCard)}
          </div>
        </section>
      ))}
    </div>
  );
}

function useStorefrontRewardCard() {
  const { wishlistToggle, wishlist } = useStoreActions();
  const balance = useStoreCredits();
  const entitlements = useEntitlements();
  const { purchase, isPurchasing } = useCreditPurchase();

  return (product: StoreCatalogueProduct): ReactNode => {
    const owned = isProductOwned(entitlements, product.slug);
    const affordable = balance !== null && product.credits !== null && product.credits <= balance;

    return (
      <ProductCard
        key={product.slug}
        product={product}
        saved={wishlist.includes(product.slug)}
        owned={owned}
        affordable={affordable}
        purchasing={isPurchasing(product.slug)}
        image={rewardShelfImageForSlug(product.slug)}
        onToggleWishlist={wishlistToggle}
        onAdd={() => {
          if (!product.purchasable || !product.serverProductId) return;
          void purchase({
            slug: product.slug,
            name: product.name,
            serverProductId: product.serverProductId,
          });
        }}
      />
    );
  };
}
