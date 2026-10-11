import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedSection,
  EmptyState,
  GeoButton,
  SearchBar,
  SectionContainer,
} from "@/components/shared";
import { CategoryCard } from "../components/CategoryCard";
import { PlayPageBackground } from "../components/PlayPageBackground";
import { QUIZ_CATEGORIES, type Difficulty, type QuizCategory } from "../data/categories";
import { DIFFICULTY_OPTIONS } from "../data/filters";

type DifficultyFilter = "any" | Difficulty;

/** /play/catalogue — every category from the shared quiz catalog. */
export function CataloguePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("any");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return QUIZ_CATEGORIES.filter((category) => {
      if (difficulty !== "any" && category.difficulty !== difficulty) return false;
      if (!needle) return true;
      return (
        category.title.toLowerCase().includes(needle) ||
        category.description.toLowerCase().includes(needle)
      );
    });
  }, [query, difficulty]);

  const playCategory = (category: QuizCategory) =>
    navigate({ to: "/play/search", search: { q: undefined, category: category.id } });

  const resetFilters = () => {
    setQuery("");
    setDifficulty("any");
  };

  return (
    <PageShell>
      <PlayPageBackground />
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <GeoButton asChild variant="dark" size="sm" className="gap-2">
            <Link to="/play" activeOptions={{ exact: true }}>
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
              Back to Play
            </Link>
          </GeoButton>
          <h1 className="mt-6 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            Explore All Categories
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            Discover every way to test your knowledge of our world.
          </p>
        </AnimatedSection>

        <AnimatedSection className="mt-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <SearchBar
              id="catalogue-search"
              label="Search categories"
              placeholder="Search categories"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onClear={() => setQuery("")}
              wrapperClassName="w-full md:max-w-md"
            />
            <label className="flex min-w-[11rem] flex-col gap-1.5">
              <span className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
                Difficulty
              </span>
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as DifficultyFilter)}
                className="game-surface-raised rounded-xl px-3 py-2.5 text-[0.8rem] text-foreground/85 outline-none transition-colors motion-snap focus:border-bronze/60"
              >
                <option value="any" className="bg-[oklch(0.16_0.008_60)]">
                  Any difficulty
                </option>
                {DIFFICULTY_OPTIONS.map((level) => (
                  <option key={level} value={level} className="bg-[oklch(0.16_0.008_60)]">
                    {level}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-8">
          {visible.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {visible.map((category) => (
                <CategoryCard key={category.id} category={category} onPlay={playCategory} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No categories match those filters"
              description="Clear the search or choose any difficulty to see all 14 categories again."
              action={
                <GeoButton variant="solid" size="md" onClick={resetFilters}>
                  Show all categories
                </GeoButton>
              }
            />
          )}
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
