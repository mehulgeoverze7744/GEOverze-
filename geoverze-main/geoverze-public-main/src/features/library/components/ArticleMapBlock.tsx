import { Map } from "lucide-react";

import { CoverArt } from "@/features/play/components/CoverArt";

/** Non-interactive map block — region label + caption from stored block data. */
export function ArticleMapBlock({ region, caption }: { region: string; caption: string }) {
  const artKey = region.trim().toLowerCase().replace(/\s+/g, "-") || "global";

  return (
    <figure className="glass-panel surface-gradient overflow-hidden rounded-2xl">
      <div className="relative">
        <CoverArt art={artKey} icon={Map} ratio="wide" fit="cover" />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,oklch(0.1_0.006_60/0.92),oklch(0.1_0.006_60/0.15))]"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-[0.6rem] uppercase tracking-[0.22em] text-bronze/90">Map region</p>
          <p className="mt-1 text-lg font-light tracking-tight text-foreground">{region}</p>
        </div>
      </div>
      {caption ? (
        <figcaption className="px-5 pb-5 pt-3 text-xs leading-relaxed text-foreground/50">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
