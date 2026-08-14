import { Bookmark, Clock, HelpCircle, Play, Star, Users } from "lucide-react";

import { GeoButton } from "@/components/shared";
import { cn } from "@/lib/utils";
import { QUIZ_CATEGORIES } from "../data/categories";
import type { Quiz } from "../data/quizzes";
import { DifficultyBadge } from "./Badges";
import { CoverArt } from "./CoverArt";
import { GameCard } from "./GameCard";

const ICONS = new Map(QUIZ_CATEGORIES.map((c) => [c.id, c.icon]));

function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return String(n);
}

/** Solid quiz card used by the featured carousel, rails and results grid. */
export function QuizCard({
  quiz,
  bookmarked,
  onToggleBookmark,
  onPlay,
  className,
}: {
  quiz: Quiz;
  bookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onPlay: (quiz: Quiz) => void;
  className?: string;
}) {
  const Icon = ICONS.get(quiz.categoryId);

  return (
    <GameCard className={cn("flex flex-col", className)}>
      <div className="relative">
        <CoverArt art={quiz.art} icon={Icon} />
        <button
          type="button"
          onClick={() => onToggleBookmark(quiz.id)}
          aria-label={bookmarked ? `Remove ${quiz.title} from bookmarks` : `Bookmark ${quiz.title}`}
          aria-pressed={bookmarked}
          className={cn(
            "absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all motion-snap active:scale-90",
            bookmarked
              ? "border-bronze bg-bronze/25 text-bronze-glow"
              : "border-bronze/25 bg-[oklch(0.12_0.006_60/0.8)] text-foreground/60 hover:border-bronze/60 hover:text-bronze-glow",
          )}
        >
          <Bookmark
            className="h-4 w-4"
            strokeWidth={2}
            fill={bookmarked ? "currentColor" : "none"}
          />
        </button>
        {typeof quiz.progress === "number" ? (
          <span className="absolute inset-x-0 bottom-0 h-1 bg-[oklch(0.2_0.008_60)]">
            <span
              className="block h-full bg-gradient-bronze"
              style={{ width: `${quiz.progress}%` }}
            />
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[0.95rem] font-semibold tracking-tight text-foreground">
              {quiz.title}
            </h3>
            <p className="mt-1 truncate text-[0.7rem] text-foreground/50">by {quiz.creator}</p>
          </div>
          <DifficultyBadge level={quiz.difficulty} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-y-2 text-[0.7rem] text-foreground/50">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.8} />
            {compact(quiz.players)} players
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-bronze" strokeWidth={1.8} fill="currentColor" />
            {quiz.rating.toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.8} />
            {quiz.questions} questions
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.8} />~{quiz.minutes} min
          </span>
        </div>

        <GeoButton variant="solid" size="md" className="mt-5 w-full" onClick={() => onPlay(quiz)}>
          <Play className="h-4 w-4" strokeWidth={2.4} />
          {typeof quiz.progress === "number" ? "Continue" : "Play"}
        </GeoButton>
      </div>
    </GameCard>
  );
}
