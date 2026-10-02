import { Sparkles } from "lucide-react";

import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";
import { cn } from "@/lib/utils";

/** Preference profile — only when a real favourite category exists. */
export function FavouriteCategoriesPanel({ className }: { className?: string }) {
  const favorite = useProgressionStore(selectPlayer).favoriteCategory;

  return (
    <section
      className={cn(
        "rounded-2xl border border-bronze/16 bg-charcoal/30 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="favourite-categories-heading"
    >
      <h2
        id="favourite-categories-heading"
        className="dashboard-section-label flex items-center gap-2"
      >
        <Sparkles className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.5} aria-hidden="true" />
        Favourite categories
      </h2>

      {favorite ? (
        <p className="mt-6 text-sm text-foreground/80">{favorite}</p>
      ) : (
        <p className="mt-6 text-sm leading-relaxed text-foreground/50">
          Category preferences will populate from your play history. Nothing to show yet.
        </p>
      )}
    </section>
  );
}
