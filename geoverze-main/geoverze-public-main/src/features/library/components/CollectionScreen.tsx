import { getRouteApi } from "@tanstack/react-router";

import { EmptyState, PageHeader, SectionContainer } from "@/components/shared";
import { useLibraryStore } from "@/stores/libraryStore";

import { LibraryCard } from "./LibraryCard";
import { useCollectionBySlug } from "../hooks/usePublishedCollections";

const routeApi = getRouteApi("/geolibrary/collections/$slug");

/** A single curated shelf. */
export function CollectionScreen() {
  const { slug } = routeApi.useParams();
  const { collection, articles, loading, error } = useCollectionBySlug(slug);
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const completed = useLibraryStore((s) => s.completed);
  const progress = useLibraryStore((s) => s.progress);
  const toggleBookmark = useLibraryStore((s) => s.toggleBookmark);

  if (loading) {
    return (
      <SectionContainer>
        <p className="text-sm text-foreground/50">Loading collection…</p>
      </SectionContainer>
    );
  }

  if (error) {
    return (
      <SectionContainer>
        <EmptyState title="Could not load collection" description={error} />
      </SectionContainer>
    );
  }

  if (!collection) {
    return (
      <SectionContainer>
        <EmptyState title="Collection not found" description="This shelf is no longer available." />
      </SectionContainer>
    );
  }

  const done = articles.filter((a) => completed.includes(a.slug)).length;
  const totalMinutes = articles.reduce((sum, article) => sum + article.minutes, 0);

  return (
    <SectionContainer>
      <PageHeader
        eyebrow="Collection"
        title={collection.title}
        description={collection.description}
      />
      <p className="mt-6 text-xs text-foreground/50">
        {articles.length} entries · {totalMinutes} min total · {done} finished
      </p>
      {articles.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="This collection is empty"
            description="Published entries will appear here once they are added to this shelf."
          />
        </div>
      ) : (
        <div className="mb-8 mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <LibraryCard
              key={article.slug}
              article={article}
              saved={bookmarks.includes(article.slug)}
              progress={progress[article.slug] ?? 0}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
      )}
    </SectionContainer>
  );
}
