import { Clock, HelpCircle, Play, TrendingUp } from "lucide-react";

import { GeoButton } from "@/components/shared";
import type { QuizCategory } from "../data/categories";
import { DifficultyBadge, MetaChip } from "./Badges";
import { CoverArt } from "./CoverArt";
import { GameCard } from "./GameCard";

/** Category tile: cover, badges, meta row, play action. */
export function CategoryCard({
  category,
  onPlay,
}: {
  category: QuizCategory;
  onPlay: (category: QuizCategory) => void;
}) {
  return (
    <GameCard className="group flex flex-col">
      <div className="relative">
        <CoverArt art={category.art} icon={category.icon} />
        <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-1.5">
          {category.isNew ? <MetaChip tone="bronze">New</MetaChip> : null}
          {category.trending ? (
            <MetaChip tone="bronze">
              <TrendingUp className="h-3 w-3" strokeWidth={2.2} /> Hot
            </MetaChip>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {category.title}
          </h3>
          <DifficultyBadge level={category.difficulty} />
        </div>
        <p className="mt-2 line-clamp-2 text-[0.82rem] leading-relaxed text-foreground/55">
          {category.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.7rem] text-foreground/50">
          <span className="inline-flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.8} />
            {category.questions} questions
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.8} />~{category.minutes}{" "}
            min
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[oklch(0.24_0.008_60)]">
            <span
              className="block h-full rounded-full bg-gradient-bronze"
              style={{ width: `${category.popularity}%` }}
            />
          </span>
          <span className="text-[0.65rem] font-semibold text-bronze/90">
            {category.popularity}% popular
          </span>
        </div>

        <GeoButton
          variant="solid"
          size="md"
          className="mt-5 w-full"
          onClick={() => onPlay(category)}
        >
          <Play className="h-4 w-4" strokeWidth={2.4} />
          Play
        </GeoButton>
      </div>
    </GameCard>
  );
}
