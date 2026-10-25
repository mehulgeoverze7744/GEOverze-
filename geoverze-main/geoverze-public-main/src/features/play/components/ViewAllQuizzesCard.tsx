import { Link } from "@tanstack/react-router";
import { ArrowRight, Globe2 } from "lucide-react";

import { geoButtonVariants } from "@/components/shared/geoButtonVariants";
import { cn } from "@/lib/utils";

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
      <div className="relative flex aspect-video items-center justify-center bg-[oklch(0.11_0.006_60)]">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-bronze/30 bg-bronze/10 text-bronze transition-colors motion-snap group-hover/view-all:border-bronze/60 group-hover/view-all:text-bronze-glow">
          <Globe2 className="h-7 w-7" strokeWidth={1.4} aria-hidden="true" />
        </span>
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
