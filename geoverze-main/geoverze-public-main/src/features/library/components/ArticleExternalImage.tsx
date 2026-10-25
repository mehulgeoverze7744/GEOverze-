import { useState } from "react";

import { CoverArt } from "@/features/play/components/CoverArt";
import { cn } from "@/lib/utils";

import { libraryResponsiveProps, type LibraryImageSlot } from "../lib/library-image-delivery";

type ArticleExternalImageProps = {
  src: string;
  alt: string;
  fallbackArt: string;
  /** Static public asset when remote src fails — avoids procedural grid placeholders. */
  staticFallbackSrc?: string;
  className?: string;
  ratio?: "video" | "wide" | "square" | "banner";
  /** The article hero is the only image fetched immediately. Body figures stay lazy. */
  priority?: boolean;
  slot?: LibraryImageSlot;
};

/** Article photograph with responsive WebP/JPEG sources and a static fallback. */
export function ArticleExternalImage({
  src,
  alt,
  fallbackArt,
  staticFallbackSrc,
  className,
  ratio = "video",
  priority = false,
  slot,
}: ArticleExternalImageProps) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = failed ? (staticFallbackSrc ?? "") : src;
  const imageSlot = slot ?? (priority ? "hero" : "body");
  const responsive = resolvedSrc ? libraryResponsiveProps(resolvedSrc, imageSlot) : null;

  if (failed && !staticFallbackSrc) {
    return (
      <CoverArt art={fallbackArt} ratio={ratio} fit="cover" overlay="none" className={className} />
    );
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-[#E8D6B8]",
        ratio === "video" && "aspect-[16/10]",
        ratio === "wide" && "aspect-[21/8]",
        ratio === "banner" && "aspect-[8/3]",
        ratio === "square" && "aspect-square",
        className,
      )}
    >
      <picture className="absolute inset-0 block h-full w-full">
        {responsive ? (
          <source type="image/webp" srcSet={responsive.webpSrcSet} sizes={responsive.sizes} />
        ) : null}
        <img
          src={responsive?.src ?? resolvedSrc}
          srcSet={responsive?.jpegSrcSet}
          sizes={responsive?.sizes}
          alt={alt}
          width={responsive?.width}
          height={responsive?.height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          className="h-full w-full object-cover object-center"
          onError={() => setFailed(true)}
        />
      </picture>
    </div>
  );
}
