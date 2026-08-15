import { Link, useNavigate, useSearch } from "@tanstack/react-router";

import { useQuizStore } from "@/stores/quizStore";
import { QuizLobby } from "../components/QuizLobby";
import { useQuizSet } from "../hooks/useQuizSet";

/** Route screen for /play/quiz — the pre-run lobby. */
export function QuizLobbyScreen() {
  const { quiz } = useSearch({ from: "/play/quiz/" });
  const navigate = useNavigate();
  const start = useQuizStore((s) => s.start);
  const { set, loading, error } = useQuizSet(quiz);

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
    <QuizLobby
      set={set}
      onStart={() => {
        start(set.id, "solo");
        navigate({ to: "/play/quiz/solo", search: { quiz: set.id } });
      }}
    />
  );
}
