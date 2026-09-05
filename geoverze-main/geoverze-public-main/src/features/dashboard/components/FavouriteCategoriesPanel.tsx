import { Sparkles } from "lucide-react";

import { FAVORITE_CATEGORIES } from "@/features/dashboard/data/dashboard";
import { cn } from "@/lib/utils";

/** Player geography preference profile with stacked distribution bars. */
export function FavouriteCategoriesPanel({ className }: { className?: string }) {
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

      <div
        className="mt-6 flex h-2 overflow-hidden rounded-full bg-bronze/10"
        role="img"
        aria-label="Category distribution"
      >
        {FAVORITE_CATEGORIES.map((category, index) => (
          <span
            key={category.id}
            className={cn(
              "h-full bg-gradient-bronze",
              index === 0 && "rounded-l-full",
              index === FAVORITE_CATEGORIES.length - 1 && "rounded-r-full",
            )}
            style={{ width: `${category.share}%` }}
            aria-hidden="true"
          />
        ))}
      </div>

      <ul className="mt-6 space-y-4">
        {FAVORITE_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <li key={category.id} className="flex items-center gap-3">
              <Icon
                className="h-3.5 w-3.5 shrink-0 text-bronze/90"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span className="flex-1 text-xs uppercase tracking-[0.14em] text-foreground/70">
                {category.label}
              </span>
              <span className="text-sm font-light text-gradient-bronze">{category.share}%</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
