import type { BankQuestionFilterState, BankQuestionRecord } from "@/features/questions/types";

export function matchesBankQuestionSearch(question: BankQuestionRecord, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [question.id, question.prompt, question.explanation, question.quizTitle, question.type].some(
    (field) => field.toLowerCase().includes(q),
  );
}

export function filterBankQuestions(
  questions: BankQuestionRecord[],
  query: string,
  filters: BankQuestionFilterState,
): BankQuestionRecord[] {
  return questions.filter((question) => {
    if (!matchesBankQuestionSearch(question, query)) return false;
    if (filters.type !== "all" && question.type !== filters.type) return false;
    if (filters.quizId !== "all" && question.quizId !== filters.quizId) return false;
    if (filters.quizStatus === "published" && !question.quizPublished) return false;
    if (filters.quizStatus === "draft" && question.quizPublished) return false;
    return true;
  });
}
