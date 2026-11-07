/**
 * Unified product detail page for the Gstorefront.
 *
 * Matches the clean white / light-grey Figma reference design:
 *   - Vertical thumbnail strip + large main image (left column)
 *   - Product info card with size selector and CTAs (right column)
 *   - Tabbed content: Product Description / Shipping / Washcare
 *   - "You may also like" section with product cards
 *
 * Wraps in #gvrze-storefront so storefront.css hides the global nav
 * and injects the StorefrontNav. The shared site footer stays visible.
 */

import "./storefront.css";

import { useState, useRef, useLayoutEffect, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Plus } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useStoreStore } from "@/stores/storeStore";

import { resolveStoreProduct } from "../lib/resolveStoreProduct";
import { useStoreActions } from "../lib/useStoreActions";
import { getTryOnGarmentBySlug } from "../tryon/tryOnProducts";
import { ComingSoonImageOverlay } from "./ComingSoonImageOverlay";
import { StorefrontNav } from "./StorefrontNav";
import { SF_SHELL, SF_UI_FONT } from "./storefront-ui";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SFGalleryImage = {
  src: string;
  alt: string;
};

export type SFColorOption = {
  id: string;
  label: string;
  hex: string;
  /** URL of the product photo for this colour (swatch preview and single-image fallback). */
  image: string;
  /**
   * Full ordered gallery for this colour.
   * When provided, selecting this colour replaces the entire thumbnail strip
   * with this gallery and resets the main image to the first slide.
   * When absent, only `image` is shown for this colour.
   */
  gallery?: SFGalleryImage[];
};

export type SFRelatedProduct = {
  slug: string;
  name: string;
  priceLabel: string;
  image: string;
  imageAlt: string;
  /** Card background colour (for coloured-background product cards). */
  tone?: string;
  comingSoon?: boolean;
};

export type StorefrontProductPageProps = {
  /** Slug used for wishlist state key AND for the server-side price lookup. */
  slug: string;
  name: string;
  categoryLabel: string;
  priceLabel: string;
  /** Primary gallery images (at least one required). */
  images: SFGalleryImage[];
  /** When provided, renders colour swatches; selecting one changes the main image. */
  colors?: SFColorOption[];
  /** Available size labels. Defaults to S / M / L / XL. */
  sizes?: string[];
  /** Hide the apparel size row (stickers, desk objects). */
  hideSizes?: boolean;
  /** Show a quantity stepper above the cart actions. */
  showQuantity?: boolean;
  description?: string;
  highlights?: string[];
  stylingTip?: string;
  washcare?: string[];
  related?: SFRelatedProduct[];
  /** Category slug used in the breadcrumb. Defaults to "tshirts". */
  categorySlug?: string;
  /** Lookbook preview — blurred gallery, disabled purchase, wishlist still works. */
  comingSoon?: boolean;
  /** Third-tab label. Defaults to Washcare so T-shirt pages stay unchanged. */
  careTabLabel?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_SIZES = ["S", "M", "L", "XL"];

const DEFAULT_SHIPPING = `Orders are dispatched within 1–2 business days of payment confirmation. Delivery takes 5–7 business days across India. International shipping is available in select regions (10–15 business days).

Free shipping on orders above Rs. 3,999. Tracking details are sent via email once your order is packed.`;

// ─── Small sub-components ─────────────────────────────────────────────────────

function SizeButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex h-9 min-w-[2.25rem] items-center justify-center rounded-md px-2 text-[12px] font-medium transition-colors duration-150",
        selected
          ? "bg-black text-white"
          : "border border-[#d0d0d0] bg-white text-black hover:border-black",
      )}
    >
      {label}
    </button>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "pb-3 text-[12px] font-medium tracking-wide transition-colors duration-150",
        active ? "border-b-2 border-black text-black" : "text-[#888888] hover:text-black",
      )}
    >
      {label}
    </button>
  );
}

function ColorSwatch({
  color,
  selected,
  onClick,
}: {
  color: SFColorOption;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={color.label}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "h-7 w-7 rounded-full border-2 transition-all duration-150",
        selected ? "border-black ring-2 ring-black ring-offset-2" : "border-white",
      )}
      style={{ backgroundColor: color.hex }}
    />
  );
}

