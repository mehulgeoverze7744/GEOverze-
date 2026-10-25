import type { LucideIcon } from "lucide-react";

import { CoverArt } from "@/features/play/components/CoverArt";
import { isLibraryMediaPath, proceduralArtKey } from "@/lib/supabase/library-media";
import { cn } from "@/lib/utils";

import { useLibraryMediaUrl } from "../hooks/useLibraryMediaUrl";
import { libraryResponsiveProps } from "../lib/library-image-delivery";

type LibraryMediaImageProps = {
  storagePath?: string | null | undefined;
  fallbackArt: string;
  /** Static public asset override (slug-keyed article/collection art). */
  staticImageSrc?: string | undefined;
  icon?: LucideIcon | undefined;
  alt?: string | undefined;
  className?: string | undefined;
  ratio?: "video" | "wide" | "square" | "banner";
  fit?: "contain" | "cover";
  /** Cover treatment. Article cards pass `none` and fade the photo in the card itself. */
  overlay?: "none" | "subtle" | "hero" | "category" | undefined;
};

/** Storage-backed library image with procedural CoverArt fallback. */
export function LibraryMediaImage({
  storagePath,
  fallbackArt,
  staticImageSrc,
  icon,
  alt = "",
  className,
  ratio = "video",
  fit = "cover",
  overlay,
}: LibraryMediaImageProps) {
  const procedural = proceduralArtKey(fallbackArt);
  const coverProps = {
    ...(icon ? { icon } : {}),
    ...(className ? { className } : {}),
    ...(overlay ? { overlay } : {}),
  };

  if (staticImageSrc) {
    const responsive = libraryResponsiveProps(staticImageSrc, "card");
    return (
      <CoverArt
        art={procedural}
        imageSrc={responsive?.src ?? staticImageSrc}
        imageAlt={alt}
        ratio={ratio}
        fit={fit}
        {...coverProps}
        {...(responsive ? { responsive } : {})}
      />
    );
  }

  const resolvedPath = storagePath ?? (isLibraryMediaPath(fallbackArt) ? fallbackArt : null);
  const { url, loading, error } = useLibraryMediaUrl(resolvedPath);

  if (!resolvedPath || error) {
    return (
      <CoverArt art={procedural} ratio={ratio} fit={fit} {...coverProps} />
    );
  }

  if (loading || !url) {
    return (
      <div
        aria-hidden
        className={cn(
          "relative w-full animate-pulse bg-[oklch(0.16_0.006_60)]",
          ratio === "video" && "aspect-[16/10]",
          ratio === "wide" && "aspect-[21/8]",
          ratio === "banner" && "aspect-[8/3]",
          ratio === "square" && "aspect-square",
          className,
        )}
      />
    );
  }

  return (
    <CoverArt
      art={procedural}
      imageSrc={url}
      imageAlt={alt}
      ratio={ratio}
      fit={fit}
      {...coverProps}
    />
  );
}
