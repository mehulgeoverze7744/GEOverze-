import { useLibraryStore } from "@/stores/libraryStore";

import { useContinueReadingArticles } from "../hooks/useContinueReadingArticles";
import { useLibrarySubscriptionTier } from "../hooks/useLibrarySubscriptionTier";
import { getResourceAccessState } from "../lib/access-tier";
import { ContinueReadingCardMenu } from "./ContinueReadingCardMenu";
import { LibraryCard } from "./LibraryCard";
import { LibraryHorizontalRail } from "./LibraryHorizontalRail";

type ContinueReadingSectionProps = {
  catalogue: readonly Article[];
};

/** Continue Reading rail — between Browse by Category and Trending Now. */
export function ContinueReadingSection({ catalogue }: ContinueReadingSectionProps) {
  const { status, articles } = useContinueReadingArticles(catalogue);
  const progress = useLibraryStore((s) => s.progress);
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const toggleBookmark = useLibraryStore((s) => s.toggleBookmark);
  const dismissFromContinueReading = useLibraryStore((s) => s.dismissFromContinueReading);
  const { tier, signedIn } = useLibrarySubscriptionTier();

  if (status === "loading" || status === "empty" || articles.length === 0) {
    return null;
  }

  return (
    <LibraryHorizontalRail title="Continue reading" description="Pick up where you left off.">
      {articles.map((article) => (
        <LibraryCard
          key={article.slug}
          article={article}
          inRail
          continueReading
          progress={progress[article.slug] ?? 0}
          saved={bookmarks.includes(article.slug)}
          onToggleBookmark={toggleBookmark}
          accessState={getResourceAccessState(article.minAccessTier, tier, signedIn)}
          headerAction={
            <ContinueReadingCardMenu
              articleTitle={article.title}
              onRemove={() => dismissFromContinueReading(article.slug)}
            />
          }
        />
      ))}
    </LibraryHorizontalRail>
  );
}
