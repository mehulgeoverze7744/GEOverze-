import { memo } from "react";

import { cn } from "@/lib/utils";

import type { GeostoreMerchProduct } from "../../data/geostoreMerch";

/** Editorial merchandise tile — image-first, no commerce chrome. */
export const GeostoreMerchCard = memo(function GeostoreMerchCard({
  product,
  className,
}: {
  product: GeostoreMerchProduct;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border border-bronze/12 bg-charcoal/45 transition-all motion-base hover:border-bronze/35 hover:shadow-[0_12px_40px_-12px_oklch(0.55_0.08_55_/_0.35)]",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[oklch(0.14_0.006_62)]">
        <img
          src={product.image}
          alt={product.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain transition-transform motion-slow group-hover:scale-[1.03]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent opacity-0 transition-opacity motion-base group-hover:opacity-100"
        />
      </div>

      <div className="border-t border-bronze/10 px-5 py-5">
        <p className="text-[0.58rem] uppercase tracking-[0.22em] text-bronze/80">
          {product.categoryLabel}
        </p>
        <h3 className="mt-2 text-sm font-light leading-snug tracking-tight text-foreground md:text-base">
          {product.title}
        </h3>
      </div>
    </article>
  );
});
