import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Play } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedSection,
  EmptyState,
  GeoButton,
  SectionContainer,
  SkeletonBlock,
} from "@/components/shared";
import { useBookmarksStore } from "@/stores/bookmarksStore";
import { AssignmentDifficultyPicker } from "../components/AssignmentDifficultyPicker";
import { QuizCard } from "../components/QuizCard";
import { QUIZ_CATEGORIES } from "../data/categories";
import { usePublishedQuizzes } from "../hooks/usePublishedQuizzes";
import {
  ASSIGNMENT_DIFFICULTIES,
  assignRandomQuizFn,
  type AssignmentDifficulty,
  type AssignRandomQuizResult,
} from "../lib/assignRandomQuiz";

function parseDifficulty(value: string | undefined): AssignmentDifficulty {
  return ASSIGNMENT_DIFFICULTIES.includes(value as AssignmentDifficulty)
    ? (value as AssignmentDifficulty)
    : "Adaptive";
}

function categoryMeta(categoryId: string) {
  if (categoryId === "emoji-fun") {
    return {
      title: "Emoji & Fun Quizzes",
      description:
        "Decode emoji, letter and number rebuses for countries, capitals, landmarks and the words of the map.",
    };
  }
  const match = QUIZ_CATEGORIES.find((category) => category.id === categoryId);
  return {
    title: match?.title ?? categoryId,
    description:
      match?.description ?? "Browse every published set in this section, then play a random quiz.",
  };
}

function assignmentMessage(
  result: Extract<AssignRandomQuizResult, { ok: false }>,
  title: string,
  difficulty: AssignmentDifficulty,
) {
  if (result.code === "none_eligible") {
    if (difficulty === "Adaptive") {
      return `No playable quizzes are available in ${title} yet.`;
    }
    return `No ${difficulty} quizzes are available in ${title} yet. Choose another difficulty or go back to categories.`;
  }
  if (result.code === "unknown_category" || result.code === "invalid_category") {
    return "This category could not be found. Go back to categories and pick a section.";
  }
  if (result.code === "invalid_difficulty") {
    return "That difficulty is not valid. Choose Adaptive, Easy, Medium, Hard or Expert.";
  }
  return "Could not assign a quiz right now. Try again.";
}

/** Category listing: browse the catalogue, then PLAY QUIZ assigns one at random. */
export function CategoryListingPage() {
  const { category, difficulty: difficultySearch } = useSearch({ from: "/play/search" });
  const navigate = useNavigate();
  const categoryId = category ?? "";
  const difficulty = parseDifficulty(difficultySearch);
  const { title, description } = categoryMeta(categoryId);

  const { quizzes, loading, error, refetch } = usePublishedQuizzes();
  const bookmarkIds = useBookmarksStore((s) => s.ids);
  const toggleBookmark = useBookmarksStore((s) => s.toggle);

  const [busy, setBusy] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const inCategory = useMemo(
    () => quizzes.filter((quiz) => quiz.categoryId === categoryId),
    [quizzes, categoryId],
  );
  const visible = useMemo(
    () =>
      difficulty === "Adaptive"
        ? inCategory
        : inCategory.filter((quiz) => quiz.difficulty === difficulty),
    [inCategory, difficulty],
  );

  const setDifficulty = (next: AssignmentDifficulty) => {
    setAssignError(null);
    void navigate({
      to: "/play/search",
      search: { q: undefined, category: categoryId, difficulty: next },
      replace: true,
    });
  };

  const playRandom = async () => {
    if (!categoryId || inFlight.current || busy) return;
    inFlight.current = true;
    setBusy(true);
    setAssignError(null);
    try {
      const result = await assignRandomQuizFn({
        data: { category: categoryId, difficulty },
      });
      if (!result.ok) {
        setAssignError(assignmentMessage(result, title, difficulty));
        inFlight.current = false;
        setBusy(false);
        return;
      }
      void navigate({ to: "/play/quiz/solo", search: { quiz: result.quizId } });
    } catch {
      setAssignError("Could not assign a quiz right now. Try again.");
      inFlight.current = false;
      setBusy(false);
    }
  };

  if (!categoryId) {
    return null;
  }

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
          <GeoButton asChild variant="dark" size="sm" className="gap-2">
            <Link to="/play/catalogue">
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
              Back to Categories
            </Link>
          </GeoButton>
          <p className="eyebrow mt-6">Quiz section</p>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            {description} Browse the sets below, then press PLAY QUIZ for a random assignment.
          </p>
        </AnimatedSection>

        <AnimatedSection className="mt-8">
          <div className="lp-card rounded-2xl p-4 sm:p-5">
            <AssignmentDifficultyPicker value={difficulty} onChange={setDifficulty} />
            <GeoButton
              variant="solid"
              size="md"
              className="mt-5 w-full"
              disabled={busy}
              aria-busy={busy}
              onClick={() => {
                void playRandom();
              }}
            >
              <Play className="h-4 w-4" strokeWidth={2.4} />
              {busy ? "Assigning quiz…" : "Play quiz"}
            </GeoButton>
            {assignError ? (
              <p className="mt-3 text-[0.82rem] leading-relaxed text-[#b42318]" role="alert">
                {assignError}
              </p>
            ) : (
              <p className="mt-3 text-[0.72rem] leading-relaxed text-foreground/45">
                PLAY QUIZ picks one eligible {title} quiz at the difficulty above. Individual sets
                cannot be started from this page.
              </p>
            )}
          </div>
        </AnimatedSection>

        <div className="mt-8">
          {loading && quizzes.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-72 w-full rounded-2xl" />
              ))}
            </div>
          ) : visible.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  bookmarked={bookmarkIds.includes(quiz.id)}
                  onToggleBookmark={toggleBookmark}
                  browseOnly
                />
              ))}
            </div>
          ) : inCategory.length === 0 ? (
            <EmptyState
              title={`No ${title} quizzes yet`}
              description="Check back soon — new sets appear here as soon as they are published."
              action={
                <GeoButton asChild variant="solid" size="md">
                  <Link to="/play/catalogue">Back to Categories</Link>
                </GeoButton>
              }
            />
          ) : (
            <EmptyState
              title={`No ${difficulty} quizzes in ${title}`}
              description="This difficulty has no eligible quizzes. Choose another difficulty — we will not assign a different one for you."
              action={
                <GeoButton variant="solid" size="md" onClick={() => setDifficulty("Adaptive")}>
                  Use Adaptive
                </GeoButton>
              }
            />
          )}
        </div>
      </SectionContainer>
    </PageShell>
  );
}
