import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { coverArt, patternLayer, patternSize } from "../lib/coverArt";

/**
 * Procedural cover artwork. Zero image weight — a hashed bronze gradient plus a
 * geometric pattern and the subject icon. Ready to be swapped for photography.
 */
export function CoverArt({
  art,
  icon: Icon,
  className,
  ratio = "video",
}: {
  art: string;
  icon?: LucideIcon | undefined;
  className?: string;
  ratio?: "video" | "wide" | "square";
}) {
  const cover = coverArt(art);
  const pattern = patternLayer(cover.pattern);
  const size = patternSize(cover.pattern);

  return (
    <div
      aria-hidden
      className={cn(
        "relative w-full overflow-hidden",
        ratio === "video" && "aspect-[16/10]",
        ratio === "wide" && "aspect-[21/8]",
        ratio === "square" && "aspect-square",
        className,
      )}
      style={{ backgroundImage: `linear-gradient(150deg, ${cover.from}, ${cover.to})` }}
    >
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
    </div>
  );
}
