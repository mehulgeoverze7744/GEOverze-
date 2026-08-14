import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Coins, Heart, ShoppingBag, Truck } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedSection,
  EmptyState,
  FilterChips,
  GeoButton,
  PageHeader,
  SectionContainer,
} from "@/components/shared";
import { useStoreStore } from "@/stores/storeStore";

import { ProductCard } from "./ProductCard";
import { ProductGallery } from "./ProductGallery";
import { ProductRail } from "./ProductRail";
import { QuickViewModal } from "./QuickViewModal";
import { RatingStars } from "./RatingStars";
import { StockPill } from "./StockPill";
import { PriceTag } from "./PriceTag";
import { VariantPicker } from "./VariantPicker";
import {
  PRODUCTS,
  productBySlug,
  productsInCategory,
  relatedProducts,
  type Product,
} from "../data/products";
import {
  AVAILABILITY,
  CREDIT_FILTERS,
  PRICE_BANDS,
  STORE_CATEGORIES,
  STORE_GROUPS,
  STORE_SORTS,
  categoryById,
  type StoreSortId,
} from "../data/taxonomy";
import { filterProducts, sortProducts } from "../lib/filter";
import { defaultOptions } from "../lib/cart";
import { useStoreActions } from "../lib/useStoreActions";
import { useStoreCredits } from "../lib/useStoreCredits";

const ALL = { id: "all", label: "All" } as const;

function useCardFactory(onQuickView: (p: Product) => void) {
  const { addProduct, wishlistToggle, wishlist, owned } = useStoreActions();
  const balance = useStoreCredits();

  return (product: Product) => (
    <ProductCard
      key={product.slug}
      product={product}
      saved={wishlist.includes(product.slug)}
      owned={owned.includes(product.slug)}
      affordable={product.credits !== null && product.credits <= balance}
      onToggleWishlist={wishlistToggle}
      onQuickView={onQuickView}
      onAdd={(p) => addProduct(p)}
    />
  );
}

/** Faceted catalogue browse. */
export function StoreBrowse() {
  const [quickView, setQuickView] = useState<Product | null>(null);
  const card = useCardFactory(setQuickView);
  const { addProduct } = useStoreActions();
  const balance = useStoreCredits();

  const [group, setGroup] = useState("all");
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState("all");
  const [creditFilter, setCreditFilter] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState<StoreSortId>("popular");
  const [query, setQuery] = useState("");

  const results = useMemo(
    () =>
      sortProducts(
        filterProducts(PRODUCTS, {
          group,
          category,
          price,
          credits: creditFilter,
          availability,
          query,
          balance,
        }),
        sort,
      ),
    [group, category, price, creditFilter, availability, query, balance, sort],
  );

  return (
    <PageShell>
      <PageHeader
        eyebrow="GEOstore"
        title="Browse the catalogue"
        description="Merchandise, digital packs and credit rewards — filtered any way you like."
        breadcrumb={[{ label: "GEOstore", to: "/geostore" }, { label: "Browse" }]}
      />
      <SectionContainer size="wide">
        <AnimatedSection className="rounded-2xl border border-bronze/12 bg-charcoal/45 p-6">
          <label className="block">
            <span className="text-[0.58rem] uppercase tracking-[0.24em] text-foreground/50">
              Search
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hoodie, capitals, poster…"
              className="mt-2 w-full rounded-xl border border-bronze/15 bg-charcoal/60 px-4 py-3 text-sm text-foreground placeholder:text-foreground/50 focus:border-bronze/45 focus:outline-none"
            />
          </label>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <FilterChips
              label="Group"
              options={[
                ALL,
                ...STORE_GROUPS.filter((g) => g.id !== "more").map((g) => ({
                  id: g.id,
                  label: g.label,
                })),
              ]}
              value={group}
              onChange={(id) => {
                setGroup(id);
                setCategory("all");
              }}
            />
            <FilterChips
              label="Category"
              options={[
                ALL,
                ...STORE_CATEGORIES.filter((c) => group === "all" || c.group === group).map(
                  (c) => ({
                    id: c.id,
                    label: c.label,
                  }),
                ),
              ]}
              value={category}
              onChange={setCategory}
            />
            <FilterChips
              label="Price"
              options={[ALL, ...PRICE_BANDS.map((b) => ({ id: b.id, label: b.label }))]}
              value={price}
              onChange={setPrice}
            />
            <FilterChips
              label="Credits"
              options={[ALL, ...CREDIT_FILTERS.map((c) => ({ id: c.id, label: c.label }))]}
              value={creditFilter}
              onChange={setCreditFilter}
            />
            <FilterChips
              label="Availability"
              options={[ALL, ...AVAILABILITY.map((a) => ({ id: a.id, label: a.label }))]}
              value={availability}
              onChange={setAvailability}
            />
            <FilterChips
              label="Sort"
              options={STORE_SORTS.map((s) => ({ id: s.id, label: s.label }))}
              value={sort}
              onChange={setSort}
            />
          </div>
        </AnimatedSection>

        <p
          className="mt-8 text-[0.66rem] uppercase tracking-[0.18em] text-foreground/50"
          aria-live="polite"
        >
          {results.length} {results.length === 1 ? "item" : "items"}
        </p>

        {results.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Nothing matches those filters"
            description="Try widening the price band or clearing the credit filter."
            action={
              <GeoButton
                variant="ghost"
                onClick={() => {
                  setGroup("all");
                  setCategory("all");
                  setPrice("all");
                  setCreditFilter("all");
                  setAvailability("all");
                  setQuery("");
                }}
              >
                Clear filters
              </GeoButton>
            }
          />
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{results.map(card)}</div>
        )}
      </SectionContainer>
      <QuickViewModal
        product={quickView}
        onClose={() => setQuickView(null)}
        onAdd={(p, o) => addProduct(p, o)}
      />
    </PageShell>
  );
}

