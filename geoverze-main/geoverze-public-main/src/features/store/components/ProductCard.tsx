import { Link } from "@tanstack/react-router";
import { Coins, Eye, Heart, Lock, ShoppingBag } from "lucide-react";
import { useMemo } from "react";

import { GeoButton } from "@/components/shared";
import { CoverArt } from "@/features/play/components/CoverArt";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";

import { ComingSoonLockChip } from "./ComingSoonLockChip";
import { PriceTag } from "./PriceTag";
import { RatingStars } from "./RatingStars";
import { StockPill } from "./StockPill";
import { isPurchaseLocked, type Product } from "../data/products";
import { productImageForSlug } from "../data/productImages";
import { cartLineIdForProduct } from "../lib/cart";
import { useStoreActions } from "../lib/useStoreActions";
import { categoryIcon, categoryLabel } from "../data/taxonomy";

/**
 * Primary catalogue tile. Works in the grid and, with `variant="list"`, in the
 * denser browse list. Cover art is procedural so no image weight is added.
 */
export function ProductCard({
  product,
  saved,
  owned,
  affordable,
  purchasing,
  onToggleWishlist,
  onQuickView,
  onAdd,
  variant = "grid",
}: {
  product: Product;
  saved: boolean;
  owned?: boolean;
  /** True when the shopper holds enough credits to claim it outright. */
  affordable?: boolean;
  /** True while a production credit purchase is in flight. */
  purchasing?: boolean;
  onToggleWishlist: (slug: string) => void;
  onQuickView?: (product: Product) => void;
  onAdd?: (product: Product) => void;
  variant?: "grid" | "list";
}) {
  const Icon = categoryIcon(product.category);
  const productImage = productImageForSlug(product.slug);
  const soldOut = product.stock === "sold-out";
  const purchaseLocked = isPurchaseLocked(product);
  const cartLineId = useMemo(() => cartLineIdForProduct(product), [product]);
  const inCart = useCartStore((state) => state.lines.some((line) => line.id === cartLineId));
  const { removeProduct } = useStoreActions();

  const handleCartAction = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (purchaseLocked) return;
    if (inCart) {
      removeProduct(product);
      return;
    }
    onAdd?.(product);
  };

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-bronze/12 bg-charcoal/45 transition-all motion-base hover:border-bronze/35 hover:bronze-glow",
        variant === "list" && "sm:flex",
      )}
    >
      <Link
        to="/geostore/product/$slug"
        params={{ slug: product.slug }}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
        aria-label={product.name}
      >
        <CoverArt
          art={product.slug}
          {...(productImage
            ? {
                imageSrc: productImage.src,
                imageAlt: productImage.alt,
                ...(product.comingSoon ? { fit: "cover" as const } : {}),
              }
            : { icon: Icon })}
          ratio={variant === "list" ? "square" : "video"}
          className={cn(
            "transition-transform motion-slow group-hover:scale-[1.03]",
            variant === "list" && "sm:w-44",
          )}
        />
      </Link>

      <div className="absolute right-3 top-3 flex gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleWishlist(product.slug);
          }}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-colors motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
            saved
              ? "border-bronze/60 bg-bronze/20 text-bronze-glow"
              : "border-bronze/20 bg-charcoal/70 text-foreground/55 hover:text-bronze-glow",
          )}
        >
          <Heart className={cn("h-4 w-4", saved && "fill-current")} strokeWidth={1.6} />
        </button>
        {onQuickView ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onQuickView(product);
            }}
            aria-label={`Quick view ${product.name}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-bronze/20 bg-charcoal/70 text-foreground/55 backdrop-blur transition-colors motion-fast hover:text-bronze-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
          >
            <Eye className="h-4 w-4" strokeWidth={1.6} />
          </button>
        ) : null}
      </div>

      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
        {purchaseLocked ? <ComingSoonLockChip compact /> : null}
        {product.bestSeller ? (
          <span className="rounded-full border border-bronze/50 bg-charcoal/80 px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.18em] text-bronze-glow backdrop-blur">
            Best seller
          </span>
        ) : null}
        {product.limited ? (
          <span className="rounded-full border border-bronze/30 bg-charcoal/80 px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.18em] text-foreground/65 backdrop-blur">
            Limited
          </span>
        ) : null}
        {owned ? (
          <span className="rounded-full border border-bronze/50 bg-bronze/15 px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.18em] text-bronze-glow backdrop-blur">
            Owned
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-foreground/50">
          {categoryLabel(product.category)}
        </p>
        <h3 className="mt-2 text-base font-light tracking-tight text-foreground">
          <Link
            to="/geostore/product/$slug"
            params={{ slug: product.slug }}
            className="transition-colors motion-fast hover:text-bronze-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-foreground/50">
          {product.tagline}
        </p>

        {product.comingSoon ? (
          <p className="mt-4 text-[0.62rem] uppercase tracking-[0.22em] text-bronze-glow">
            Coming soon
          </p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <RatingStars rating={product.rating} reviews={product.reviews} />
              {purchaseLocked ? null : <StockPill stock={product.stock} />}
            </div>

            <PriceTag product={product} className="mt-4" />

            {affordable && product.price === null && !purchaseLocked ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-[0.66rem] text-bronze-glow">
                <Coins className="h-3 w-3" strokeWidth={1.6} /> You can claim this now
              </p>
            ) : null}
          </>
        )}

        {onAdd && purchaseLocked ? (
          <div className="mt-5 flex gap-2">
            <GeoButton variant="dark" size="sm" className="min-w-0 flex-1" disabled>
              <Lock className="mr-1.5 h-3.5 w-3.5 shrink-0 sm:mr-2" />
              Coming soon
            </GeoButton>
          </div>
        ) : onAdd && !product.comingSoon ? (
          <div className="mt-5 flex gap-2">
            <GeoButton
              variant={inCart ? "ghost" : "solid"}
              size="sm"
              className={cn(
                "min-w-0 flex-1 text-[0.62rem] leading-tight xs:text-[0.68rem] sm:text-xs",
                inCart && "border border-bronze/35 text-bronze-glow hover:border-bronze/50",
              )}
              disabled={owned || purchasing || (!inCart && soldOut)}
              onClick={handleCartAction}
            >
              <ShoppingBag className="mr-1.5 h-3.5 w-3.5 shrink-0 sm:mr-2" />
              {inCart
                ? "Remove from cart"
                : purchasing
                  ? "Claiming…"
                  : owned
                    ? "In your library"
                    : soldOut
                      ? "Sold out"
                      : product.price === null
                        ? "Claim"
                        : "Add to cart"}
            </GeoButton>
          </div>
        ) : null}
      </div>
    </article>
  );
}
