import { Link } from "@tanstack/react-router";
import { ArrowRight, Bookmark, Clock, Eye, Heart } from "lucide-react";
import { useMemo, type ReactNode } from "react";

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
import {
  libraryRailCardClass,
  libraryRailContinueReadingCardClass,
  libraryRailMediaClass,
} from "../lib/library-rail-layout";

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
  inRail = false,
  continueReading = false,
  headerAction,
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
  /** Marks card as a horizontal rail item with fixed width. */
  inRail?: boolean;
  /** Continue Reading rail — show percent label, bar, and resume CTA. */
  continueReading?: boolean;
  headerAction?: ReactNode;
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

  const articleTo = "/geolibrary/article/$slug" as const;
  const articleParams = { slug: article.slug };

  const bookmarkButton = onToggleBookmark ? (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${article.title} from bookmarks` : `Save ${article.title}`}
      onClick={(event) => {
        event.stopPropagation();
        onToggleBookmark(article.slug);
      }}
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

  const cardTitle = (
    <span
      className={cn(!restricted && "transition-colors motion-fast group-hover:text-bronze-glow")}
    >
      {article.title}
    </span>
  );

  if (variant === "list") {
    return (
      <article
        className={cn(
          "glass-panel surface-gradient group relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl p-4 transition-all motion-base hover:border-bronze/35 sm:flex sm:gap-5",
          restricted && "opacity-90",
          !restricted && "cursor-pointer",
          className,
        )}
      >
        {!restricted ? (
          <Link
            to={articleTo}
            params={articleParams}
            aria-label={`Open ${article.title}`}
            className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
          />
        ) : null}
        <div className="pointer-events-none relative z-[1] hidden w-28 shrink-0 overflow-hidden rounded-xl sm:block">
          <LibraryMediaImage
            storagePath={article.coverArtKey}
            fallbackArt={article.slug}
            staticImageSrc={cardImageSrc}
            icon={Icon}
            ratio="square"
          />
        </div>
        <div className="pointer-events-none relative z-[1] min-w-0 flex-1">
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
            {cardTitle}
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
        {bookmarkButton ? <div className="relative z-[2]">{bookmarkButton}</div> : null}
      </article>
    );
  }

  const railCardClass =
    inRail && continueReading ? libraryRailContinueReadingCardClass : libraryRailCardClass;

  return (
    <article
      {...(inRail ? { "data-rail-item": true } : {})}
      className={cn(
        "glass-panel surface-gradient group relative flex flex-col rounded-2xl transition-all motion-base",
        restricted
          ? "opacity-95"
          : "cursor-pointer hover:-translate-y-1 hover:border-bronze/40 hover:shadow-[var(--glow-bronze)] motion-reduce:hover:translate-y-0",
        inRail && railCardClass,
        className,
      )}
    >
      {!restricted ? (
        <Link
          to={articleTo}
          params={articleParams}
          aria-label={`Open ${article.title}`}
          className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
        />
      ) : null}
      <div
        className={cn(
          "pointer-events-none relative z-[1] overflow-hidden rounded-t-2xl",
          inRail && libraryRailMediaClass,
        )}
      >
        <LibraryMediaImage
          storagePath={article.coverArtKey}
          fallbackArt={article.slug}
          staticImageSrc={cardImageSrc}
          icon={Icon}
          ratio="video"
          fit="cover"
          className="h-full w-full"
        />
        <span className="absolute right-3 top-3 rounded-full border border-bronze/35 bg-[oklch(0.12_0.006_60/0.85)] px-3 py-1 text-[0.58rem] uppercase tracking-[0.2em] text-bronze/85">
          {categoryLabel(article.category)}
        </span>
        {headerAction ? (
          <div className="pointer-events-auto absolute left-3 top-3 z-20">{headerAction}</div>
        ) : null}
        {showTierBadge && article.minAccessTier ? (
          <span className={cn("absolute top-3", headerAction ? "left-12" : "left-3")}>
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

      <div
        className={cn(
          "pointer-events-none relative z-[1] flex flex-col px-5 pb-4 pt-4",
          continueReading ? "shrink-0" : "min-h-0 flex-1",
        )}
      >
        <div className="flex flex-wrap items-center gap-2 text-[0.68rem] text-foreground/50">
          {meta}
        </div>
        <h3
          className={cn(
            "line-clamp-2 text-base font-light leading-snug tracking-tight text-foreground",
            continueReading ? "mt-3" : "mt-2.5",
          )}
        >
          {cardTitle}
        </h3>
        {!continueReading ? (
          <p
            className={cn(
              "mt-2.5 line-clamp-2 text-[0.8rem] leading-relaxed text-foreground/50",
              inRail ? "shrink-0" : "flex-1",
            )}
          >
            {article.dek}
          </p>
        ) : null}

        {continueReading && progress > 0 ? (
          <div className="mt-4 space-y-1.5">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-bronze/90">
              {Math.round(progress)}% read
            </p>
            <div
              className="h-1 overflow-hidden rounded-full bg-charcoal/50"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Reading progress for ${article.title}`}
            >
              <span
                className="block h-full rounded-full bg-gradient-to-r from-bronze/80 to-bronze-glow/90 transition-[width] motion-base"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          </div>
        ) : null}

        {continueReading ? (
          <div className="mt-5 border-t border-bronze/10 pt-3">
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex min-w-0 items-center gap-1.5 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-bronze-glow">
                Continue reading
                <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
              </p>
              {bookmarkButton ? (
                <div className="pointer-events-auto relative z-[2] shrink-0">{bookmarkButton}</div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mt-auto shrink-0 border-t border-bronze/10 pt-4">
            <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              {author ? (
                restricted ? (
                  <span className="block truncate text-xs text-foreground/60">{author.name}</span>
                ) : (
                  <Link
                    to="/geolibrary/creators/$handle"
                    params={{ handle: author.handle }}
                    onClick={(event) => event.stopPropagation()}
                    className="pointer-events-auto relative z-[2] block truncate text-xs text-foreground/60 transition-colors motion-fast hover:text-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
                  >
                    {author.name}
                  </Link>
                )
              ) : null}
              <div className="mt-2">{stats}</div>
            </div>
            {bookmarkButton ? (
              <div className="pointer-events-auto relative z-[2] shrink-0">{bookmarkButton}</div>
            ) : null}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
