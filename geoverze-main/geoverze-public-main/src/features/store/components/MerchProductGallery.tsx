import { memo, useState, type SyntheticEvent } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

type MerchProductGalleryProps = {
  imageKey: string;
  src: string;
  alt: string;
  onPrevious: () => void;
  onNext: () => void;
  onFullscreen: () => void;
};

/**
 * Merch PDP hero gallery. The frame follows the loaded image's natural
 * aspect ratio so letterboxed black bars do not appear around the photo.
 */
export const MerchProductGallery = memo(function MerchProductGallery({
  imageKey,
  src,
  alt,
  onPrevious,
  onNext,
  onFullscreen,
}: MerchProductGalleryProps) {
  const [aspect, setAspect] = useState<number | null>(null);

  const applyNaturalAspect = (img: HTMLImageElement) => {
    if (img.naturalWidth <= 0 || img.naturalHeight <= 0) return;
    const next = img.naturalWidth / img.naturalHeight;
    setAspect((prev) => (prev !== null && Math.abs(prev - next) < 0.0001 ? prev : next));
  };

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    applyNaturalAspect(event.currentTarget);
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-bronze/15"
      style={aspect ? { aspectRatio: `${aspect}` } : undefined}
    >
      <img
        key={imageKey}
        src={src}
        alt={alt}
        onLoad={handleLoad}
        className={aspect ? "h-full w-full object-contain object-center" : "block h-auto w-full"}
      />

      <button
        type="button"
        onClick={onPrevious}
        aria-label="Previous colour"
        className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-bronze/20 bg-background/40 text-foreground/70 backdrop-blur-sm transition-colors hover:border-bronze/45 hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.6} />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next colour"
        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-bronze/20 bg-background/40 text-foreground/70 backdrop-blur-sm transition-colors hover:border-bronze/45 hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={1.6} />
      </button>
      <button
        type="button"
        onClick={onFullscreen}
        aria-label="View gallery fullscreen"
        className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-bronze/20 bg-background/40 text-foreground/70 backdrop-blur-sm transition-colors hover:border-bronze/45 hover:text-foreground"
      >
        <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.6} />
      </button>
    </div>
  );
});
