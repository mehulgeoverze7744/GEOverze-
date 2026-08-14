/**
 * Pure session helpers: grading, formatting and summarising a run.
 *
 * Everything here is synchronous and local to the browser session — there is no
 * backend, and no result is persisted.
 */
import { PLACEHOLDER_TYPES, type QuizQuestion, type QuizSet } from "../data/types";
import type { RunAnswer } from "@/stores/quizStore";

export type AnswerValue = string[] | null;

export function isPlayable(question: QuizQuestion) {
  return !PLACEHOLDER_TYPES.includes(question.type);
}

function normalise(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}

/** Grade a value against a question. Placeholder types always grade as skipped. */
export function isCorrect(question: QuizQuestion, value: AnswerValue): boolean {
  if (!value || value.length === 0) return false;
  switch (question.type) {
    case "single":
    case "image":
    case "map":
      return value[0] === question.answerId;
    case "boolean":
      return value[0] === String(question.answer);
    case "multiple": {
      const picked = [...value].sort();
      const expected = [...question.answerIds].sort();
      return picked.length === expected.length && picked.every((id, i) => id === expected[i]);
    }
    case "typed":
      return question.accepted.some((a) => normalise(a) === normalise(value[0] ?? ""));
    default:
      return false;
  }
}

/** Human-readable labels for a submitted value. */
export function labelsFor(question: QuizQuestion, value: AnswerValue): string[] {
  if (!value || value.length === 0) return [];
  switch (question.type) {
    case "single":
    case "image":
      return value.map((id) => question.options.find((o) => o.id === id)?.label ?? id);
    case "multiple":
      return value.map((id) => question.options.find((o) => o.id === id)?.label ?? id);
    case "map":
      return value.map((id) => question.regions.find((r) => r.id === id)?.label ?? id);
    case "boolean":
      return value.map((v) => (v === "true" ? "True" : "False"));
    case "typed":
      return value;
    default:
      return value;
  }
}

/** The correct answer, as labels. */
export function correctLabels(question: QuizQuestion): string[] {
  switch (question.type) {
    case "single":
    case "image":
      return labelsFor(question, [question.answerId]);
    case "map":
      return labelsFor(question, [question.answerId]);
    case "multiple":
      return labelsFor(question, question.answerIds);
    case "boolean":
      return [question.answer ? "True" : "False"];
    case "typed":
      return [question.accepted[0] ?? ""];
    default:
      return ["Not yet gradable"];
  }
}

export type RunSummary = {
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  /** 0-1 */
  accuracy: number;
  score: number;
  xp: number;
  credits: number;
  streak: number;
  bestStreak: number;
  durationMs: number;
  rating: { label: string; blurb: string };
};

const RATINGS = [
  {
    min: 0.9,
    label: "Cartographer",
    blurb: "Elite command of the map. Almost nothing slipped past.",
  },
  {
    min: 0.75,
    label: "Navigator",
    blurb: "Strong, confident reading of the world. Very close to flawless.",
  },
  {
    min: 0.5,
    label: "Explorer",
    blurb: "Solid ground covered. A second run should push you higher.",
  },
  {
    min: 0,
    label: "Wanderer",
    blurb: "Every run teaches the map. Review the answers and go again.",
  },
] as const;

const FALLBACK_RATING = RATINGS[RATINGS.length - 1] as { label: string; blurb: string };

export function ratingFor(accuracy: number): { label: string; blurb: string } {
  return RATINGS.find((r) => accuracy >= r.min) ?? FALLBACK_RATING;
}

/** Longest run of consecutive correct answers, in question order. */
function longestStreak(set: QuizSet, answers: Record<string, RunAnswer>) {
  let best = 0;
  let current = 0;
  for (const question of set.questions) {
    if (answers[question.id]?.correct) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

/** Trailing streak at the end of the run. */
function endStreak(set: QuizSet, answers: Record<string, RunAnswer>) {
  let current = 0;
  for (const question of [...set.questions].reverse()) {
    if (answers[question.id]?.correct) current += 1;
    else break;
  }
  return current;
}

export function summarise(
  set: QuizSet,
  answers: Record<string, RunAnswer>,
  durationMs: number,
): RunSummary {
  const total = set.questions.length;
  let correct = 0;
  let wrong = 0;
  let skipped = 0;

  for (const question of set.questions) {
    const answer = answers[question.id];
    if (!answer || answer.skipped) skipped += 1;
    else if (answer.correct) correct += 1;
    else wrong += 1;
  }

  const accuracy = total === 0 ? 0 : correct / total;
  const bestStreak = longestStreak(set, answers);

  return {
    total,
    correct,
    wrong,
    skipped,
    accuracy,
    score: correct * 100 + bestStreak * 25,
    // Placeholder economy until the rewards service lands.
    xp: Math.round(set.rewards.xp * accuracy),
    credits: Math.round(set.rewards.credits * accuracy),
    streak: endStreak(set, answers),
    bestStreak: Math.max(bestStreak, set.bestStreak),
    durationMs,
    rating: ratingFor(accuracy),
  };
}

export function formatDuration(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
