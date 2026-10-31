import { type ReactNode, useState } from "react";

import { cn } from "@/lib/utils";

import { ProductCard } from "./ProductCard";
import { rewardShelfImageForSlug } from "../data/productImages";
import {
  groupStorefrontRewards,
  listStorefrontRewards,
  type StorefrontRewardGroup,
} from "../data/storefrontRewards";
import { useCreditPurchase } from "../hooks/useCreditPurchase";
import { isProductOwned, useEntitlements } from "../hooks/useEntitlements";
import { useStoreActions } from "../lib/useStoreActions";
import { useStoreCredits } from "../lib/useStoreCredits";
import type { StoreCatalogueProduct } from "../lib/mergeCatalogue";

export type StorefrontRewardsPresentation = "shelf" | "categories" | "carousel";

/** Grouped Special Rewards / Themes / Avatars used on Gstore and Profile. */
export function StorefrontRewardsCatalog({
  products,
  className,
  presentation = "shelf",
  tone = "default",
}: {
  products: readonly StoreCatalogueProduct[];
  className?: string | undefined;
  presentation?: StorefrontRewardsPresentation | undefined;
  tone?: "default" | "light";
}) {
  if (presentation === "carousel") {
    return <RewardCarousel tone={tone} products={products} />;
  }

  const groups = groupStorefrontRewards(products);

  if (groups.length === 0) return null;

  if (presentation === "categories") {
    return <RewardCategoryPicker tone={tone} className={className} groups={groups} />;
  }

  return <RewardShelf tone={tone} className={className} groups={groups} />;
}

function RewardCarousel({
  products,
  tone = "default",
}: {
  products: readonly StoreCatalogueProduct[];
  tone?: "default" | "light";
}) {
  const renderCard = useStorefrontRewardCard(tone);
  const listed = listStorefrontRewards(products);

  if (listed.length === 0) return null;

  return (
    <>
      {listed.map((product) => (
        <div
          key={product.slug}
          data-rail-item
          className="w-[min(82vw,18rem)] shrink-0 snap-start sm:w-[18rem]"
        >
          {renderCard(product)}
        </div>
      ))}
    </>
  );
}

function RewardShelf({
  groups,
  className,
  tone = "default",
}: {
  groups: StorefrontRewardGroup<StoreCatalogueProduct>[];
  className?: string | undefined;
  tone?: "default" | "light";
}) {
  const renderCard = useStorefrontRewardCard(tone);
  const lead = groups.slice(0, 2);
  const rest = groups.slice(2);

  return (
    <div className={cn("space-y-10", className)}>
      {lead.length === 2 ? (
        <div className="grid items-start gap-x-6 gap-y-10 lg:grid-cols-2">
          {lead.map((group) => (
            <RewardGroupSection
              key={group.category.id}
              tone={tone}
              group={group}
              renderCard={renderCard}
            />
          ))}
        </div>
      ) : (
        lead.map((group) => (
          <RewardGroupSection
            key={group.category.id}
            tone={tone}
            group={group}
            renderCard={renderCard}
          />
        ))
      )}
      {rest.map((group) => (
        <RewardGroupSection
          key={group.category.id}
          compactOnDesktop
          tone={tone}
          group={group}
          renderCard={renderCard}
        />
      ))}
    </div>
  );
}

function RewardGroupSection({
  group,
  renderCard,
  compactOnDesktop = false,
  tone = "default",
}: {
  group: StorefrontRewardGroup<StoreCatalogueProduct>;
  renderCard: (product: StoreCatalogueProduct) => ReactNode;
  compactOnDesktop?: boolean | undefined;
  tone?: "default" | "light";
}) {
  return (
    <section>
      <h3
        className={cn(
          "mb-3 text-[0.58rem] font-medium uppercase tracking-[0.3em]",
          tone === "light" ? "text-[#555555]" : "text-bronze",
        )}
      >
        {group.category.label}
      </h3>
      <div className={cn("grid gap-6 sm:grid-cols-2", compactOnDesktop && "lg:grid-cols-4")}>
        {group.products.map(renderCard)}
      </div>
    </section>
  );
}

function RewardCategoryPicker({
  groups,
  className,
  tone = "default",
}: {
  groups: StorefrontRewardGroup<StoreCatalogueProduct>[];
  className?: string | undefined;
  tone?: "default" | "light";
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const renderCard = useStorefrontRewardCard(tone);
  const openGroup = groups.find((group) => group.category.id === openId) ?? null;
  const light = tone === "light";

  return (
    <div className={cn("space-y-8", className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => {
          const selected = openId === group.category.id;
          return (
            <button
              key={group.category.id}
              type="button"
              aria-expanded={selected}
              aria-controls={`reward-category-panel-${group.category.id}`}
              onClick={() => setOpenId(selected ? null : group.category.id)}
              className={cn(
                "group/card overflow-hidden rounded-2xl border text-left transition-all motion-base focus-visible:outline-none focus-visible:ring-2",
                light
                  ? cn(
                      "bg-[#FFFFFF] shadow-[0_14px_32px_-22px_rgb(17_17_17_/_0.18)] focus-visible:ring-[#111111]/25",
                      selected
                        ? "border-[#111111]"
                        : "border-[#E5E7EB] hover:border-[#d1d5db]",
                    )
                  : cn(
                      "bg-charcoal focus-visible:ring-bronze/50",
                      selected
                        ? "border-bronze/55 bronze-glow"
                        : "border-bronze/12 hover:border-bronze/35 hover:bronze-glow",
                    ),
              )}
            >
              <div className="grid grid-cols-2">
                {group.products.map((product) => {
                  const image = rewardShelfImageForSlug(product.slug);
                  return (
                    <div
                      key={product.slug}
                      className={cn(
                        "relative aspect-[4/3] overflow-hidden",
                        light ? "bg-[#F5F6F8]" : "bg-[oklch(0.12_0.006_62)]",
                      )}
                    >
                      {image ? (
                        <img
                          src={image.src}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
                        />
                      ) : null}
                      {light ? null : (
                        <span
                          aria-hidden
                          className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div
                className={cn(
                  "relative z-[1] px-4 pb-4",
                  light ? "pt-3" : "-mt-5 pt-2",
                )}
              >
                <p
                  className={cn(
                    "text-[0.58rem] font-medium uppercase tracking-[0.3em]",
                    light ? "text-[#555555]" : "text-bronze",
                  )}
                >
                  {group.category.label}
                </p>
                <p
                  className={cn(
                    "mt-2 text-sm tracking-tight",
                    light ? "font-bold text-[#111111]" : "font-light text-foreground/90",
                  )}
                >
                  {group.products.length} rewards
                </p>
                <p
                  className={cn(
                    "mt-1 text-xs leading-relaxed",
                    light ? "text-[#606060]" : "text-foreground/50",
                  )}
                >
                  {group.products.map((product) => product.name).join(" · ")}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {openGroup ? (
        <section
          id={`reward-category-panel-${openGroup.category.id}`}
          aria-label={openGroup.category.label}
        >
          <h3
            className={cn(
              "mb-3 text-[0.58rem] font-medium uppercase tracking-[0.3em]",
              light ? "text-[#555555]" : "text-bronze",
            )}
          >
            {openGroup.category.label}
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:max-w-3xl">
            {openGroup.products.map(renderCard)}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function useStorefrontRewardCard(tone: "default" | "light" = "default") {
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
        equalizeHeight
        tone={tone}
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
