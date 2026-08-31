import type { LucideIcon } from "lucide-react";

import { CoverArt } from "@/features/play/components/CoverArt";
import { isLibraryMediaPath, proceduralArtKey } from "@/lib/supabase/library-media";
import { cn } from "@/lib/utils";

import { useLibraryMediaUrl } from "../hooks/useLibraryMediaUrl";

type LibraryMediaImageProps = {
  storagePath?: string | null;
  fallbackArt: string;
  icon?: LucideIcon;
  alt?: string;
  className?: string;
  ratio?: "video" | "wide" | "square" | "banner";
  fit?: "contain" | "cover";
};

/** Storage-backed library image with procedural CoverArt fallback. */
export function LibraryMediaImage({
  storagePath,
  fallbackArt,
  icon,
  alt = "",
  className,
  ratio = "video",
  fit = "cover",
}: LibraryMediaImageProps) {
  const resolvedPath =
    storagePath ?? (isLibraryMediaPath(fallbackArt) ? fallbackArt : null);
  const { url, loading, error } = useLibraryMediaUrl(resolvedPath);
  const procedural = proceduralArtKey(fallbackArt);

  if (!resolvedPath || error) {
    return <CoverArt art={procedural} icon={icon} ratio={ratio} fit={fit} className={className} />;
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
      icon={icon}
      imageSrc={url}
      imageAlt={alt}
      ratio={ratio}
      fit={fit}
      className={className}
    />
  );
}
