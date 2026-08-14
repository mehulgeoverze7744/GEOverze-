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
import { bestSellers, creditPicks, featuredProducts, newArrivals } from "../lib/filter";
import { money } from "../lib/format";
import { useStoreActions } from "../lib/useStoreActions";
import { useStoreCredits } from "../lib/useStoreCredits";

/** GEOstore front page: hero, credit balance, categories and merchandising rails. */
export function StoreHome() {
  const [quickView, setQuickView] = useState<Product | null>(null);
  const { addProduct, addBundle, wishlistToggle, wishlist, owned } = useStoreActions();
  const balance = useStoreCredits();
  const cartCount = useCartStore(selectCartCount);
  const recentlyViewed = useStoreStore((s) => s.recentlyViewed);

  const featured = featuredProducts(PRODUCTS, 3);
  const recent = recentlyViewed
    .map(productBySlug)
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);

  const card = (product: Product) => (
    <ProductCard
      key={product.slug}
      product={product}
      saved={wishlist.includes(product.slug)}
      owned={owned.includes(product.slug)}
      affordable={product.credits !== null && product.credits <= balance}
      onToggleWishlist={wishlistToggle}
      onQuickView={setQuickView}
      onAdd={(p) => addProduct(p)}
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
            <p className="mt-3 text-3xl font-light text-bronze-glow">{balance}</p>
            <Link
              to="/play/credit-history"
              className="mt-3 inline-block text-[0.64rem] uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
            >
              Credit history
            </Link>
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
            {STORE_GROUPS.filter((g) => g.id !== "more").map((group) => (
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
          description={`Everything here is within your ${balance} credits.`}
          to="/geostore/rewards"
          linkLabel="All rewards"
        >
          {creditPicks(PRODUCTS, balance, 4).map(card)}
        </ProductRail>

        <AnimatedSection className="mt-[var(--space-section-sm)]">
          <h2 className="text-lg font-light tracking-tight text-foreground">Bundles</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BUNDLES.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} onAdd={addBundle} />
            ))}
          </div>
        </AnimatedSection>

        <ProductRail
          title="New arrivals"
          description="Fresh from production."
          to="/geostore/browse"
        >
          {newArrivals(PRODUCTS, 4).map(card)}
        </ProductRail>

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
              copy: "Earned credits work like cash on most of the catalogue.",
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
