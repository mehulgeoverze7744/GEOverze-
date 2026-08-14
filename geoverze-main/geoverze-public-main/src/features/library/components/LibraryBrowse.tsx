import { Link, getRouteApi, useNavigate } from "@tanstack/react-router";

import { EmptyState, PageHeader, SectionContainer } from "@/components/shared";
import { useLibraryStore } from "@/stores/libraryStore";

import { LibraryCard } from "./LibraryCard";
import {
  CATEGORIES,
  CONTINENTS,
  DIFFICULTIES,
  READING_TIMES,
  SORTS,
  type CategoryId,
  type ContinentId,
  type DifficultyId,
  type ReadingTimeId,
  type SortId,
} from "../data/taxonomy";
import { filterArticles, sortArticles } from "../lib/filter";

const routeApi = getRouteApi("/geolibrary/browse");

function ChipRow<T extends string>({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  active: string;
  onSelect: (id: T | "all") => void;
}) {
  return (
    <div>
      <p className="text-[0.6rem] uppercase tracking-[0.22em] text-foreground/50">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {[{ id: "all" as const, label: "All" }, ...options].map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={active === option.id}
            onClick={() => onSelect(option.id as T | "all")}
            className={
              active === option.id
                ? "rounded-full border border-bronze/55 bg-bronze/15 px-3 py-1.5 text-xs text-bronze-glow"
                : "rounded-full border border-bronze/15 px-3 py-1.5 text-xs text-foreground/55 transition-colors motion-fast hover:border-bronze/40 hover:text-foreground"
            }
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Faceted browse surface. All filter state lives in the URL. */
export function LibraryBrowse() {
  const search = routeApi.useSearch();
  const navigate = useNavigate({ from: "/geolibrary/browse" });
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const progress = useLibraryStore((s) => s.progress);
  const toggleBookmark = useLibraryStore((s) => s.toggleBookmark);

  const set = (patch: Partial<typeof search>) =>
    navigate({ search: (prev: typeof search) => ({ ...prev, ...patch }) });

  const filtered = filterArticles(
    {
      q: search.q,
      continent: search.continent as ContinentId | "all",
      difficulty: search.difficulty as DifficultyId | "all",
      time: search.time as ReadingTimeId | "all",
      category: search.category as CategoryId | "all",
      sort: search.sort as SortId,
      saved: search.saved,
    },
    bookmarks,
  );
  const results = sortArticles(filtered, search.sort as SortId);

  return (
    <SectionContainer>
      <PageHeader
        eyebrow="GEOlibrary"
        title="Browse the library"
        description="Filter every entry by continent, category, difficulty and reading time."
      />

      <div className="glass-panel surface-gradient mt-8 space-y-5 rounded-2xl p-6">
        <label className="block">
          <span className="sr-only">Search the library</span>
          <input
            type="search"
            value={search.q}
            onChange={(event) => set({ q: event.target.value })}
            placeholder="Search countries, capitals, rivers, landmarks…"
            className="w-full rounded-xl border border-bronze/20 bg-[oklch(0.14_0.006_60/0.6)] px-4 py-3 text-sm text-foreground placeholder:text-foreground/50 focus-visible:border-bronze/50 focus-visible:outline-none"
          />
        </label>
        <ChipRow
          label="Continent"
          options={CONTINENTS}
          active={search.continent}
          onSelect={(id) => set({ continent: id })}
        />
        <ChipRow
          label="Category"
          options={CATEGORIES}
          active={search.category}
          onSelect={(id) => set({ category: id })}
        />
        <ChipRow
          label="Difficulty"
          options={DIFFICULTIES}
          active={search.difficulty}
          onSelect={(id) => set({ difficulty: id })}
        />
        <ChipRow
          label="Reading time"
          options={READING_TIMES}
          active={search.time}
          onSelect={(id) => set({ time: id })}
        />
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[0.6rem] uppercase tracking-[0.22em] text-foreground/50">Sort</p>
          {SORTS.map((sort) => (
            <button
              key={sort.id}
              type="button"
              aria-pressed={search.sort === sort.id}
              onClick={() => set({ sort: sort.id })}
              className={
                search.sort === sort.id
                  ? "rounded-full border border-bronze/55 bg-bronze/15 px-3 py-1.5 text-xs text-bronze-glow"
                  : "rounded-full border border-bronze/15 px-3 py-1.5 text-xs text-foreground/55 hover:border-bronze/40 hover:text-foreground"
              }
            >
              {sort.label}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={search.saved}
            onClick={() => set({ saved: !search.saved })}
            className={
              search.saved
                ? "ml-auto rounded-full border border-bronze/55 bg-bronze/15 px-3 py-1.5 text-xs text-bronze-glow"
                : "ml-auto rounded-full border border-bronze/15 px-3 py-1.5 text-xs text-foreground/55 hover:border-bronze/40 hover:text-foreground"
            }
          >
            Saved only
          </button>
        </div>
      </div>

      <p className="mt-6 text-xs text-foreground/50" aria-live="polite">
        {results.length} {results.length === 1 ? "entry" : "entries"}
      </p>

      {results.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No entries match those filters"
            description="Try widening the continent or reading-time filter, or clear the search."
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
            Clear all filters
          </Link>
        </div>
      ) : (
        <div className="mb-8 mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((article) => (
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
