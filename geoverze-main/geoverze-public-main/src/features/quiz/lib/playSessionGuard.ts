import type { QuizMode, QuizStatus } from "@/stores/quizStore";

/**
 * Whether the play route should start or hydrate a new run.
 *
 * A just-finished quiz must keep its answers so the result route can read
 * them. Restarting on `complete` was wiping Flag Frenzy (and every other quiz)
 * before `/play/quiz/result` mounted.
 */
export function shouldStartOrHydratePlayRun(input: {
  status: QuizStatus;
  quizId: string | null;
  storeMode: QuizMode | null;
  setId: string;
  mode: QuizMode;
}): boolean {
  const sameQuiz = input.quizId === input.setId;
  if (input.status === "active" && sameQuiz && input.storeMode === input.mode) {
    return false;
  }
  if (input.status === "complete" && sameQuiz) {
    return false;
  }
  return true;
}