/** Single category shelf. */
export function CategoryScreen() {
  const { slug } = useParams({ from: "/geostore/category/$slug" });
  const [quickView, setQuickView] = useState<Product | null>(null);
  const card = useCardFactory(setQuickView);
  const { addProduct } = useStoreActions();
  const category = categoryById(slug);
  const items = sortProducts(productsInCategory(slug), "popular");

  return (
    <PageShell>
      <PageHeader
        eyebrow="GEOstore"
        title={category?.label ?? "Category"}
        description={category?.blurb ?? "This shelf is still being filled."}
        breadcrumb={[
          { label: "GEOstore", to: "/geostore" },
          { label: "Browse", to: "/geostore/browse" },
          { label: category?.label ?? "Category" },
        ]}
      />
      <SectionContainer size="wide">
        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Nothing on this shelf yet"
            description="New pieces land here first — check the full catalogue in the meantime."
            action={
              <GeoButton asChild variant="ghost">
                <Link to="/geostore/browse">Browse everything</Link>
              </GeoButton>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{items.map(card)}</div>
        )}
      </SectionContainer>
      <QuickViewModal
        product={quickView}
        onClose={() => setQuickView(null)}
        onAdd={(product, options) => addProduct(product, options)}
      />
    </PageShell>
  );
}

