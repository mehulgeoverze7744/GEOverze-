import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Coins, Heart, Lock, ShoppingBag, Truck } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedSection,
  EmptyState,
  GeoButton,
  PageHeader,
  SectionContainer,
} from "@/components/shared";
import { useStoreStore } from "@/stores/storeStore";
import { cn } from "@/lib/utils";
import {
  isMerchProductListed,
  isMerchStoreCategory,
  merchProductById,
  merchProductsForStoreCategory,
} from "@/features/marketing/data/geostoreMerch";

import { ComingSoonLockChip } from "./ComingSoonLockChip";
import { GeostoreProductPageBackground } from "./GeostoreProductPageBackground";
import { MerchProductScreen } from "./MerchProductScreen";
import { storefrontTeeById } from "../storefront/storefront-product-data";
import { ComingSoonProductPage } from "../storefront/ComingSoonProductPage";
import {
  StorefrontProductPage,
  StorefrontTeeProductPage,
  type SFGalleryImage,
  type SFRelatedProduct,
} from "../storefront/StorefrontProductPage";
import { StorefrontCategoryPage } from "../storefront/StorefrontCategoryPage";
import { type EditorialItem } from "../storefront/EditorialCard";
import { ProductCard } from "./ProductCard";
import { ProductGallery } from "./ProductGallery";
import { ProductRail } from "./ProductRail";
import { ProStorePerkPill } from "./ProStorePerkPill";
import { QuickViewModal } from "./QuickViewModal";
import { RatingStars } from "./RatingStars";
import { StockPill } from "./StockPill";
import { PriceTag } from "./PriceTag";
import { VariantPicker } from "./VariantPicker";
import {
  BROWSE_CATEGORY_IDS,
  BROWSE_PRODUCTS,
  browseMerchForSlug,
} from "../data/browseCatalogue";
import {
  isAccessoryLookbookCategory,
  isRetiredProductSlug,
} from "../data/catalogAvailability";
import {
  ACCESSORIES_STICKER_SLUGS,
  isPurchaseLocked,
  productBySlug,
  productsInCategory,
  relatedProducts,
  type Product,
} from "../data/products";
import {
  PRICE_BANDS,
  STORE_CATEGORIES,
  STORE_SORTS,
  categoryById,
  isComingSoonCategory,
  type StoreSortId,
} from "../data/taxonomy";
import { filterProducts, sortProducts } from "../lib/filter";
import { defaultOptions } from "../lib/cart";
import { money } from "../lib/format";
import { formatInrPaise, getProductPrice } from "../lib/gstoreProductPrices";
import { resolveStoreProduct } from "../lib/resolveStoreProduct";
import { useStoreActions } from "../lib/useStoreActions";
import { globeGalleryExtras } from "../data/globeGalleries";
import { mugGalleryForSlug } from "../data/mugGalleries";
import { productImageForSlug } from "../data/productImages";
import { useStoreCredits, useStoreCreditsState } from "../lib/useStoreCredits";
import { useCreditPurchase } from "../hooks/useCreditPurchase";
import { isProductOwned, useEntitlements } from "../hooks/useEntitlements";
import { useStoreCatalogue } from "../hooks/useStoreCatalogue";
import { catalogueProductBySlug } from "../lib/mergeCatalogue";
import { isPurchasableRewardSlug } from "../lib/rewards";

const ALL = { id: "all", label: "All" } as const;

/* ─── Editorial adapters ──────────────────────────────────────────────────── */

/** Converts a `GeostoreMerchProduct` to the `EditorialItem` shape. */
function merchToEditorial(
  m: ReturnType<typeof merchProductsForStoreCategory>[number],
): EditorialItem {
  const product = resolveStoreProduct(m.id);
  const comingSoon = product ? isPurchaseLocked(product) : true;
  return {
    id: m.id,
    slug: m.id,
    name: m.title,
    priceLabel: comingSoon ? "Coming soon" : money(m.price),
    image: m.image,
    alt: m.alt,
    comingSoon,
    previewDisabled: comingSoon,
  };
}

