import { useState } from "react";

import { CoverArt } from "@/features/play/components/CoverArt";
import { cn } from "@/lib/utils";

type ArticleExternalImageProps = {
  src: string;
  alt: string;
  fallbackArt: string;
  /** Static public asset when remote src fails — avoids procedural grid placeholders. */
  staticFallbackSrc?: string;
  className?: string;
  ratio?: "video" | "wide" | "square" | "banner";
};

/** Remote article image with procedural fallback when the URL fails. */
export function ArticleExternalImage({
  src,
  alt,
  fallbackArt,
  staticFallbackSrc,
  className,
  ratio = "video",
}: ArticleExternalImageProps) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = failed ? (staticFallbackSrc ?? "") : src;

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
      <img
        src={resolvedSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
