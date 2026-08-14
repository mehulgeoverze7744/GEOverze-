/**
 * Quiz run state.
 *
 * Holds the active run so the play → result → review handoff needs no prop
 * drilling. Deliberately transient: a refresh should not resume a timed round,
 * and nothing here is persisted or sent anywhere.
 */
import { create } from "zustand";

export type QuizMode = "solo" | "pvp" | "multiplayer" | "practice";
export type QuizStatus = "idle" | "active" | "complete";

export type RunAnswer = {
  questionId: string;
  /** Normalised submitted value: option ids, "true"/"false", or typed text. */
  value: string[] | null;
  correct: boolean;
  skipped: boolean;
  /** Milliseconds taken to answer. */
  elapsedMs: number;
};

/** Placeholder settings panel — present, interactive, not yet wired to play. */
export type QuizSettings = {
  difficulty: "Adaptive" | "Easy" | "Medium" | "Hard" | "Expert";
  questionCount: "All" | "5" | "10" | "20";
  timeLimit: "Off" | "15s" | "30s" | "60s";
  sound: boolean;
  music: boolean;
  animations: boolean;
};

export const DEFAULT_SETTINGS: QuizSettings = {
  difficulty: "Adaptive",
  questionCount: "All",
  timeLimit: "30s",
  sound: true,
  music: false,
  animations: true,
};

type QuizState = {
  status: QuizStatus;
  mode: QuizMode | null;
  quizId: string | null;
  index: number;
  answers: Record<string, RunAnswer>;
  startedAt: number | null;
  finishedAt: number | null;
  settings: QuizSettings;
  start: (quizId: string, mode: QuizMode) => void;
  record: (answer: RunAnswer) => void;
  goTo: (index: number) => void;
  next: () => void;
  previous: () => void;
  finish: () => void;
  reset: () => void;
  updateSettings: (patch: Partial<QuizSettings>) => void;
};

const initial = {
  status: "idle" as QuizStatus,
  mode: null,
  quizId: null,
  index: 0,
  answers: {} as Record<string, RunAnswer>,
  startedAt: null,
  finishedAt: null,
};

export const useQuizStore = create<QuizState>((set) => ({
  ...initial,
  settings: DEFAULT_SETTINGS,
  start: (quizId, mode) =>
    set({ ...initial, status: "active", quizId, mode, startedAt: Date.now() }),
  record: (answer) =>
    set((state) => ({ answers: { ...state.answers, [answer.questionId]: answer } })),
  goTo: (index) => set({ index: Math.max(0, index) }),
  next: () => set((state) => ({ index: state.index + 1 })),
  previous: () => set((state) => ({ index: Math.max(0, state.index - 1) })),
  finish: () => set({ status: "complete", finishedAt: Date.now() }),
  reset: () => set({ ...initial }),
  updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),
}));

export const selectScore = (s: QuizState) =>
  Object.values(s.answers).reduce((n, a) => n + (a.correct ? 1 : 0), 0);

export const selectAnswered = (s: QuizState) => Object.keys(s.answers).length;

export const selectAccuracy = (s: QuizState) => {
  const answered = Object.values(s.answers).filter((a) => !a.skipped);
  return answered.length === 0 ? 0 : selectScore(s) / answered.length;
};

export const selectHasRun = (s: QuizState) => s.quizId !== null;