function RelatedCard({ product }: { product: SFRelatedProduct }) {
  return (
    <li className="min-w-0">
      <Link
        to="/geostore/product/$slug"
        params={{ slug: product.slug }}
        className="group block"
      >
        {/* Card with coloured or neutral background */}
        <div
          className="relative overflow-hidden rounded-[11px] aspect-[324/407]"
          style={{ backgroundColor: product.tone ?? "#f0f0f0" }}
        >
          <img
            src={product.image}
            alt={product.imageAlt}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-center",
              product.comingSoon
                ? "scale-[1.14] blur-[12px]"
                : "transition-transform duration-300 group-hover:scale-105",
            )}
            loading="lazy"
            decoding="async"
          />
          {product.comingSoon ? <ComingSoonImageOverlay /> : (
            <span
              aria-hidden="true"
              className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"
            >
              <Plus className="h-4 w-4 text-black" strokeWidth={2} />
            </span>
          )}
        </div>
        <div className="mt-3 px-0.5">
          <p className="text-[13px] font-normal leading-snug text-black sm:text-[15px]">
            {product.name}
          </p>
          <p className="mt-1 text-[13px] text-[#353535] sm:text-[15px]">{product.priceLabel}</p>
        </div>
      </Link>
    </li>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = "description" | "shipping" | "washcare";

/**
 * Unified storefront product detail page.
 * Renders its own nav via the #gvrze-storefront wrapper; the shared site
 * footer stays visible so product pages match the homepage.
 */
