import type { QuestionFilterState, QuestionRecord } from "@/features/questions/types";

export function matchesQuestionSearch(question: QuestionRecord, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    question.id,
    question.prompt,
    question.topic,
    question.category,
    question.country,
    question.region,
    question.author,
    ...question.tags,
  ].some((field) => field.toLowerCase().includes(q));
}

export function filterQuestions(
  questions: QuestionRecord[],
  query: string,
  filters: QuestionFilterState,
): QuestionRecord[] {
  return questions.filter((question) => {
    if (!matchesQuestionSearch(question, query)) return false;
    if (filters.type !== "all" && question.type !== filters.type) return false;
    if (filters.difficulty !== "all" && question.difficulty !== filters.difficulty) return false;
    if (filters.status !== "all" && question.status !== filters.status) return false;
    if (filters.region !== "all" && question.region !== filters.region) return false;
    if (filters.language !== "all" && question.language !== filters.language) return false;
    if (filters.topic !== "all" && question.topic !== filters.topic) return false;
    return true;
  });
}
