import { useState } from "react";

import { CoverArt } from "@/features/play/components/CoverArt";
import { cn } from "@/lib/utils";

import { mugGalleryForSlug } from "../data/mugGalleries";
import { categoryIcon } from "../data/taxonomy";
import type { Product } from "../data/products";
import { productImageForSlug } from "../data/productImages";

/**
 * Product imagery. Catalogue items use four procedural views; mug PDPs use
 * cropped photography from the product lookbook; sticker collections use the
 * supplied sheet as the only view.
 */
export function ProductGallery({ product }: { product: Product }) {
  const mugGallery = mugGalleryForSlug(product.slug);
  const productImage = productImageForSlug(product.slug);
  const stickerSheet = product.category === "stickers" && productImage ? productImage : undefined;
  const views = mugGallery
    ? mugGallery.map((view) => view.src)
    : stickerSheet
      ? [stickerSheet.src]
      : [product.slug, `${product.slug}-detail`, `${product.slug}-angle`, `${product.slug}-macro`];
  const [active, setActive] = useState(0);
  const Icon = categoryIcon(product.category);
  const activeMug = mugGallery?.[active];

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-bronze/15 bg-charcoal/40">
        {activeMug ? (
          <div className="relative aspect-[16/10] w-full bg-[oklch(0.12_0.006_62)]">
            <img
              src={activeMug.src}
              alt={activeMug.alt}
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
        ) : stickerSheet ? (
          <div className="relative aspect-[16/10] w-full bg-[oklch(0.12_0.006_62)]">
            <img
              src={stickerSheet.src}
              alt={stickerSheet.alt}
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
        ) : (
          <CoverArt
            art={views[active] ?? product.slug}
            icon={Icon}
            ratio="video"
            {...(productImage && active === 0
              ? {
                  imageSrc: productImage.src,
                  imageAlt: productImage.alt,
                  ...(product.comingSoon ? { fit: "cover" as const } : {}),
                }
              : {})}
          />
        )}
      </div>
      <div
        className={cn("mt-4 grid gap-3", mugGallery ? "grid-cols-5" : "grid-cols-4")}
        role="group"
        aria-label="Product views"
      >
        {mugGallery ? (
          mugGallery.map((view, i) => (
            <button
              key={view.label}
              type="button"
              aria-pressed={i === active}
              aria-label={view.label}
              onClick={() => setActive(i)}
              className={cn(
                "overflow-hidden rounded-xl border bg-[oklch(0.12_0.006_62)] transition-colors motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
                i === active ? "border-bronze/60" : "border-bronze/12 hover:border-bronze/35",
              )}
            >
              <img src={view.src} alt="" className="aspect-square h-full w-full object-contain" />
            </button>
          ))
        ) : stickerSheet ? (
          <button
            type="button"
            aria-pressed
            aria-label="Collection view"
            className="overflow-hidden rounded-xl border border-bronze/60 bg-[oklch(0.12_0.006_62)]"
          >
            <img
              src={stickerSheet.src}
              alt=""
              className="aspect-square h-full w-full object-contain"
            />
          </button>
        ) : (
          views.map((view, i) => (
            <button
              key={view}
              type="button"
              aria-pressed={i === active}
              aria-label={`View ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "overflow-hidden rounded-xl border transition-colors motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
                i === active ? "border-bronze/60" : "border-bronze/12 hover:border-bronze/35",
              )}
            >
              <CoverArt art={view} ratio="square" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
