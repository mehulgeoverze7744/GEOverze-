/** Build the answer payload sent to submit_pvp_attempt() / submit_multiplayer_attempt(). */
export function buildAnswerPayload(
  answers: Record<string, { questionId: string; value: string[] | null; skipped: boolean }>,
  validQuestionIds: readonly string[],
) {
  const validIds = new Set(validQuestionIds);
  const staleIds: string[] = [];

  const payload = Object.values(answers)
    .filter((answer) => {
      if (validIds.has(answer.questionId)) return true;
      staleIds.push(answer.questionId);
      return false;
    })
    .map((answer) => ({
      question_id: answer.questionId,
      value: answer.skipped ? null : answer.value,
      skipped: answer.skipped,
    }));

  if (import.meta.env.DEV && staleIds.length > 0) {
    console.warn("[buildAnswerPayload] Excluded stale answer question IDs:", staleIds);
  }

  return payload;
}
