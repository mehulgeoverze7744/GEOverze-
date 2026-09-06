import { Link } from "@tanstack/react-router";
import { memo } from "react";

import { cn } from "@/lib/utils";

import type { MerchStoreCategorySlug } from "../../data/geostoreMerch";

/** Category gateway tile — matches merchandise card dimensions on the Home page. */
export const GeostoreViewAllCard = memo(function GeostoreViewAllCard({
  slug,
  label,
  categoryLabel,
  image,
  imageAlt,
  className,
}: {
  slug: MerchStoreCategorySlug;
  label: string;
  categoryLabel: string;
  image: string;
  imageAlt: string;
  className?: string;
}) {
  return (
    <Link
      to="/geostore/category/$slug"
      params={{ slug }}
      aria-label={`${label}. ${imageAlt}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-bronze/12 bg-charcoal/45 transition-all motion-base hover:border-bronze/35 hover:shadow-[0_12px_40px_-12px_oklch(0.55_0.08_55_/_0.35)]",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[oklch(0.14_0.006_62)]">
        <img
          src={image}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain transition-transform motion-slow group-hover:scale-[1.03]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/88 via-charcoal/45 to-charcoal/25"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-charcoal/20 transition-opacity motion-base group-hover:bg-charcoal/10"
        />
      </div>

      <div className="border-t border-bronze/10 px-5 py-5">
        <p className="text-[0.58rem] uppercase tracking-[0.22em] text-bronze/80">{categoryLabel}</p>
        <p className="mt-2 text-sm font-light leading-snug tracking-tight text-foreground md:text-base">
          {label}
          <span
            aria-hidden
            className="ml-1.5 inline-block text-bronze/80 transition-transform motion-slow group-hover:translate-x-0.5"
          >
            →
          </span>
        </p>
      </div>
    </Link>
  );
});