/** Converts a `Product` record to the `EditorialItem` shape. */
function productToEditorial(p: Product): EditorialItem {
  const img = productImageForSlug(p.slug);
  // Storefront signature tees carry their own display priceLabel (e.g. "Rs. 2,999 or 499 credits").
  // Use it directly so the category card shows the correct currency instead of USD.
  const tee = storefrontTeeById(p.slug);
  const checkoutPrice = getProductPrice(p.slug);
  const comingSoon = isPurchaseLocked(p);
  const livePrice =
    tee?.priceLabel ??
    (checkoutPrice
      ? formatInrPaise(checkoutPrice.priceMinor)
      : p.price !== null
        ? money(p.price)
        : p.credits !== null
          ? `${p.credits} credits`
          : "Coming soon");
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    priceLabel: livePrice,
    image: img?.src ?? "",
    alt: img?.alt ?? p.name,
    comingSoon,
    imageContain: p.category === "stickers",
  };
}

/* ─── Browse filter chips (light-themed) ─────────────────────────────────── */

function LightChipRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <span
        className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-black/40"
        style={{ fontFamily: "var(--sf-font-ui)" }}
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-full px-3.5 py-1 text-[12px] font-medium transition-colors duration-150",
              opt.id === value
                ? "bg-black text-white"
                : "border border-black/15 bg-white text-black/70 hover:border-black/30 hover:text-black",
            )}
            style={{ fontFamily: "var(--sf-font-ui)" }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function useCardFactory(
  onQuickView: (p: Product) => void,
  options?: { blendCoverFor?: ((product: Product) => boolean) | undefined },
) {
  const { addProduct, wishlistToggle, wishlist } = useStoreActions();
  const balance = useStoreCredits();
  const entitlements = useEntitlements();
  const { products: catalogueProducts } = useStoreCatalogue();

  return (product: Product) => {
    const display = catalogueProductBySlug(catalogueProducts, product.slug) ?? product;
    const blendCover = options?.blendCoverFor?.(product) === true;

    return (
      <ProductCard
        key={product.slug}
        product={display}
        saved={wishlist.includes(product.slug)}
        owned={isProductOwned(entitlements, product.slug)}
        affordable={balance !== null && display.credits !== null && display.credits <= balance}
        onToggleWishlist={wishlistToggle}
        onQuickView={onQuickView}
        onAdd={(p) => addProduct(p)}
        {...(blendCover ? { blendCover: true } : {})}
      />
    );
  };
}

/** Faceted catalogue browse — editorial storefront layout. */
export function StoreBrowse() {
  const { addProduct } = useStoreActions();

  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState<StoreSortId>("popular");
  const [query, setQuery] = useState("");

  const results = useMemo(
    () =>
      sortProducts(
        filterProducts(BROWSE_PRODUCTS, {
          group: "all",
          category,
          price,
          credits: "all",
          availability: "all",
          query,
          balance: null,
        }),
        sort,
      ),
    [category, price, query, sort],
  );

  /** Convert browse results to EditorialItem (prefer merch image if available). */
  const editorialItems: EditorialItem[] = results.map((product) => {
    const merch = browseMerchForSlug(product.slug);
    if (merch) {
      const comingSoon = isPurchaseLocked(product);
      return {
        id: merch.id,
        slug: merch.id,
        name: merch.title,
        priceLabel: comingSoon ? "Coming soon" : money(merch.price),
        image: merch.image,
        alt: merch.alt,
        comingSoon,
        previewDisabled: comingSoon && product.category === "hoodies",
      };
    }
    return productToEditorial(product);
  });

  function handleAdd(item: EditorialItem) {
    const product = BROWSE_PRODUCTS.find((p) => p.slug === item.slug);
    if (product && !isPurchaseLocked(product)) {
      addProduct(product, defaultOptions(product));
    }
  }

  function clearFilters() {
    setCategory("all");
    setPrice("all");
    setQuery("");
  }

  /* Key resets StorefrontCategoryPage pagination whenever filters change. */
  const filterKey = [category, price, query, sort].join("|");

  const controls = (
    <div className="mb-8 rounded-2xl border border-black/8 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <label className="block">
        <span
          className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-black/40"
          style={{ fontFamily: "var(--sf-font-ui)" }}
        >
          Search
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hoodie, capitals, globe…"
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 focus:border-black/30 focus:outline-none focus:ring-2 focus:ring-black/8"
        />
      </label>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        <LightChipRow
          label="Category"
          options={[
            ALL,
            ...STORE_CATEGORIES.filter((c) => BROWSE_CATEGORY_IDS.has(c.id)).map((c) => ({
              id: c.id,
              label: c.label,
            })),
          ]}
          value={category}
          onChange={setCategory}
        />
        <LightChipRow
          label="Price"
          options={[ALL, ...PRICE_BANDS.map((b) => ({ id: b.id, label: b.label }))]}
          value={price}
          onChange={setPrice}
        />
        <LightChipRow
          label="Sort"
          options={STORE_SORTS.map((s) => ({ id: s.id, label: s.label }))}
          value={sort}
          onChange={(v) => setSort(v as StoreSortId)}
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/40"
          aria-live="polite"
          style={{ fontFamily: "var(--sf-font-ui)" }}
        >
          {results.length} {results.length === 1 ? "item" : "items"}
        </p>
        <button
          type="button"
          onClick={clearFilters}
          className="text-[12px] text-black/50 underline underline-offset-2 hover:text-black transition-colors"
          style={{ fontFamily: "var(--sf-font-ui)" }}
        >
          Clear filters
        </button>
      </div>
    </div>
  );

  return (
    <StorefrontCategoryPage
      key={filterKey}
      title="All Products"
      description="GVRZE merchandise — filtered any way you like."
      items={editorialItems}
      onAdd={handleAdd}
      controls={controls}
    />
  );
}

/** Static merchandise shelf (T-shirts / Hoodies) — editorial storefront layout. */
function MerchCategoryShelf({ slug }: { slug: "tshirts" | "hoodies" }) {
  const category = categoryById(slug);
  const merch = merchProductsForStoreCategory(slug);
  const items = merch.map(merchToEditorial);
  const { addProduct } = useStoreActions();
  const locked = isComingSoonCategory(slug) || items.every((item) => item.comingSoon);

  function handleAdd(item: EditorialItem) {
    const product = resolveStoreProduct(item.slug);
    if (product && !isPurchaseLocked(product)) addProduct(product, defaultOptions(product));
  }

  const notice = locked ? (
    <div className="mb-8 flex items-start gap-3 rounded-2xl border border-black/12 bg-black/5 px-5 py-4">
      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-black/50" strokeWidth={1.6} />
      <div>
        <ComingSoonLockChip />
        <p className="mt-2 text-sm leading-relaxed text-black/55">
          This collection is on the way. You can browse the lookbook — purchasing opens when we
          launch.
        </p>
      </div>
    </div>
  ) : undefined;

  return (
    <StorefrontCategoryPage
      title={category?.label ?? "Merchandise"}
      description={category?.blurb ?? "Premium GVRZE apparel."}
      items={items}
      onAdd={handleAdd}
      notice={notice}
    />
  );
}

const STICKER_CARE = [
  "Apply to a clean, dry, dust-free surface.",
  "Press from the centre outward to clear air bubbles.",
  "Wipe with a damp cloth only — do not dishwasher or soak.",
  "Indoor and outdoor vinyl; avoid prolonged abrasive scrubbing.",
];

function accessoryCareCopy(category: Product["category"]): string[] {
  if (category === "mugs") {
    return [
      "Dishwasher and microwave safe unless the product specs say otherwise.",
      "Avoid abrasive scouring pads on printed artwork.",
      "Hand wash enamel rims when possible.",
    ];
  }
  if (category === "caps") {
    return [
      "Spot clean with a damp cloth.",
      "Do not machine wash or tumble dry.",
      "Reshape and air dry away from direct heat.",
    ];
  }
  if (category === "posters") {
    return [
      "Store flat or in the supplied tube.",
      "Keep away from prolonged direct sunlight.",
      "Frame behind UV-protective glass when possible.",
    ];
  }
  return [
    "Dust with a soft, dry cloth.",
    "Keep away from prolonged direct sunlight.",
    "Handle meridians, bases and printed surfaces with care.",
  ];
}

function storefrontImagesForProduct(product: Product): SFGalleryImage[] {
  const mugGallery = mugGalleryForSlug(product.slug);
  if (mugGallery && mugGallery.length > 0) {
    return mugGallery.map((view) => ({ src: view.src, alt: view.alt }));
  }
  const primary = productImageForSlug(product.slug);
  const extras = globeGalleryExtras(product.slug);
  const images: SFGalleryImage[] = [];
  if (primary) images.push({ src: primary.src, alt: primary.alt });
  for (const extra of extras) images.push({ src: extra.src, alt: extra.alt });
  return images.length > 0 ? images : [{ src: "", alt: product.name }];
}

function accessoryPriceLabel(product: Product): string {
  const checkoutPrice = getProductPrice(product.slug);
  if (checkoutPrice) return formatInrPaise(checkoutPrice.priceMinor);
  if (product.price !== null) return money(product.price);
  return "Coming soon";
}

function relatedAsStorefrontCards(product: Product): SFRelatedProduct[] {
  return relatedProducts(product, 4, { includeLookbook: true }).flatMap((item) => {
    const relatedImg = productImageForSlug(item.slug);
    if (!relatedImg) return [];
    return [
      {
        slug: item.slug,
        name: item.name,
        priceLabel: accessoryPriceLabel(item),
        image: relatedImg.src,
        imageAlt: relatedImg.alt,
        comingSoon: isPurchaseLocked(item),
      },
    ];
  });
}

/** Accessories editorial category page. */
function AccessoriesCategoryShelf() {
  const category = categoryById("accessories");
  const { addProduct } = useStoreActions();
  const stickers = ACCESSORIES_STICKER_SLUGS.map(productBySlug).filter((p): p is Product =>
    Boolean(p),
  );
  const lookbook = [
    ...productsInCategory("accessories"),
    ...productsInCategory("mugs"),
    ...productsInCategory("caps"),
    ...productsInCategory("posters"),
  ];
  const seen = new Set(stickers.map((item) => item.slug));
  const allProducts = [
    ...stickers,
    ...lookbook.filter((item) => {
      if (seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    }),
  ];
  const items = allProducts.map(productToEditorial);

  function handleAdd(item: EditorialItem) {
    const product = productBySlug(item.slug);
    if (product && !isPurchaseLocked(product)) addProduct(product, defaultOptions(product));
  }

  return (
    <StorefrontCategoryPage
      title={category?.label ?? "Accessories"}
      description="Die-cut GVRZE sticker collections are available now. Globes, mugs, caps and desk pieces remain a lookbook until those drops launch."
      items={items}
      onAdd={handleAdd}
    />
  );
}

function StorefrontAccessoryProductPage({ product }: { product: Product }) {
  const images = storefrontImagesForProduct(product);
  const category = categoryById(product.category);

  return (
    <StorefrontProductPage
      slug={product.slug}
      name={product.name}
      categoryLabel={category?.label ?? "Accessories"}
      categorySlug={product.category === "accessories" ? "accessories" : product.category}
      priceLabel={accessoryPriceLabel(product)}
      images={images}
      hideSizes
      comingSoon
      description={product.description}
      {...(product.features.length > 0 ? { highlights: [...product.features] } : {})}
      washcare={accessoryCareCopy(product.category)}
      careTabLabel="Care"
      related={relatedAsStorefrontCards(product)}
    />
  );
}

function StorefrontStickerProductPage({ product }: { product: Product }) {
  const img = productImageForSlug(product.slug);
  const checkoutPrice = getProductPrice(product.slug);
  const related = relatedProducts(product, 4).flatMap((item) => {
    const relatedImg = productImageForSlug(item.slug);
    const relatedPrice = getProductPrice(item.slug);
    if (!relatedImg) return [];
    return [
      {
        slug: item.slug,
        name: item.name,
        priceLabel: relatedPrice ? formatInrPaise(relatedPrice.priceMinor) : money(item.price),
        image: relatedImg.src,
        imageAlt: relatedImg.alt,
      },
    ];
  });

  return (
    <StorefrontProductPage
      slug={product.slug}
      name={product.name}
      categoryLabel="Stickers"
      categorySlug="accessories"
      priceLabel={
        checkoutPrice ? formatInrPaise(checkoutPrice.priceMinor) : money(product.price)
      }
      images={[{ src: img?.src ?? "", alt: img?.alt ?? product.name }]}
      hideSizes
      showQuantity
      description={product.description}
      highlights={
        product.features.length > 0
          ? [...product.features]
          : [
              "Die-cut weatherproof vinyl",
              "GVRZE geography and exploration artwork",
              "Laptop, bottle and notebook safe",
            ]
      }
      washcare={STICKER_CARE}
      related={related}
    />
  );
}

/** Generic catalogue category page — editorial storefront layout. */
function CatalogCategoryShelf({ slug }: { slug: string }) {
  const category = categoryById(slug);
  const products = sortProducts(productsInCategory(slug), "popular");
  const locked = isComingSoonCategory(slug);
  const items = products.map(productToEditorial);
  const { addProduct } = useStoreActions();

  function handleAdd(item: EditorialItem) {
    const product = productBySlug(item.slug);
    if (product && !isPurchaseLocked(product)) addProduct(product, defaultOptions(product));
  }

  const notice = locked ? (
    <div className="mb-8 flex items-start gap-3 rounded-2xl border border-black/12 bg-black/5 px-5 py-4">
      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-black/50" strokeWidth={1.6} />
      <div>
        <ComingSoonLockChip />
        <p className="mt-2 text-sm leading-relaxed text-black/55">
          This collection is on the way. You can browse the lookbook — purchasing opens when we
          launch.
        </p>
      </div>
    </div>
  ) : undefined;

  return (
    <StorefrontCategoryPage
      title={category?.label ?? "Category"}
      description={category?.blurb ?? "This shelf is still being filled."}
      items={items}
      onAdd={handleAdd}
      notice={notice}
    />
  );
}

/** Single category shelf. */
export function CategoryScreen() {
  const { slug } = useParams({ from: "/geostore/category/$slug" });

  // Signature tees live in PRODUCTS (sourced from STOREFRONT_TEES) and use
  // CatalogCategoryShelf. Hoodies remain a merch lookbook shelf.
  if (slug !== "tshirts" && isMerchStoreCategory(slug)) {
    return <MerchCategoryShelf slug={slug} />;
  }

  if (slug === "accessories") {
    return <AccessoriesCategoryShelf />;
  }

  return <CatalogCategoryShelf slug={slug} />;
}

function ProductPageFrame({ children }: { children: ReactNode }) {
  return (
    <div id="gvrze-store-flow">
      <GeostoreProductPageBackground />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/** Product detail: gallery, variants, pricing and related items. */
export function ProductScreen() {
  const { slug } = useParams({ from: "/geostore/product/$slug" });
  const merch = merchProductById(slug);
  const staticProduct = productBySlug(slug);
  const { products: catalogueProducts } = useStoreCatalogue();
  const catalogueProduct = catalogueProductBySlug(catalogueProducts, slug);
  const product = catalogueProduct ?? staticProduct;
  const isProductionReward = isPurchasableRewardSlug(slug);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const card = useCardFactory(setQuickView);
  const { addProduct, wishlistToggle, wishlist } = useStoreActions();
  const view = useStoreStore((s) => s.view);
  const { balance, signedIn, authReady } = useStoreCreditsState();
  const entitlements = useEntitlements();
  const { purchase, isPurchasing } = useCreditPurchase();
  const [options, setOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) view(product.slug);
  }, [product, view]);

  // Storefront signature tees (Midnight Black, Cherry Blossom, Golden Arc, New Age)
  // get the clean-white storefront design. This check is placed after all hooks
  // so the Rules of Hooks are satisfied on every render path.
  if (isRetiredProductSlug(slug)) {
    return (
      <ProductPageFrame>
        <PageShell>
          <PageHeader
            eyebrow="Gstore"
            title="We couldn't find that item"
            description="This product has been retired from the collection."
            breadcrumb={[{ label: "Gstore", to: "/geostore" }, { label: "Not found" }]}
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
      </ProductPageFrame>
    );
  }

  const storefrontTee = storefrontTeeById(slug);
  if (storefrontTee) {
    return <StorefrontTeeProductPage tee={storefrontTee} />;
  }

  if (product?.category === "stickers" && !isPurchaseLocked(product)) {
    return <StorefrontStickerProductPage product={product} />;
  }

  const resolvedLookbook = product ?? resolveStoreProduct(slug);
  if (resolvedLookbook && isPurchaseLocked(resolvedLookbook)) {
    if (resolvedLookbook.category === "hoodies") {
      const img = productImageForSlug(resolvedLookbook.slug);
      return (
        <ComingSoonProductPage
          name={resolvedLookbook.name}
          image={img?.src ?? merch?.image ?? ""}
          imageAlt={img?.alt ?? merch?.alt ?? resolvedLookbook.name}
          categoryLabel={categoryById(resolvedLookbook.category)?.label ?? "Gstore"}
          categorySlug={resolvedLookbook.category}
        />
      );
    }
    if (isAccessoryLookbookCategory(resolvedLookbook.category)) {
      return <StorefrontAccessoryProductPage product={resolvedLookbook} />;
    }
  }

  // Discontinued merch products (e.g. old slogan tees) are hidden from
  // listings via HIDDEN_MERCH_IDS but their data is kept for order history.
  // If someone navigates directly to a discontinued product slug, treat it
  // as unavailable so no active product page is served.
  if (merch && isMerchProductListed(merch)) {
    return (
      <ProductPageFrame>
        <MerchProductScreen product={merch} />
      </ProductPageFrame>
    );
  }

  if (!product) {
    return (
      <ProductPageFrame>
        <PageShell>
          <PageHeader
            eyebrow="Gstore"
            title="We couldn't find that item"
            description="It may have sold out or been retired from the collection."
            breadcrumb={[{ label: "Gstore", to: "/geostore" }, { label: "Not found" }]}
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
      </ProductPageFrame>
    );
  }

  const selected = Object.keys(options).length ? options : defaultOptions(product);
  const saved = wishlist.includes(product.slug);
  const purchaseLocked = isPurchaseLocked(product);
  const isOwned = isProductOwned(entitlements, product.slug);
  const canPurchaseProduction =
    isProductionReward &&
    catalogueProduct?.purchasable &&
    Boolean(catalogueProduct.serverProductId);
  const balanceLabel = !authReady ? "…" : signedIn ? String(balance ?? 0) : null;

  return (
    <ProductPageFrame>
      <PageShell>
        <PageHeader
          eyebrow={categoryById(product.category)?.label ?? "Gstore"}
          title={product.name}
          description={product.tagline}
          breadcrumb={[
            { label: "Gstore", to: "/geostore" },
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
              {purchaseLocked ? (
                <div className="flex items-start gap-3 rounded-2xl border border-bronze/20 bg-charcoal/50 px-4 py-3">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-bronze" strokeWidth={1.6} />
                  <div>
                    <ComingSoonLockChip />
                    <p className="mt-1.5 text-xs leading-relaxed text-foreground/55">
                      This item is not available to purchase yet.
                    </p>
                  </div>
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                {product.comingSoon ? (
                  <ComingSoonLockChip />
                ) : (
                  <>
                    <RatingStars rating={product.rating} reviews={product.reviews} />
                    <StockPill stock={product.stock} />
                    {product.limited ? (
                      <span className="rounded-full border border-bronze/40 px-2.5 py-0.5 text-[0.6rem] uppercase tracking-[0.16em] text-bronze">
                        Limited run
                      </span>
                    ) : null}
                  </>
                )}
              </div>

              {product.comingSoon ? null : (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <PriceTag product={product} size="lg" />
                  <ProStorePerkPill />
                </div>
              )}
              {!product.comingSoon && !purchaseLocked && product.credits !== null ? (
                <p className="inline-flex items-center gap-2 text-xs text-foreground/50">
                  <Coins className="h-3.5 w-3.5 text-bronze" strokeWidth={1.6} />
                  {balanceLabel === null ? (
                    <>Sign in to see your credit balance.</>
                  ) : (
                    <>
                      You hold {balanceLabel} credits
                      {balance !== null && product.credits <= balance
                        ? " — enough to claim this now."
                        : "."}
                    </>
                  )}
                </p>
              ) : null}

              <p className="text-sm leading-relaxed text-foreground/60">{product.description}</p>

              {product.comingSoon || purchaseLocked ? null : (
                <VariantPicker product={product} value={selected} onChange={setOptions} />
              )}

              <div className="flex flex-wrap items-center gap-3">
                {purchaseLocked ? (
                  <GeoButton variant="dark" disabled>
                    <Lock className="mr-2 h-4 w-4" />
                    Coming soon
                  </GeoButton>
                ) : product.comingSoon ? null : (
                  <>
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
                      disabled={
                        product.stock === "sold-out" || isOwned || isPurchasing(product.slug)
                      }
                      onClick={() => {
                        if (isPurchaseLocked(product)) return;
                        if (canPurchaseProduction && catalogueProduct?.serverProductId) {
                          void purchase({
                            slug: product.slug,
                            name: product.name,
                            serverProductId: catalogueProduct.serverProductId,
                          });
                          return;
                        }
                        addProduct(product, selected, quantity);
                      }}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      {isPurchasing(product.slug)
                        ? "Claiming…"
                        : isOwned
                          ? "Already yours"
                          : product.stock === "sold-out"
                            ? "Sold out"
                            : product.price === null
                              ? canPurchaseProduction
                                ? "Claim with credits"
                                : "Unavailable"
                              : "Add to cart"}
                    </GeoButton>
                  </>
                )}
                <GeoButton variant="ghost" onClick={() => wishlistToggle(product.slug)}>
                  <Heart className={saved ? "mr-2 h-4 w-4 fill-current" : "mr-2 h-4 w-4"} />
                  {saved ? "Saved" : "Save"}
                </GeoButton>
              </div>

              {product.category === "stickers" ? (
                <div className="space-y-6 border-t border-bronze/10 pt-6">
                  <div>
                    <h3 className="text-[0.58rem] uppercase tracking-[0.2em] text-foreground/50">
                      Description
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                      {product.description}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[0.58rem] uppercase tracking-[0.2em] text-foreground/50">
                      Collection Details
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                      A GVRZE sticker collection.
                    </p>
                  </div>
                  {product.comingSoon || purchaseLocked ? null : (
                    <div>
                      <h3 className="text-[0.58rem] uppercase tracking-[0.2em] text-foreground/50">
                        Shipping
                      </h3>
                      <p className="mt-2 inline-flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.16em] text-foreground/50">
                        <Truck className="h-3.5 w-3.5" />
                        Ships worldwide in 4 – 12 days
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
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

                  {product.comingSoon || purchaseLocked ? null : (
                    <p className="inline-flex items-center gap-2 border-t border-bronze/10 pt-6 text-[0.66rem] uppercase tracking-[0.16em] text-foreground/50">
                      <Truck className="h-3.5 w-3.5" />
                      {product.group === "merch"
                        ? "Ships worldwide in 4 – 12 days"
                        : "Instant delivery"}
                    </p>
                  )}
                </>
              )}
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
    </ProductPageFrame>
  );
}
