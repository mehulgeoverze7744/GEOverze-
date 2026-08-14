import type { Choice, QuizQuestion } from "../data/types";

/** Shared shape for every question renderer. */
export type QuestionViewProps<T extends QuizQuestion = QuizQuestion> = {
  question: T;
  /** Current selection: option ids, "true"/"false", or typed text. */
  value: string[] | null;
  /** True once the answer is committed — renderers then show feedback. */
  locked: boolean;
  onSelect: (value: string[]) => void;
};

import type { AnswerState } from "./AnswerCard";

/** Option state resolver shared by every choice-style renderer. */
export function optionState({
  id,
  value,
  locked,
  correctIds,
}: {
  id: string;
  value: string[] | null;
  locked: boolean;
  correctIds: string[];
}): AnswerState {
  const selected = value?.includes(id) ?? false;
  if (!locked) return selected ? "selected" : "idle";
  if (correctIds.includes(id)) return "correct";
  if (selected) return "incorrect";
  return "muted";
}

export const SHORTCUTS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function choiceShortcut(index: number): string {
  return SHORTCUTS[index] ?? String(index + 1);
}

export type { Choice };
