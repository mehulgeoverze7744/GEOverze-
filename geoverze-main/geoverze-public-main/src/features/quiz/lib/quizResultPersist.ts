import {
  QUIZ_RESULT_NEXT_KEY,
  readMigratingValue,
  writePrimaryValue,
} from "@/lib/persist-key-migration";
import type { QuizMode, RunAnswer } from "@/stores/quizStore";

import type { QuizSet } from "../data/types";
import { summarise, type RunSummary } from "./session";
import { storedResultMatches } from "./storedResultMatch";

/** Shape returned by the submit_quiz_attempt RPC (Phase L2 server grading). */
export type AttemptResult = {
  xp_earned: number;
  credits_earned: number;
  new_xp: number;
  new_level: number;
  level_up: boolean;
  new_streak: number;
  new_credits: number;
  total_quizzes: number;
  total_correct: number;
  total_answered: number;
  correct: number;
  total: number;
  score: number;
  best_streak: number;
  duplicate: boolean;
};

export type StoredQuizResult = {
  attemptId: string;
  quizId: string;
  mode: QuizMode;
  summary: RunSummary;
  serverResult: AttemptResult | null;
  answers: Record<string, RunAnswer>;
  startedAt: number | null;
  finishedAt: number;
  persisted: boolean;
};

function sessionStore(): Storage | null {
  try {
    return (globalThis as { sessionStorage?: Storage }).sessionStorage ?? null;
  } catch {
    return null;
  }
}

export function saveQuizResult(data: StoredQuizResult): void {
  const storage = sessionStore();
  if (!storage) return;
  writePrimaryValue(storage, QUIZ_RESULT_NEXT_KEY, JSON.stringify(data));
}

export function loadQuizResult(quizId: string, attemptId?: string | null): StoredQuizResult | null {
  const storage = sessionStore();
  if (!storage || !quizId) return null;
  try {
    const raw = readMigratingValue(storage, QUIZ_RESULT_NEXT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredQuizResult;
    return storedResultMatches(parsed, quizId, attemptId) ? parsed : null;
  } catch {
    return null;
  }
}

/** Snapshot the finished run before the play screen unmounts. */
export function persistFinishedRun(input: {
  set: QuizSet;
  answers: Record<string, RunAnswer>;
  startedAt: number | null;
  finishedAt: number | null;
  attemptId: string | null;
  mode: QuizMode | null;
}): StoredQuizResult | null {
  if (!input.attemptId || Object.keys(input.answers).length === 0) return null;
  const finishedAt = input.finishedAt ?? Date.now();
  const durationMs = Math.max(1, finishedAt - (input.startedAt ?? finishedAt));
  const snapshot: StoredQuizResult = {
    attemptId: input.attemptId,
    quizId: input.set.id,
    mode: input.mode ?? "solo",
    summary: summarise(input.set, input.answers, durationMs),
    serverResult: null,
    answers: input.answers,
    startedAt: input.startedAt,
    finishedAt,
    persisted: false,
  };
  saveQuizResult(snapshot);
  return snapshot;
}

export function markQuizResultPersisted(
  current: StoredQuizResult,
  serverResult: AttemptResult,
  summary: RunSummary,
): StoredQuizResult {
  const next: StoredQuizResult = {
    ...current,
    serverResult,
    summary,
    persisted: true,
  };
  saveQuizResult(next);
  return next;
}