/** Product detail: gallery, variants, pricing and related items. */
export function ProductScreen() {
  const { slug } = useParams({ from: "/geostore/product/$slug" });
  const product = productBySlug(slug);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const card = useCardFactory(setQuickView);
  const { addProduct, wishlistToggle, wishlist, owned } = useStoreActions();
  const view = useStoreStore((s) => s.view);
  const balance = useStoreCredits();
  const [options, setOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) view(product.slug);
  }, [product, view]);

  if (!product) {
    return (
      <PageShell>
        <PageHeader
          eyebrow="GEOstore"
          title="We couldn't find that item"
          description="It may have sold out or been retired from the collection."
          breadcrumb={[{ label: "GEOstore", to: "/geostore" }, { label: "Not found" }]}
        />
        <SectionContainer>
          <EmptyState
            icon={ShoppingBag}
            title="Item unavailable"
            action={
              <GeoButton asChild variant="solid">
                <Link to="/geostore/browse">Browse the catalogue</Link>
              </GeoButton>
            }
          />
        </SectionContainer>
      </PageShell>
    );
  }

  const selected = Object.keys(options).length ? options : defaultOptions(product);
  const saved = wishlist.includes(product.slug);
  const isOwned = owned.includes(product.slug);

  return (
    <PageShell>
      <PageHeader
        eyebrow={categoryById(product.category)?.label ?? "GEOstore"}
        title={product.name}
        description={product.tagline}
        breadcrumb={[
          { label: "GEOstore", to: "/geostore" },
          { label: "Browse", to: "/geostore/browse" },
          { label: product.name },
        ]}
      />
      <SectionContainer size="wide">
        <div className="grid gap-10 lg:grid-cols-2">
          <AnimatedSection>
            <ProductGallery product={product} />
          </AnimatedSection>

          <AnimatedSection delay={80} className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <RatingStars rating={product.rating} reviews={product.reviews} />
              <StockPill stock={product.stock} />
              {product.limited ? (
                <span className="rounded-full border border-bronze/40 px-2.5 py-0.5 text-[0.6rem] uppercase tracking-[0.16em] text-bronze">
                  Limited run
                </span>
              ) : null}
            </div>

            <PriceTag product={product} size="lg" />
            {product.credits !== null ? (
              <p className="inline-flex items-center gap-2 text-xs text-foreground/50">
                <Coins className="h-3.5 w-3.5 text-bronze" strokeWidth={1.6} />
                You hold {balance} credits
                {product.credits <= balance ? " — enough to claim this now." : "."}
              </p>
            ) : null}

            <p className="text-sm leading-relaxed text-foreground/60">{product.description}</p>

            <VariantPicker product={product} value={selected} onChange={setOptions} />

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-bronze/15 px-3 py-2">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-foreground/55 hover:text-bronze-glow"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="text-foreground/55 hover:text-bronze-glow"
                >
                  +
                </button>
              </div>
              <GeoButton
                variant="solid"
                disabled={product.stock === "sold-out" || isOwned}
                onClick={() => addProduct(product, selected, quantity)}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                {isOwned
                  ? "Already yours"
                  : product.stock === "sold-out"
                    ? "Sold out"
                    : product.price === null
                      ? "Claim with credits"
                      : "Add to cart"}
              </GeoButton>
              <GeoButton variant="ghost" onClick={() => wishlistToggle(product.slug)}>
                <Heart className={saved ? "mr-2 h-4 w-4 fill-current" : "mr-2 h-4 w-4"} />
                {saved ? "Saved" : "Save"}
              </GeoButton>
            </div>

            {product.features.length > 0 ? (
              <ul className="space-y-2 border-t border-bronze/10 pt-6">
                {product.features.map((feature) => (
                  <li key={feature} className="text-xs text-foreground/60">
                    · {feature}
                  </li>
                ))}
              </ul>
            ) : null}

            {product.specs.length > 0 ? (
              <dl className="grid grid-cols-2 gap-4 border-t border-bronze/10 pt-6">
                {product.specs.map((spec) => (
                  <div key={spec.label}>
                    <dt className="text-[0.58rem] uppercase tracking-[0.2em] text-foreground/50">
                      {spec.label}
                    </dt>
                    <dd className="mt-1 text-xs text-foreground/70">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <p className="inline-flex items-center gap-2 border-t border-bronze/10 pt-6 text-[0.66rem] uppercase tracking-[0.16em] text-foreground/50">
              <Truck className="h-3.5 w-3.5" />
              {product.group === "merch" ? "Ships worldwide in 4 – 12 days" : "Instant delivery"}
            </p>
          </AnimatedSection>
        </div>

        <ProductRail title="You might also like" columns={4}>
          {relatedProducts(product, 4).map(card)}
        </ProductRail>
      </SectionContainer>
      <QuickViewModal
        product={quickView}
        onClose={() => setQuickView(null)}
        onAdd={(p, o) => addProduct(p, o)}
      />
    </PageShell>
  );
}
