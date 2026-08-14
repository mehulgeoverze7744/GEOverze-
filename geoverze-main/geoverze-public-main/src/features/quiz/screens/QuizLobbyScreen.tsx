import { useNavigate, useSearch } from "@tanstack/react-router";

import { resolveQuizSet } from "../data/quizSets";
import { useQuizStore } from "@/stores/quizStore";
import { QuizLobby } from "../components/QuizLobby";

/** Route screen for /play/quiz — the pre-run lobby. */
export function QuizLobbyScreen() {
  const { quiz } = useSearch({ from: "/play/quiz/" });
  const navigate = useNavigate();
  const start = useQuizStore((s) => s.start);
  const set = resolveQuizSet(quiz);

  return (
    <QuizLobby
      set={set}
      onStart={() => {
        start(set.id, "solo");
        navigate({ to: "/play/quiz/solo", search: { quiz: set.id } });
      }}
    />
  );
}
