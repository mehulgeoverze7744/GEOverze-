import { Link } from "@tanstack/react-router";

import { EmptyState, GeoButton, PageHeader, SectionContainer } from "@/components/shared";
import { useLibraryStore } from "@/stores/libraryStore";

import { LibraryMediaImage } from "./LibraryMediaImage";
import { LibraryTierBadge } from "./LibraryTierBadge";
import { articleCardImageSrc } from "../data/article-card-images";
import type { Article } from "../data/articles";
import { categoryIcon, categoryLabel } from "../data/taxonomy";
import { useLibraryProgressEntries } from "../hooks/useLibraryProgressEntries";
import { useLibrarySubscriptionTier } from "../hooks/useLibrarySubscriptionTier";
import { usePublishedArticles } from "../hooks/usePublishedArticles";
import { usePublishedCollections } from "../hooks/usePublishedCollections";
import { getResourceAccessState, type LibraryAccessTier } from "../lib/access-tier";

function ProgressArticleRow({
  slug,
  percent,
  article,
  actionLabel,
  tier,
  signedIn,
}: {
  slug: string;
  percent: number;
  article: Article;
  actionLabel: string;
  tier: LibraryAccessTier;
  signedIn: boolean;
}) {
  const accessState = getResourceAccessState(article.minAccessTier, tier, signedIn);
  const Icon = categoryIcon(article.category);

  return (
    <article className="glass-panel surface-gradient grid gap-4 rounded-2xl p-4 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center sm:gap-5">
      <div className="overflow-hidden rounded-xl">
        <LibraryMediaImage
          storagePath={article.coverArtKey}
          fallbackArt={article.slug}
          staticImageSrc={articleCardImageSrc(article.slug)}
          icon={Icon}
          ratio="square"
        />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[0.6rem] uppercase tracking-[0.22em] text-bronze/90">
            {categoryLabel(article.category)}
          </p>
          {article.minAccessTier ? (
            <LibraryTierBadge tier={article.minAccessTier} accessState={accessState} showLock />
          ) : null}
        </div>
        <h3 className="mt-2 text-base font-light tracking-tight text-foreground">
          <Link
            to="/geolibrary/article/$slug"
            params={{ slug }}
            className="transition-colors motion-fast hover:text-bronze-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
          >
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-[0.8rem] leading-relaxed text-foreground/50">
          {article.dek}
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3 text-[0.65rem] uppercase tracking-[0.18em] text-foreground/45">
            <span>{percent >= 100 ? "Completed" : "Reading progress"}</span>
            <span>{percent}%</span>
          </div>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-[oklch(0.2_0.008_60/0.7)]"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${article.title} reading progress`}
          >
            <span className="block h-full bg-bronze/70" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
      <GeoButton asChild variant="ghost" className="w-full sm:w-auto">
        <Link to="/geolibrary/article/$slug" params={{ slug }}>
          {actionLabel}
        </Link>
      </GeoButton>
    </article>
  );
}

/** Reading progress across entries and collections. */
export function LibraryProgressScreen() {
  const completedSlugs = useLibraryStore((s) => s.completed);
  const progress = useLibraryStore((s) => s.progress);
  const { articles } = usePublishedArticles();
  const { collections } = usePublishedCollections();
  const { inProgress, completed, loading, error } = useLibraryProgressEntries();
  const { tier, signedIn } = useLibrarySubscriptionTier();

  const resolveArticle = (slug: string) => articles.find((a) => a.slug === slug);

  const minutes = completedSlugs.reduce(
    (total, slug) => total + (resolveArticle(slug)?.minutes ?? 0),
    0,
  );
  const inProgressCount = Object.keys(progress).filter(
    (slug) => (progress[slug] ?? 0) > 0 && !completedSlugs.includes(slug),
  ).length;

  const stats = [
    { label: "Entries finished", value: `${completedSlugs.length} / ${articles.length}` },
    { label: "Minutes read", value: `${minutes}` },
    { label: "In progress", value: `${inProgressCount}` },
  ];

  if (error) {
    return (
      <SectionContainer>
        <EmptyState title="Could not load reading progress" description={error} />
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <PageHeader
        eyebrow="GEOlibrary"
        title="Learning progress"
        description="Pick up where you left off and track how far you are through each collection."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-panel surface-gradient rounded-2xl p-6">
            <p className="text-2xl font-light text-bronze-glow">{stat.value}</p>
            <p className="mt-1 text-[0.68rem] uppercase tracking-[0.22em] text-foreground/50">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-16 text-lg font-light tracking-tight text-foreground">Continue reading</h2>
      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-foreground/50">Loading your reading list…</p>
        ) : inProgress.length === 0 ? (
          <EmptyState
            title="Nothing in progress"
            description="Start reading an entry and your progress will appear here."
          />
        ) : (
          inProgress.map((entry) => (
            <ProgressArticleRow
              key={entry.slug}
              slug={entry.slug}
              percent={entry.percent}
              article={entry.article}
              actionLabel="Continue reading"
              tier={tier}
              signedIn={signedIn}
            />
          ))
        )}
      </div>

      {completed.length > 0 ? (
        <>
          <h2 className="mt-16 text-lg font-light tracking-tight text-foreground">Completed</h2>
          <div className="mt-6 space-y-4">
            {completed.map((entry) => (
              <ProgressArticleRow
                key={entry.slug}
                slug={entry.slug}
                percent={entry.percent}
                article={entry.article}
                actionLabel="Read again"
                tier={tier}
                signedIn={signedIn}
              />
            ))}
          </div>
        </>
      ) : null}

      <h2 className="mt-16 text-lg font-light tracking-tight text-foreground">Collections</h2>
      <div className="mb-8 mt-6 space-y-4">
        {collections.map((collection) => {
          const collectionArticleSlugs = collection.articles;
          const done = collectionArticleSlugs.filter((slug) =>
            completedSlugs.includes(slug),
          ).length;
          const percent =
            collectionArticleSlugs.length === 0
              ? 0
              : Math.round((done / collectionArticleSlugs.length) * 100);
          return (
            <div key={collection.slug} className="glass-panel surface-gradient rounded-2xl p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="min-w-0 truncate text-sm text-foreground/80">{collection.title}</p>
                <p className="shrink-0 text-xs text-foreground/50">
                  {done} / {collectionArticleSlugs.length}
                </p>
              </div>
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-[oklch(0.2_0.008_60/0.7)]"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${collection.title} progress`}
              >
                <span className="block h-full bg-bronze/70" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </SectionContainer>
  );
}
