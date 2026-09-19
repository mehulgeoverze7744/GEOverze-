import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";

import {
  AnimatedSection,
  EmptyState,
  GeoButton,
  SectionContainer,
} from "@/components/shared";

import { useLibraryStore } from "@/stores/libraryStore";

import { ContinueReadingSection } from "./ContinueReadingSection";
import { LibraryCard } from "./LibraryCard";
import { LibraryCategoryRail } from "./LibraryCategoryRail";
import { LibraryCollectionCard } from "./LibraryCollectionCard";
import { LibraryHero } from "./LibraryHero";
import { LibraryHorizontalRail } from "./LibraryHorizontalRail";
import { usePublishedArticles } from "../hooks/usePublishedArticles";
import { usePublishedCollections } from "../hooks/usePublishedCollections";
import { useLibrarySubscriptionTier } from "../hooks/useLibrarySubscriptionTier";
import { getResourceAccessState } from "../lib/access-tier";
import { sortFeaturedCollectionsByTopic } from "../lib/library-featured-collections";
import { trendingArticles } from "../lib/filter";

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

/** GEOlibrary home: hero, categories, continue reading, trending, featured collections. */
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
      <SectionContainer>
        <EmptyState title="GEOlibrary is unavailable" description={articlesError} />
      </SectionContainer>
    );
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <LibraryHero bookmarkCount={bookmarks.length} />

      {/* ── Content sections (starfield background continues here) ───────── */}
      <SectionContainer className="pt-10 pb-4">
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
          <div className="group relative overflow-hidden rounded-2xl border border-bronze/25 bg-charcoal/40 p-6 transition-all motion-base hover:border-bronze/45 hover:shadow-[var(--glow-bronze)] sm:p-8">
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-bronze/10 blur-3xl transition-opacity motion-base opacity-60 group-hover:opacity-100"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.72_0.08_65/0.08),transparent_55%)]"
              aria-hidden
            />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-bronze/85">
                  Behind every entry
                </p>
                <h2 className="mt-2 text-xl font-light tracking-tight text-foreground sm:text-2xl">
                  Meet the creators
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground/55">
                  Cartographers, writers and researchers shaping GEOlibrary — explore their
                  profiles, specialties and latest work.
                </p>
              </div>

              <GeoButton
                asChild
                variant="ghost"
                className="group/btn shrink-0 border border-bronze/30 bg-bronze/8 px-5 hover:border-bronze/55 hover:bg-bronze/14"
              >
                <Link to="/geolibrary/creators">
                  View creators
                  <ArrowRight
                    className="ml-2 h-4 w-4 transition-transform motion-fast group-hover/btn:translate-x-0.5"
                    strokeWidth={1.8}
                    aria-hidden
                  />
                </Link>
              </GeoButton>
            </div>
          </div>
        </AnimatedSection>
      </SectionContainer>
    </>
  );
}