export function StorefrontProductPage({
  slug,
  name,
  categoryLabel,
  priceLabel,
  images,
  colors,
  sizes = DEFAULT_SIZES,
  hideSizes = false,
  showQuantity = false,
  description,
  highlights,
  stylingTip,
  washcare,
  related = [],
  categorySlug = "tshirts",
  comingSoon = false,
  careTabLabel = "Washcare",
}: StorefrontProductPageProps) {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(
    colors?.[0]?.id ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("description");

  // ── Equal-height two-column layout ──────────────────────────────────────
  // CSS Grid `auto` rows are inflated by both columns' max-content sizes
  // even when overflow-y: auto is set, so pure-CSS tricks don't reliably
  // constrain the right col. We use a ResizeObserver to sync the right col's
  // maxHeight to the left col's exact rendered height on desktop (≥1024px).
  // useLayoutEffect fires synchronously before paint → no flash.
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const leftCol = leftColRef.current;
    const rightCol = rightColRef.current;
    if (!leftCol || !rightCol) return;

    const mq = window.matchMedia("(min-width: 1024px)");

    function syncHeight() {
      if (!leftColRef.current || !rightColRef.current) return;
      if (mq.matches) {
        // Lock right col to exactly the left col's rendered height so they
        // appear equal while the right col scrolls its overflowing content.
        rightColRef.current.style.maxHeight = `${leftColRef.current.offsetHeight}px`;
      } else {
        // Mobile: natural height — right col grows with content, page scrolls.
        rightColRef.current.style.maxHeight = "";
      }
    }

    // Re-sync whenever the left col resizes (viewport resize, gallery change).
    const ro = new ResizeObserver(syncHeight);
    ro.observe(leftCol);
    mq.addEventListener("change", syncHeight);
    syncHeight(); // initial sync

    return () => {
      ro.disconnect();
      mq.removeEventListener("change", syncHeight);
    };
  }, []);
  // ────────────────────────────────────────────────────────────────────────

  const navigate = useNavigate();
  const wishlistItems = useStoreStore((s) => s.wishlist);
  const wishlistToggleFn = useStoreStore((s) => s.toggleWishlist);
  const isSaved = wishlistItems.includes(slug);
  const { addProduct } = useStoreActions();
  const product = resolveStoreProduct(slug);
  const canOpenTryOn = Boolean(getTryOnGarmentBySlug(slug));

  // When a colour swatch is selected, switch to that colour's gallery and
  // reset the thumbnail strip to the first slide.
  function handleColorSelect(colorId: string) {
    setSelectedColorId(colorId);
    setSelectedImageIdx(0);
  }

  // Resolve the gallery images for the currently active colour (or the base images prop).
  //
  // Priority:
  //   1. Active colour has a full gallery  → use it
  //   2. Active colour has only a single image → wrap in a one-element array
  //   3. No colours defined               → use the `images` prop directly
  const activeColor = colors?.find((c) => c.id === selectedColorId);
  const galleryImages: SFGalleryImage[] = (() => {
    if (!colors || colors.length === 0) return images;
    if (activeColor?.gallery && activeColor.gallery.length > 0) return activeColor.gallery;
    return [{ src: activeColor?.image ?? "", alt: `${name} — ${activeColor?.label ?? ""}` }];
  })();

  const mainImage = galleryImages[selectedImageIdx] ?? galleryImages[0] ?? { src: "", alt: name };

  function handleAddToCart() {
    if (comingSoon) return;
    if (!hideSizes && !selectedSize) {
      toast.error("Please select a size before adding to cart.");
      return;
    }
    if (!product) {
      toast.error("This product isn’t available to add yet.");
      return;
    }
    const options: Record<string, string> = {};
    if (selectedSize) options["Size"] = selectedSize;
    const color = colors?.find((entry) => entry.id === selectedColorId);
    if (color) options['Colour'] = color.label;
    addProduct(product, options, showQuantity ? quantity : 1);
  }

  function handleBuyNow() {
    if (comingSoon) return;
    if (!hideSizes && !selectedSize) {
      toast.error("Please select a size first.");
      return;
    }
    // Navigate to checkout in Buy Now mode.
    // The server validates the price by slug — the client only passes identifiers.
    const searchParams: Record<string, string> = {
      buyNow: "1",
      slug,
      qty: String(showQuantity ? quantity : 1),
    };
    if (selectedSize) searchParams["Size"] = selectedSize;
    const color = colors?.find((c) => c.id === selectedColorId);
    if (color) searchParams["Colour"] = color.label;

    navigate({ to: "/geostore/checkout", search: searchParams as unknown as Record<string, string> });
  }

  function handleCustomization() {
    if (!canOpenTryOn) return;
    const search: Record<string, string> = { slug };
    if (selectedColorId) search["color"] = selectedColorId;
    if (selectedSize) search["size"] = selectedSize;
    void navigate({ to: "/geostore/try-on", search: search as never });
  }

  const washcareList = washcare ?? [
    "Machine wash cold (30°C / 86°F) with like colours.",
    "Do not bleach.",
    "Tumble dry low or air dry flat.",
    "Iron on low heat. Do not iron directly on the print.",
    "Do not dry clean.",
  ];

  return (
    <div id="gvrze-storefront" className="gvrze-storefront-product">
      <StorefrontNav variant="solid" />

      <main className="min-h-0 bg-white pb-[clamp(48px,6vw,96px)]">
        {/* ── Breadcrumb: own row below the header, never under the nav ───── */}
        <div className={`${SF_SHELL} pb-4 pt-5 md:pb-5 md:pt-6`}>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-[#888888]">
              <li>
                <Link to="/geostore" className="transition-opacity hover:opacity-60">
                  Store
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  to="/geostore/category/$slug"
                  params={{ slug: categorySlug }}
                  className="capitalize transition-opacity hover:opacity-60"
                >
                  {categoryLabel}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-black">{name}</li>
            </ol>
          </nav>
        </div>

        {/* ── Main product layout ────────────────────────────────────────────── */}
        <div
          className={`${SF_SHELL} sfpp-product-grid grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10`}
        >
          {/* ── Left: Gallery ──────────────────────────────────────────────── */}
          <div className="sfpp-left-col flex min-w-0 w-full flex-col gap-4 sm:flex-row" ref={leftColRef}>
            {/* Vertical thumbnail strip (desktop: col, mobile: row at bottom) */}
            {galleryImages.length > 1 && (
              <div className="sfpp-thumbs order-2 flex gap-2 sm:order-1 sm:flex-col sm:gap-2.5">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImageIdx(i)}
                    aria-label={img.alt}
                    className={cn(
                      "h-16 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150 sm:h-[72px] sm:w-[60px]",
                      i === selectedImageIdx
                        ? "border-black"
                        : "border-transparent hover:border-[#ccc]",
                    )}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className={cn(
                        "h-full w-full object-cover object-center",
                        comingSoon && "scale-[1.14] blur-[8px]",
                      )}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="sfpp-main-image order-1 min-w-0 w-full max-w-full flex-1 sm:order-2">
              <div className="relative w-full max-w-full overflow-hidden rounded-2xl bg-[#f6f6f6]">
                <img
                  src={mainImage.src}
                  alt={mainImage.alt}
                  className={cn(
                    "aspect-[4/5] h-auto w-full max-w-full object-cover object-center",
                    comingSoon && "scale-[1.14] blur-[12px]",
                  )}
                />
                {comingSoon ? <ComingSoonImageOverlay /> : null}
              </div>
            </div>
          </div>

          {/* ── Right: Info + tabs ─────────────────────────────────────────── */}
          <div className="sfpp-right-col rounded-2xl bg-[#f6f6f6] p-5 sm:p-7 lg:p-8" ref={rightColRef}>
            {/* Header: name + wishlist bookmark */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-[10px] uppercase tracking-[0.2em] text-[#888] ${SF_UI_FONT}`}>
                  {categoryLabel}
                </p>
                <h1 className="mt-1 text-[20px] font-semibold leading-tight text-black sm:text-[22px]">
                  {name}
                </h1>
              </div>
              <button
                type="button"
                aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
                onClick={() => wishlistToggleFn(slug)}
                className="mt-1 shrink-0 transition-opacity hover:opacity-60"
              >
                {isSaved ? (
                  <BookmarkCheck className="h-5 w-5 text-black" strokeWidth={1.75} />
                ) : (
                  <Bookmark className="h-5 w-5 text-black" strokeWidth={1.75} />
                )}
              </button>
            </div>

            {/* Price */}
            <p className="mt-3 text-[20px] font-bold text-black sm:text-[22px]">{priceLabel}</p>
            {comingSoon ? (
              <p className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-black/40 ${SF_UI_FONT}`}>
                Coming soon
              </p>
            ) : null}

            {/* Colour swatches (if multiple colours available) */}
            {colors && colors.length > 1 && !comingSoon && (
              <div className="mt-5">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-[#555]">
                  Colour:{" "}
                  <span className="normal-case text-black">
                    {colors.find((c) => c.id === selectedColorId)?.label ?? ""}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map((c) => (
                    <ColorSwatch
                      key={c.id}
                      color={c}
                      selected={c.id === selectedColorId}
                      onClick={() => handleColorSelect(c.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {hideSizes || comingSoon ? null : (
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#555]">
                    Size
                  </p>
                  <button
                    type="button"
                    className="text-[11px] text-[#555] underline transition-opacity hover:opacity-60"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <SizeButton
                      key={s}
                      label={s}
                      selected={selectedSize === s}
                      onClick={() => setSelectedSize(s)}
                    />
                  ))}
                </div>
              </div>
            )}

            {showQuantity && !comingSoon ? (
              <div className="mt-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#555]">
                  Quantity
                </p>
                <div className="mt-2.5 inline-flex items-center gap-3 rounded-lg border border-[#d8dee6] bg-white px-3 py-2">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-7 w-7 text-[16px] leading-none text-[#555] transition-colors hover:text-black"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-black">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="h-7 w-7 text-[16px] leading-none text-[#555] transition-colors hover:text-black"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : null}

            {/* CTAs */}
            <div className="mt-6 flex flex-col gap-3">
              {comingSoon ? (
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-lg bg-black/80 px-6 py-3.5 text-[13px] font-semibold tracking-wide text-white opacity-70"
                >
                  COMING SOON
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full rounded-lg border border-black bg-white px-6 py-3.5 text-[13px] font-semibold tracking-wide text-black transition-colors duration-150 hover:bg-[#f0f0f0] active:bg-[#e8e8e8]"
                  >
                    ADD TO CART
                  </button>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full rounded-lg bg-black px-6 py-3.5 text-[13px] font-semibold tracking-wide text-white transition-colors duration-150 hover:bg-[#222] active:bg-[#333]"
                  >
                    BUY NOW
                  </button>
                  {canOpenTryOn ? (
                    <button
                      type="button"
                      onClick={handleCustomization}
                      className="w-full rounded-lg border border-black/25 bg-transparent px-6 py-3.5 text-[13px] font-semibold tracking-wide text-black transition-colors duration-150 hover:border-black hover:bg-[#f0f0f0] active:bg-[#e8e8e8]"
                    >
                      CUSTOMIZATION
                    </button>
                  ) : null}
                </>
              )}
            </div>

            {/* ── Tabs: Description / Shipping / Washcare ──────────────────── */}
            <div className="mt-7 border-t border-[#e0e0e0] pt-5">
              {/* Tab nav */}
              <div className="flex gap-6 border-b border-[#e0e0e0]">
                {(
                  [
                    { id: "description", label: "Product Description" },
                    { id: "shipping", label: "Shipping" },
                    { id: "washcare", label: careTabLabel },
                  ] as { id: Tab; label: string }[]
                ).map(({ id, label }) => (
                  <TabButton
                    key={id}
                    label={label}
                    active={activeTab === id}
                    onClick={() => setActiveTab(id)}
                  />
                ))}
              </div>

              {/* Tab content */}
              <div className="mt-4 space-y-4 text-[13px] leading-relaxed text-[#444]">
                {activeTab === "description" && (
                  <>
                    {description && <p>{description}</p>}

                    {highlights && highlights.length > 0 && (
                      <div>
                        <p className="mb-2 font-semibold text-black">Product Highlights</p>
                        <ul className="space-y-1.5">
                          {highlights.map((h, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {stylingTip && (
                      <div>
                        <p className="mb-1 font-semibold text-black">Styling Recommendation</p>
                        <p>{stylingTip}</p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "shipping" && <p>{DEFAULT_SHIPPING}</p>}

                {activeTab === "washcare" && (
                  <ul className="space-y-1.5">
                    {washcareList.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── You may also like ──────────────────────────────────────────────── */}
        {related.length > 0 && (
          <section
            aria-labelledby="sfpp-related"
            className={`${SF_SHELL} sfpp-related mt-[clamp(48px,6vw,88px)]`}
          >
            <div className="flex items-center justify-between gap-4">
              <h2
                id="sfpp-related"
                className={`text-[18px] font-semibold text-black md:text-[20px] ${SF_UI_FONT}`}
              >
                You may also like
              </h2>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4">
              {related.map((p) => (
                <RelatedCard key={p.slug} product={p} />
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

// ─── Convenience wrapper for storefront signature tees ────────────────────────

import {
  relatedStorefrontTees,
  type StorefrontTeeProduct,
} from "./storefront-product-data";

/** Renders a storefront signature tee on the standard product detail page. */
export function StorefrontTeeProductPage({ tee }: { tee: StorefrontTeeProduct }) {
  const related = relatedStorefrontTees(tee.id);

  // Map tee colour variants to the SFColorOption shape understood by StorefrontProductPage.
  // Each colour carries its own full gallery so switching colour replaces the
  // entire thumbnail strip with that colour's images.
  const sfColors: SFColorOption[] | undefined = tee.colors?.map((c) => ({
    id: c.id,
    label: c.label,
    hex: c.hex,
    image: c.image.src,
    gallery: c.gallery,
  }));

  // Base gallery: used only when no colour variants are defined.
  const baseImages: SFGalleryImage[] = tee.gallery ?? [tee.image];

  // `exactOptionalPropertyTypes` is on — only pass `colors` when defined so we
  // never assign `undefined` to an optional-but-not-undefined-typed prop.
  const colorsProp = sfColors ? { colors: sfColors } : {};

  return (
    <StorefrontProductPage
      slug={tee.id}
      name={tee.name}
      categoryLabel={tee.categoryLabel}
      priceLabel={tee.priceLabel}
      images={baseImages}
      {...colorsProp}
      description={tee.description}
      highlights={tee.highlights}
      stylingTip={tee.stylingTip}
      washcare={tee.washcare}
      related={related.map((r) => ({
        slug: r.id,
        name: r.name,
        priceLabel: r.priceLabel,
        image: r.image.src,
        imageAlt: r.image.alt,
        tone: r.tone,
      }))}
      categorySlug="tshirts"
    />
  );
}
