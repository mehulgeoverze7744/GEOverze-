import { cn } from "@/lib/utils";
import { coverArt, patternLayer, patternSize } from "@/features/play/lib/coverArt";

/**
 * Procedural cover thumbnail. Same art engine as Let's Play, so studio drafts
 * preview exactly as they will appear to players.
 */
export function CoverThumb({
  artKey,
  className,
  label,
}: {
  artKey: string;
  className?: string;
  label?: string;
}) {
  const cover = coverArt(artKey);

  return (
    <div
      role="img"
      aria-label={label ? `Cover art for ${label}` : "Cover art"}
      className={cn("relative overflow-hidden rounded-lg border border-bronze/12", className)}
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
    </div>
  );
}
