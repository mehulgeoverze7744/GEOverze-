import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, SectionContainer } from "@/components/shared";
import { useStoreStore } from "@/stores/storeStore";

import { CategoryTile } from "./CategoryTile";
import { DigitalProductsCarousel } from "./DigitalProductsCarousel";
import { ProductCard } from "./ProductCard";
import { ProductRail } from "./ProductRail";
import { StoreHero } from "./StoreHero";
import { QuickViewModal } from "./QuickViewModal";
import { PRODUCTS, productBySlug, type Product } from "../data/products";
import { STORE_CATEGORIES, STORE_GROUPS } from "../data/taxonomy";
import { useCreditPurchase } from "../hooks/useCreditPurchase";
import { isProductOwned, useEntitlements } from "../hooks/useEntitlements";
import { useStoreCatalogue } from "../hooks/useStoreCatalogue";
import { catalogueProductBySlug, type StoreCatalogueProduct } from "../lib/mergeCatalogue";
import { bestSellers } from "../lib/filter";
import { money } from "../lib/format";
import { useStoreActions } from "../lib/useStoreActions";
import { useStoreCreditsState } from "../lib/useStoreCredits";

/** GEOstore front page: hero, credit balance, categories and merchandising rails. */
export function StoreHome() {
  const [quickView, setQuickView] = useState<Product | null>(null);
  const { addProduct, wishlistToggle, wishlist } = useStoreActions();
  const { balance, signedIn, authReady } = useStoreCreditsState();
  const entitlements = useEntitlements();
  const { rewardProducts, products: catalogueProducts } = useStoreCatalogue();
  const { purchase, isPurchasing } = useCreditPurchase();
  const recentlyViewed = useStoreStore((s) => s.recentlyViewed);

  const balanceDisplay = !authReady ? "…" : signedIn ? String(balance ?? 0) : "—";

  const recent = recentlyViewed
    .map(productBySlug)
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);

  const affordableRewards =
    balance === null
      ? []
      : rewardProducts
          .filter(
            (p) =>
              p.purchasable && p.credits !== null && p.credits <= balance && p.stock !== "sold-out",
          )
          .slice(0, 4);

  const card = (product: Product) => {
    const display = catalogueProductBySlug(catalogueProducts, product.slug) ?? product;

    return (
      <ProductCard
        key={product.slug}
        product={display}
        saved={wishlist.includes(product.slug)}
        owned={isProductOwned(entitlements, product.slug)}
        affordable={balance !== null && display.credits !== null && display.credits <= balance}
        onToggleWishlist={wishlistToggle}
        onQuickView={setQuickView}
        onAdd={(p) => addProduct(p)}
      />
    );
  };

  const rewardCard = (product: StoreCatalogueProduct) => (
    <ProductCard
      key={product.slug}
      product={product}
      saved={wishlist.includes(product.slug)}
      owned={isProductOwned(entitlements, product.slug)}
      affordable={balance !== null && product.credits !== null && product.credits <= balance}
      purchasing={isPurchasing(product.slug)}
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

  return (
    <PageShell>
      {/* ── Cinematic hero ─────────────────────────────────────────── */}
      <StoreHero
        balanceDisplay={balanceDisplay}
        creditHistoryLink={
          signedIn ? (
            <Link
              to="/play/credit-history"
              className="inline-block text-[0.55rem] uppercase tracking-[0.16em] text-bronze transition-colors motion-fast hover:text-bronze-glow"
            >
              Credit history
            </Link>
          ) : authReady ? (
            <Link
              to="/auth/login"
              className="inline-block text-[0.55rem] uppercase tracking-[0.16em] text-bronze transition-colors motion-fast hover:text-bronze-glow"
            >
              Sign in
            </Link>
          ) : null
        }
        catalogueCount={PRODUCTS.length}
        categoryCount={STORE_CATEGORIES.length}
        freeShippingThreshold={money(7_500)}
      />

      {/* ── Merchandising sections ──────────────────────────────────── */}
      <SectionContainer size="wide" className="[&>:first-child]:mt-0">
        <ProductRail
          title="Best sellers"
          description="What most explorers take home."
          titleClassName="text-2xl font-bold tracking-tight text-foreground md:text-3xl"
          descriptionClassName="mt-2.5 max-w-xl text-sm leading-relaxed text-foreground/55 md:text-base"
          to="/geostore/browse"
          layout="scroll"
        >
          {bestSellers(PRODUCTS).map((product) => (
            <div
              key={product.slug}
              data-rail-item
              className="w-[min(82vw,18rem)] shrink-0 snap-start sm:w-[18rem]"
            >
              {card(product)}
            </div>
          ))}
        </ProductRail>

        <AnimatedSection className="mt-[var(--space-section-sm)]">
          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            All categories
          </h2>
          <div className="mt-6 space-y-10">
            {STORE_GROUPS.filter(
              (group) => group.id !== "more" && group.id !== "digital" && group.id !== "rewards",
            ).map((group) => (
              <div key={group.id}>
                <div className="flex flex-wrap items-center gap-3">
                  <group.icon className="h-4 w-4 text-bronze" strokeWidth={1.6} />
                  <p className="text-sm font-light text-foreground/80">{group.label}</p>
                  <p className="text-xs text-foreground/50">{group.blurb}</p>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {STORE_CATEGORIES.filter(
                    (category) => category.group === group.id && category.id !== "posters",
                  ).map((category) => (
                    <CategoryTile key={category.id} category={category} compact />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <DigitalProductsCarousel />

        <ProductRail
          title="Claim with credits"
          description={
            signedIn
              ? `Rewards you can claim with your ${balanceDisplay} credits.`
              : "Sign in to claim digital rewards with credits."
          }
          to="/geostore/rewards"
          linkLabel="All rewards"
        >
          {affordableRewards.length > 0
            ? affordableRewards.map(rewardCard)
            : rewardProducts
                .filter((p) => p.purchasable)
                .slice(0, 4)
                .map(rewardCard)}
        </ProductRail>

        {recent.length > 0 ? (
          <ProductRail title="Recently viewed">{recent.map(card)}</ProductRail>
        ) : null}
      </SectionContainer>

      <QuickViewModal
        product={quickView}
        onClose={() => setQuickView(null)}
        onAdd={(product, options) => addProduct(product, options)}
      />
    </PageShell>
  );
}
