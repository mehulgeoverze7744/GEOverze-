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
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-bronze/12 bg-charcoal transition-all motion-base hover:border-bronze/35 hover:bronze-glow hover:shadow-[0_12px_40px_-12px_oklch(0.55_0.08_55_/_0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden transition-transform motion-slow group-hover:scale-[1.03]">
        <img
          src={image}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform motion-slow group-hover:scale-[1.03]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-2/5 bg-gradient-to-t from-charcoal to-transparent"
        />
      </div>

      <div className="relative z-[2] -mt-5 px-5 pb-5 pt-2">
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
