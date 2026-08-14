import { Play, Star, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { GeoButton } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { Quiz } from "../data/quizzes";
import { DifficultyBadge, MetaChip } from "./Badges";
import { CoverArt } from "./CoverArt";

/**
 * Featured carousel. One large slide at a time, auto-advancing until the user
 * interacts, with dot controls and keyboard-reachable arrows.
 */
export function FeaturedCarousel({
  quizzes,
  onPlay,
}: {
  quizzes: Quiz[];
  onPlay: (quiz: Quiz) => void;
}) {
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!auto || quizzes.length < 2) return;
    timer.current = window.setInterval(() => setIndex((i) => (i + 1) % quizzes.length), 6000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [auto, quizzes.length]);

  const active = quizzes[index];
  if (!active) return null;

  const go = (i: number) => {
    setAuto(false);
    setIndex((i + quizzes.length) % quizzes.length);
  };

  return (
    <div className="game-surface overflow-hidden rounded-2xl">
      <div className="relative">
        <CoverArt
          key={active.id}
          art={active.art}
          ratio="wide"
          className="h-[15rem] md:h-[19rem]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.006_60)] via-[oklch(0.12_0.006_60/0.55)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <MetaChip tone="bronze">Featured</MetaChip>
            <DifficultyBadge level={active.difficulty} />
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {active.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.75rem] text-foreground/60">
            <span>by {active.creator}</span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.8} />
              {active.players.toLocaleString()} players
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-bronze" strokeWidth={1.8} fill="currentColor" />
              {active.rating.toFixed(1)}
            </span>
            <span>
              {active.questions} questions · ~{active.minutes} min
            </span>
          </div>
          <GeoButton variant="solid" size="lg" className="mt-5" onClick={() => onPlay(active)}>
            <Play className="h-4 w-4" strokeWidth={2.4} />
            Play now
          </GeoButton>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 px-6 py-4">
        {quizzes.map((quiz, i) => (
          <button
            key={quiz.id}
            type="button"
            onClick={() => go(i)}
            aria-label={`Show ${quiz.title}`}
            aria-current={i === index}
            className={cn(
              "h-1.5 rounded-full transition-all motion-snap",
              i === index
                ? "w-8 bg-gradient-bronze"
                : "w-3 bg-[oklch(0.3_0.01_60)] hover:bg-bronze/50",
            )}
          />
        ))}
      </div>
    </div>
  );
}
