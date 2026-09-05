import { Link } from "@tanstack/react-router";
import { Bookmark, Clock, Eye, Heart } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

import type { Article } from "../data/articles";
import {
  getResourceAccessState,
  isResourceAccessRestricted,
  type ResourceAccessState,
} from "../lib/access-tier";
import { LibraryMediaImage } from "./LibraryMediaImage";
import { LibraryTierBadge } from "./LibraryTierBadge";
import { articleCardImageSrc } from "../data/article-card-images";
import { categoryIcon, categoryLabel, difficultyLabel } from "../data/taxonomy";
import { creatorByHandle } from "../data/creators";
import { usePublishedCreators } from "../hooks/usePublishedCreators";

const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k` : `${n}`);

/**
 * The library's single content card. `grid` is the default poster layout,
 * `list` is the dense row used by bookmarks and collections in list view.
 */
export function LibraryCard({
  article,
  variant = "grid",
  saved = false,
  liked = false,
  progress = 0,
  onToggleBookmark,
  accessState,
  className,
}: {
  article: Article;
  variant?: "grid" | "list";
  saved?: boolean;
  liked?: boolean;
  /** 0–100 reading progress, shown as a hairline under the cover. */
  progress?: number;
  onToggleBookmark?: (slug: string) => void;
  /** When omitted, derived from article tier + caller context is not applied. */
  accessState?: ResourceAccessState;
  className?: string;
}) {
  const Icon = categoryIcon(article.category);
  const { creators } = usePublishedCreators();
  const author = useMemo(() => {
    const live = creators.find((creator) => creator.handle === article.creator);
    return live ?? creatorByHandle(article.creator);
  }, [creators, article.creator]);
  const resolvedAccess =
    accessState ??
    getResourceAccessState(article.minAccessTier, "explorer", !article.minAccessTier);
  const restricted = isResourceAccessRestricted(resolvedAccess);
  const showTierBadge = Boolean(article.minAccessTier);
  const cardImageSrc = articleCardImageSrc(article.slug);

  const meta = (
    <>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-3 w-3" strokeWidth={1.6} aria-hidden="true" />
        {article.minutes} min
      </span>
      <span aria-hidden="true">·</span>
      <span>{difficultyLabel(article.difficulty)}</span>
    </>
  );

  const stats = (
    <div className="flex items-center gap-4 text-[0.68rem] text-foreground/50">
      <span className="inline-flex items-center gap-1.5">
        <Eye className="h-3 w-3" strokeWidth={1.6} aria-hidden="true" />
        <span className="sr-only">Views: </span>
        {compact(article.views)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Heart
          className={cn("h-3 w-3", liked && "fill-bronze text-bronze")}
          strokeWidth={1.6}
          aria-hidden="true"
        />
        <span className="sr-only">Likes: </span>
        {compact(article.likes)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Bookmark className="h-3 w-3" strokeWidth={1.6} aria-hidden="true" />
        <span className="sr-only">Bookmarks: </span>
        {compact(article.bookmarks)}
      </span>
    </div>
  );

  const bookmarkButton = onToggleBookmark ? (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${article.title} from bookmarks` : `Save ${article.title}`}
      onClick={() => onToggleBookmark(article.slug)}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
        saved
          ? "border-bronze/60 bg-bronze/15 text-bronze-glow"
          : "border-bronze/20 text-foreground/50 hover:border-bronze/45 hover:text-bronze",
      )}
    >
      <Bookmark className={cn("h-4 w-4", saved && "fill-current")} strokeWidth={1.6} />
    </button>
  ) : null;

  const titleLink = (
    <Link
      to="/geolibrary/article/$slug"
      params={{ slug: article.slug }}
      className={cn(
        "transition-colors motion-fast hover:text-bronze-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
        restricted && "text-foreground/85",
      )}
    >
      {article.title}
    </Link>
  );

  if (variant === "list") {
    return (
      <article
        className={cn(
          "glass-panel surface-gradient group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl p-4 transition-all motion-base hover:border-bronze/35 sm:flex sm:gap-5",
          restricted && "opacity-90",
          className,
        )}
      >
        <div className="hidden w-28 shrink-0 overflow-hidden rounded-xl sm:block">
          <LibraryMediaImage
            storagePath={article.coverArtKey}
            fallbackArt={article.slug}
            staticImageSrc={cardImageSrc}
            icon={Icon}
            ratio="square"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[0.6rem] uppercase tracking-[0.22em] text-bronze/90">
              {categoryLabel(article.category)}
            </p>
            {showTierBadge && article.minAccessTier ? (
              <LibraryTierBadge
                tier={article.minAccessTier}
                accessState={resolvedAccess}
                showLock={restricted}
              />
            ) : null}
          </div>
          <h3 className="mt-2 truncate text-base font-light tracking-tight text-foreground">
            {titleLink}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.68rem] text-foreground/50">
            {meta}
            {author ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{author.name}</span>
              </>
            ) : null}
          </div>
          <div className="mt-3">{stats}</div>
        </div>
        {bookmarkButton}
      </article>
    );
  }

  return (
    <article
      className={cn(
        "glass-panel surface-gradient group relative flex h-full flex-col overflow-hidden rounded-2xl transition-all motion-base hover:-translate-y-1 hover:border-bronze/40 hover:shadow-[var(--glow-bronze)] motion-reduce:hover:translate-y-0",
        restricted && "opacity-95",
        className,
      )}
    >
      <div className="relative">
        <LibraryMediaImage
          storagePath={article.coverArtKey}
          fallbackArt={article.slug}
          staticImageSrc={cardImageSrc}
          icon={Icon}
        />
        <span className="absolute right-3 top-3 rounded-full border border-bronze/35 bg-[oklch(0.12_0.006_60/0.85)] px-3 py-1 text-[0.58rem] uppercase tracking-[0.2em] text-bronze/85">
          {categoryLabel(article.category)}
        </span>
        {showTierBadge && article.minAccessTier ? (
          <span className="absolute left-3 top-3">
            <LibraryTierBadge
              tier={article.minAccessTier}
              accessState={resolvedAccess}
              showLock={restricted}
            />
          </span>
        ) : null}
        {restricted ? (
          <span
            className="pointer-events-none absolute inset-0 bg-[oklch(0.08_0.004_60/0.35)]"
            aria-hidden
          />
        ) : null}
        {progress > 0 ? (
          <span
            className="absolute inset-x-0 bottom-0 h-0.5 bg-bronze/70"
            style={{ width: `${Math.min(100, progress)}%` }}
            aria-hidden="true"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-[0.68rem] text-foreground/50">
          {meta}
        </div>
        <h3 className="mt-3 text-base font-light leading-snug tracking-tight text-foreground">
          {titleLink}
        </h3>
        <p className="mt-2.5 line-clamp-2 text-[0.8rem] leading-relaxed text-foreground/50">
          {article.dek}
        </p>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-bronze/10 pt-4">
          <div className="min-w-0">
            {author ? (
              <Link
                to="/geolibrary/creators/$handle"
                params={{ handle: author.handle }}
                className="block truncate text-xs text-foreground/60 transition-colors motion-fast hover:text-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
              >
                {author.name}
              </Link>
            ) : null}
            <div className="mt-2">{stats}</div>
          </div>
          {bookmarkButton}
        </div>
      </div>
    </article>
  );
}
