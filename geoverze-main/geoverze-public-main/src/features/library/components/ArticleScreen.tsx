import { getRouteApi } from "@tanstack/react-router";

import { EmptyState, GeoButton, SectionContainer } from "@/components/shared";
import { useLibraryStore } from "@/stores/libraryStore";

import { ArticleUnavailableScreen } from "./ArticleUnavailableScreen";
import { articleHeadings } from "../data/articles";
import { useArticleBySlug } from "../hooks/useArticleBySlug";
import { useArticleReadingProgress } from "../hooks/useArticleReadingProgress";
import { useStartArticleReading } from "../hooks/useStartArticleReading";
import { useRecordArticleView } from "../hooks/useRecordArticleView";
import { useLibrarySubscriptionTier } from "../hooks/useLibrarySubscriptionTier";
import { usePublishedArticles } from "../hooks/usePublishedArticles";
import { getResourceAccessState } from "../lib/access-tier";
import { ArticleAtlasParchmentScreen } from "./ArticleAtlasParchmentScreen";

const routeApi = getRouteApi("/geolibrary/article/$slug");

/** Reading surface for a single library entry. */
export function ArticleScreen() {
  const { slug } = routeApi.useParams();
  const { pageState, article, loading, error } = useArticleBySlug(slug);
  const { tier, signedIn, authReady } = useLibrarySubscriptionTier();
  const { articles: catalogue } = usePublishedArticles();
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const likes = useLibraryStore((s) => s.likes);
  const progress = useLibraryStore((s) => s.progress);
  const toggleBookmark = useLibraryStore((s) => s.toggleBookmark);
  const toggleLike = useLibraryStore((s) => s.toggleLike);
  const markComplete = useLibraryStore((s) => s.markComplete);
  const completed = useLibraryStore((s) => s.completed.includes(slug));

  const readyArticle = pageState?.status === "ready" ? pageState.article : undefined;
  const contentAccess =
    readyArticle && !loading && authReady
      ? getResourceAccessState(readyArticle.minAccessTier, tier, signedIn)
      : null;
  const canRecordView =
    Boolean(readyArticle?.resourceId) && contentAccess?.kind === "open" && !error && signedIn;

  useRecordArticleView(readyArticle?.resourceId, canRecordView);
  const canStartReading =
    pageState?.status === "ready" &&
    Boolean(article) &&
    !loading &&
    authReady &&
    contentAccess?.kind === "open" &&
    !completed;
  useStartArticleReading(slug, canStartReading);
  const { contentRef } = useArticleReadingProgress(slug, Boolean(article) && !completed);

  if (loading || !authReady) {
    return (
      <SectionContainer className="pt-[calc(var(--nav-height)+1.25rem)] pb-12">
        <p className="text-sm text-foreground/50">Loading entry…</p>
      </SectionContainer>
    );
  }

  if (error) {
    return (
      <SectionContainer className="pt-[calc(var(--nav-height)+1.25rem)] pb-12">
        <EmptyState title="Could not load this entry" description={error} />
      </SectionContainer>
    );
  }

  if (!pageState || pageState.status === "not_found") {
    return <ArticleUnavailableScreen kind="not_found" slug={slug} />;
  }

  if (pageState.status === "restricted") {
    const kind = !signedIn ? "sign_in_required" : "tier_restricted";
    return (
      <ArticleUnavailableScreen
        kind={kind}
        slug={slug}
        requiredTier={pageState.requiredTier}
        title={pageState.title}
      />
    );
  }

  if (!article) {
    return <ArticleUnavailableScreen kind="not_found" slug={slug} />;
  }

  const accessState = getResourceAccessState(article.minAccessTier, tier, signedIn);
  if (accessState.kind === "sign_in_required") {
    return (
      <ArticleUnavailableScreen
        kind="sign_in_required"
        slug={slug}
        requiredTier={accessState.requiredTier}
        title={article.title}
      />
    );
  }
  if (accessState.kind === "tier_insufficient") {
    return (
      <ArticleUnavailableScreen
        kind="tier_restricted"
        slug={slug}
        requiredTier={accessState.requiredTier}
        title={article.title}
      />
    );
  }

  const headings = articleHeadings(article);
  const readPercent = progress[slug] ?? 0;
  return (
    <ArticleAtlasParchmentScreen
      article={article}
      slug={slug}
      headings={headings}
      readPercent={readPercent}
      completed={completed}
      bookmarks={bookmarks}
      likes={likes}
      progress={progress}
      toggleBookmark={toggleBookmark}
      toggleLike={toggleLike}
      markComplete={markComplete}
      contentRef={contentRef}
      catalogue={catalogue}
      signedIn={signedIn}
      subscriptionTier={tier}
    />
  );
}
