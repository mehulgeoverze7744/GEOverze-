import { useState } from "react";

import { CoverArt } from "@/features/play/components/CoverArt";
import { cn } from "@/lib/utils";

import {
  mugGalleryFillsFrame,
  mugGalleryFrameAspect,
  mugGalleryForSlug,
} from "../data/mugGalleries";
import { categoryIcon } from "../data/taxonomy";
import type { Product } from "../data/products";
import { isGlobeProductSlug, productImageForSlug } from "../data/productImages";

function MugPhoto({
  src,
  alt,
  fillsFrame,
  square,
  objectPosition,
}: {
  src: string;
  alt: string;
  fillsFrame: boolean;
  square?: boolean;
  objectPosition?: string;
}) {
  const fit = fillsFrame ? "object-cover" : "object-contain";
  const img = (
    <img
      src={src}
      alt={alt}
      className={cn("absolute inset-0 h-full w-full", fit, !objectPosition && "object-center")}
      style={objectPosition ? { objectPosition } : undefined}
    />
  );
  if (square) {
    return <span className="relative block aspect-square w-full">{img}</span>;
  }
  return img;
}

/**
 * Product imagery. Catalogue items use four procedural views; mug PDPs use
 * cropped photography from the product lookbook; sticker collections use the
 * supplied sheet as the only view.
 */
export function ProductGallery({ product }: { product: Product }) {
  const mugGallery = mugGalleryForSlug(product.slug);
  const productImage = productImageForSlug(product.slug);
  const stickerSheet = product.category === "stickers" && productImage ? productImage : undefined;
  const globePhoto = isGlobeProductSlug(product.slug) && productImage ? productImage : undefined;
  const views = mugGallery
    ? mugGallery.map((view) => view.src)
    : stickerSheet
      ? [stickerSheet.src]
      : globePhoto
        ? [globePhoto.src, globePhoto.src, globePhoto.src, globePhoto.src]
        : [
            product.slug,
            `${product.slug}-detail`,
            `${product.slug}-angle`,
            `${product.slug}-macro`,
          ];
  const [active, setActive] = useState(0);
  const Icon = categoryIcon(product.category);
  const activeMug = mugGallery?.[active];
  const mugFillsFrame = mugGalleryFillsFrame(product.slug);

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-bronze/15 bg-charcoal/40">
        {activeMug ? (
          <div
            className={cn(
              "relative w-full bg-[oklch(0.12_0.006_62)]",
              mugGalleryFrameAspect(product.slug),
            )}
          >
            <MugPhoto
              src={activeMug.src}
              alt={activeMug.alt}
              fillsFrame={mugFillsFrame}
              objectPosition={activeMug.objectPosition}
            />
          </div>
        ) : globePhoto ? (
          <div className="relative aspect-[16/10] w-full bg-[#0b0a09]">
            <img
              src={globePhoto.src}
              alt={globePhoto.alt}
              className="absolute inset-0 h-full w-full object-contain"
              style={{ objectPosition: globePhoto.objectPosition ?? "50% 50%" }}
            />
          </div>
        ) : stickerSheet ? (
          <div className="relative aspect-[16/10] w-full bg-[#f6f4ef]">
            <img
              src={stickerSheet.src}
              alt={stickerSheet.alt}
              className={cn(
                "absolute inset-0 h-full w-full",
                stickerSheet.fillFrame
                  ? "object-cover object-center"
                  : "object-contain object-center",
              )}
            />
          </div>
        ) : (
          <CoverArt
            art={views[active] ?? product.slug}
            icon={Icon}
            ratio="video"
            {...(productImage && (active === 0 || globePhoto)
              ? {
                  imageSrc: productImage.src,
                  imageAlt: productImage.alt,
                  ...(product.comingSoon || productImage.fillFrame
                    ? { fit: "cover" as const }
                    : {}),
                  ...(productImage.objectPosition
                    ? { objectPosition: productImage.objectPosition }
                    : {}),
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
                "relative overflow-hidden rounded-xl border bg-[oklch(0.12_0.006_62)] transition-colors motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
                i === active ? "border-bronze/60" : "border-bronze/12 hover:border-bronze/35",
              )}
            >
              <MugPhoto
                src={view.src}
                alt=""
                fillsFrame={mugFillsFrame}
                objectPosition={view.objectPosition}
                square
              />
            </button>
          ))
        ) : globePhoto ? (
          views.map((_, i) => (
            <button
              key={`globe-view-${i}`}
              type="button"
              aria-pressed={i === active}
              aria-label={`View ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative overflow-hidden rounded-xl border bg-[#0b0a09] transition-colors motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
                i === active ? "border-bronze/60" : "border-bronze/12 hover:border-bronze/35",
              )}
            >
              <span className="relative block aspect-square w-full">
                <img
                  src={globePhoto.src}
                  alt=""
                  className="absolute inset-0 h-full w-full object-contain"
                  style={{ objectPosition: globePhoto.objectPosition ?? "50% 50%" }}
                />
              </span>
            </button>
          ))
        ) : stickerSheet ? (
          <button
            type="button"
            aria-pressed
            aria-label="Collection view"
            className="overflow-hidden rounded-xl border border-bronze/60 bg-[#f6f4ef]"
          >
            <img
              src={stickerSheet.src}
              alt=""
              className="aspect-square h-full w-full object-contain object-center"
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
