import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

import type { Quiz } from "../data/quizzes";
import { QuizCard } from "./QuizCard";

/** Horizontally scrollable quiz rail with arrow controls on desktop. */
export function QuizRail({
  title,
  description,
  quizzes,
  bookmarkIds,
  onToggleBookmark,
  onPlay,
  viewAllTo,
  viewAllLabel = "View all",
}: {
  title: string;
  description?: string;
  quizzes: Quiz[];
  bookmarkIds: string[];
  onToggleBookmark: (id: string) => void;
  onPlay: (quiz: Quiz) => void;
  /** Optional destination for a "View all" link beside the rail arrows. */
  viewAllTo?: "/play/search" | "/play/collections" | "/play/modes" | "/play/history";
  viewAllLabel?: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  const nudge = (dir: -1 | 1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.8), behavior: "smooth" });
  };

  if (quizzes.length === 0) return null;

  return (
    <section className="mt-12 first:mt-0" aria-label={title}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-[0.8rem] text-foreground/50">{description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {viewAllTo ? (
            <Link
              to={viewAllTo}
              className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-bronze transition-colors motion-snap hover:text-bronze-glow"
            >
              {viewAllLabel}
            </Link>
          ) : null}
          <div className="hidden gap-2 md:flex">
            {([-1, 1] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => nudge(dir)}
                aria-label={dir === -1 ? `Scroll ${title} left` : `Scroll ${title} right`}
                className="game-surface-raised inline-flex h-9 w-9 items-center justify-center rounded-xl text-foreground/70 transition-all motion-snap hover:border-bronze/60 hover:text-bronze-glow active:scale-90"
              >
                {dir === -1 ? (
                  <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
                ) : (
                  <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div ref={railRef} className="rail-scroll mt-5 flex gap-4 pb-2">
        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            bookmarked={bookmarkIds.includes(quiz.id)}
            onToggleBookmark={onToggleBookmark}
            onPlay={onPlay}
            className="w-[17rem] shrink-0 snap-start"
          />
        ))}
      </div>
    </section>
  );
}
