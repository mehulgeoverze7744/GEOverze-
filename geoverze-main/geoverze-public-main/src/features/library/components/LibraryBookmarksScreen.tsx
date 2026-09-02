import { Link } from "@tanstack/react-router";

import { EmptyState, PageHeader, SectionContainer } from "@/components/shared";
import { useLibraryStore } from "@/stores/libraryStore";

import { LibraryCard } from "./LibraryCard";
import { usePublishedArticles } from "../hooks/usePublishedArticles";
import { useLibrarySubscriptionTier } from "../hooks/useLibrarySubscriptionTier";
import { getResourceAccessState } from "../lib/access-tier";

/** Saved reading list. */
export function LibraryBookmarksScreen() {
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const progress = useLibraryStore((s) => s.progress);
  const toggleBookmark = useLibraryStore((s) => s.toggleBookmark);
  const { tier, signedIn } = useLibrarySubscriptionTier();
  const { articles } = usePublishedArticles();

  const saved = bookmarks
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <SectionContainer>
      <PageHeader
        eyebrow="GEOlibrary"
        title="Saved reading"
        description="Everything you bookmarked, ready to pick up again."
      />
      {saved.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Nothing saved yet"
            description="Bookmark an entry while reading and it will wait for you here."
          />
          <Link
            to="/geolibrary/browse"
            search={{
              q: "",
              continent: "all",
              difficulty: "all",
              time: "all",
              category: "all",
              sort: "popular",
              saved: false,
              view: "grid",
            }}
            className="mt-4 inline-block text-xs text-bronze hover:text-bronze-glow"
          >
            Browse the library
          </Link>
        </div>
      ) : (
        <div className="mb-8 mt-10 space-y-4">
          {saved.map((article) => (
            <LibraryCard
              key={article.slug}
              article={article}
              variant="list"
              saved
              progress={progress[article.slug] ?? 0}
              onToggleBookmark={toggleBookmark}
              accessState={getResourceAccessState(article.minAccessTier, tier, signedIn)}
            />
          ))}
        </div>
      )}
    </SectionContainer>
  );
}
