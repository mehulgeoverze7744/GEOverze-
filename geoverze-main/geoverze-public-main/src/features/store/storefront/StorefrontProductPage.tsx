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

import { useState, useRef, useEffect, useLayoutEffect, type MouseEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Plus } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useStoreStore } from "@/stores/storeStore";

import { defaultOptions } from "../lib/cart";
import { resolveStoreProduct } from "../lib/resolveStoreProduct";
import { useStoreActions } from "../lib/useStoreActions";
import { ComingSoonImageOverlay } from "./ComingSoonImageOverlay";
import { SizeGuideDialog } from "./SizeGuideDialog";
import { StorefrontNav } from "./StorefrontNav";
import { StorefrontProductImage } from "./StorefrontProductImage";
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

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

/** Ignore tiny taps; require a mostly-horizontal gesture so page scroll still works. */
const GALLERY_SWIPE_PX = 48;
const GALLERY_SWIPE_RATIO = 1.25;

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
        "sfpp-size-pill flex h-[35px] min-w-[88px] items-center justify-center rounded-[26px] px-4 text-[13px] font-medium transition-colors duration-150",
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
  const { addProduct } = useStoreActions();
  const productLink = {
    to: "/geostore/product/$slug" as const,
    params: { slug: product.slug },
  };

  function handleQuickAdd(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const resolved = resolveStoreProduct(product.slug);
    if (!resolved || product.comingSoon) return;
    addProduct(resolved, defaultOptions(resolved));
  }

  return (
    <li className="min-w-0">
      <div
        className="relative overflow-hidden rounded-[11px] aspect-[324/407]"
        style={{ backgroundColor: product.tone ?? "#f0f0f0" }}
      >
        <Link
          {...productLink}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0 block"
        >
          <img
            src={product.image}
            alt={product.imageAlt}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-center",
              product.comingSoon
                ? "scale-[1.14] blur-[12px]"
                : "transition-transform duration-300 hover:scale-105",
            )}
            loading="lazy"
            decoding="async"
          />
          {product.comingSoon ? <ComingSoonImageOverlay /> : null}
        </Link>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <p className="text-[13px] font-normal leading-snug text-black sm:text-[15px]">
            <Link {...productLink} className="transition-opacity hover:opacity-60">
              {product.name}
            </Link>
          </p>
          <p className="mt-1 text-[13px] text-[#353535] sm:text-[15px]">{product.priceLabel}</p>
        </div>
        {product.comingSoon ? null : (
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label={`Add ${product.name} to cart`}
            title="Add to cart"
            className="mb-0.5 inline-flex h-[29px] w-[39px] shrink-0 items-center justify-center rounded-[8px] border border-black/10 bg-white text-black transition-colors hover:bg-black hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        )}
      </div>
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
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const gallerySurfaceRef = useRef<HTMLDivElement>(null);
  const gallerySwipeStart = useRef<{ x: number; y: number } | null>(null);
  const gallerySwipeLock = useRef(0);
  const galleryIndexRef = useRef(0);
  const galleryCountRef = useRef(0);
  const setGalleryIndexRef = useRef(setSelectedImageIdx);
  setGalleryIndexRef.current = setSelectedImageIdx;

  const navigate = useNavigate();
  const wishlistItems = useStoreStore((s) => s.wishlist);
  const wishlistToggleFn = useStoreStore((s) => s.toggleWishlist);
  const isSaved = wishlistItems.includes(slug);
  const { addProduct } = useStoreActions();
  const product = resolveStoreProduct(slug);

  useEffect(() => {
    setSelectedImageIdx(0);
    setSelectedColorId(colors?.[0]?.id ?? null);
    setSelectedSize(null);
    setQuantity(1);
    setActiveTab("description");
    setSizeGuideOpen(false);
    // Reset only when the product route changes — not when the colours array
    // is a new identity from the parent on re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

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
  const activeColor = colors?.find((c) => c.id === selectedColorId) ?? colors?.[0];
  const galleryImages: SFGalleryImage[] = (() => {
    if (activeColor?.gallery && activeColor.gallery.length > 0) return activeColor.gallery;
    if (activeColor?.image) {
      return [{ src: activeColor.image, alt: `${name} — ${activeColor.label}` }];
    }
    return images.filter((img) => Boolean(img.src));
  })();

  const mainImage = galleryImages[selectedImageIdx] ?? galleryImages[0] ?? images[0] ?? { src: "", alt: name };
  const galleryCount = galleryImages.length;
  galleryIndexRef.current = selectedImageIdx;
  galleryCountRef.current = galleryCount;

  useEffect(() => {
    const activeThumb = thumbsRef.current?.querySelector<HTMLElement>(
      `[data-sfpp-thumb="${selectedImageIdx}"]`,
    );
    activeThumb?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
  }, [selectedImageIdx]);

  function goToGalleryImage(index: number) {
    const count = galleryCountRef.current;
    if (count < 1) return;
    const next = ((index % count) + count) % count;
    setGalleryIndexRef.current(next);
  }

  useLayoutEffect(() => {
    const node = gallerySurfaceRef.current;
    if (!node) return;

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (touch) beginGallerySwipe(touch.clientX, touch.clientY);
    };
    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (touch) finishGallerySwipe(touch.clientX, touch.clientY);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      beginGallerySwipe(event.clientX, event.clientY);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      finishGallerySwipe(event.clientX, event.clientY);
    };
    const onCancel = () => {
      gallerySwipeStart.current = null;
    };

    node.addEventListener("touchstart", onTouchStart, { passive: true });
    node.addEventListener("touchend", onTouchEnd, { passive: true });
    node.addEventListener("touchcancel", onCancel, { passive: true });
    node.addEventListener("pointerdown", onPointerDown, { passive: true });
    node.addEventListener("pointerup", onPointerUp, { passive: true });
    node.addEventListener("pointercancel", onCancel, { passive: true });
    return () => {
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("touchend", onTouchEnd);
      node.removeEventListener("touchcancel", onCancel);
      node.removeEventListener("pointerdown", onPointerDown);
      node.removeEventListener("pointerup", onPointerUp);
      node.removeEventListener("pointercancel", onCancel);
    };
  }, []);

  function beginGallerySwipe(x: number, y: number) {
    if (galleryCountRef.current < 2) return;
    gallerySwipeStart.current = { x, y };
  }

  function finishGallerySwipe(x: number, y: number) {
    const origin = gallerySwipeStart.current;
    gallerySwipeStart.current = null;
    const count = galleryCountRef.current;
    if (!origin || count < 2) return;
    const dx = x - origin.x;
    const dy = y - origin.y;
    if (Math.abs(dx) < GALLERY_SWIPE_PX) return;
    if (Math.abs(dx) < Math.abs(dy) * GALLERY_SWIPE_RATIO) return;
    const now = Date.now();
    if (now - gallerySwipeLock.current < 280) return;
    gallerySwipeLock.current = now;
    goToGalleryImage(galleryIndexRef.current + (dx < 0 ? 1 : -1));
  }

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
    addProduct(product, options, quantity);
  }

  function handleBuyNow() {
    if (comingSoon) return;
    if (!hideSizes && !selectedSize) {
      toast.error("Please select a size first.");
      return;
    }
    // Navigate to checkout in Buy Now mode.
    // The server validates the price by slug — the client only passes identifiers.
    const color = colors?.find((c) => c.id === selectedColorId);
    void navigate({
      to: "/geostore/checkout",
      search: {
        buyNow: "1",
        slug,
        qty: String(quantity),
        Size: selectedSize ?? undefined,
        Colour: color?.label,
        Design: undefined,
        CustomDesign: undefined,
        Instructions: undefined,
      },
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
          <div className="sfpp-left-col flex min-w-0 w-full flex-col gap-4 sm:flex-row">
            {/* Vertical thumbnail strip (desktop: col, mobile: row at bottom) */}
            {galleryImages.length > 1 && (
              <div
                ref={thumbsRef}
                className="sfpp-thumbs order-2 flex gap-2 sm:order-1 sm:flex-col sm:gap-2.5"
              >
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    data-sfpp-thumb={i}
                    {...(i === selectedImageIdx ? { "aria-current": "true" as const } : {})}
                    onClick={() => goToGalleryImage(i)}
                    aria-label={img.alt}
                    className={cn(
                      "h-16 w-14 shrink-0 overflow-hidden rounded-[11px] border-2 transition-all duration-150 sm:h-[154px] sm:w-[155px]",
                      i === selectedImageIdx
                        ? "border-black"
                        : "border-transparent hover:border-[#ccc]",
                    )}
                  >
                    <StorefrontProductImage
                      src={img.src}
                      alt={img.alt}
                      comingSoon={comingSoon}
                      className="h-full w-full"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="sfpp-main-image order-1 min-w-0 w-full max-w-full flex-1 sm:order-2">
              <div
                ref={gallerySurfaceRef}
                data-sfpp-gallery-swipe=""
                className="relative w-full max-w-full overflow-hidden rounded-[11px] bg-[#f6f6f6] touch-pan-y"
                onTouchStart={(event) => {
                  const touch = event.changedTouches[0];
                  if (touch) beginGallerySwipe(touch.clientX, touch.clientY);
                }}
                onTouchEnd={(event) => {
                  const touch = event.changedTouches[0];
                  if (touch) finishGallerySwipe(touch.clientX, touch.clientY);
                }}
                onTouchCancel={() => {
                  gallerySwipeStart.current = null;
                }}
                onPointerDown={(event) => {
                  if (event.pointerType !== "touch") return;
                  beginGallerySwipe(event.clientX, event.clientY);
                }}
                onPointerUp={(event) => {
                  if (event.pointerType !== "touch") return;
                  finishGallerySwipe(event.clientX, event.clientY);
                }}
                onPointerCancel={() => {
                  gallerySwipeStart.current = null;
                }}
              >
                <StorefrontProductImage
                  key={`${slug}-${selectedColorId ?? "base"}-${mainImage.src}`}
                  src={mainImage.src}
                  alt={mainImage.alt}
                  priority
                  comingSoon={comingSoon}
                  className="aspect-[562/684] h-auto w-full max-w-full"
                />
                {comingSoon ? <ComingSoonImageOverlay /> : null}
              </div>
            </div>
          </div>

          {/* ── Right: Figma Desktop 8 — info card + description card ─────── */}
          <div className="sfpp-right-col flex min-w-0 flex-col gap-4">
            <section className="sfpp-info-card rounded-[11px] bg-[#f6f6f6] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className={`text-[10px] uppercase tracking-[0.2em] text-[#888] ${SF_UI_FONT}`}>
                    {categoryLabel}
                  </p>
                  <div className="mt-1 flex items-start gap-2">
                    <h1 className="min-w-0 text-[20px] font-semibold leading-tight text-black sm:text-[22px]">
                      {name}
                    </h1>
                    {comingSoon ? null : (
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        aria-label={`Add ${name} to cart`}
                        title="Add to cart"
                        className="mt-0.5 inline-flex h-[29px] w-[39px] shrink-0 items-center justify-center rounded-[8px] border border-black/10 bg-white text-black transition-colors hover:bg-black hover:text-white"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
                      </button>
                    )}
                  </div>
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

              <p className="mt-3 text-[20px] font-bold text-black sm:text-[22px]">{priceLabel}</p>
              {comingSoon ? (
                <p className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-black/40 ${SF_UI_FONT}`}>
                  Coming soon
                </p>
              ) : null}

              {colors && colors.length > 0 && !comingSoon ? (
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
              ) : null}

              {hideSizes || comingSoon ? null : (
                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#555]">
                      Size
                    </p>
                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(true)}
                      className="inline-flex h-[29px] min-w-[111px] items-center justify-center rounded-[26px] border border-black/15 bg-white px-3 text-[11px] font-medium text-black transition-colors hover:border-black"
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

              {!comingSoon ? (
                <div className="mt-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#555]">
                    Quantity
                  </p>
                  <div className="mt-2.5 inline-flex items-center gap-3 rounded-[26px] border border-[#d8dee6] bg-white px-3 py-1.5">
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

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {comingSoon ? (
                  <button
                    type="button"
                    disabled
                    className="sfpp-cta h-11 w-full cursor-not-allowed rounded-[26px] bg-black/80 text-[13px] font-semibold tracking-wide text-white opacity-70"
                  >
                    COMING SOON
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="sfpp-cta h-11 min-h-[44px] flex-1 rounded-[26px] border border-black bg-white px-6 text-[13px] font-semibold tracking-wide text-black transition-colors duration-150 hover:bg-[#f0f0f0]"
                    >
                      ADD TO BAG
                    </button>
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="sfpp-cta h-11 min-h-[44px] flex-1 rounded-[26px] bg-black px-6 text-[13px] font-semibold tracking-wide text-white transition-colors duration-150 hover:bg-[#222]"
                    >
                      BUY NOW
                    </button>
                  </>
                )}
              </div>
            </section>

            <section className="sfpp-desc-card rounded-[11px] bg-[#f6f6f6] p-5 sm:p-6">
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

                {activeTab === "shipping" && <p className="whitespace-pre-line">{DEFAULT_SHIPPING}</p>}

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
            </section>
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

      {hideSizes ? null : (
        <SizeGuideDialog
          open={sizeGuideOpen}
          onOpenChange={setSizeGuideOpen}
          sizes={sizes}
          categorySlug={categorySlug}
        />
      )}
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
      sizes={DEFAULT_SIZES}
      showQuantity
    />
  );
}
