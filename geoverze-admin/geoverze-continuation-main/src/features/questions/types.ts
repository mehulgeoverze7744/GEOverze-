export type QuestionType =
  | "Multiple Choice"
  | "True / False"
  | "Fill in the Blank"
  | "Image Based"
  | "Map Based"
  | "Matching"
  | "Ordering";

export type QuestionDifficulty = "Easy" | "Medium" | "Hard" | "Expert";
export type QuestionStatus = "published" | "draft" | "archived";

/** Types the player runtime already renders. The rest are schema-ready only. */
export const playableQuestionTypes: QuestionType[] = [
  "Multiple Choice",
  "True / False",
  "Fill in the Blank",
  "Image Based",
  "Map Based",
];

export const backendReadyQuestionTypes: QuestionType[] = ["Matching", "Ordering"];

export const questionTypes: QuestionType[] = [
  ...playableQuestionTypes,
  ...backendReadyQuestionTypes,
];

export const questionDifficulties: QuestionDifficulty[] = ["Easy", "Medium", "Hard", "Expert"];

export interface QuestionOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface QuestionRecord {
  id: string;
  prompt: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  category: string;
  region: string;
  country: string;
  topic: string;
  tags: string[];
  language: string;
  explanation: string;
  options: QuestionOption[];
  /** Free-text answer for fill-in-the-blank / map questions. */
  answerText: string;
  /** Placeholder reference — no binary is stored in the mock layer. */
  mediaLabel: string;
  requiresMedia: boolean;
  usageCount: number;
  status: QuestionStatus;
  author: string;
  createdAt: string;
  updatedAt: string;
  /** Preserved DB-only fields for complex question types the editor cannot fully round-trip. */
  preservedDbFields?: import("@/features/questions/data/question-mapper").PreservedDbFields;
}

export interface QuestionFilterState {
  type: string;
  difficulty: string;
  status: string;
  region: string;
  language: string;
  topic: string;
}

export const emptyQuestionFilters: QuestionFilterState = {
  type: "all",
  difficulty: "all",
  status: "all",
  region: "all",
  language: "all",
  topic: "all",
};
