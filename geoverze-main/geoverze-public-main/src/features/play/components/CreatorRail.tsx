import { Link } from "@tanstack/react-router";
import { Users } from "lucide-react";

import { SectionHeading } from "@/components/shared";
import { FEATURED_CREATORS } from "../data/creators";
import { CoverArt } from "./CoverArt";
import { GameCard } from "./GameCard";

function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return String(n);
}

/** Featured creator rail — deep-links into the GEOlibrary creator profiles. */
export function CreatorRail() {
  return (
    <section aria-label="Featured creators">
      <SectionHeading
        eyebrow="Creators"
        title="Sets from the makers"
        description="The studios and independent cartographers writing the questions you play."
      />
      <div className="rail-scroll mt-6 flex gap-4 pb-2">
        {FEATURED_CREATORS.map((creator) => (
          <GameCard key={creator.handle} className="w-[14rem] shrink-0 snap-start">
            <Link
              to="/geolibrary/creators/$handle"
              params={{ handle: creator.handle }}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
            >
              <CoverArt art={creator.art} ratio="wide" />
              <div className="p-4">
                <h3 className="truncate text-[0.9rem] font-semibold tracking-tight text-foreground">
                  {creator.name}
                </h3>
                <p className="mt-1 truncate text-[0.72rem] text-foreground/50">{creator.focus}</p>
                <p className="mt-3 flex items-center gap-1.5 text-[0.7rem] text-foreground/50">
                  <Users className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.8} aria-hidden />
                  {compact(creator.followers)} followers · {creator.quizzes} quizzes
                </p>
              </div>
            </Link>
          </GameCard>
        ))}
      </div>
    </section>
  );
}
