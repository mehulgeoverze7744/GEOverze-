import { Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionContainer } from "@/components/shared/SectionContainer";
import {
  BOOKMARK_FILTER_LABELS,
  type BookmarkFilterId,
} from "@/features/profile/data/bookmarks";
import { useBookmarksCollection } from "@/features/profile/lib/useBookmarksCollection";
import { cn } from "@/lib/utils";

import { BookmarkCard } from "./BookmarkCard";
import "../styles/bookmarks.css";

const FILTER_ORDER: readonly BookmarkFilterId[] = [
  "all",
  "articles",
  "quizzes",
  "maps",
  "paths",
];

function matchesQuery(
  item: ReturnType<ReturnType<typeof useBookmarksCollection>["itemsForFilter"]>[number],
  query: string,
) {
  const haystack = `${item.title} ${item.category} ${item.typeLabel} ${item.description}`.toLowerCase();
  return haystack.includes(query);
}

/** Saved articles, quizzes, maps and learning paths. */
export function BookmarksPage() {
  const [activeFilter, setActiveFilter] = useState<BookmarkFilterId>("all");
  const [search, setSearch] = useState("");
  const { sections, counts, loading, itemsForFilter, removeBookmark } = useBookmarksCollection();

  const filteredItems = useMemo(() => {
    const items = itemsForFilter(activeFilter);
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => matchesQuery(item, query));
  }, [activeFilter, itemsForFilter, search]);

  const activeSection =
    activeFilter === "all"
      ? null
      : (sections.find((section) => section.id === activeFilter) ?? null);

  const compactGrid = filteredItems.length > 0 && filteredItems.length <= 2;

  return (
    <PageShell>
      <SectionContainer size="default" className="bookmarks-page max-w-[78rem]">
        <header className="bookmarks-header">
          <AnimatedSection>
            <p className="bookmarks-eyebrow">Bookmarks</p>
            <h1 className="bookmarks-title">Your saved collection</h1>
            <p className="bookmarks-description">
              Your saved explorations, all in one place.
            </p>
          </AnimatedSection>
        </header>

        <div className="bookmarks-toolbar">
          <div className="bookmarks-toolbar-meta">
            {counts.all > 0 ? (
              <p className="bookmarks-summary" aria-live="polite">
                {counts.all} {counts.all === 1 ? "exploration saved" : "explorations saved"}
              </p>
            ) : null}

            <div
              className="bookmarks-filters"
              role="tablist"
              aria-label="Bookmark categories"
            >
              {FILTER_ORDER.map((filterId) => (
                <button
                  key={filterId}
                  type="button"
                  role="tab"
                  id={`bookmark-tab-${filterId}`}
                  aria-selected={activeFilter === filterId}
                  aria-controls="bookmark-panel"
                  data-active={activeFilter === filterId}
                  onClick={() => setActiveFilter(filterId)}
                  className="bookmarks-filter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45"
                >
                  {BOOKMARK_FILTER_LABELS[filterId]}
                  <span className="bookmarks-filter-count">{counts[filterId]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bookmarks-search-wrap">
            <Search
              className="bookmarks-search-icon h-3.5 w-3.5"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <input
              id="bookmarks-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search saved explorations"
              aria-label="Search saved explorations"
              className="bookmarks-search"
            />
          </div>
        </div>

        <div
          role="tabpanel"
          id="bookmark-panel"
          aria-labelledby={`bookmark-tab-${activeFilter}`}
        >
          {loading ? (
            <ul className={cn("bookmarks-grid", compactGrid && "bookmarks-grid--compact")}>
              {Array.from({ length: 3 }).map((_, index) => (
                <li
                  key={index}
                  className="h-56 animate-pulse rounded-[1.125rem] border border-bronze/10 bg-charcoal/35"
                  aria-hidden="true"
                />
              ))}
            </ul>
          ) : filteredItems.length === 0 ? (
            <AnimatedSection>
              <div className="bookmarks-empty">
                {search.trim() ? (
                  <>
                    <p className="bookmarks-empty-title">No matches</p>
                    <p className="bookmarks-empty-body">
                      Try a different search term or switch filters.
                    </p>
                  </>
                ) : activeSection ? (
                  <>
                    <p className="bookmarks-empty-title">{activeSection.emptyTitle}</p>
                    <p className="bookmarks-empty-body">{activeSection.emptyBody}</p>
                    <Link
                      to={activeSection.exploreTo}
                      {...(activeSection.exploreSearch
                        ? { search: activeSection.exploreSearch }
                        : {})}
                      className="bookmarks-empty-link"
                    >
                      {activeSection.exploreLabel}
                      <ArrowRight className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="bookmarks-empty-title">Nothing saved yet</p>
                    <p className="bookmarks-empty-body">
                      Bookmark articles, quizzes and more across GEOverze to build your library.
                    </p>
                    <Link to="/geolibrary/browse" className="bookmarks-empty-link">
                      Explore GEOlibrary
                      <ArrowRight className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                    </Link>
                  </>
                )}
              </div>
            </AnimatedSection>
          ) : (
            <ul
              className={cn("bookmarks-grid", compactGrid && "bookmarks-grid--compact mx-auto")}
            >
              {filteredItems.map((item, index) => (
                <li key={item.id}>
                  <AnimatedSection delay={index * 40}>
                    <BookmarkCard item={item} onRemove={() => removeBookmark(item)} />
                  </AnimatedSection>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SectionContainer>
    </PageShell>
  );
}
