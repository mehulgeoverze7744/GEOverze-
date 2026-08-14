import { Link } from "@tanstack/react-router";
import { Clock, Layers, Play } from "lucide-react";

import { GeoButton } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { Collection } from "../data/collections";
import { MetaChip } from "./Badges";
import { CoverArt } from "./CoverArt";
import { GameCard } from "./GameCard";

/** Solid card for a curated multi-quiz collection. */
export function CollectionCard({
  collection,
  className,
}: {
  collection: Collection;
  className?: string;
}) {
  return (
    <GameCard className={cn("flex flex-col", className)}>
      <CoverArt art={collection.art} ratio="wide" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <MetaChip tone="bronze">
            <Layers className="h-3 w-3" strokeWidth={2.2} aria-hidden />
            {collection.quizIds.length} quizzes
          </MetaChip>
          <MetaChip>
            <Clock className="h-3 w-3" strokeWidth={2.2} aria-hidden />~{collection.minutes} min
          </MetaChip>
        </div>
        <h3 className="mt-4 text-[0.98rem] font-semibold tracking-tight text-foreground">
          {collection.title}
        </h3>
        <p className="mt-1 text-[0.72rem] text-foreground/50">Curated by {collection.curator}</p>
        <p className="mt-3 flex-1 text-[0.82rem] leading-relaxed text-foreground/55">
          {collection.tagline}
        </p>
        <GeoButton asChild variant="solid" size="md" className="mt-5 w-full">
          <Link to="/play/collections/$slug" params={{ slug: collection.slug }}>
            <Play className="h-4 w-4" strokeWidth={2.4} aria-hidden />
            Open collection
          </Link>
        </GeoButton>
      </div>
    </GameCard>
  );
}
