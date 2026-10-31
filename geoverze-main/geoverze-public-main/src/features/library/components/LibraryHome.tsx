import { ArrowRight } from "lucide-react";
import { useMemo } from "react";

import { AnimatedSection, EmptyState, GeoButton, SectionContainer } from "@/components/shared";

import { useLibraryStore } from "@/stores/libraryStore";

import { ContinueReadingSection } from "./ContinueReadingSection";
import { LibraryCard } from "./LibraryCard";
import { LibraryCategoryRail } from "./LibraryCategoryRail";
import { LibraryCollectionCard } from "./LibraryCollectionCard";
import { LibraryGeoPageBackground } from "./LibraryGeoPageBackground";
import { LibraryHero } from "./LibraryHero";
import { LibraryHorizontalRail } from "./LibraryHorizontalRail";
import { usePublishedArticles } from "../hooks/usePublishedArticles";
import { usePublishedCollections } from "../hooks/usePublishedCollections";
import { useLibrarySubscriptionTier } from "../hooks/useLibrarySubscriptionTier";
import { getResourceAccessState } from "../lib/access-tier";
import { sortFeaturedCollectionsByTopic } from "../lib/library-featured-collections";
import { trendingArticles } from "../lib/filter";
import "../styles/library-home-light.css";

const trendingBrowseSearch = {
  q: "",
  continent: "all" as const,
  difficulty: "all" as const,
  time: "all" as const,
  category: "all" as const,
  sort: "trending" as const,
  saved: false,
  page: 1,
  pageSize: 12,
  view: "grid" as const,
};

/** GVRZE Library home: hero, categories, continue reading, trending, featured collections. */
export function LibraryHome() {
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const toggleBookmark = useLibraryStore((s) => s.toggleBookmark);
  const { tier, signedIn } = useLibrarySubscriptionTier();

  const { articles, error: articlesError } = usePublishedArticles();
  const { collections } = usePublishedCollections();

  const trending = useMemo(() => trendingArticles(articles.length, articles), [articles]);
  const featured = useMemo(() => sortFeaturedCollectionsByTopic(collections), [collections]);

  if (articlesError) {
    return (
      <div id="gvrze-library-home">
        <LibraryGeoPageBackground />
        <div className="gvrze-library-home__content">
          <SectionContainer>
            <EmptyState title="GVRZE Library is unavailable" description={articlesError} />
          </SectionContainer>
        </div>
      </div>
    );
  }

  return (
    <div id="gvrze-library-home">
      <LibraryGeoPageBackground />
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <LibraryHero bookmarkCount={bookmarks.length} />

      {/* ── Content sections sit on the icy cartographic plate ───────────── */}
      <div className="gvrze-library-home__content">
        <SectionContainer className="min-w-0 pt-10 pb-4">
          {/* Browse by Category / Explore by Subject */}
          <LibraryCategoryRail className="" />

          {/* Continue Reading — only when user has active progress */}
          <ContinueReadingSection catalogue={articles} />

          {/* Trending Now */}
          <LibraryHorizontalRail
            title="Trending now"
            viewAllTo="/geolibrary/browse"
            viewAllSearch={trendingBrowseSearch}
          >
            {trending.map((article) => (
              <LibraryCard
                key={article.slug}
                article={article}
                inRail
                saved={bookmarks.includes(article.slug)}
                onToggleBookmark={toggleBookmark}
                accessState={getResourceAccessState(article.minAccessTier, tier, signedIn)}
              />
            ))}
          </LibraryHorizontalRail>

          {/* Featured Collections */}
          <LibraryHorizontalRail title="Featured collections" viewAllTo="/geolibrary/collections">
            {featured.map((collection) => (
              <LibraryCollectionCard key={collection.slug} collection={collection} />
            ))}
          </LibraryHorizontalRail>

          {/* Meet the Creators callout */}
          <AnimatedSection className="mt-16 mb-8">
            <div className="gvrze-library-studio group relative overflow-hidden rounded-2xl p-6 transition-all motion-base sm:p-8">
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-xl">
                  <p className="gvrze-library-studio__eyebrow text-[0.62rem] font-semibold uppercase tracking-[0.24em]">
                    Behind every entry
                  </p>
                  <h2 className="gvrze-library-studio__title mt-2 text-xl font-light tracking-tight sm:text-2xl">
                    GVRZE Studio
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed">
                    The official editorial team behind GVRZE Library, creating and curating geography
                    articles, maps, cultural insights, and educational resources.
                  </p>
                </div>

                <GeoButton
                  type="button"
                  variant="ghost"
                  disabled
                  className="gvrze-library-studio__cta group/btn shrink-0 px-5 disabled:opacity-100"
                >
                  View creator
                  <ArrowRight
                    className="ml-2 h-4 w-4 transition-transform motion-fast group-hover/btn:translate-x-0.5"
                    strokeWidth={1.8}
                    aria-hidden
                  />
                </GeoButton>
              </div>
            </div>
          </AnimatedSection>
        </SectionContainer>
      </div>
    </div>
  );
}
