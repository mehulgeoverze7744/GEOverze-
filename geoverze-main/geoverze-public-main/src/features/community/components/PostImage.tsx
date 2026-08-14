import { cn } from "@/lib/utils";

import { coverArt, patternLayer, patternSize } from "@/features/play/lib/coverArt";

/**
 * Procedural post imagery. Community photos have no real bytes yet, so each
 * image key hashes into a stable bronze-anchored gradient and pattern.
 */
export function PostImage({
  imageKey,
  alt,
  className,
}: {
  imageKey: string;
  alt: string;
  className?: string;
}) {
  const cover = coverArt(imageKey);
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn("relative overflow-hidden rounded-xl", className)}
      style={{ backgroundImage: `linear-gradient(150deg, ${cover.from}, ${cover.to})` }}
    >
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: patternLayer(cover.pattern),
          backgroundSize: patternSize(cover.pattern),
        }}
      />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,oklch(0_0_0/0.45),transparent)]"
      />
    </div>
  );
}

/** Gallery layout for one to four images. */
export function PostImageGrid({
  images,
  caption,
}: {
  images: readonly string[];
  caption?: string;
}) {
  const [first, ...rest] = images;
  if (!first) return null;

  return (
    <figure className="mt-4">
      <div
        className={cn(
          "grid gap-1.5",
          rest.length === 0 && "grid-cols-1",
          rest.length >= 1 && "grid-cols-[minmax(0,2fr)_minmax(0,1fr)]",
        )}
      >
        <PostImage imageKey={first} alt={caption ?? "Community photo"} className="aspect-[4/3]" />
        {rest.length > 0 ? (
          <div className="grid gap-1.5">
            {rest.slice(0, 2).map((key) => (
              <PostImage
                key={key}
                imageKey={key}
                alt={caption ?? "Community photo"}
                className="min-h-24"
              />
            ))}
          </div>
        ) : null}
      </div>
      {caption ? (
        <figcaption className="mt-2 text-[0.7rem] uppercase tracking-[0.18em] text-foreground/50">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
