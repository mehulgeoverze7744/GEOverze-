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
import {
  hoodieLookbookCropForProduct,
  hoodieLookbookThumbHeight,
} from "../data/hoodieLookbookCrop";
import { isPurchaseLocked, type Product } from "../data/products";
import { isGlobeProductSlug, productImageForSlug, type ProductImage } from "../data/productImages";
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
  equalizeHeight = false,
  image,
  blendCover = false,
  tone = "default",
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
  /** Rail presentation: hoodie photography covers the frame and blends into the copy. */
  equalizeHeight?: boolean;
  /** Surface-specific artwork; covers the frame and blends into the copy. */
  image?: ProductImage | undefined;
  /** Cover the media frame and fade into the copy (Browse T-shirts). */
  blendCover?: boolean | undefined;
  /** Opaque white / black cards for Quiz History & Rewards. */
  tone?: "default" | "light";
}) {
  const Icon = categoryIcon(product.category);
  const productImage = image ?? productImageForSlug(product.slug);
  const lookbook = hoodieLookbookCropForProduct(product.slug);
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

  const light = tone === "light";
  const seamlessBlend =
    Boolean(image) ||
    blendCover ||
    product.category === "mugs" ||
    product.category === "stickers" ||
    isGlobeProductSlug(product.slug) ||
    (product.category === "tshirts" && Boolean(productImage)) ||
    (equalizeHeight && product.category === "hoodies");
  const useLookbook = Boolean(lookbook && productImage && !seamlessBlend);
  const claimClass = light
    ? "hr-claim-btn min-w-0 flex-1 rounded-full border border-[#E5E7EB] bg-[#FFFFFF] text-[#111111] shadow-none hover:bg-[#EAEAEA] hover:brightness-100 hover:shadow-none focus-visible:ring-[#111111]/25"
    : undefined;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl transition-all motion-base",
        light
          ? "store-product-card--light border border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_14px_32px_-22px_rgb(17_17_17_/_0.18)] hover:shadow-[0_18px_36px_-20px_rgb(17_17_17_/_0.22)]"
          : "border border-bronze/12 hover:border-bronze/35 hover:bronze-glow",
        !light && (seamlessBlend ? "bg-charcoal" : "bg-charcoal/45"),
        "flex h-full w-full flex-col",
        variant === "list" && "sm:flex-row",
      )}
    >
      <Link
        to="/geostore/product/$slug"
        params={{ slug: product.slug }}
        className={cn(
          "relative block focus-visible:outline-none focus-visible:ring-2",
          light ? "focus-visible:ring-[#111111]/25" : "focus-visible:ring-bronze/50",
        )}
        aria-label={product.name}
      >
        {useLookbook && lookbook && productImage ? (
          <div
            className={cn(
              "relative overflow-hidden",
              variant === "list" ? "aspect-square sm:w-44" : "aspect-[16/10]",
            )}
          >
            <img
              src={productImage.src}
              alt={productImage.alt}
              loading="lazy"
              decoding="async"
              className="block w-full object-cover object-top transition-transform motion-slow group-hover:scale-[1.03]"
              style={{ height: hoodieLookbookThumbHeight(lookbook) }}
            />
          </div>
        ) : (
          <div
            className={cn(
              "relative overflow-hidden",
              seamlessBlend && "transition-transform motion-slow group-hover:scale-[1.03]",
            )}
          >
            <CoverArt
              art={product.slug}
              {...(productImage
                ? {
                    imageSrc: productImage.src,
                    imageAlt: productImage.alt,
                    ...(product.comingSoon || productImage.fillFrame || seamlessBlend
                      ? { fit: "cover" as const }
                      : {}),
                    ...(productImage.objectPosition
                      ? { objectPosition: productImage.objectPosition }
                      : {}),
                    ...(seamlessBlend || light ? { overlay: "none" as const } : {}),
                  }
                : { icon: Icon })}
              ratio={variant === "list" ? "square" : "video"}
              className={cn(
                !seamlessBlend && "transition-transform motion-slow group-hover:scale-[1.03]",
                variant === "list" && "sm:w-44",
                light ? "!bg-[#F5F6F8]" : seamlessBlend && "bg-transparent",
                !light && isGlobeProductSlug(product.slug) && "!bg-[#0b0a09]",
              )}
            />
            {seamlessBlend && !light ? (
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute z-[1]",
                  variant === "list"
                    ? "inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-charcoal to-transparent sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:w-2/5 sm:bg-gradient-to-l"
                    : "inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-charcoal to-transparent",
                )}
              />
            ) : null}
          </div>
        )}
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
            "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors motion-fast focus-visible:outline-none focus-visible:ring-2",
            light
              ? "border-[#E5E7EB] bg-[#FFFFFF] text-[#111111] hover:bg-[#EAEAEA] focus-visible:ring-[#111111]/25"
              : saved
                ? "border-bronze/60 bg-bronze/20 text-bronze-glow backdrop-blur focus-visible:ring-bronze/50"
                : "border-bronze/20 bg-charcoal/70 text-foreground/55 backdrop-blur hover:text-bronze-glow focus-visible:ring-bronze/50",
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
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors motion-fast focus-visible:outline-none focus-visible:ring-2",
              light
                ? "border-[#E5E7EB] bg-[#FFFFFF] text-[#111111] hover:bg-[#EAEAEA] focus-visible:ring-[#111111]/25"
                : "border-bronze/20 bg-charcoal/70 text-foreground/55 backdrop-blur hover:text-bronze-glow focus-visible:ring-bronze/50",
            )}
          >
            <Eye className="h-4 w-4" strokeWidth={1.6} />
          </button>
        ) : null}
      </div>

      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
        {purchaseLocked ? (
          <ComingSoonLockChip
            compact
            className={
              light
                ? "border-[#E5E7EB] bg-[#FFFFFF] text-[#555555] backdrop-blur-none"
                : undefined
            }
          />
        ) : null}
        {product.bestSeller ? (
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.18em]",
              light
                ? "border-[#E5E7EB] bg-[#FFFFFF] text-[#555555]"
                : "border-bronze/50 bg-charcoal/80 text-bronze-glow backdrop-blur",
            )}
          >
            Best seller
          </span>
        ) : null}
        {product.limited ? (
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.18em]",
              light
                ? "border-[#E5E7EB] bg-[#FFFFFF] text-[#555555]"
                : "border-bronze/30 bg-charcoal/80 text-foreground/65 backdrop-blur",
            )}
          >
            Limited
          </span>
        ) : null}
        {owned ? (
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.18em]",
              light
                ? "border-[#E5E7EB] bg-[#FFFFFF] text-[#111111]"
                : "border-bronze/50 bg-bronze/15 text-bronze-glow backdrop-blur",
            )}
          >
            Owned
          </span>
        ) : null}
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col p-5",
          seamlessBlend && !light && "relative z-[2] -mt-5 pt-2",
        )}
      >
        <p
          className={cn(
            "text-[0.6rem] uppercase tracking-[0.2em]",
            light ? "text-[#555555]" : "text-foreground/50",
          )}
        >
          {categoryLabel(product.category)}
        </p>
        <h3
          className={cn(
            "mt-2 text-base tracking-tight",
            light ? "font-bold text-[#111111]" : "font-light text-foreground",
          )}
        >
          <Link
            to="/geostore/product/$slug"
            params={{ slug: product.slug }}
            className={cn(
              "transition-colors motion-fast focus-visible:outline-none focus-visible:ring-2",
              light
                ? "hover:text-[#111111] focus-visible:ring-[#111111]/25"
                : "hover:text-bronze-glow focus-visible:ring-bronze/50",
            )}
          >
            {product.name}
          </Link>
        </h3>
        <p
          className={cn(
            "mt-1.5 line-clamp-2 text-xs leading-relaxed",
            light ? "text-[#606060]" : "text-foreground/50",
          )}
        >
          {product.tagline}
        </p>

        {product.comingSoon ? (
          <p
            className={cn(
              "mt-4 text-[0.62rem] uppercase tracking-[0.22em]",
              light ? "text-[#555555]" : "text-bronze-glow",
            )}
          >
            Coming soon
          </p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <RatingStars tone={tone} rating={product.rating} reviews={product.reviews} />
              {purchaseLocked ? null : <StockPill tone={tone} stock={product.stock} />}
            </div>

            <PriceTag tone={tone} product={product} className="mt-4" />

            {affordable && product.price === null && !purchaseLocked ? (
              <p
                className={cn(
                  "mt-2 inline-flex items-center gap-1.5 text-[0.66rem]",
                  light ? "text-[#555555]" : "text-bronze-glow",
                )}
              >
                <Coins
                  className={cn("h-3 w-3", light && "text-[#8EB8D4]")}
                  strokeWidth={1.6}
                />{" "}
                You can claim this now
              </p>
            ) : null}
          </>
        )}

        {onAdd && purchaseLocked ? (
          <div className="mt-auto flex gap-2 pt-5">
            <GeoButton
              variant={light ? "ghost" : "dark"}
              size="sm"
              className={cn("min-w-0 flex-1", claimClass)}
              disabled
            >
              <Lock className="mr-1.5 h-3.5 w-3.5 shrink-0 sm:mr-2" />
              Coming soon
            </GeoButton>
          </div>
        ) : onAdd && !product.comingSoon ? (
          <div className="mt-auto flex gap-2 pt-5">
            <GeoButton
              variant={light ? "ghost" : inCart ? "ghost" : "solid"}
              size="sm"
              className={cn(
                "min-w-0 flex-1 text-[0.62rem] leading-tight xs:text-[0.68rem] sm:text-xs",
                claimClass,
                !light && inCart && "border border-bronze/35 text-bronze-glow hover:border-bronze/50",
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
