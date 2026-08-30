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
  overlay = "hero",
}: {
  art: string;
  icon?: LucideIcon | undefined;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
  ratio?: "video" | "wide" | "square" | "banner";
  /** `contain` for label thumbnails; `cover` for cinematic hero banners. */
  fit?: "contain" | "cover";
  /** Image overlay when `fit="cover"`. `subtle` = bottom blend only. */
  overlay?: "none" | "subtle" | "hero";
}) {
  const cover = coverArt(art);
  const pattern = patternLayer(cover.pattern);
  const size = patternSize(cover.pattern);
  const coverImage = Boolean(imageSrc && fit === "cover");
  const showIconOnCover = Boolean(coverImage && Icon);
  const resolvedOverlay = coverImage ? (overlay === "hero" && !Icon ? "none" : overlay) : "none";

  return (
    <div
      aria-hidden={imageSrc && !imageAlt ? true : undefined}
      className={cn(
        "relative w-full overflow-hidden",
        ratio === "video" && "aspect-[16/10]",
        ratio === "wide" && "aspect-[21/8]",
        ratio === "banner" && "aspect-[8/3]",
        ratio === "square" && "aspect-square",
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
        <>
          <img
            src={imageSrc}
            alt={imageAlt ?? ""}
            loading="lazy"
            decoding="async"
            className={cn(
              "absolute inset-0 h-full w-full object-center transition-transform duration-700 ease-out motion-reduce:transition-none",
              fit === "cover"
                ? "object-cover group-hover/card:scale-[1.04] motion-reduce:group-hover/card:scale-100"
                : "object-contain group-hover/card:scale-[1.03]",
            )}
          />
          {resolvedOverlay === "hero" ? (
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-b from-charcoal/55 via-charcoal/25 to-charcoal/65"
            />
          ) : resolvedOverlay === "subtle" ? (
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-charcoal/55 to-transparent"
            />
          ) : null}
          {showIconOnCover ? (
            <span className="absolute bottom-3 left-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-bronze/40 bg-[oklch(0.12_0.006_60/0.85)] text-bronze-glow">
              <Icon className="h-5 w-5" strokeWidth={1.6} />
            </span>
          ) : null}
        </>
      ) : (
        <>
          <span
            className="absolute inset-0"
            style={{ backgroundImage: pattern, backgroundSize: size }}
          />
          <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[oklch(0.1_0.004_60/0.9)] to-transparent" />
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
