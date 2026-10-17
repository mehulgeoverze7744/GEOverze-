import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { GeoButton } from "@/components/shared";
import { dashboardQuizAttemptsQueryKey } from "@/features/dashboard/hooks/useDashboardQuizAttempts";
import { quizProgressStatsQueryKey } from "@/features/dashboard/hooks/useQuizProgressStats";
import { streakStatsQueryKey } from "@/features/progression/data/fetchStreakStats";
import { getLevelTitle, getXpProgress } from "@/features/progression/lib/progress";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { useProgressionStore } from "@/stores/progressionStore";
import { useQuizStore } from "@/stores/quizStore";
import { ResultSummary } from "../components/ResultSummary";
import { QuizLayout } from "../components/QuizLayout";
import { fetchOwnedQuizAttempt } from "../data/fetchOwnedQuizAttempt";
import { useQuizSet } from "../hooks/useQuizSet";
import {
  type AttemptResult,
  loadQuizResult,
  markQuizResultPersisted,
  persistFinishedRun,
  type StoredQuizResult,
} from "../lib/quizResultPersist";
import { ratingFor, summarise, type RunSummary } from "../lib/session";

function buildAnswerPayload(
  answers: Record<string, { questionId: string; value: string[] | null; skipped: boolean }>,
) {
  return Object.values(answers).map((answer) => ({
    question_id: answer.questionId,
    value: answer.skipped ? null : answer.value,
    skipped: answer.skipped,
  }));
}

function authoritativeSummary(base: RunSummary, result: AttemptResult): RunSummary {
  const skipped = base.skipped;
  const wrong = Math.max(0, result.total - result.correct - skipped);
  const accuracy = result.total === 0 ? 0 : result.correct / result.total;
  return {
    ...base,
    total: result.total,
    correct: result.correct,
    wrong,
    skipped,
    accuracy,
    score: result.score,
    bestStreak: result.best_streak,
    xp: result.xp_earned,
    rating: ratingFor(accuracy),
  };
}

