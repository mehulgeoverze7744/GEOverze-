import type { BankQuestionRecord } from "@/features/questions/types";
import { questionTypes } from "@/features/questions/types";

export interface BankQuestionStatsSummary {
  total: number;
  publishedQuizQuestions: number;
  draftQuizQuestions: number;
  uniqueQuizzes: number;
  typeCounts: { label: string; count: number }[];
}

export function summarizeBankQuestions(list: BankQuestionRecord[]): BankQuestionStatsSummary {
  const quizIds = new Set(list.map((question) => question.quizId));

  return {
    total: list.length,
    publishedQuizQuestions: list.filter((question) => question.quizPublished).length,
    draftQuizQuestions: list.filter((question) => !question.quizPublished).length,
    uniqueQuizzes: quizIds.size,
    typeCounts: questionTypes.map((type) => ({
      label: type,
      count: list.filter((question) => question.type === type).length,
    })),
  };
}

export function toBankChartSeries(counts: { label: string; count: number }[]) {
  const max = Math.max(1, ...counts.map((entry) => entry.count));
  return {
    labels: counts.map((entry) => entry.label),
    series: counts.map((entry) => Math.round((entry.count / max) * 100)),
  };
}
