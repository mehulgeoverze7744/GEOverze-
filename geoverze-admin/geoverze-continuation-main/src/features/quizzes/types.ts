export type QuizStatus = "draft" | "published" | "archived";
export type QuizVisibility = "Public" | "Unlisted" | "Private";
export type QuizDifficulty = "Easy" | "Medium" | "Hard" | "Expert";

export interface QuizVersion {
  id: string;
  version: string;
  author: string;
  summary: string;
  at: string;
}

export interface QuizActivity {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
}

export interface QuizRecord {
  id: string;
  title: string;
  creatorId: string;
  creator: string;
  category: string;
  difficulty: QuizDifficulty;
  questionCount: number;
  durationMinutes: number;
  status: QuizStatus;
  visibility: QuizVisibility;
  language: string;
  tags: string[];
  thumbnailLabel: string;
  timeLimitMinutes: number;
  passingScore: number;
  instructions: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  plays: number;
  completionRate: number;
  averageScore: number;
  rating: number;
  ratingCount: number;
  questionIds: string[];
  difficultyMix: Record<QuizDifficulty, number>;
  playsSeries: number[];
  activity: QuizActivity[];
  versions: QuizVersion[];
}

export interface QuizFilterState {
  status: string;
  category: string;
  difficulty: string;
  visibility: string;
  language: string;
  creator: string;
}

export const emptyQuizFilters: QuizFilterState = {
  status: "all",
  category: "all",
  difficulty: "all",
  visibility: "all",
  language: "all",
  creator: "all",
};

export const quizDifficulties: QuizDifficulty[] = ["Easy", "Medium", "Hard", "Expert"];
