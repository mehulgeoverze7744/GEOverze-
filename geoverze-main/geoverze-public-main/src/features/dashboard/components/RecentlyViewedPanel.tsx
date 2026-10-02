import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";

import { articleCardImageSrc } from "@/features/library/data/article-card-images";
import { categoryLabel } from "@/features/library/data/taxonomy";
import { usePublishedArticles } from "@/features/library/hooks/usePublishedArticles";
import { CONTINUE_READING_MIN_PERCENT } from "@/features/library/lib/article-reading-progress";
import { useLibraryStore } from "@/stores/libraryStore";
import { cn } from "@/lib/utils";

/** Recently accessed GEOlibrary articles from real reading progress. */
export function RecentlyViewedPanel({ className }: { className?: string }) {
  const progress = useLibraryStore((s) => s.progress);
  const progressReadAt = useLibraryStore((s) => s.progressReadAt);
  const { articles, loading } = usePublishedArticles();

  const recent = Object.entries(progress)
    .filter(([, percent]) => percent >= CONTINUE_READING_MIN_PERCENT)
    .sort((a, b) => (progressReadAt[b[0]] ?? 0) - (progressReadAt[a[0]] ?? 0))
    .slice(0, 3)
    .flatMap(([slug, percent]) => {
      const article = articles.find((item) => item.slug === slug);
      if (!article) return [];
      return [{ article, percent }];
    });

  return (
    <section
      className={cn(
        "rounded-2xl border border-bronze/16 bg-charcoal/30 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="recently-viewed-heading"
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id="recently-viewed-heading"
          className="dashboard-section-label flex items-center gap-2"
        >
          <Eye className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.5} aria-hidden="true" />
          Recently viewed
        </h2>
        <Link
          to="/geolibrary"
          className="text-[0.62rem] uppercase tracking-[0.2em] text-bronze/90 transition-colors hover:text-bronze"
        >
          All
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-foreground/50">Loading reading history…</p>
      ) : recent.length === 0 ? (
        <p className="mt-6 text-sm leading-relaxed text-foreground/50">
          Articles you open in GEOlibrary will collect here.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {recent.map(({ article, percent }) => (
            <li key={article.slug}>
              <Link
                to="/geolibrary/article/$slug"
                params={{ slug: article.slug }}
                className="dashboard-editorial-card group flex gap-4 rounded-xl border border-transparent p-2 transition-colors motion-fast hover:border-bronze/18 hover:bg-bronze/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-bronze/15">
                  <img
                    src={articleCardImageSrc(article.slug)}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transform-none"
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="min-w-0 flex-1 py-0.5">
                  <span className="text-[0.58rem] uppercase tracking-[0.18em] text-bronze/80">
                    {categoryLabel(article.category)}
                  </span>
                  <span className="mt-1 block truncate text-sm text-foreground/85">
                    {article.title}
                  </span>
                  <span className="mt-1 block text-[0.65rem] text-foreground/50">
                    {percent}% read · {article.minutes} min
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
