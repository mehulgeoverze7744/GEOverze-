import { Link } from "@tanstack/react-router";
import { Bookmark, Clock, HelpCircle, Lock, Play, Star, Users } from "lucide-react";

import { GeoButton } from "@/components/shared";
import { useEntitlements } from "@/hooks/useEntitlements";
import { cn } from "@/lib/utils";
import type { TierId } from "@/features/pricing/data/plans";
import { QUIZ_CATEGORIES } from "../data/categories";
import type { Quiz } from "../data/quizzes";
import { quizThumbnailForId } from "../data/quizThumbnails";
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
  browseOnly = false,
  className,
}: {
  quiz: Quiz;
  bookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onPlay?: (quiz: Quiz) => void;
  /** Browse a section without launching this specific quiz. */
  browseOnly?: boolean;
  className?: string;
}) {
  const Icon = ICONS.get(quiz.categoryId);
  const thumbnail = quizThumbnailForId(quiz.id);
  const { meetsMinTier, minTierLabel } = useEntitlements();
  const requiredTier = quiz.minAccessTier ?? null;
  const locked = Boolean(requiredTier) && !meetsMinTier(requiredTier as TierId);

  return (
    <GameCard className={cn("group/card flex flex-col", className)}>
      <div className="relative">
        <CoverArt
          art={quiz.art}
          {...(thumbnail
            ? {
                imageSrc: thumbnail.src,
                imageAlt: thumbnail.alt,
                fit: "cover" as const,
                overlay: "none" as const,
                ...(thumbnail.objectPosition ? { objectPosition: thumbnail.objectPosition } : {}),
              }
            : { icon: Icon })}
        />
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
        {requiredTier ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-bronze/40 bg-[oklch(0.12_0.006_60/0.85)] px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-bronze-glow">
            {locked ? <Lock className="h-3 w-3" strokeWidth={1.8} aria-hidden /> : null}
            {locked ? `Requires ${minTierLabel(requiredTier as TierId)}` : minTierLabel(requiredTier as TierId)}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              className={cn(
                "truncate text-[0.95rem] font-semibold tracking-tight text-foreground",
                thumbnail?.labelArtwork && "sr-only",
              )}
            >
              {quiz.title}
            </h3>
            <p className="mt-1 truncate text-[0.7rem] text-foreground/50">by {quiz.creator}</p>
          </div>
          <DifficultyBadge level={quiz.difficulty} />
        </div>

        {browseOnly && quiz.description ? (
          <p className="mt-2 line-clamp-2 text-[0.82rem] leading-relaxed text-foreground/55">
            {quiz.description}
          </p>
        ) : null}

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

        {browseOnly ? null : locked ? (
          <GeoButton variant="dark" size="md" className="mt-5 w-full" asChild>
            <Link to="/pricing">
              <Lock className="h-4 w-4" strokeWidth={2.4} />
              Upgrade to play
            </Link>
          </GeoButton>
        ) : (
          <GeoButton
            variant="solid"
            size="md"
            className="mt-5 w-full"
            onClick={() => onPlay?.(quiz)}
          >
            <Play className="h-4 w-4" strokeWidth={2.4} />
            {typeof quiz.progress === "number" ? "Continue" : "Play"}
          </GeoButton>
        )}
      </div>
    </GameCard>
  );
}
