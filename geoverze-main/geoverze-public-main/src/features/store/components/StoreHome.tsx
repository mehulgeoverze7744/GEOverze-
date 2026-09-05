import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Coins, Compass, Gift, Heart, Package, ShoppingBag } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, PageHeader, SectionContainer } from "@/components/shared";
import { useCartStore, selectCartCount } from "@/stores/cartStore";
import { useStoreStore } from "@/stores/storeStore";

import { BundleCard } from "./BundleCard";
import { CategoryTile } from "./CategoryTile";
import { ProductCard } from "./ProductCard";
import { ProductRail } from "./ProductRail";
import { QuickViewModal } from "./QuickViewModal";
import { BUNDLES } from "../data/offers";
import { PRODUCTS, productBySlug, type Product } from "../data/products";
import { STORE_CATEGORIES, STORE_GROUPS } from "../data/taxonomy";
import { useCreditPurchase } from "../hooks/useCreditPurchase";
import { isProductOwned, useEntitlements } from "../hooks/useEntitlements";
import { useStoreCatalogue } from "../hooks/useStoreCatalogue";
import { catalogueProductBySlug, type StoreCatalogueProduct } from "../lib/mergeCatalogue";
import { bestSellers, featuredProducts } from "../lib/filter";
import { money } from "../lib/format";
import { useStoreActions } from "../lib/useStoreActions";
import { useStoreCreditsState } from "../lib/useStoreCredits";

/** GEOstore front page: hero, credit balance, categories and merchandising rails. */
export function StoreHome() {
  const [quickView, setQuickView] = useState<Product | null>(null);
  const { addProduct, addBundle, wishlistToggle, wishlist } = useStoreActions();
  const { balance, signedIn, authReady } = useStoreCreditsState();
  const entitlements = useEntitlements();
  const { rewardProducts, products: catalogueProducts } = useStoreCatalogue();
  const { purchase, isPurchasing } = useCreditPurchase();
  const cartCount = useCartStore(selectCartCount);
  const recentlyViewed = useStoreStore((s) => s.recentlyViewed);

  const balanceDisplay = !authReady ? "…" : signedIn ? String(balance ?? 0) : "—";

  const featured = featuredProducts(PRODUCTS, 3);
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
      <PageHeader
        eyebrow="GEOstore"
        title="Where progress becomes collection"
        description="Redeem credits, unlock question packs, or take the bronze home. Everything here shares the material language of the platform."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "GEOstore" }]}
      >
        <div className="flex flex-wrap gap-3">
          <GeoButton asChild variant="solid">
            <Link to="/geostore/browse">
              <Compass className="mr-2 h-4 w-4" /> Browse the catalogue
            </Link>
          </GeoButton>
          <GeoButton asChild variant="ghost">
            <Link to="/geostore/rewards">
              <Gift className="mr-2 h-4 w-4" /> Spend credits
            </Link>
          </GeoButton>
          <GeoButton asChild variant="ghost">
            <Link to="/geostore/cart">
              <ShoppingBag className="mr-2 h-4 w-4" /> Cart ({cartCount})
            </Link>
          </GeoButton>
        </div>
      </PageHeader>

      <SectionContainer size="wide">
        <AnimatedSection className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-bronze/25 bg-charcoal/55 p-6">
            <p className="inline-flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.2em] text-foreground/50">
              <Coins className="h-3.5 w-3.5 text-bronze" /> Credit balance
            </p>
            <p className="mt-3 text-3xl font-light text-bronze-glow">{balanceDisplay}</p>
            {signedIn ? (
              <Link
                to="/play/credit-history"
                className="mt-3 inline-block text-[0.64rem] uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
              >
                Credit history
              </Link>
            ) : authReady ? (
              <Link
                to="/auth/login"
                className="mt-3 inline-block text-[0.64rem] uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
              >
                Sign in to view balance
              </Link>
            ) : null}
          </div>
          <div className="rounded-2xl border border-bronze/12 bg-charcoal/45 p-6">
            <p className="text-[0.62rem] uppercase tracking-[0.2em] text-foreground/50">
              Catalogue
            </p>
            <p className="mt-3 text-3xl font-light text-foreground">{PRODUCTS.length}</p>
            <p className="mt-3 text-[0.64rem] text-foreground/50">
              Across {STORE_CATEGORIES.length} categories
            </p>
          </div>
          <div className="rounded-2xl border border-bronze/12 bg-charcoal/45 p-6">
            <p className="text-[0.62rem] uppercase tracking-[0.2em] text-foreground/50">
              Free shipping
            </p>
            <p className="mt-3 text-3xl font-light text-foreground">{money(7_500)}</p>
            <p className="mt-3 text-[0.64rem] text-foreground/50">On physical orders above</p>
          </div>
        </AnimatedSection>

        <ProductRail
          title="Featured this month"
          description="Chosen by the studio — the pieces that define the current collection."
          to="/geostore/browse"
          columns={3}
        >
          {featured.map(card)}
        </ProductRail>

        <AnimatedSection className="mt-[var(--space-section-sm)]">
          <h2 className="text-lg font-light tracking-tight text-foreground">Shop by category</h2>
          <div className="mt-6 space-y-10">
            {STORE_GROUPS.filter((g) => g.id !== "more" && g.id !== "rewards").map((group) => (
              <div key={group.id}>
                <div className="flex items-center gap-3">
                  <group.icon className="h-4 w-4 text-bronze" strokeWidth={1.6} />
                  <p className="text-sm font-light text-foreground/80">{group.label}</p>
                  <p className="text-xs text-foreground/50">{group.blurb}</p>
                </div>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {STORE_CATEGORIES.filter((c) => c.group === group.id).map((category) => (
                    <CategoryTile key={category.id} category={category} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <ProductRail
          title="Best sellers"
          description="What most explorers take home."
          to="/geostore/browse"
        >
          {bestSellers(PRODUCTS, 4).map(card)}
        </ProductRail>

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

        <AnimatedSection className="mt-[var(--space-section-sm)]">
          <h2 className="text-lg font-light tracking-tight text-foreground">Bundles</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BUNDLES.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} onAdd={addBundle} />
            ))}
          </div>
        </AnimatedSection>

        {recent.length > 0 ? (
          <ProductRail title="Recently viewed">{recent.map(card)}</ProductRail>
        ) : null}

        <AnimatedSection className="mt-[var(--space-section-sm)] grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: Package,
              title: "Made to last",
              copy: "Heavyweight fabrics, archival inks, brass hardware.",
            },
            {
              icon: Coins,
              title: "Credits count",
              copy: "Earn credits to unlock merchandise, digital rewards, and premium perks.",
            },
            {
              icon: Heart,
              title: "Wishlist anything",
              copy: "Save now, decide later — your list follows your account.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-bronze/12 bg-charcoal/45 p-6"
            >
              <item.icon className="h-4 w-4 text-bronze" strokeWidth={1.6} />
              <p className="mt-4 text-sm font-light text-foreground">{item.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-foreground/50">{item.copy}</p>
            </div>
          ))}
        </AnimatedSection>
      </SectionContainer>

      <QuickViewModal
        product={quickView}
        onClose={() => setQuickView(null)}
        onAdd={(product, options) => addProduct(product, options)}
      />
    </PageShell>
  );
}
