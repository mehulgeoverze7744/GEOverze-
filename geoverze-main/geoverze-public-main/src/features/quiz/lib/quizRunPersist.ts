import { readMigratingValue, writePrimaryValue } from "@/lib/persist-key-migration";
import type { QuizMode, QuizStatus, RunAnswer } from "@/stores/quizStore";

export type QuizRunSnapshot = {
  quizId: string;
  mode: QuizMode;
  roomId?: string;
  index: number;
  answers: Record<string, RunAnswer>;
  startedAt: number | null;
  attemptId: string | null;
  status: QuizStatus;
};

export function quizRunPersistKey(scope: string): string {
  return `gvrze.quiz.run.${scope}`;
}

function sessionStore(): Storage | null {
  try {
    const storage = (globalThis as { sessionStorage?: Storage }).sessionStorage;
    return storage ?? null;
  } catch {
    return null;
  }
}

export function loadQuizRun(scope: string): QuizRunSnapshot | null {
  const storage = sessionStore();
  if (!storage) return null;
  try {
    const raw = readMigratingValue(storage, quizRunPersistKey(scope));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizRunSnapshot;
    if (!parsed?.quizId || !parsed.attemptId || parsed.status !== "active") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveQuizRun(scope: string, snapshot: QuizRunSnapshot): void {
  const storage = sessionStore();
  if (!storage) return;
  if (snapshot.status !== "active") {
    clearQuizRun(scope);
    return;
  }
  writePrimaryValue(storage, quizRunPersistKey(scope), JSON.stringify(snapshot));
}

export function clearQuizRun(scope: string): void {
  const storage = sessionStore();
  if (!storage) return;
  try {
    storage.removeItem(quizRunPersistKey(scope));
  } catch {
    // private mode
  }
}
