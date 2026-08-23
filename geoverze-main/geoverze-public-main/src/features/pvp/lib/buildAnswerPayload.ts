/** Build the answer payload sent to submit_pvp_attempt(). */
export function buildAnswerPayload(
  answers: Record<string, { questionId: string; value: string[] | null; skipped: boolean }>,
) {
  return Object.values(answers).map((answer) => ({
    question_id: answer.questionId,
    value: answer.skipped ? null : answer.value,
    skipped: answer.skipped,
  }));
}
