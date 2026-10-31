import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Unified shape for an item displayed in the editorial category grid.
 * Both `GeostoreMerchProduct` and `Product` types are adapted to this before rendering.
 */
export type EditorialItem = {
  id: string;
  /** Used for `/geostore/product/$slug` navigation. */
  slug: string;
  name: string;
  /** Pre-formatted price string e.g. "$37" or "300 credits". */
  priceLabel: string;
  /** Resolved image `src` (imported asset URL or public path). Empty string → no image. */
  image: string;
  alt: string;
};

interface EditorialCardProps {
  item: EditorialItem;
  /**
   * True for the first card in a 3+ item page: causes `lg:col-span-2 lg:row-span-2`
   * so it becomes a large editorial hero tile on desktop.
   */
  isHero?: boolean;
  /** Called when the user taps the "+" icon (add-to-cart action). */
  onAdd?: () => void;
  className?: string;
}

/**
 * Full-bleed editorial product tile.
 *
 * The product image fills the entire card. A gradient at the bottom creates
 * contrast for the white name / price text. A single `<Link>` covers the whole
 * card for keyboard and pointer navigation; the "+" button sits above it and
 * prevents navigation via `stopPropagation`.
 */
export function EditorialCard({ item, isHero, onAdd, className }: EditorialCardProps) {
  return (
    <article
      className={cn(
        "gvrze-editorial-card group relative overflow-hidden rounded-[11px] bg-[#d8d8d8] min-h-[240px]",
        isHero ? "lg:col-span-2 lg:row-span-2" : "",
        className,
      )}
    >
      {/* Product image */}
      {item.image ? (
        <img
          src={item.image}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        /* Fallback: gradient placeholder */
        <div className="absolute inset-0 bg-gradient-to-br from-[#e0e0e0] to-[#c4c4c4]" />
      )}

      {/* Bottom gradient — creates legible zone for white text */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-2/5 bg-gradient-to-t from-black/70 to-transparent"
      />

      {/* Full-card navigation link (accessible; sits above image, below info bar) */}
      <Link
        to="/geostore/product/$slug"
        params={{ slug: item.slug }}
        className="absolute inset-0 z-[2] rounded-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-1"
        aria-label={`${item.name} — ${item.priceLabel}`}
      />

      {/* Info bar — z-[3] so it sits above the card link */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 z-[3] flex items-end justify-between gap-3 p-4">
        {/* Product name + price (non-interactive; card link handles navigation) */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-white drop-shadow-sm">
            {item.name}
          </p>
          <p className="mt-0.5 text-xs text-white/75 drop-shadow-sm">{item.priceLabel}</p>
        </div>

        {/* Add-to-cart button */}
        {onAdd ? (
          <button
            type="button"
            onClick={(e) => {
              /* Prevent the card-level Link from triggering navigation. */
              e.stopPropagation();
              e.preventDefault();
              onAdd();
            }}
            aria-label={`Add ${item.name} to cart`}
            className="pointer-events-auto shrink-0 flex h-9 w-9 items-center justify-center rounded-lg border border-white/60 transition-colors duration-200 hover:bg-white/25 active:bg-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <Plus className="h-4 w-4 text-white" strokeWidth={2} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </article>
  );
}
