import type { QuestionRecord } from "@/features/questions/types";
import { questionDifficulties } from "@/features/questions/types";

export type QuestionIssueCode =
  | "empty-question"
  | "missing-answer"
  | "duplicate-options"
  | "missing-media"
  | "incomplete-explanation"
  | "invalid-difficulty";

export interface QuestionIssue {
  code: QuestionIssueCode;
  field: "prompt" | "options" | "answerText" | "mediaLabel" | "explanation" | "difficulty";
  message: string;
}

const CHOICE_TYPES = new Set(["Multiple Choice", "True / False", "Matching", "Ordering"]);
const MEDIA_TYPES = new Set(["Image Based", "Map Based"]);

/**
 * Single validation pass shared by the editor, the table badge and bulk publish.
 * Pure and backend-ready: the same rules can run server-side unchanged.
 */
export function validateQuestion(question: Partial<QuestionRecord>): QuestionIssue[] {
  const issues: QuestionIssue[] = [];
  const type = question.type ?? "Multiple Choice";
  const options = question.options ?? [];

  if (!question.prompt?.trim()) {
    issues.push({
      code: "empty-question",
      field: "prompt",
      message: "Question text is empty.",
    });
  }

  if (CHOICE_TYPES.has(type)) {
    if (options.length < 2) {
      issues.push({
        code: "missing-answer",
        field: "options",
        message: "Add at least two answer options.",
      });
    } else if (!options.some((option) => option.correct)) {
      issues.push({
        code: "missing-answer",
        field: "options",
        message: "Mark one option as the correct answer.",
      });
    }

    const seen = new Set<string>();
    const duplicated = options.some((option) => {
      const key = option.text.trim().toLowerCase();
      if (!key) return false;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
    if (duplicated) {
      issues.push({
        code: "duplicate-options",
        field: "options",
        message: "Two answer options are identical.",
      });
    }
  } else if (!question.answerText?.trim()) {
    issues.push({
      code: "missing-answer",
      field: "answerText",
      message: "Provide the expected answer.",
    });
  }

  if ((MEDIA_TYPES.has(type) || question.requiresMedia) && !question.mediaLabel?.trim()) {
    issues.push({
      code: "missing-media",
      field: "mediaLabel",
      message: "This question type needs an image or map reference.",
    });
  }

  const explanation = question.explanation?.trim() ?? "";
  if (explanation.length < 20) {
    issues.push({
      code: "incomplete-explanation",
      field: "explanation",
      message: "Explanations should be at least 20 characters.",
    });
  }

  if (!question.difficulty || !questionDifficulties.includes(question.difficulty)) {
    issues.push({
      code: "invalid-difficulty",
      field: "difficulty",
      message: "Select a valid difficulty.",
    });
  }

  return issues;
}

export function issuesFor(issues: QuestionIssue[], field: QuestionIssue["field"]): QuestionIssue[] {
  return issues.filter((issue) => issue.field === field);
}
