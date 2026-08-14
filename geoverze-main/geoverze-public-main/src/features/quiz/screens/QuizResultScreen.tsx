import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";

import { GeoButton } from "@/components/shared";
import { useQuizStore } from "@/stores/quizStore";
import { ResultSummary } from "../components/ResultSummary";
import { QuizLayout } from "../components/QuizLayout";
import { resolveQuizSet } from "../data/quizSets";
import { summarise } from "../lib/session";

/** Route screen for /play/quiz/result. */
export function QuizResultScreen() {
  const { quiz } = useSearch({ from: "/play/quiz/result" });
  const navigate = useNavigate();
  const answers = useQuizStore((s) => s.answers);
  const startedAt = useQuizStore((s) => s.startedAt);
  const finishedAt = useQuizStore((s) => s.finishedAt);
  const start = useQuizStore((s) => s.start);
  const mode = useQuizStore((s) => s.mode);
  const set = resolveQuizSet(quiz);
  const hasRun = Object.keys(answers).length > 0;

  const summary = useMemo(
    () => summarise(set, answers, (finishedAt ?? Date.now()) - (startedAt ?? Date.now())),
    [answers, finishedAt, set, startedAt],
  );

  if (!hasRun) {
    return (
      <QuizLayout width="narrow" className="pt-16">
        <div className="game-surface rounded-2xl p-7 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">No result yet</h1>
          <p className="mt-2 text-[0.88rem] text-foreground/55">
            Runs are not stored between visits. Play {set.title} to see your summary here.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <GeoButton variant="solid" size="md" asChild>
              <Link to="/play/quiz" search={{ quiz: set.id }}>
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

  return (
    <ResultSummary
      set={set}
      summary={summary}
      reviewSearch={{ quiz: set.id }}
      onPlayAgain={() => {
        start(set.id, mode ?? "solo");
        navigate({ to: "/play/quiz/solo", search: { quiz: set.id } });
      }}
    />
  );
}
