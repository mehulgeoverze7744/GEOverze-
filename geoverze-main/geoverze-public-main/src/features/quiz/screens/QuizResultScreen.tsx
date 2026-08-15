import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { GeoButton } from "@/components/shared";
import { getLevelTitle, getXpProgress } from "@/features/progression/lib/progress";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { useProgressionStore } from "@/stores/progressionStore";
import { useQuizStore } from "@/stores/quizStore";
import { ResultSummary } from "../components/ResultSummary";
import { QuizLayout } from "../components/QuizLayout";
import { useQuizSet } from "../hooks/useQuizSet";
import { summarise, type RunSummary } from "../lib/session";

/** Shape returned by the record_quiz_attempt RPC (Phase 2C idempotency). */
type AttemptResult = {
  xp_earned: number;
  credits_earned: number;
  new_xp: number;
  new_level: number;
  level_up: boolean;
  new_streak: number;
  new_credits: number;
  total_quizzes: number;
  total_correct: number;
  total_answered: number;
  /** True when this attempt_id was already recorded; no progression was changed. */
  duplicate: boolean;
};

// ---------------------------------------------------------------------------
// Tab-session result persistence
//
// After a successful submission, the confirmed result is stored in
// sessionStorage so it survives a page refresh within the same browser tab.
// sessionStorage is deliberately tab-scoped (not localStorage) so results
// do not bleed across separate quiz sessions in other tabs.
//
// The stored entry is automatically superseded when a new quiz run saves
// its own result. No explicit cleanup is required.
// ---------------------------------------------------------------------------

type StoredQuizResult = {
  attemptId: string;
  quizId: string;
  summary: RunSummary;
  serverResult: AttemptResult;
};

const RESULT_STORAGE_KEY = "geoVerze.quiz.lastResult";

function saveResult(data: StoredQuizResult): void {
  try {
    sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage unavailable (private browsing quota, etc.) — non-fatal.
  }
}

