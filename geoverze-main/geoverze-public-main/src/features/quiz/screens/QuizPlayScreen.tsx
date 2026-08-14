import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";

import { useQuizStore, type QuizMode } from "@/stores/quizStore";
import { OpponentPanel } from "../components/OpponentPanel";
import { QuizPlay } from "../components/QuizPlay";
import { resolveQuizSet } from "../data/quizSets";

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
  const set = resolveQuizSet(quiz);

  // Deep-linked or refreshed runs start cleanly rather than showing an empty state.
  useEffect(() => {
    if (status === "idle" || quizId !== set.id) start(set.id, mode);
  }, [mode, quizId, set.id, start, status]);

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
