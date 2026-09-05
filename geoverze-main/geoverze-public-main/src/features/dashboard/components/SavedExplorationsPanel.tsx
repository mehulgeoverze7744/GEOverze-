import { Link } from "@tanstack/react-router";
import { BookMarked } from "lucide-react";

import { SAVED_ARTICLES } from "@/features/dashboard/data/dashboard";
import { dashboardLinkedItemThumbnail } from "@/features/dashboard/lib/dashboardAssets";
import { cn } from "@/lib/utils";

/** Premium GEOlibrary shelf for saved articles. */
export function SavedExplorationsPanel({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-bronze/16 bg-charcoal/30 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="saved-explorations-heading"
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id="saved-explorations-heading"
          className="dashboard-section-label flex items-center gap-2"
        >
          <BookMarked className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.5} aria-hidden="true" />
          Saved explorations
        </h2>
        <Link
          to="/bookmarks"
          className="text-[0.62rem] uppercase tracking-[0.2em] text-bronze/90 transition-colors hover:text-bronze"
        >
          All
        </Link>
      </div>

      <ul className="mt-6 space-y-3">
        {SAVED_ARTICLES.map((item) => {
          const image = dashboardLinkedItemThumbnail(item);

          return (
            <li key={item.id}>
              <Link
                to={item.to}
                className="dashboard-editorial-card group flex gap-4 rounded-xl border border-transparent p-2 transition-colors motion-fast hover:border-bronze/18 hover:bg-bronze/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-bronze/15">
                  {image ? (
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transform-none"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1 py-0.5">
                  <span className="text-[0.58rem] uppercase tracking-[0.18em] text-bronze/80">
                    GEOlibrary
                  </span>
                  <span className="mt-1 block truncate text-sm text-foreground/85">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-[0.65rem] text-foreground/50">{item.meta}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
