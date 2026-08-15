import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";

import { useQuizStore, type QuizMode } from "@/stores/quizStore";
import { OpponentPanel } from "../components/OpponentPanel";
import { QuizPlay } from "../components/QuizPlay";
import { useQuizSet } from "../hooks/useQuizSet";

type PlayRoute = "/play/quiz/solo" | "/play/quiz/pvp" | "/play/quiz/multiplayer";

/**
 * Shared route screen for every play mode.
 *
 * Solo, duel and multiplayer run the same engine; only the header label and the
 * opponent panel differ while the realtime service is still to come.
 */
export function QuizPlayScreen({ mode, from }: { mode: QuizMode; from: PlayRoute }) {
  const { quiz } = useSearch({ from });
  const navigate = useNavigate();
  const status = useQuizStore((s) => s.status);
  const quizId = useQuizStore((s) => s.quizId);
  const start = useQuizStore((s) => s.start);
  const reset = useQuizStore((s) => s.reset);
  const { set, loading, error } = useQuizSet(quiz);

  // Deep-linked or refreshed runs start cleanly rather than showing an empty state.
  // Guard on set being loaded — do not call start() until questions are available.
  useEffect(() => {
    if (!set) return;
    if (status === "idle" || quizId !== set.id) start(set.id, mode);
  }, [mode, quizId, set, start, status]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div
          className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent text-bronze"
          aria-label="Loading quiz…"
        />
      </div>
    );
  }

  if (error || !set) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-[0.9rem] text-foreground/60">
          {error ?? "Could not load quiz. Please try again."}
        </p>
        <Link
          to="/play"
          className="text-[0.85rem] font-medium text-bronze underline-offset-2 hover:text-bronze-glow hover:underline"
        >
          Back to hub
        </Link>
      </div>
    );
  }

  return (
    <QuizPlay
      set={set}
      mode={mode}
      sidebar={mode === "pvp" || mode === "multiplayer" ? <OpponentPanel mode={mode} /> : undefined}
      onFinish={() => navigate({ to: "/play/quiz/result", search: { quiz: set.id } })}
      onExit={() => {
        reset();
        navigate({ to: "/play" });
      }}
    />
  );
}
