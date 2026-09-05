import { Link } from "@tanstack/react-router";
import { ArrowRight, Bookmark } from "lucide-react";

import { CoverArt } from "@/features/play/components/CoverArt";
import { QUIZ_CATEGORIES } from "@/features/play/data/categories";
import type { SavedBookmark } from "@/features/profile/data/bookmarks";
import { cn } from "@/lib/utils";

const QUIZ_ICONS = new Map(QUIZ_CATEGORIES.map((c) => [c.id, c.icon]));

type BookmarkCardProps = {
  item: SavedBookmark;
  onRemove: () => void;
  className?: string;
};

/** Premium saved-item card for the bookmarks library. */
export function BookmarkCard({ item, onRemove, className }: BookmarkCardProps) {
  const showImage = Boolean(item.imageSrc) || item.kind === "quizzes";
  const quizIcon =
    item.kind === "quizzes" && item.categoryId
      ? QUIZ_ICONS.get(item.categoryId)
      : undefined;

  return (
    <article
      className={cn(
        "bookmark-card group relative flex h-full flex-col overflow-hidden rounded-[1.125rem] border border-bronze/14 bg-charcoal/45 backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-200 motion-reduce:transition-none",
        "hover:-translate-y-0.5 hover:border-bronze/28 hover:shadow-[0_12px_40px_rgba(0,0,0,0.35),0_0_0_1px_rgba(198,169,118,0.08)]",
        "motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      {showImage ? (
        <div className="relative border-b border-bronze/10">
          {item.imageSrc ? (
            <div className="aspect-[16/10] overflow-hidden bg-[oklch(0.12_0.006_62)]">
              <img
                src={item.imageSrc}
                alt={item.imageAlt ?? ""}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none"
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : item.art ? (
            <CoverArt art={item.art} icon={quizIcon} ratio="video" className="rounded-none" />
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <p className="bookmark-card-type">
              <span>{item.typeLabel}</span>
              <span className="text-foreground/20" aria-hidden="true">
                ·
              </span>
              <span className="text-bronze/85">{item.category}</span>
            </p>
            <h2 className="text-[0.95rem] font-medium leading-snug tracking-tight text-foreground/92">
              {item.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onRemove();
            }}
            aria-label={`Remove ${item.title} from bookmarks`}
            className="bookmark-card-remove shrink-0"
          >
            <Bookmark className="h-3.5 w-3.5" strokeWidth={1.75} fill="currentColor" aria-hidden="true" />
          </button>
        </div>

        {item.description ? (
          <p className="mt-2.5 line-clamp-2 flex-1 text-xs leading-relaxed text-foreground/48">
            {item.description}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-bronze/10 pt-3.5">
          <span className="text-[0.62rem] uppercase tracking-[0.16em] text-foreground/42">
            {item.meta}
          </span>
          <Link
            to={item.to}
            {...(item.params ? { params: item.params } : {})}
            {...(item.search ? { search: item.search } : {})}
            className="inline-flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-bronze/90 transition-colors hover:text-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45"
          >
            {item.actionLabel}
            <ArrowRight className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
