import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedSection,
  EmptyState,
  GeoButton,
  SectionContainer,
  SkeletonBlock,
} from "@/components/shared";
import { useBookmarksStore } from "@/stores/bookmarksStore";
import { FilterBar } from "../components/FilterBar";
import { QuizCard } from "../components/QuizCard";
import type { Quiz } from "../data/quizzes";
import { usePublishedQuizzes } from "../hooks/usePublishedQuizzes";
import { INITIAL_FILTERS, applyFilters, isFiltering, type PlayFilterState } from "../lib/filter";

/** /play/search — full-catalog search with the shared filter model. */
export function SearchPage() {
  const { q, category } = useSearch({ from: "/play/search" });
  const navigate = useNavigate();
  const { quizzes, loading, error, refetch } = usePublishedQuizzes();
  const [filters, setFilters] = useState<PlayFilterState>({
    ...INITIAL_FILTERS,
    query: q ?? "",
    category: category ?? "any",
  });

  const bookmarkIds = useBookmarksStore((s) => s.ids);
  const toggleBookmark = useBookmarksStore((s) => s.toggle);
  const results = useMemo(() => applyFilters(quizzes, filters), [quizzes, filters]);

  const patch = (next: Partial<PlayFilterState>) => {
    setFilters((f) => {
      const merged = { ...f, ...next };
      if (typeof next.query === "string") {
        navigate({
          to: "/play/search",
          search: {
            q: next.query.trim() === "" ? undefined : next.query,
            category: merged.category === "any" ? undefined : merged.category,
          },
          replace: true,
        });
      }
      return merged;
    });
  };

  const playQuiz = (quiz: Quiz) => navigate({ to: "/play/quiz", search: { quiz: quiz.id } });

  if (error) {
    return (
      <PageShell>
        <SectionContainer
          size="wide"
          className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
        >
          <EmptyState
            title="Could not load the quiz catalog"
            description={error}
            action={
              <GeoButton variant="solid" size="md" onClick={() => refetch()}>
                Try again
              </GeoButton>
            }
          />
        </SectionContainer>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <p className="eyebrow">Search</p>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            Find an exact match
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            Search the full catalog, then narrow by difficulty, category, length, size and creator.
          </p>
        </AnimatedSection>

        <AnimatedSection className="mt-9">
          <FilterBar
            filters={filters}
            onChange={patch}
            resultCount={results.length}
            quizzes={quizzes}
          />
        </AnimatedSection>

        <div className="mt-8">
          {loading && quizzes.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-72 w-full rounded-2xl" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  bookmarked={bookmarkIds.includes(quiz.id)}
                  onToggleBookmark={toggleBookmark}
                  onPlay={playQuiz}
                />
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <EmptyState
              title="No published quizzes yet"
              description="Check back soon — new sets appear here as soon as they are published."
            />
          ) : (
            <EmptyState
              title="Nothing matched that search"
              description={
                isFiltering(filters)
                  ? "Try a shorter search term or clear a filter to widen the catalog."
                  : "The catalog is loading — try again in a moment."
              }
              action={
                <GeoButton
                  variant="solid"
                  size="md"
                  onClick={() => {
                    setFilters(INITIAL_FILTERS);
                    navigate({
                      to: "/play/search",
                      search: { q: undefined, category: undefined },
                      replace: true,
                    });
                  }}
                >
                  Reset search
                </GeoButton>
              }
            />
          )}
        </div>
      </SectionContainer>
    </PageShell>
  );
}

/** Route-level pending fallback. */
export function SearchPageSkeleton() {
  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))]"
      >
        <SkeletonBlock className="h-10 w-64" />
        <SkeletonBlock className="mt-6 h-16 w-full" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-72 w-full" />
          ))}
        </div>
      </SectionContainer>
    </PageShell>
  );
}
