import { getRouteApi } from "@tanstack/react-router";

import { EmptyState, PageHeader, SectionContainer } from "@/components/shared";
import { useLibraryStore } from "@/stores/libraryStore";

import { LibraryCard } from "./LibraryCard";
import { creatorByHandle } from "../data/creators";
import { articlesByCreator } from "../lib/filter";

const routeApi = getRouteApi("/geolibrary/creators/$handle");

/** Creator profile with their published entries. */
export function CreatorScreen() {
  const { handle } = routeApi.useParams();
  const creator = creatorByHandle(handle);
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const toggleBookmark = useLibraryStore((s) => s.toggleBookmark);

  if (!creator) {
    return (
      <SectionContainer>
        <EmptyState title="Creator not found" description="This profile is no longer available." />
      </SectionContainer>
    );
  }

  const articles = articlesByCreator(creator.handle);

  return (
    <SectionContainer>
      <PageHeader eyebrow={creator.role} title={creator.name} description={creator.bio} />
      <p className="mt-6 text-xs text-foreground/50">
        {creator.followers.toLocaleString()} followers · {creator.likes.toLocaleString()} likes ·
        joined {creator.joinedAt}
      </p>
      <h2 className="mt-12 text-lg font-light tracking-tight text-foreground">Published entries</h2>
      <div className="mb-8 mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <LibraryCard
            key={article.slug}
            article={article}
            saved={bookmarks.includes(article.slug)}
            onToggleBookmark={toggleBookmark}
          />
        ))}
      </div>
    </SectionContainer>
  );
}
