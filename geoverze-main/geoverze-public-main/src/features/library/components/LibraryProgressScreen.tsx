import { PageHeader, SectionContainer } from "@/components/shared";
import { useLibraryStore } from "@/stores/libraryStore";

import { articleBySlug } from "../data/articles";
import { usePublishedArticles } from "../hooks/usePublishedArticles";
import { usePublishedCollections } from "../hooks/usePublishedCollections";

/** Reading progress across entries and collections. */
export function LibraryProgressScreen() {
  const completed = useLibraryStore((s) => s.completed);
  const progress = useLibraryStore((s) => s.progress);
  const { articles } = usePublishedArticles();
  const { collections } = usePublishedCollections();

  const resolveArticle = (slug: string) =>
    articles.find((a) => a.slug === slug) ?? articleBySlug(slug);

  const minutes = completed.reduce(
    (total, slug) => total + (resolveArticle(slug)?.minutes ?? 0),
    0,
  );
  const inProgress = Object.keys(progress).filter(
    (slug) => (progress[slug] ?? 0) > 0 && !completed.includes(slug),
  ).length;

  const stats = [
    { label: "Entries finished", value: `${completed.length} / ${articles.length}` },
    { label: "Minutes read", value: `${minutes}` },
    { label: "In progress", value: `${inProgress}` },
  ];

  return (
    <SectionContainer>
      <PageHeader
        eyebrow="GEOlibrary"
        title="Learning progress"
        description="How far you are through the library, collection by collection."
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

      <h2 className="mt-16 text-lg font-light tracking-tight text-foreground">Collections</h2>
      <div className="mb-8 mt-6 space-y-4">
        {collections.map((collection) => {
          const collectionArticleSlugs = collection.articles;
          const done = collectionArticleSlugs.filter((slug) => completed.includes(slug)).length;
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
