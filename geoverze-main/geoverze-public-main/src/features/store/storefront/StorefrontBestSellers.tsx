import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { CSSProperties, MouseEvent } from "react";

import { defaultOptions } from "../lib/cart";
import { resolveStoreProduct } from "../lib/resolveStoreProduct";
import { useStoreActions } from "../lib/useStoreActions";
import { SF_ASSETS } from "./storefront-assets";
import { SpecialColourBadge } from "./SpecialColourBadge";
import { STOREFRONT_TEE_PRICE_LABEL, teeHasSpecialColourBadge } from "./storefront-product-data";
import { ExploreMoreLink, SF_SHELL, SF_UI_FONT } from "./storefront-ui";

type BestSeller = {
  /** Exact product name from the Figma "Best Sellers" frame. */
  name: string;
  /** Exact price label from the Figma frame (currency included). */
  price: string;
  /** Tile background colour from the Figma card. */
  tone: string;
  image: { src: string; width: number; height: number };
  alt: string;
  /** Route slug for the individual product detail page. */
  slug: string;
  /**
   * When true the image is placed directly at inset-0 inside the card link
   * with object-fit:cover — the simplest, most reliable full-bleed mode.
   * Use this for portrait model shots whose aspect ratio closely matches the
   * 324×407 card tile. Mutually exclusive with frame/imageStyle/clip.
   */
  cover?: boolean;
  /**
   * Placement of the photo inside the 324 x 407 Figma tile, as percentages of the
   * tile, so the crop scales with the card. Only used when cover is not set.
   */
  frame?: CSSProperties;
  /** Optional extra style for the photo inside its frame. */
  imageStyle?: CSSProperties;
  /** Clip the photo to its frame (Figma "clip content"). */
  clip?: boolean;
};

/**
 * The four products shown in the Figma Best Sellers frame (Desktop - 9), in the
 * Figma order. Each card now links to its individual product detail page.
 */
const BEST_SELLERS: readonly BestSeller[] = [
  {
    name: "ECLIPSE T-Shirt",
    price: STOREFRONT_TEE_PRICE_LABEL,
    tone: "#2b2b2b",
    image: SF_ASSETS.bestSellerEclipse,
    alt: "GVRZE ECLIPSE T-Shirt in Charcoal Black — model wearing the tee, front view with monochrome world-map artwork",
    slug: "eclipse",
    cover: true,
  },
  {
    name: "BLOOM T-Shirt",
    price: STOREFRONT_TEE_PRICE_LABEL,
    tone: "#e8729a",
    image: SF_ASSETS.bestSellerCherryBlossom,
    alt: "BLOOM T-Shirt in Cherry Blossom Pink — model back view showing full GVRZE graphic",
    slug: "cherry-blossom-tshirt",
    // Portrait model shot — full-bleed cover mode (image fills card edge-to-edge).
    cover: true,
  },
  {
    name: "TERRA T-Shirt",
    price: STOREFRONT_TEE_PRICE_LABEL,
    tone: "#8cc8e8",
    image: SF_ASSETS.bestSellerGoldenArc,
    alt: "TERRA T-Shirt in Sky Blue — front and back product photograph",
    slug: "golden-arc-tshirt",
    // Portrait model shot — full-bleed cover mode (image fills card edge-to-edge).
    cover: true,
  },
  {
    name: "ORBIT T-Shirt",
    price: STOREFRONT_TEE_PRICE_LABEL,
    tone: "#6c0036",
    image: SF_ASSETS.bestSellerOrbit,
    alt: "ORBIT T-Shirt in Rose Wine Burgundy — front product view with sleeve artwork, star emblem and GVRZE wordmark",
    slug: "orbit-tshirt",
    cover: true,
  },
];

function BestSellerCard({ item }: { item: BestSeller }) {
  const { addProduct } = useStoreActions();
  const productLink = {
    to: "/geostore/product/$slug",
    params: { slug: item.slug },
  } as const;

  function handleQuickAdd(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const product = resolveStoreProduct(item.slug);
    if (!product) return;
    addProduct(product, defaultOptions(product));
  }

  // ── Full-bleed cover path ──────────────────────────────────────────────────
  // For portrait model/product shots whose aspect ratio closely matches the
  // 324×407 card tile. The image is placed directly at inset-0 so it reaches
  // every edge of the card with no background showing through.
  const coverImage = item.cover ? (
    <img
      src={item.image.src}
      width={item.image.width}
      height={item.image.height}
      alt={item.alt}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 block h-full w-full object-cover object-center"
    />
  ) : null;

  // ── Figma-precise frame path ───────────────────────────────────────────────
  // For images that need pixel-accurate placement, rotation or overflow clipping
  // as specified in the Figma source (e.g. Midnight Black tilted flat-lay).
  const framedImage = !item.cover ? (
    <span
      className={item.clip ? "absolute block overflow-hidden" : "absolute block"}
      style={item.frame}
    >
      <img
        src={item.image.src}
        width={item.image.width}
        height={item.image.height}
        alt={item.alt}
        loading="lazy"
        decoding="async"
        className={
          item.imageStyle
            ? "absolute block max-w-none object-cover"
            : "absolute inset-0 block h-full w-full max-w-none object-cover object-bottom"
        }
        style={
          item.imageStyle
            ? { left: 0, width: "100%", height: "100%", ...item.imageStyle }
            : undefined
        }
      />
    </span>
  ) : null;

  return (
    <li className="min-w-0">
      <div
        className="relative aspect-[324/407] overflow-hidden rounded-[11px]"
        style={{ backgroundColor: item.tone }}
      >
        {/* The title link below is the accessible link. This one makes the photo clickable. */}
        <Link
          {...productLink}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0 block"
        >
          {coverImage}
          {framedImage}
        </Link>
        {teeHasSpecialColourBadge(item.slug) ? <SpecialColourBadge /> : null}
      </div>

      <div className="mt-3.5 flex items-end justify-between gap-2 px-0.5 sm:px-3">
        <div className="min-w-0">
          <h3 className="text-[12.5px] font-normal leading-snug text-black [overflow-wrap:anywhere] sm:text-[16px]">
            <Link {...productLink} className="transition-opacity hover:opacity-60">
              {item.name}
            </Link>
          </h3>
          <p className="mt-1.5 text-[13px] text-[#353535] sm:text-[16px]">{item.price}</p>
        </div>
        <button
          type="button"
          onClick={handleQuickAdd}
          aria-label={`Add ${item.name} to cart`}
          title="Add to cart"
          className="mb-0.5 inline-flex h-[29px] w-[39px] shrink-0 items-center justify-center rounded-[8px] border border-black/10 bg-white text-black transition-colors hover:bg-black hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      </div>
    </li>
  );
}

/** The Figma Best Sellers product grid: exact photography, names and prices. */
export function StorefrontBestSellers() {
  return (
    <section
      id="best-sellers"
      aria-labelledby="sf-best-sellers"
      className="bg-[#f6f6f6] py-[clamp(40px,6vw,88px)]"
    >
      <div className={SF_SHELL}>
        <div className="flex items-center justify-between gap-4">
          <h2
            id="sf-best-sellers"
            className={`text-[18px] font-semibold text-black md:text-[20px] ${SF_UI_FONT}`}
          >
            Best Sellers
          </h2>
          <ExploreMoreLink />
        </div>
        <ul className="mt-[clamp(20px,3.2vw,46px)] grid grid-cols-2 gap-x-3 gap-y-9 lg:grid-cols-4">
          {BEST_SELLERS.map((item) => (
            <BestSellerCard key={item.name} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
}
