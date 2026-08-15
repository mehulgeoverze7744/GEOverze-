import type { QuestionRecord } from "@/features/questions/types";
import { validateQuestion } from "@/features/questions/validation";
import { isComplexDbType } from "@/features/questions/data/question-mapper";
import type { Enums } from "@/lib/supabase/database.types";
import type { QuizRecord } from "@/features/quizzes/types";

type DbQuestionType = Enums<"question_type">;

/** Returns human-readable validation problems blocking publish. */
export function validateQuizForPublish(
  quiz: QuizRecord,
  questions: QuestionRecord[],
): string[] {
  const problems: string[] = [];

  if (!quiz.title.trim()) {
    problems.push("Quiz title is required before publishing.");
  }

  if (questions.length < 3) {
    problems.push(`At least 3 questions are required (currently ${questions.length}).`);
  }

  questions.forEach((question, index) => {
    const dbType = question.preservedDbFields?.["type"];
    if (dbType && isComplexDbType(dbType)) {
      if (!question.prompt.trim()) {
        problems.push(`Question ${index + 1} is missing prompt text.`);
      }
      return;
    }

    const issues = validateQuestion(question);
    if (issues.length > 0) {
      problems.push(`Question ${index + 1}: ${issues.map((i) => i.message).join("; ")}`);
    }
  });

  return problems;
}
