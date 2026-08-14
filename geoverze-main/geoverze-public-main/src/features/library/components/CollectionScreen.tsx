import { getRouteApi } from "@tanstack/react-router";

import { EmptyState, PageHeader, SectionContainer } from "@/components/shared";
import { useLibraryStore } from "@/stores/libraryStore";

import { LibraryCard } from "./LibraryCard";
import { collectionArticles, collectionBySlug, collectionMinutes } from "../data/collections";

const routeApi = getRouteApi("/geolibrary/collections/$slug");

/** A single curated shelf. */
export function CollectionScreen() {
  const { slug } = routeApi.useParams();
  const collection = collectionBySlug(slug);
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const completed = useLibraryStore((s) => s.completed);
  const progress = useLibraryStore((s) => s.progress);
  const toggleBookmark = useLibraryStore((s) => s.toggleBookmark);

  if (!collection) {
    return (
      <SectionContainer>
        <EmptyState title="Collection not found" description="This shelf is no longer available." />
      </SectionContainer>
    );
  }

  const articles = collectionArticles(collection);
  const done = articles.filter((a) => completed.includes(a.slug)).length;

  return (
    <SectionContainer>
      <PageHeader
        eyebrow="Collection"
        title={collection.title}
        description={collection.description}
      />
      <p className="mt-6 text-xs text-foreground/50">
        {articles.length} entries · {collectionMinutes(collection)} min total · {done} finished
      </p>
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
    </SectionContainer>
  );
}
