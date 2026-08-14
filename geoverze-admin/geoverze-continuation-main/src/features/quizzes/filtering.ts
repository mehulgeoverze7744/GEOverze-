import type { QuizFilterState, QuizRecord } from "@/features/quizzes/types";

export function matchesQuizSearch(quiz: QuizRecord, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [quiz.id, quiz.title, quiz.creator, quiz.category, quiz.language, ...quiz.tags]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export function filterQuizzes(list: QuizRecord[], query: string, filters: QuizFilterState) {
  return list.filter((quiz) => {
    if (!matchesQuizSearch(quiz, query)) return false;
    if (filters.status !== "all" && quiz.status !== filters.status) return false;
    if (filters.category !== "all" && quiz.category !== filters.category) return false;
    if (filters.difficulty !== "all" && quiz.difficulty !== filters.difficulty) return false;
    if (filters.visibility !== "all" && quiz.visibility !== filters.visibility) return false;
    if (filters.language !== "all" && quiz.language !== filters.language) return false;
    if (filters.creator !== "all" && quiz.creator !== filters.creator) return false;
    return true;
  });
}
