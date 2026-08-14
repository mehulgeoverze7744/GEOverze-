import { Link } from "@tanstack/react-router";
import { BookOpen, Compass, Library, Users } from "lucide-react";

import { AnimatedSection, GeoButton, PageHeader, SectionContainer } from "@/components/shared";
import { CoverArt } from "@/features/play/components/CoverArt";
import { useLibraryStore } from "@/stores/libraryStore";

import { LibraryCard } from "./LibraryCard";
import { ARTICLES, articleBySlug } from "../data/articles";
import { COLLECTIONS } from "../data/collections";
import { CREATORS } from "../data/creators";
import { CATEGORIES } from "../data/taxonomy";
import { recentArticles, recommendedArticles, trendingArticles } from "../lib/filter";

function Rail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <AnimatedSection className="mt-16">
      <h2 className="text-lg font-light tracking-tight text-foreground">{title}</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </AnimatedSection>
  );
}

/** GEOlibrary home: hero, continue reading, collections, trending and creators. */
export function LibraryHome() {
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const progress = useLibraryStore((s) => s.progress);
  const toggleBookmark = useLibraryStore((s) => s.toggleBookmark);

  const continueReading = Object.keys(progress)
    .filter((slug) => (progress[slug] ?? 0) > 0 && (progress[slug] ?? 0) < 100)
    .map(articleBySlug)
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .slice(0, 3);

  const featured = COLLECTIONS.filter((c) => c.featured).slice(0, 3);

  return (
    <SectionContainer>
      <PageHeader
        eyebrow="GEOlibrary"
        title="Know Earth, one entry at a time"
        description="The knowledge centre of GEOverze. Read, save and revisit the geography behind every quiz — written by cartographers, not scraped."
      />

      <div className="mt-8 flex flex-wrap gap-3">
        <GeoButton asChild>
          <Link to="/geolibrary/browse">
            <Compass className="mr-2 h-4 w-4" /> Browse everything
          </Link>
        </GeoButton>
        <GeoButton asChild variant="ghost">
          <Link to="/geolibrary/collections">
            <Library className="mr-2 h-4 w-4" /> Collections
          </Link>
        </GeoButton>
        <GeoButton asChild variant="ghost">
          <Link to="/geolibrary/bookmarks">
            <BookOpen className="mr-2 h-4 w-4" /> Saved ({bookmarks.length})
          </Link>
        </GeoButton>
      </div>

      <AnimatedSection className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Entries", value: ARTICLES.length },
          { label: "Collections", value: COLLECTIONS.length },
          { label: "Creators", value: CREATORS.length },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel surface-gradient rounded-2xl p-6">
            <p className="text-2xl font-light text-bronze-glow">{stat.value}</p>
            <p className="mt-1 text-[0.68rem] uppercase tracking-[0.22em] text-foreground/50">
              {stat.label}
            </p>
          </div>
        ))}
      </AnimatedSection>

      {continueReading.length > 0 ? (
        <Rail title="Continue reading">
          {continueReading.map((article) => (
            <LibraryCard
              key={article.slug}
              article={article}
              progress={progress[article.slug] ?? 0}
              saved={bookmarks.includes(article.slug)}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </Rail>
      ) : null}

      <AnimatedSection className="mt-16">
        <h2 className="text-lg font-light tracking-tight text-foreground">Featured collections</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((collection) => (
            <Link
              key={collection.slug}
              to="/geolibrary/collections/$slug"
              params={{ slug: collection.slug }}
              className="glass-panel surface-gradient group overflow-hidden rounded-2xl transition-all motion-base hover:border-bronze/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
            >
              <CoverArt art={collection.art} icon={Library} />
              <div className="p-5">
                <h3 className="text-base font-light text-foreground">{collection.title}</h3>
                <p className="mt-2 line-clamp-2 text-[0.8rem] text-foreground/50">
                  {collection.description}
                </p>
                <p className="mt-3 text-[0.68rem] uppercase tracking-[0.2em] text-bronze/90">
                  {collection.articles.length} entries
                </p>
              </div>
            </Link>
          ))}
        </div>
      </AnimatedSection>

      <Rail title="Trending now">
        {trendingArticles(3).map((article) => (
          <LibraryCard
            key={article.slug}
            article={article}
            saved={bookmarks.includes(article.slug)}
            onToggleBookmark={toggleBookmark}
          />
        ))}
      </Rail>

      <Rail title="Newly published">
        {recentArticles(3).map((article) => (
          <LibraryCard
            key={article.slug}
            article={article}
            saved={bookmarks.includes(article.slug)}
            onToggleBookmark={toggleBookmark}
          />
        ))}
      </Rail>

      <Rail title="Recommended for you">
        {recommendedArticles(3).map((article) => (
          <LibraryCard
            key={article.slug}
            article={article}
            saved={bookmarks.includes(article.slug)}
            onToggleBookmark={toggleBookmark}
          />
        ))}
      </Rail>

      <AnimatedSection className="mt-16">
        <h2 className="text-lg font-light tracking-tight text-foreground">Browse by category</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to="/geolibrary/browse"
              search={{
                q: "",
                continent: "all",
                difficulty: "all",
                time: "all",
                category: category.id,
                sort: "popular",
                saved: false,
                view: "grid",
              }}
              className="glass-panel surface-gradient flex items-center gap-3 rounded-2xl p-4 text-sm text-foreground/75 transition-all motion-fast hover:border-bronze/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
            >
              <category.icon className="h-4 w-4 shrink-0 text-bronze" strokeWidth={1.6} />
              <span className="truncate">{category.label}</span>
            </Link>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection className="mt-16 mb-8">
        <div className="glass-panel surface-gradient flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-light tracking-tight text-foreground">Meet the creators</h2>
            <p className="mt-2 text-sm text-foreground/55">
              Cartographers, writers and researchers behind every entry.
            </p>
          </div>
          <GeoButton asChild variant="ghost">
            <Link to="/geolibrary/creators">
              <Users className="mr-2 h-4 w-4" /> View creators
            </Link>
          </GeoButton>
        </div>
      </AnimatedSection>
    </SectionContainer>
  );
}
