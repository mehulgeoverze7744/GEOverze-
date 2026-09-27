import { Link } from "@tanstack/react-router";
import { memo, useState, type SyntheticEvent } from "react";
import { Coins } from "lucide-react";

import { money, credits as formatCredits } from "@/features/store/lib/format";
import {
  hoodieLookbookCropForProduct,
  hoodieLookbookThumbHeight,
} from "@/features/store/data/hoodieLookbookCrop";
import { cn } from "@/lib/utils";

import type { GeostoreMerchProduct } from "../../data/geostoreMerch";

/** Editorial merchandise tile with concise commerce context. */
export const GeostoreMerchCard = memo(function GeostoreMerchCard({
  product,
  className,
  fitNaturalImage = false,
  seamlessSurface = false,
}: {
  product: GeostoreMerchProduct;
  className?: string;
  /** Size the media frame from the loaded image so letterbox bars do not appear. */
  fitNaturalImage?: boolean;
  /** Hoodies category: one continuous card with no image/copy divider. */
  seamlessSurface?: boolean;
}) {
  const [imageAspect, setImageAspect] = useState<number | null>(null);
  const lookbook = hoodieLookbookCropForProduct(product.id);

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    if (!fitNaturalImage || lookbook) return;
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (naturalWidth > 0 && naturalHeight > 0) {
      setImageAspect(naturalWidth / naturalHeight);
    }
  };

  return (
    <Link
      to="/geostore/product/$slug"
      params={{ slug: product.id }}
      aria-label={`${product.title}. ${product.tagline}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl bg-charcoal/45 transition-all motion-base hover:shadow-[0_12px_40px_-12px_oklch(0.55_0.08_55_/_0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
        seamlessSurface ? "border-0" : "border border-bronze/12 hover:border-bronze/35",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          lookbook || !fitNaturalImage ? "aspect-[16/10]" : undefined,
          !lookbook && !fitNaturalImage && "bg-[oklch(0.14_0.006_62)]",
        )}
        style={
          fitNaturalImage && !lookbook && imageAspect
            ? { aspectRatio: `${imageAspect}` }
            : undefined
        }
      >
        <img
          src={product.image}
          alt={product.alt}
          loading="lazy"
          decoding="async"
          onLoad={handleImageLoad}
          className={cn(
            "transition-transform motion-slow group-hover:scale-[1.03]",
            lookbook
              ? "block w-full object-cover object-top"
              : fitNaturalImage
                ? imageAspect
                  ? "h-full w-full object-contain"
                  : "block h-auto w-full"
                : "h-full w-full object-contain",
          )}
          style={lookbook ? { height: hoodieLookbookThumbHeight(lookbook) } : undefined}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent transition-opacity motion-base",
            seamlessSurface ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        />
        {seamlessSurface ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-charcoal/80 via-charcoal/25 to-transparent"
          />
        ) : null}
      </div>

      <div className={cn("px-5 py-5", !seamlessSurface && "border-t border-bronze/10")}>
        <p className="text-[0.58rem] uppercase tracking-[0.22em] text-bronze/80">
          {product.categoryLabel}
        </p>
        <h3 className="mt-2 text-sm font-light leading-snug tracking-tight text-foreground md:text-base">
          {product.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground/55">
          {product.tagline}
        </p>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="text-base font-light tracking-tight text-foreground">
            {money(product.price)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-bronze-glow">
            <Coins className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden />
            or {formatCredits(product.credits)}
          </span>
        </div>
      </div>
    </Link>
  );
});
