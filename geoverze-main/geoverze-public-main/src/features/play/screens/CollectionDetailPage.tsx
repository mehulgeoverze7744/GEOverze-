import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Clock, Layers, Play } from "lucide-react";
import { useMemo } from "react";

import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedSection,
  EmptyState,
  GeoButton,
  SectionContainer,
  SkeletonBlock,
} from "@/components/shared";
import { useBookmarksStore } from "@/stores/bookmarksStore";
import { MetaChip } from "../components/Badges";
import { CoverArt } from "../components/CoverArt";
import { QuizCard } from "../components/QuizCard";
import { collectionBySlug } from "../data/collections";
import { pick, type Quiz } from "../data/quizzes";
import { usePublishedQuizzes } from "../hooks/usePublishedQuizzes";

/** /play/collections/$slug — a single curated route through several quizzes. */
export function CollectionDetailPage() {
  const { slug } = useParams({ from: "/play/collections/$slug" });
  const navigate = useNavigate();
  const { quizzes: catalog, loading, error, refetch } = usePublishedQuizzes();
  const bookmarkIds = useBookmarksStore((s) => s.ids);
  const toggleBookmark = useBookmarksStore((s) => s.toggle);
  const collection = collectionBySlug(slug);

  const quizzes = useMemo(() => {
    if (!collection) return [];
    return pick([...collection.quizIds], catalog);
  }, [collection, catalog]);

  const playQuiz = (quiz: Quiz) => navigate({ to: "/play/quiz", search: { quiz: quiz.id } });

  if (!collection) {
    return (
      <PageShell>
        <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
          <EmptyState
            title="Collection not found"
            description="That curated route has moved or was never published."
            action={
              <GeoButton asChild variant="solid" size="md">
                <Link to="/play/collections">All collections</Link>
              </GeoButton>
            }
          />
        </SectionContainer>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
          <EmptyState
            title="Could not load quizzes for this collection"
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

  const first = quizzes[0];

  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <Link
            to="/play/collections"
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
            All collections
          </Link>

          <div className="game-surface mt-6 overflow-hidden rounded-2xl">
            <CoverArt art={collection.art} ratio="wide" className="h-40 sm:h-56" />
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <MetaChip tone="bronze">
                  <Layers className="h-3 w-3" strokeWidth={2.2} aria-hidden />
                  {quizzes.length} quizzes
                </MetaChip>
                <MetaChip>
                  <Clock className="h-3 w-3" strokeWidth={2.2} aria-hidden />~{collection.minutes}{" "}
                  min total
                </MetaChip>
                <MetaChip>Curated by {collection.curator}</MetaChip>
              </div>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {collection.title}
              </h1>
              <p className="mt-3 max-w-2xl text-[0.9rem] leading-relaxed text-foreground/60">
                {collection.description}
              </p>
              {first ? (
                <GeoButton
                  variant="solid"
                  size="lg"
                  className="mt-6"
                  onClick={() => playQuiz(first)}
                >
                  <Play className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                  Start with {first.title}
                </GeoButton>
              ) : null}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-12">
          <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
            In this collection
          </h2>
          {loading && quizzes.length === 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-72 w-full rounded-2xl" />
              ))}
            </div>
          ) : quizzes.length > 0 ? (
            <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz, i) => (
                <li key={quiz.id} className="relative">
                  <span className="absolute -top-2 left-4 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border border-bronze/50 bg-[oklch(0.12_0.006_60)] text-[0.7rem] font-semibold tabular-nums text-bronze-glow">
                    {i + 1}
                  </span>
                  <QuizCard
                    quiz={quiz}
                    bookmarked={bookmarkIds.includes(quiz.id)}
                    onToggleBookmark={toggleBookmark}
                    onPlay={playQuiz}
                  />
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-foreground/60">
              No published quizzes from this collection are available right now.
            </p>
          )}
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
