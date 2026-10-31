import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";

import { SF_ASSETS } from "./storefront-assets";
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
   * Placement of the photo inside the 324 x 407 Figma tile, as percentages of the
   * tile, so the crop scales with the card.
   */
  frame: CSSProperties;
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
    name: "Midnight Black T-Shirt",
    price: "Rs. 2,999",
    tone: "#000000",
    image: SF_ASSETS.bestSellerMidnightBlack,
    alt: "Midnight Black T-Shirt, back view",
    slug: "midnight-black-tshirt",
    // Figma: x 12, y 24, 293 x 383; photo 114.75% tall, anchored to the top.
    frame: { left: "3.704%", top: "5.897%", width: "90.432%", height: "94.103%" },
    imageStyle: { height: "114.75%", top: "-0.07%" },
    clip: true,
  },
  {
    name: "Cherry Blossom T-Shirt",
    price: "Rs. 2,999",
    tone: "#e29ecc",
    image: SF_ASSETS.bestSellerCherryBlossom,
    alt: "Cherry Blossom T-Shirt, back view",
    slug: "cherry-blossom-tshirt",
    // Figma: x 10, y 30, 304 x 346, cover.
    frame: { left: "3.086%", top: "7.371%", width: "93.827%", height: "85.012%" },
  },
  {
    name: "Golden Arc T-Shirt",
    price: "Rs. 2,999",
    tone: "#8c624a",
    image: SF_ASSETS.bestSellerGoldenArc,
    alt: "Golden Arc T-Shirt, front view",
    slug: "golden-arc-tshirt",
    // Figma: frame y 18, 324 x 388, clipped. Photo 342 x 417, rotated -3.55deg.
    frame: { left: "0%", top: "4.423%", width: "100%", height: "95.332%" },
    imageStyle: {
      left: "-3.086%",
      top: "-1.804%",
      width: "105.556%",
      height: "107.474%",
      transform: "rotate(-3.55deg)",
    },
    clip: true,
  },
  {
    name: "New Age T-Shirt",
    price: "Rs. 2,999",
    tone: "#6c0036",
    image: SF_ASSETS.bestSellerNewAge,
    alt: "New Age T-Shirt, back view",
    slug: "new-age-tshirt",
    // Figma: x 5, y 26, 312 x 381, anchored to the bottom.
    frame: { left: "1.543%", top: "6.388%", width: "96.296%", height: "93.612%" },
  },
];

function BestSellerCard({ item }: { item: BestSeller }) {
  const free = item.imageStyle !== undefined;
  const productLink = {
    to: "/geostore/product/$slug",
    params: { slug: item.slug },
  } as const;

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
                free
                  ? "absolute block max-w-none object-cover"
                  : "absolute inset-0 block h-full w-full max-w-none object-cover object-bottom"
              }
              style={
                free ? { left: 0, width: "100%", height: "100%", ...item.imageStyle } : undefined
              }
            />
          </span>
        </Link>
      </div>

      <div className="mt-3.5 px-0.5 sm:px-3">
        <h3 className="text-[12.5px] font-normal leading-snug text-black [overflow-wrap:anywhere] sm:text-[16px]">
          <Link {...productLink} className="transition-opacity hover:opacity-60">
            {item.name}
          </Link>
        </h3>
        <p className="mt-1.5 text-[13px] text-[#353535] sm:text-[16px]">{item.price}</p>
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
