/**
 * Unified product detail page for the GVRZE storefront.
 *
 * Matches the clean white / light-grey Figma reference design:
 *   - Vertical thumbnail strip + large main image (left column)
 *   - Product info card with size selector and CTAs (right column)
 *   - Tabbed content: Product Description / Shipping / Washcare
 *   - "You may also like" section with product cards
 *
 * Wraps in #gvrze-storefront so storefront.css hides the global nav/footer
 * and injects the StorefrontNav + StorefrontFooter instead.
 */

import "./storefront.css";

import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Plus } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useStoreStore } from "@/stores/storeStore";

import { StorefrontFooter } from "./StorefrontFooter";
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
  /** URL of the product photo for this colour. */
  image: string;
};

export type SFRelatedProduct = {
  slug: string;
  name: string;
  priceLabel: string;
  image: string;
  imageAlt: string;
  /** Card background colour (for coloured-background product cards). */
  tone?: string;
};

export type StorefrontProductPageProps = {
  /** Slug used for wishlist state key. */
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
  description?: string;
  highlights?: string[];
  stylingTip?: string;
  washcare?: string[];
  related?: SFRelatedProduct[];
  /** Category slug used in the breadcrumb. Defaults to "tshirts". */
  categorySlug?: string;
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
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          {/* "+" quick-add button */}
          <span
            aria-hidden="true"
            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <Plus className="h-4 w-4 text-black" strokeWidth={2} />
          </span>
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
 * Renders its own nav and footer via the #gvrze-storefront wrapper.
 */
export function StorefrontProductPage({
  slug,
  name,
  categoryLabel,
  priceLabel,
  images,
  colors,
  sizes = DEFAULT_SIZES,
  description,
  highlights,
  stylingTip,
  washcare,
  related = [],
  categorySlug = "tshirts",
}: StorefrontProductPageProps) {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(
    colors?.[0]?.id ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("description");

  const wishlistItems = useStoreStore((s) => s.wishlist);
  const wishlistToggleFn = useStoreStore((s) => s.toggleWishlist);
  const isSaved = wishlistItems.includes(slug);

  // When a colour swatch is selected, update the displayed image to match.
  function handleColorSelect(colorId: string) {
    setSelectedColorId(colorId);
    if (colors) {
      const idx = colors.findIndex((c) => c.id === colorId);
      if (idx >= 0) setSelectedImageIdx(idx);
    }
  }

  // Build the full image list: if colours provided, each colour's image is a "slide".
  const galleryImages: SFGalleryImage[] =
    colors && colors.length > 0
      ? colors.map((c) => ({ src: c.image, alt: `${name} — ${c.label}` }))
      : images;

  const mainImage = galleryImages[selectedImageIdx] ?? galleryImages[0] ?? { src: "", alt: name };

  function handleAddToBag() {
    if (!selectedSize) {
      toast.error("Please select a size before adding to bag.");
      return;
    }
    toast.success(`${name} (${selectedSize}) added to bag.`, {
      description: "Merchandise checkout coming soon.",
    });
  }

  function handleBuyNow() {
    if (!selectedSize) {
      toast.error("Please select a size first.");
      return;
    }
    toast.message("Available soon", {
      description: "Merchandise checkout is not live yet. Stay tuned!",
    });
  }

  const washcareList = washcare ?? [
    "Machine wash cold (30°C / 86°F) with like colours.",
    "Do not bleach.",
    "Tumble dry low or air dry flat.",
    "Iron on low heat. Do not iron directly on the print.",
    "Do not dry clean.",
  ];

  return (
    <div id="gvrze-storefront">
      <StorefrontNav />

      <main className="min-h-screen bg-white pb-[clamp(48px,6vw,96px)]">
        {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
        <div className={`${SF_SHELL} py-4`}>
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
          className={`${SF_SHELL} grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10`}
        >
          {/* ── Left: Gallery ──────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Vertical thumbnail strip (desktop: col, mobile: row at bottom) */}
            {galleryImages.length > 1 && (
              <div className="order-2 flex gap-2 sm:order-1 sm:flex-col sm:gap-2.5">
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
                      className="h-full w-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="order-1 min-w-0 flex-1 sm:order-2">
              <div className="relative overflow-hidden rounded-2xl bg-[#f6f6f6]">
                <img
                  src={mainImage.src}
                  alt={mainImage.alt}
                  className="aspect-[4/5] w-full object-cover object-center"
                />
              </div>
            </div>
          </div>

          {/* ── Right: Info + tabs ─────────────────────────────────────────── */}
          <div className="rounded-2xl bg-[#f6f6f6] p-5 sm:p-7 lg:p-8">
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

            {/* Colour swatches (if multiple colours available) */}
            {colors && colors.length > 1 && (
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

            {/* CTAs */}
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleAddToBag}
                className="w-full rounded-lg border border-black bg-white px-6 py-3.5 text-[13px] font-semibold tracking-wide text-black transition-colors duration-150 hover:bg-[#f0f0f0] active:bg-[#e8e8e8]"
              >
                ADD TO BAG
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full rounded-lg bg-black px-6 py-3.5 text-[13px] font-semibold tracking-wide text-white transition-colors duration-150 hover:bg-[#222] active:bg-[#333]"
              >
                BUY NOW
              </button>
            </div>

            {/* ── Tabs: Description / Shipping / Washcare ──────────────────── */}
            <div className="mt-7 border-t border-[#e0e0e0] pt-5">
              {/* Tab nav */}
              <div className="flex gap-6 border-b border-[#e0e0e0]">
                {(
                  [
                    { id: "description", label: "Product Description" },
                    { id: "shipping", label: "Shipping" },
                    { id: "washcare", label: "Washcare" },
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
            className={`${SF_SHELL} mt-[clamp(48px,6vw,88px)]`}
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

      <StorefrontFooter />
    </div>
  );
}

// ─── Convenience wrapper for storefront signature tees ────────────────────────

import {
  STOREFRONT_TEES,
  relatedStorefrontTees,
  type StorefrontTeeProduct,
} from "./storefront-product-data";

/** Renders a storefront signature tee product detail page. */
export function StorefrontTeeProductPage({ tee }: { tee: StorefrontTeeProduct }) {
  const related = relatedStorefrontTees(tee.id);
  return (
    <StorefrontProductPage
      slug={tee.id}
      name={tee.name}
      categoryLabel={tee.categoryLabel}
      priceLabel={tee.priceLabel}
      images={[tee.image]}
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