/** Route screen for /play/quiz/result. */
export function QuizResultScreen() {
  const { quiz, attempt } = useSearch({ from: "/play/quiz/result" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const answers = useQuizStore((s) => s.answers);
  const startedAt = useQuizStore((s) => s.startedAt);
  const finishedAt = useQuizStore((s) => s.finishedAt);
  const start = useQuizStore((s) => s.start);
  const hydrate = useQuizStore((s) => s.hydrate);
  const mode = useQuizStore((s) => s.mode);
  const persisted = useQuizStore((s) => s.persisted);
  const setPersisted = useQuizStore((s) => s.setPersisted);
  const attemptId = useQuizStore((s) => s.attemptId);
  const quizId = useQuizStore((s) => s.quizId);
  const user = useAuthStore((s) => s.user);
  const { set, loading: setLoading } = useQuizSet(quiz);

  const liveForThisQuiz =
    Object.keys(answers).length > 0 &&
    finishedAt !== null &&
    (quizId === quiz || !quizId) &&
    (!attempt || !attemptId || attemptId === attempt);

  const [hydratedResult] = useState<StoredQuizResult | null>(() =>
    liveForThisQuiz ? null : loadQuizResult(quiz ?? "", attempt),
  );

  useEffect(() => {
    if (liveForThisQuiz || !hydratedResult) return;
    if (Object.keys(hydratedResult.answers).length === 0) return;
    hydrate({
      quizId: hydratedResult.quizId,
      mode: hydratedResult.mode,
      index: 0,
      answers: hydratedResult.answers,
      startedAt: hydratedResult.startedAt,
      finishedAt: hydratedResult.finishedAt,
      attemptId: hydratedResult.attemptId,
      status: "complete",
    });
  }, [hydrate, hydratedResult, liveForThisQuiz]);

  const [remoteResult, setRemoteResult] = useState<{
    summary: RunSummary;
    serverResult: AttemptResult;
  } | null>(null);

  const liveSummary = useMemo(
    () =>
      liveForThisQuiz && set
        ? summarise(set, answers, (finishedAt ?? Date.now()) - (startedAt ?? Date.now()))
        : null,
    [answers, finishedAt, liveForThisQuiz, set, startedAt],
  );

  const [serverResult, setServerResult] = useState<AttemptResult | null>(
    hydratedResult?.serverResult ?? null,
  );
  const [submitError, setSubmitError] = useState(false);

  const summary: RunSummary | null = useMemo(() => {
    const base = liveSummary ?? hydratedResult?.summary ?? remoteResult?.summary ?? null;
    if (!base) return null;
    const authoritative = serverResult ?? remoteResult?.serverResult ?? null;
    if (!authoritative) return base;
    return authoritativeSummary(base, authoritative);
  }, [liveSummary, hydratedResult?.summary, remoteResult, serverResult]);

  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (!set || !liveForThisQuiz || hydratedResult) return;
    persistFinishedRun({
      set,
      answers,
      startedAt,
      finishedAt,
      attemptId,
      mode,
    });
  }, [answers, attemptId, finishedAt, hydratedResult, liveForThisQuiz, mode, set, startedAt]);

  useEffect(() => {
    if (liveForThisQuiz || hydratedResult || !user?.id || !quiz) return;
    let cancelled = false;
    void fetchOwnedQuizAttempt(user.id, quiz, attempt).then((owned) => {
      if (cancelled || !owned) return;
      setRemoteResult(owned);
      setServerResult(owned.serverResult);
    });
    return () => {
      cancelled = true;
    };
  }, [attempt, hydratedResult, liveForThisQuiz, quiz, user?.id]);

  const answersForSubmit = useMemo(
    () => (liveForThisQuiz ? answers : (hydratedResult?.answers ?? {})),
    [answers, hydratedResult?.answers, liveForThisQuiz],
  );
  const attemptForSubmit = liveForThisQuiz ? attemptId : hydratedResult?.attemptId;
  const alreadyPersisted = persisted || Boolean(hydratedResult?.persisted) || Boolean(remoteResult);

  useEffect(() => {
    if (
      alreadyPersisted ||
      hasFiredRef.current ||
      !user?.id ||
      !attemptForSubmit ||
      !set ||
      Object.keys(answersForSubmit).length === 0
    ) {
      return;
    }
    hasFiredRef.current = true;

    const stableAttemptId = attemptForSubmit;
    const durationMs = Math.max(
      1,
      (finishedAt ?? hydratedResult?.finishedAt ?? Date.now()) -
        (startedAt ?? hydratedResult?.startedAt ?? 0),
    );
    const answerPayload = buildAnswerPayload(answersForSubmit);
    const baseSummary =
      liveSummary ?? hydratedResult?.summary ?? summarise(set, answersForSubmit, durationMs);

    void supabase
      .rpc("submit_quiz_attempt", {
        _attempt_id: stableAttemptId,
        _quiz_id: set.id,
        _mode: mode ?? hydratedResult?.mode ?? "solo",
        _duration_ms: durationMs,
        _answers: answerPayload,
      })
      .then(({ data, error }) => {
        if (error) {
          console.error("submit_quiz_attempt failed", error);
          setSubmitError(true);
          toast.error("Could not save your quiz result. Your score is shown below.");
          return;
        }

        const result = data as AttemptResult | null;
        if (!result) return;

        const confirmedSummary = authoritativeSummary(baseSummary, result);
        const current = loadQuizResult(set.id, stableAttemptId) ?? hydratedResult;
        if (current) {
          markQuizResultPersisted(current, result, confirmedSummary);
        }

        setPersisted();
        setServerResult(result);
        void queryClient.invalidateQueries({ queryKey: quizProgressStatsQueryKey });
        void queryClient.invalidateQueries({ queryKey: dashboardQuizAttemptsQueryKey });
        void queryClient.invalidateQueries({ queryKey: streakStatsQueryKey });

        if (result.duplicate) return;

        const store = useProgressionStore.getState();
        const player = store.player;
        const { xpIntoLevel, xpForLevel } = getXpProgress(result.new_xp, result.new_level);
        const accuracy =
          result.total_answered > 0
            ? Math.round((result.total_correct / result.total_answered) * 1000) / 10
            : player.accuracy;
        store.setPlayer({
          ...player,
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
    alreadyPersisted,
    answersForSubmit,
    attemptForSubmit,
    finishedAt,
    hydratedResult,
    liveSummary,
    mode,
    queryClient,
    set,
    setPersisted,
    startedAt,
    user?.id,
  ]);

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

  if (!summary) {
    const quizTitle = set?.title ?? quiz ?? "this quiz";
    return (
      <QuizLayout width="narrow" className="pt-16">
        <div className="game-surface rounded-2xl p-7 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">No result yet</h1>
          <p className="mt-2 text-[0.88rem] text-foreground/55">
            Finish {quizTitle} to see your summary here. A completed run is saved for this tab and,
            when you are signed in, on your account.
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

  const isHydrated = !liveForThisQuiz && (hydratedResult !== null || remoteResult !== null);

  return (
    <ResultSummary
      set={set}
      summary={summary}
      serverResult={serverResult}
      submitError={submitError}
      hydrated={isHydrated}
      persistToAccount={Boolean(user?.id)}
      onPlayAgain={() => {
        start(set.id, mode ?? "solo");
        navigate({ to: "/play/quiz/solo", search: { quiz: set.id } });
      }}
      {...(liveForThisQuiz || Object.keys(hydratedResult?.answers ?? {}).length > 0
        ? { reviewSearch: { quiz: set.id } }
        : {})}
    />
  );
}
