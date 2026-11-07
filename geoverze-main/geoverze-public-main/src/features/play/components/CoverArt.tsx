import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { coverArt, patternLayer, patternSize } from "../lib/coverArt";

/**
 * Cover artwork — procedural bronze gradient by default, or a supplied image when
 * `imageSrc` is set (quiz label thumbnails, photography, etc.).
 */
export function CoverArt({
  art,
  icon: Icon,
  imageSrc,
  imageAlt,
  className,
  ratio = "video",
  fit = "contain",
  overlay: _overlay = "none",
  objectPosition,
  responsive,
  loading = "lazy",
  fetchPriority,
}: {
  art: string;
  icon?: LucideIcon | undefined;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
  ratio?: "video" | "wide" | "square" | "banner" | "fill";
  /** `contain` for label thumbnails; `cover` for cinematic hero banners. */
  fit?: "contain" | "cover";
  /** Kept for callers. Card images stay unblended — overlays are not rendered. */
  overlay?: "none" | "subtle" | "hero" | "category";
  objectPosition?: string;
  /** Responsive library derivatives. Omitted for quiz and store art. */
  responsive?: {
    webpSrcSet: string;
    jpegSrcSet: string;
    sizes: string;
    width: number;
    height: number;
  };
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
}) {
  const cover = coverArt(art);
  const pattern = patternLayer(cover.pattern);
  const size = patternSize(cover.pattern);

  return (
    <div
      aria-hidden={imageSrc && !imageAlt ? true : undefined}
      className={cn(
        "relative w-full overflow-hidden",
        ratio === "video" && "aspect-[16/10]",
        ratio === "wide" && "aspect-[21/8]",
        ratio === "banner" && "aspect-[8/3]",
        ratio === "square" && "aspect-square",
        ratio === "fill" && "h-full",
        imageSrc && "bg-[oklch(0.12_0.006_62)]",
        className,
      )}
      style={
        imageSrc
          ? undefined
          : { backgroundImage: `linear-gradient(150deg, ${cover.from}, ${cover.to})` }
      }
    >
      {imageSrc ? (
        <picture className="absolute inset-0 block h-full w-full">
          {responsive ? (
            <source type="image/webp" srcSet={responsive.webpSrcSet} sizes={responsive.sizes} />
          ) : null}
          <img
            src={imageSrc}
            srcSet={responsive?.jpegSrcSet}
            sizes={responsive?.sizes}
            alt={imageAlt ?? ""}
            width={responsive?.width ?? 1536}
            height={responsive?.height ?? 1024}
            loading={loading}
            fetchPriority={fetchPriority}
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.opacity = "0";
            }}
            className={cn(
              "h-full w-full transition-transform duration-700 ease-out motion-reduce:transition-none",
              !objectPosition && "object-center",
              fit === "cover"
                ? "object-cover group-hover/card:scale-[1.04] motion-reduce:group-hover/card:scale-100"
                : "object-contain group-hover/card:scale-[1.03]",
            )}
            style={objectPosition ? { objectPosition } : undefined}
          />
        </picture>
      ) : (
        <>
          <span
            className="absolute inset-0"
            style={{ backgroundImage: pattern, backgroundSize: size }}
          />
          {Icon ? (
            <span className="absolute bottom-3 left-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-bronze/40 bg-[oklch(0.12_0.006_60/0.85)] text-bronze-glow">
              <Icon className="h-5 w-5" strokeWidth={1.6} />
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}
