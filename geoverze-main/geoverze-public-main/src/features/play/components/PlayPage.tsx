import { Link, useNavigate } from "@tanstack/react-router";

import { ProgressionNav } from "@/features/progression";
import { useMemo, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedSection,
  EmptyState,
  GeoButton,
  SectionContainer,
  SectionHeading,
} from "@/components/shared";
import { useBookmarksStore } from "@/stores/bookmarksStore";
import { QUIZ_CATEGORIES, type QuizCategory } from "../data/categories";
import { GAME_MODES, type GameMode } from "../data/gameModes";
import { DISCOVERY_RAILS, FEATURED_QUIZ_IDS, QUIZZES, type Quiz } from "../data/quizzes";
import { INITIAL_FILTERS, applyFilters, type PlayFilterState } from "../lib/filter";
import { COLLECTIONS } from "../data/collections";
import { CategoryCard } from "./CategoryCard";
import { CollectionCard } from "./CollectionCard";
import { CreatorRail } from "./CreatorRail";
import { DailyChallenge } from "./DailyChallenge";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { FilterBar } from "./FilterBar";
import { ModeCard } from "./ModeCard";
import { PlayHero } from "./PlayHero";
import { PlayQuickLinks } from "./PlayQuickLinks";
import { QuizCard } from "./QuizCard";
import { QuizRail } from "./QuizRail";
import { WeeklyChallenge } from "./WeeklyChallenge";

const byId = new Map(QUIZZES.map((q) => [q.id, q]));
const featured = FEATURED_QUIZ_IDS.map((id) => byId.get(id)).filter(Boolean) as Quiz[];

/** Let's Play — the full quiz hub lobby. */
export function PlayPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PlayFilterState>(INITIAL_FILTERS);
  const bookmarkIds = useBookmarksStore((s) => s.ids);
  const toggleBookmark = useBookmarksStore((s) => s.toggle);

  const results = useMemo(() => applyFilters(QUIZZES, filters), [filters]);

  const patch = (next: Partial<PlayFilterState>) => setFilters((f) => ({ ...f, ...next }));

  /** Every launch point lands in the quiz lobby, which resolves the set. */
  const openLobby = (key: string) => navigate({ to: "/play/quiz", search: { quiz: key } });

  const playQuiz = (quiz: Quiz) => openLobby(quiz.id);
  const playCategory = (category: QuizCategory) => openLobby(category.id);
  const playMode = (mode: GameMode) => {
    if (mode.id === "pvp" || mode.id === "multiplayer") {
      navigate({ to: "/play/matchmaking", search: { mode: mode.id, quiz: undefined } });
      return;
    }
    openLobby(mode.id);
  };

  const playRandom = () => {
    const pick = QUIZZES[Math.floor(Math.random() * QUIZZES.length)];
    if (pick) openLobby(pick.id);
  };

  const bookmarked = QUIZZES.filter((q) => bookmarkIds.includes(q.id));

  return (
    <PageShell>
      <PlayHero onRandom={playRandom} />

      <section className="pb-[var(--space-section-sm)]">
        <SectionContainer size="wide">
          <AnimatedSection>
            <FeaturedCarousel quizzes={featured} onPlay={playQuiz} />
          </AnimatedSection>

          <AnimatedSection className="mt-12">
            <DailyChallenge onPlay={() => openLobby("daily")} />
          </AnimatedSection>

          <AnimatedSection className="mt-6">
            <WeeklyChallenge onPlay={() => openLobby("weekly")} />
          </AnimatedSection>

          <AnimatedSection className="mt-12">
            <ProgressionNav />
          </AnimatedSection>

          <AnimatedSection className="mt-16">
            <PlayQuickLinks />
          </AnimatedSection>

          <AnimatedSection className="mt-16">
            <SectionHeading
              eyebrow="Game modes"
              title="Choose how you play"
              description="Same question engine, different pressure. Every mode shares your XP, streak and ranking."
            />
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {GAME_MODES.map((mode) => (
                <ModeCard key={mode.id} mode={mode} onSelect={playMode} />
              ))}
            </div>
            <div className="mt-6">
              <GeoButton asChild variant="dark" size="md">
                <Link to="/play/modes">See every mode</Link>
              </GeoButton>
            </div>
          </AnimatedSection>

          <AnimatedSection className="mt-16">
            <SectionHeading
              eyebrow="Collections"
              title="Guided routes across the planet"
              description="Multi-set journeys that build one region or theme at a time."
            />
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {COLLECTIONS.slice(0, 3).map((collection) => (
                <CollectionCard key={collection.slug} collection={collection} />
              ))}
            </div>
            <div className="mt-6">
              <GeoButton asChild variant="dark" size="md">
                <Link to="/play/collections">Browse all collections</Link>
              </GeoButton>
            </div>
          </AnimatedSection>

          <AnimatedSection className="mt-16">
            <CreatorRail />
          </AnimatedSection>

          <AnimatedSection className="mt-16">
            <SectionHeading
              eyebrow="Categories"
              title="Pick your ground"
              description="Fourteen subject areas, from flags and capitals to the planet's extremes."
            />
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {QUIZ_CATEGORIES.map((category) => (
                <CategoryCard key={category.id} category={category} onPlay={playCategory} />
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection className="mt-16">
            <SectionHeading eyebrow="Discover" title="Curated for the way you play" />
            <div className="mt-2">
              {DISCOVERY_RAILS.map((rail) => (
                <QuizRail
                  key={rail.id}
                  title={rail.title}
                  description={rail.description}
                  quizzes={rail.quizIds.map((id) => byId.get(id)).filter(Boolean) as Quiz[]}
                  bookmarkIds={bookmarkIds}
                  onToggleBookmark={toggleBookmark}
                  onPlay={playQuiz}
                  viewAllTo="/play/search"
                  viewAllLabel="Browse catalog"
                />
              ))}
              {bookmarked.length > 0 ? (
                <QuizRail
                  title="Your bookmarks"
                  description="Saved on this device."
                  quizzes={bookmarked}
                  bookmarkIds={bookmarkIds}
                  onToggleBookmark={toggleBookmark}
                  onPlay={playQuiz}
                />
              ) : null}
            </div>
          </AnimatedSection>

          <AnimatedSection className="mt-16">
            <SectionHeading
              eyebrow="Browse everything"
              title="Find an exact match"
              description="Search and filter the full catalog by difficulty, category, length, size and creator."
            />
            <div className="mt-7">
              <FilterBar filters={filters} onChange={patch} resultCount={results.length} />
            </div>

            {results.length > 0 ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="No quizzes match those filters"
                  description="Try widening the difficulty or clearing the search to see the full catalog again."
                  action={
                    <GeoButton
                      variant="solid"
                      size="md"
                      onClick={() => setFilters(INITIAL_FILTERS)}
                    >
                      Reset filters
                    </GeoButton>
                  }
                />
              </div>
            )}
          </AnimatedSection>

          <AnimatedSection className="mt-16">
            <div className="game-surface flex flex-wrap items-center justify-between gap-5 rounded-2xl p-6 md:p-8">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                  Track every run on the global board
                </h2>
                <p className="mt-2 max-w-xl text-[0.85rem] leading-relaxed text-foreground/55">
                  Scores, streaks and season standings all land on the leaderboard the moment the
                  engine goes live.
                </p>
              </div>
              <GeoButton asChild variant="dark" size="lg">
                <Link to="/leaderboard">View leaderboard</Link>
              </GeoButton>
            </div>
          </AnimatedSection>
        </SectionContainer>
      </section>
    </PageShell>
  );
}
