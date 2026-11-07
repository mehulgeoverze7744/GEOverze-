import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import { ComingSoonImageOverlay } from "./ComingSoonImageOverlay";

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
  /** Lookbook-only tiles keep Coming Soon treatment. */
  comingSoon?: boolean;
  /** Hoodie lookbook tiles stay unlinked; accessory lookbook tiles stay previewable. */
  previewDisabled?: boolean;
  /** Letterbox the photo instead of cropping — used for sticker sheets. */
  imageContain?: boolean;
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
 * Editorial product tile — crisp image plate, then a solid content bar.
 * A single `<Link>` covers the whole card; the "+" button sits above it and
 * prevents navigation via `stopPropagation`.
 */
export function EditorialCard({ item, isHero, onAdd, className }: EditorialCardProps) {
  return (
    <article
      className={cn(
        "gvrze-editorial-card group relative flex h-full min-h-[240px] flex-col overflow-hidden rounded-[11px] bg-[#ffffff]",
        isHero ? "lg:col-span-2 lg:row-span-2" : "",
        className,
      )}
      data-coming-soon={item.comingSoon ? "true" : undefined}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#d8d8d8]">
        {item.image ? (
          <img
            src={item.image}
            alt={item.alt}
            loading="lazy"
            decoding="async"
            className={cn(
              "absolute inset-0 h-full w-full",
              item.imageContain ? "object-contain object-center" : "object-cover",
              item.comingSoon
                ? "scale-[1.14] blur-[12px]"
                : "transition-transform duration-500 ease-out group-hover:scale-[1.04]",
            )}
          />
        ) : (
          <div className="absolute inset-0 bg-[#d8d8d8]" />
        )}
        {item.comingSoon ? <ComingSoonImageOverlay /> : null}
      </div>

      {item.comingSoon && item.previewDisabled ? null : (
        <Link
          to="/geostore/product/$slug"
          params={{ slug: item.slug }}
          className="absolute inset-0 z-[2] rounded-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/40 focus-visible:ring-offset-1"
          aria-label={`${item.name} — ${item.priceLabel}`}
        />
      )}

      <div className="relative z-[3] flex shrink-0 items-center justify-between gap-3 bg-[#ffffff] px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-[#111111]">{item.name}</p>
          <p className="mt-0.5 text-xs text-[#555555]">{item.priceLabel}</p>
        </div>

        {onAdd && !item.comingSoon ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onAdd();
            }}
            aria-label={`Add ${item.name} to cart`}
            className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#d8dee6] bg-[#ffffff] text-[#111111] transition-colors duration-200 hover:bg-[#f4f6f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/40"
          >
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </article>
  );
}
