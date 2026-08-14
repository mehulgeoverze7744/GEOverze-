import { Image as ImageIcon, Map as MapIcon, Music, Video } from "lucide-react";

import { cn } from "@/lib/utils";
import { coverArt, patternLayer, patternSize } from "@/features/play/lib/coverArt";
import type { QuestionMedia } from "../data/types";

function ProceduralPlate({
  art,
  className,
  children,
}: {
  art: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const cover = coverArt(art);
  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-2xl", className)}
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
      {children}
    </div>
  );
}

/**
 * Renders the media attached to a question card.
 *
 * Images, illustrations and maps use procedural art so the engine ships with
 * zero image bytes; audio and video are labelled placeholders for the media
 * pipeline. Flags use emoji glyphs.
 */
export function QuestionMediaView({ media }: { media: QuestionMedia }) {
  if (media.kind === "flag") {
    return (
      <figure className="flex flex-col items-center gap-3">
        <div className="game-surface-raised flex w-full max-w-sm items-center justify-center rounded-2xl py-8">
          <span
            className="text-[4.5rem] leading-none sm:text-[5.5rem]"
            role="img"
            aria-label={media.caption ?? "Flag"}
          >
            {media.glyph}
          </span>
        </div>
        {media.caption ? (
          <figcaption className="text-[0.75rem] text-foreground/50">{media.caption}</figcaption>
        ) : null}
      </figure>
    );
  }

  if (media.kind === "audio" || media.kind === "video") {
    const Icon = media.kind === "audio" ? Music : Video;
    return (
      <div className="game-surface-raised flex items-center gap-3 rounded-2xl px-4 py-5">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-bronze/30 bg-bronze/10 text-bronze-glow">
          <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden />
        </span>
        <div>
          <p className="text-[0.85rem] font-semibold text-foreground/85">
            {media.kind === "audio" ? "Audio clue" : "Video clue"}
          </p>
          <p className="text-[0.75rem] text-foreground/50">
            {media.caption ?? "Media playback arrives with the content pipeline."}
          </p>
        </div>
      </div>
    );
  }

  const Icon = media.kind === "map" ? MapIcon : ImageIcon;

  return (
    <figure className="flex flex-col gap-3">
      <ProceduralPlate art={media.art} className="aspect-[16/9]">
        <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[oklch(0.1_0.004_60/0.92)] to-transparent" />
        <span className="absolute bottom-3 left-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-bronze/40 bg-[oklch(0.12_0.006_60/0.85)] text-bronze-glow">
          <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden />
        </span>
      </ProceduralPlate>
      <figcaption className="text-[0.75rem] text-foreground/50">
        {media.caption ?? "Reference imagery placeholder."}
      </figcaption>
    </figure>
  );
}

export { ProceduralPlate };