function loadResult(quizId: string): StoredQuizResult | null {
  try {
    const raw = sessionStorage.getItem(RESULT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredQuizResult;
    // Only hydrate when the stored result matches the quiz in the current URL.
    return parsed.quizId === quizId ? parsed : null;
  } catch {
    return null;
  }
}

/** Route screen for /play/quiz/result. */
export function QuizResultScreen() {
  const { quiz } = useSearch({ from: "/play/quiz/result" });
  const navigate = useNavigate();

  const answers = useQuizStore((s) => s.answers);
  const startedAt = useQuizStore((s) => s.startedAt);
  const finishedAt = useQuizStore((s) => s.finishedAt);
  const start = useQuizStore((s) => s.start);
  const mode = useQuizStore((s) => s.mode);
  const persisted = useQuizStore((s) => s.persisted);
  const setPersisted = useQuizStore((s) => s.setPersisted);
  const attemptId = useQuizStore((s) => s.attemptId);
  const user = useAuthStore((s) => s.user);
  const { set, loading: setLoading } = useQuizSet(quiz);

  // True only when this tab has a live, finished run in memory.
  const hasRun = Object.keys(answers).length > 0 && finishedAt !== null;

  // Use the quiz URL param directly for sessionStorage lookup — it is the
  // quiz ID string, available synchronously before the set loads from DB.
  const [hydratedResult] = useState<StoredQuizResult | null>(() =>
    hasRun ? null : loadResult(quiz ?? ""),
  );

  // Derive the run summary from the live session, or fall back to hydrated.
  const liveSummary = useMemo(
    () =>
      hasRun && set
        ? summarise(set, answers, (finishedAt ?? Date.now()) - (startedAt ?? Date.now()))
        : null,
    [answers, finishedAt, hasRun, set, startedAt],
  );

  const summary: RunSummary | null = liveSummary ?? hydratedResult?.summary ?? null;

  // Initialise from sessionStorage when hydrating a post-refresh result.
  const [serverResult, setServerResult] = useState<AttemptResult | null>(
    hydratedResult?.serverResult ?? null,
  );
  const [submitError, setSubmitError] = useState(false);

  // Prevents React StrictMode double-invoke from firing two RPC calls.
  const hasFiredRef = useRef(false);

  // Fire record_quiz_attempt() exactly once per live completed run.
  // This block is intentionally skipped when the result is hydrated from
  // sessionStorage — hydrated results are already persisted; no re-submission.
  // Guard on `set` being loaded: the RPC needs set.questions.length and set.id.
  useEffect(() => {
    if (!hasRun || persisted || hasFiredRef.current || !user?.id || !attemptId || !set) return;
    hasFiredRef.current = true;

    // Capture stable values before the async boundary.
    const stableAttemptId = attemptId;
    const durationMs = Math.max(1, (finishedAt ?? Date.now()) - (startedAt ?? 0));
    const correctCount = Object.values(answers).filter((a) => a.correct).length;
    const totalCount = set.questions.length;
    const score = liveSummary?.score ?? 0;
    const bestStreak = liveSummary?.bestStreak ?? 0;

    void supabase
      .rpc("record_quiz_attempt", {
        _attempt_id: stableAttemptId,
        _quiz_id: set.id,
        _mode: mode ?? "solo",
        _score: score,
        _correct: correctCount,
        _total: totalCount,
        _best_streak: bestStreak,
        _duration_ms: durationMs,
      })
      .then(({ data, error }) => {
        if (error) {
          console.error("record_quiz_attempt failed", error);
          setSubmitError(true);
          toast.error("Could not save your quiz result. Your score is shown below.");
          return;
        }

        const result = data as AttemptResult | null;
        if (!result) return;

        // Persist the confirmed result to sessionStorage so it survives a
        // page refresh in the same tab.
        if (liveSummary) {
          saveResult({
            attemptId: stableAttemptId,
            quizId: set.id,
            summary: liveSummary,
            serverResult: result,
          });
        }

        // Mark persisted regardless of duplicate — the run is recorded.
        setPersisted();
        setServerResult(result);

        if (result.duplicate) {
          // Server confirmed this attempt_id was already recorded.
          // Current progression values in the response are accurate; do not
          // inflate the store a second time.
          return;
        }

        // Update the progression store with server-confirmed values.
        const store = useProgressionStore.getState();
        const current = store.player;
        const { xpIntoLevel, xpForLevel } = getXpProgress(result.new_xp, result.new_level);
        const accuracy =
          result.total_answered > 0
            ? Math.round((result.total_correct / result.total_answered) * 1000) / 10
            : current.accuracy;
        store.setPlayer({
          ...current,
          xp: result.new_xp,
          level: result.new_level,
          levelTitle: getLevelTitle(result.new_level),
          xpIntoLevel,
          xpForLevel,
          credits: result.new_credits,
          currentStreak: result.new_streak,
          totalQuizzes: result.total_quizzes,
          accuracy,
        });
      });
  }, [
    hasRun,
    persisted,
    user?.id,
    attemptId,
    finishedAt,
    startedAt,
    answers,
    set,
    mode,
    liveSummary,
    setPersisted,
  ]);

  // While the quiz set is loading from Supabase show a minimal spinner.
  // This is typically sub-second; the result screen's core state (answers,
  // finishedAt, attemptId) is already in the store and does not depend on it.
  if (setLoading) {
    return (
      <QuizLayout width="narrow" className="pt-16">
        <div className="flex items-center justify-center py-16">
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent text-bronze"
            aria-label="Loading…"
          />
        </div>
      </QuizLayout>
    );
  }

  // No result: neither a live in-memory run nor a hydrated sessionStorage entry.
  if (!summary) {
    const quizTitle = set?.title ?? quiz ?? "this quiz";
    return (
      <QuizLayout width="narrow" className="pt-16">
        <div className="game-surface rounded-2xl p-7 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">No result yet</h1>
          <p className="mt-2 text-[0.88rem] text-foreground/55">
            Runs are not stored between visits. Play {quizTitle} to see your summary here.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <GeoButton variant="solid" size="md" asChild>
              <Link to="/play/quiz" search={{ quiz: quiz ?? "" }}>
                Open lobby
              </Link>
            </GeoButton>
            <GeoButton variant="dark" size="md" asChild>
              <Link to="/play">Back to hub</Link>
            </GeoButton>
          </div>
        </div>
      </QuizLayout>
    );
  }

  if (!set) {
    return (
      <QuizLayout width="narrow" className="pt-16">
        <div className="game-surface rounded-2xl p-7 text-center">
          <p className="text-[0.9rem] text-foreground/60">Could not load quiz details.</p>
          <GeoButton variant="dark" size="md" asChild className="mt-4">
            <Link to="/play">Back to hub</Link>
          </GeoButton>
        </div>
      </QuizLayout>
    );
  }

  const isHydrated = !hasRun && hydratedResult !== null;

  return (
    <ResultSummary
      set={set}
      summary={summary}
      serverResult={serverResult}
      submitError={submitError}
      hydrated={isHydrated}
      onPlayAgain={() => {
        start(set.id, mode ?? "solo");
        navigate({ to: "/play/quiz/solo", search: { quiz: set.id } });
      }}
      {...(hasRun ? { reviewSearch: { quiz: set.id } } : {})}
    />
  );
}
