import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Swords } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { GeoButton, SectionContainer } from "@/components/shared";
import { QuizPlay } from "@/features/quiz/components/QuizPlay";
import { useQuizSet } from "@/features/quiz";
import { selectUser, useAuthStore } from "@/stores/authStore";
import { refreshProgression } from "@/lib/supabase/auth-sync";
import { useQuizStore } from "@/stores/quizStore";
import { PvpMatchResult } from "../components/PvpMatchResult";
import { PvpOpponentPanel } from "../components/PvpOpponentPanel";
import { submitPvpAttempt } from "../data/pvpRoomApi";
import { buildAnswerPayload } from "../lib/buildAnswerPayload";
import type { PvpRoomState } from "../types";

type PvpMatchScreenProps = {
  roomId: string | undefined;
  code: string | undefined;
  state: PvpRoomState | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

/** PvP match — quiz play, submission, waiting, and final results. */
export function PvpMatchScreen({
  roomId,
  code,
  state,
  loading,
  error,
  refresh,
}: PvpMatchScreenProps) {
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const { set, loading: setLoading } = useQuizSet(state?.room.quiz_id);

  const quizStatus = useQuizStore((s) => s.status);
  const answers = useQuizStore((s) => s.answers);
  const attemptId = useQuizStore((s) => s.attemptId);
  const startedAt = useQuizStore((s) => s.startedAt);
  const finishedAt = useQuizStore((s) => s.finishedAt);
  const start = useQuizStore((s) => s.start);
  const reset = useQuizStore((s) => s.reset);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  /** Tracks which room_id received a fresh local quiz run via start(). */
  const initializedRoomIdRef = useRef<string | null>(null);
  const hasFiredRef = useRef(false);

  const you = state?.participants.find((p) => p.user_id === user?.id) ?? null;
  const opponent = state?.participants.find((p) => p.user_id !== user?.id) ?? null;
  const roomCompleted = state?.room.status === "completed";
  const youSubmitted = Boolean(you?.submitted_at);
  const opponentSubmitted = Boolean(opponent?.submitted_at);
  const rewardsSettled = Boolean(state?.room.rewards_settled_at);

  useEffect(() => {
    if (!roomCompleted || !rewardsSettled || !user?.id) return;
    void refreshProgression(user.id);
  }, [roomCompleted, rewardsSettled, user?.id]);

  // Reset room-scoped guards when entering a different PvP room.
  useEffect(() => {
    initializedRoomIdRef.current = null;
    hasFiredRef.current = false;
  }, [roomId]);

  // Start exactly one fresh quiz run per room while playing and not yet submitted.
  useEffect(() => {
    if (!roomId || !set || !state || state.room.status !== "playing" || youSubmitted) return;
    if (initializedRoomIdRef.current === roomId) return;

    start(set.id, "pvp");
    initializedRoomIdRef.current = roomId;
    hasFiredRef.current = false;
  }, [roomId, set, start, state, youSubmitted]);

  // Submit answers once when the local run for this room finishes.
  const submitAttempt = useCallback(async () => {
    if (
      !roomId ||
      !attemptId ||
      !set ||
      initializedRoomIdRef.current !== roomId ||
      state?.room.status !== "playing" ||
      youSubmitted ||
      quizStatus !== "complete" ||
      hasFiredRef.current
    ) {
      return;
    }

    hasFiredRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    const durationMs = Math.max(1, (finishedAt ?? Date.now()) - (startedAt ?? 0));
    const validQuestionIds = set.questions.map((q) => q.id);
    const payload = buildAnswerPayload(answers, validQuestionIds);

    try {
      await submitPvpAttempt(roomId, attemptId, durationMs, payload);
      await refresh();
    } catch (err) {
      hasFiredRef.current = false;
      const message = err instanceof Error ? err.message : "Could not submit duel answers";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }, [
    answers,
    attemptId,
    finishedAt,
    quizStatus,
    refresh,
    roomId,
    set,
    startedAt,
    state?.room.status,
    youSubmitted,
  ]);

  useEffect(() => {
    if (submitError) return;
    void submitAttempt();
  }, [submitAttempt, submitError]);

  if (loading || setLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent text-bronze"
            aria-label="Loading match…"
          />
        </div>
      </PageShell>
    );
  }

  if (error || !state || !set || !roomId) {
    return (
      <PageShell>
        <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
          <div className="game-surface rounded-2xl p-7 text-center">
            <h1 className="text-xl font-semibold text-foreground">Match unavailable</h1>
            <p className="mt-2 text-[0.9rem] text-foreground/60">
              {error ?? "This match could not be loaded."}
            </p>
            <GeoButton variant="solid" size="md" className="mt-6" asChild>
              <Link to="/play/pvp">Back to PvP</Link>
            </GeoButton>
          </div>
        </SectionContainer>
      </PageShell>
    );
  }

  if (roomCompleted) {
    return (
      <PvpMatchResult
        set={set}
        room={state.room}
        participants={state.participants}
        youUserId={user?.id}
        roomCode={code}
      />
    );
  }

  if (
    submitting ||
    (quizStatus === "complete" &&
      !youSubmitted &&
      !submitError &&
      initializedRoomIdRef.current === roomId)
  ) {
    return (
      <PageShell>
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-6 w-6 animate-spin text-bronze" aria-hidden />
          <p className="text-[0.9rem] text-foreground/60">Submitting your answers…</p>
        </div>
      </PageShell>
    );
  }

  if (youSubmitted && !roomCompleted) {
    return (
      <PageShell>
        <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
          <div className="game-surface mx-auto max-w-lg rounded-2xl p-8 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-bronze/30 bg-bronze/10 text-bronze-glow">
              <Swords className="h-6 w-6" strokeWidth={1.8} aria-hidden />
            </span>
            <h1 className="mt-5 text-xl font-semibold text-foreground">Waiting for opponent</h1>
            <p className="mt-2 text-[0.9rem] leading-relaxed text-foreground/60">
              Your answers were submitted and graded by the server.
              {opponentSubmitted
                ? " Finalising the match…"
                : ` Waiting for ${opponent?.username ?? "your opponent"} to finish.`}
            </p>
            {you?.score != null ? (
              <p className="mt-4 text-[0.85rem] text-foreground/55">
                Your score: <span className="font-semibold text-foreground">{you.score}</span> (
                {you.correct ?? 0}/{you.total ?? 0} correct)
              </p>
            ) : null}
            <div className="mt-6">
              <PvpOpponentPanel
                participants={state.participants}
                youUserId={user?.id}
                roomStatus={state.room.status}
              />
            </div>
          </div>
        </SectionContainer>
      </PageShell>
    );
  }

  if (submitError) {
    return (
      <PageShell>
        <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
          <div className="game-surface mx-auto max-w-lg rounded-2xl p-8 text-center">
            <h1 className="text-xl font-semibold text-foreground">Submission failed</h1>
            <p className="mt-2 text-[0.9rem] text-foreground/60">{submitError}</p>
            <GeoButton
              variant="solid"
              size="md"
              className="mt-6"
              onClick={() => {
                setSubmitError(null);
                void submitAttempt();
              }}
            >
              Retry submission
            </GeoButton>
          </div>
        </SectionContainer>
      </PageShell>
    );
  }

  return (
    <QuizPlay
      set={set}
      mode="pvp"
      sidebar={
        <PvpOpponentPanel
          participants={state.participants}
          youUserId={user?.id}
          roomStatus={state.room.status}
        />
      }
      onFinish={() => {
        /* finish() is called inside QuizPlay; submission effect handles RPC */
      }}
      onExit={() => {
        reset();
        void navigate({ to: "/play/pvp" });
      }}
    />
  );
}
