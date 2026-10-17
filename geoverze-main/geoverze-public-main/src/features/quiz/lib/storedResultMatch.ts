/** Whether a tab-scoped saved result belongs to the quiz/attempt in the URL. */
export function storedResultMatches(
  parsed: { quizId: string; attemptId: string },
  quizId: string,
  attemptId?: string | null,
): boolean {
  if (parsed.quizId !== quizId) return false;
  if (attemptId && parsed.attemptId !== attemptId) return false;
  return true;
}
