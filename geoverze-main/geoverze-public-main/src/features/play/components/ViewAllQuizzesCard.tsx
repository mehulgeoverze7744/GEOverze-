import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { geoButtonVariants } from "@/components/shared/geoButtonVariants";
import { cn } from "@/lib/utils";

/** Apollo 17 Blue Marble, already licensed for the Countries category. */
const VIEW_ALL_COVER = "/assets/play/categories/countries.jpg";

/** Eighth card in the play-page preview grid. Opens the full quiz catalogue. */
export function ViewAllQuizzesCard() {
  return (
    <Link
      to="/play/search"
      search={{ q: undefined, category: undefined }}
      className={cn(
        "game-surface game-lift group/view-all flex h-full min-w-0 flex-col overflow-hidden rounded-2xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-[var(--game-bg)]">
        <img
          src={VIEW_ALL_COVER}
          alt=""
          className="h-full w-full object-cover object-[center_36%]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-[42%] via-[color-mix(in_oklab,var(--game-bg)_28%,transparent)] via-[72%] to-[var(--game-bg)]"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[0.95rem] font-semibold tracking-tight text-foreground">
          View All Quizzes
        </h3>
        <p className="mt-2 text-[0.8rem] leading-relaxed text-foreground/55">
          Explore the complete quiz collection.
        </p>
        <span
          className={cn(
            geoButtonVariants({ variant: "solid", size: "md" }),
            "pointer-events-none mt-auto w-full group-hover/view-all:brightness-110",
          )}
        >
          Explore all quizzes
          <ArrowRight className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
