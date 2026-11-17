import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import { ComingSoonImageOverlay } from "./ComingSoonImageOverlay";
import { SpecialColourBadge } from "./SpecialColourBadge";

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
  /** Exclusive colourway badge on the image (BLOOM). */
  specialColour?: boolean;
};

interface EditorialCardProps {
  item: EditorialItem;
  /** Called when the user taps the "+" icon (add-to-cart action). */
  onAdd?: () => void;
  className?: string;
}

/**
 * Equal-size catalogue tile — 4:5 image plate, then a solid content bar.
 * A single `<Link>` covers the whole card; the "+" button sits above it and
 * prevents navigation via `stopPropagation`.
 */
export function EditorialCard({ item, onAdd, className }: EditorialCardProps) {
  return (
    <article
      className={cn(
        "gvrze-editorial-card group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[11px] bg-[#ffffff]",
        className,
      )}
      data-coming-soon={item.comingSoon ? "true" : undefined}
    >
      <div className="gvrze-editorial-card__media relative w-full overflow-hidden bg-[#d8d8d8]">
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
        {item.specialColour ? <SpecialColourBadge className="z-[4]" /> : null}
      </div>

      {item.comingSoon && item.previewDisabled ? null : (
        <Link
          to="/geostore/product/$slug"
          params={{ slug: item.slug }}
          className="absolute inset-0 z-[2] rounded-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/40 focus-visible:ring-offset-1"
          aria-label={`${item.name} — ${item.priceLabel}`}
        />
      )}

      <div className="relative z-[3] flex h-[4.75rem] shrink-0 items-center justify-between gap-2 bg-[#ffffff] px-3 py-2 sm:h-[4.25rem] sm:gap-3 sm:px-4 sm:py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-tight text-[#111111] sm:text-sm">{item.name}</p>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[#555555] sm:line-clamp-1 sm:text-xs">{item.priceLabel}</p>
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
            className="pointer-events-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#d8dee6] bg-[#ffffff] text-[#111111] transition-colors duration-200 hover:bg-[#f4f6f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/40 sm:h-9 sm:w-9"
          >
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </article>
  );
}
