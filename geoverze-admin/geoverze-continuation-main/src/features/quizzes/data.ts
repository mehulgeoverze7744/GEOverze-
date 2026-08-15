import { creatorRecords } from "@/features/creators/data";
import { questionRecords } from "@/features/questions/data";
import type { QuestionRecord } from "@/features/questions/types";
import {
  catalogDaysAgo,
  contentTags,
  languages,
  pickFrom,
  quizCategories,
  rng,
} from "@/lib/catalog";
import {
  quizDifficulties,
  type QuizActivity,
  type QuizDifficulty,
  type QuizRecord,
  type QuizStatus,
  type QuizVersion,
  type QuizVisibility,
} from "@/features/quizzes/types";

const titleLead = [
  "World Capitals",
  "Tectonic Plates",
  "River Systems",
  "Climate Zones",
  "Ocean Currents",
  "Mountain Ranges",
  "Island Nations",
  "Desert Belts",
  "Flag Sprint",
  "Border Puzzle",
  "Great Lakes",
  "Arctic Atlas",
];

const titleTail = ["Challenge", "Masterclass", "Sprint", "Deep Dive", "Field Test", "Rapid Round"];

const visibilities: QuizVisibility[] = ["Public", "Public", "Unlisted", "Private"];

function buildVersions(rand: () => number, index: number, author: string): QuizVersion[] {
  const count = Math.floor(rand() * 3) + 2;
  return Array.from({ length: count }, (_, v) => ({
    id: `QV-${index}-${v}`,
    version: `v1.${count - v - 1}`,
    author: v === 0 ? author : "Content Ops",
    summary:
      v === 0
        ? "Current published revision."
        : pickFrom(rand, [
            "Reworded three questions for clarity.",
            "Replaced outdated map imagery.",
            "Adjusted passing score and time limit.",
            "Added two expert-level questions.",
          ]),
    at: catalogDaysAgo(v * 34 + Math.floor(rand() * 12) + 2, 11),
  }));
}

function buildActivity(rand: () => number, index: number, title: string): QuizActivity[] {
  return Array.from({ length: 5 }, (_, a) => ({
    id: `QA-${index}-${a}`,
    actor: pickFrom(rand, ["M. Alvarez", "J. Kim", "S. Patel", "Content Ops"]),
    action: pickFrom(rand, [
      "published",
      "updated the question set of",
      "changed visibility on",
      "reviewed reports for",
      "archived a revision of",
    ]),
    target: title,
    time: catalogDaysAgo(a * 4 + 1, 9),
  }));
}

function buildQuiz(index: number): QuizRecord {
  const rand = rng(index * 4523 + 271);
  const creator = creatorRecords[index % creatorRecords.length];
  const title = `${pickFrom(rand, titleLead)} ${pickFrom(rand, titleTail)}`;
  const status = pickFrom<QuizStatus>(rand, [
    "published",
    "published",
    "published",
    "draft",
    "archived",
  ]);
  const difficulty = pickFrom(rand, quizDifficulties) as QuizDifficulty;
  const questionCount = Math.floor(rand() * 22) + 8;
  const questionIds = Array.from(
    { length: questionCount },
    (_, q) => (questionRecords[(index * 7 + q * 3) % questionRecords.length] as QuestionRecord).id,
  );
  const plays =
    status === "published" ? Math.floor(rand() * 96000) + 450 : Math.floor(rand() * 300);
  const createdDays = Math.floor(rand() * 700) + 20;

  const mix: Record<QuizDifficulty, number> = { Easy: 0, Medium: 0, Hard: 0, Expert: 0 };
  for (const id of questionIds) {
    const question = questionRecords.find((entry) => entry.id === id);
    if (question) mix[question.difficulty] += 1;
  }

  return {
    id: `QZ-${String(3000 + index)}`,
    title,
    creatorId: creator?.id ?? "CR-1001",
    creator: creator?.displayName ?? "GEOverze Studio",
    category: pickFrom(rand, quizCategories),
    difficulty,
    questionCount,
    durationMinutes: Math.max(3, Math.round(questionCount * 0.75)),
    status,
    visibility: pickFrom(rand, visibilities),
    language: pickFrom(rand, languages),
    tags: [pickFrom(rand, contentTags), pickFrom(rand, contentTags)].filter(
      (tag, i, all) => all.indexOf(tag) === i,
    ),
    thumbnailLabel: `thumbnails/${title.toLowerCase().replace(/\s+/g, "-")}.jpg`,
    timeLimitMinutes: pickFrom(rand, [0, 5, 10, 15, 20]),
    passingScore: pickFrom(rand, [50, 60, 70, 80]),
    instructions: "Answer every question. You can review explanations after each answer.",
    description: `A ${difficulty.toLowerCase()} ${questionCount}-question tour of the topic, curated by ${creator?.displayName ?? "GEOverze Studio"}.`,
    rewardXp: 0,
    rewardCredits: 0,
    createdAt: catalogDaysAgo(createdDays, 10),
    updatedAt: catalogDaysAgo(Math.max(1, createdDays - Math.floor(rand() * 400)), 16),
    plays,
    completionRate: Math.floor(rand() * 38) + 58,
    averageScore: Math.floor(rand() * 34) + 60,
    rating: Math.round((rand() * 1.8 + 3.2) * 10) / 10,
    ratingCount: Math.floor(rand() * 2400) + 12,
    questionIds,
    difficultyMix: mix,
    playsSeries: Array.from({ length: 12 }, (_, m) => Math.floor(35 + rand() * 55 + m * 1.6)),
    activity: buildActivity(rand, index, title),
    versions: buildVersions(rand, index, creator?.displayName ?? "GEOverze Studio"),
  };
}

const records: QuizRecord[] = Array.from({ length: 64 }, (_, i) => buildQuiz(i + 1));

/** Mock service layer — swap the bodies for Lovable Cloud queries later. */
export function getQuizzes(): QuizRecord[] {
  return records;
}

export function getQuizById(id: string): QuizRecord | undefined {
  return records.find((quiz) => quiz.id === id);
}

export function getQuizQuestions(quiz: QuizRecord): QuestionRecord[] {
  return quiz.questionIds
    .map((id) => questionRecords.find((question) => question.id === id))
    .filter((question): question is QuestionRecord => question !== undefined);
}

export const quizRecords = records;
export const quizCreators = Array.from(new Set(records.map((quiz) => quiz.creator))).sort();

export interface QuizStatsSummary {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalQuestions: number;
  averageDifficulty: string;
  mostPlayed: QuizRecord | undefined;
  highestRated: QuizRecord | undefined;
}

const difficultyWeight: Record<QuizDifficulty, number> = { Easy: 1, Medium: 2, Hard: 3, Expert: 4 };

export function summarizeQuizzes(list: QuizRecord[]): QuizStatsSummary {
  const byStatus = (status: QuizStatus) => list.filter((quiz) => quiz.status === status).length;
  const weight = list.length
    ? list.reduce((sum, quiz) => sum + difficultyWeight[quiz.difficulty], 0) / list.length
    : 0;
  const averageDifficulty =
    (quizDifficulties.find((level) => difficultyWeight[level] === Math.round(weight)) ?? "Medium") +
    ` (${weight.toFixed(1)}/4)`;

  return {
    total: list.length,
    published: byStatus("published"),
    draft: byStatus("draft"),
    archived: byStatus("archived"),
    totalQuestions: list.reduce((sum, quiz) => sum + quiz.questionCount, 0),
    averageDifficulty,
    mostPlayed: [...list].sort((a, b) => b.plays - a.plays)[0],
    highestRated: [...list].sort((a, b) => b.rating - a.rating)[0],
  };
}

export function quizCategorySeries(list: QuizRecord[]) {
  const counts = quizCategories.map(
    (category) => list.filter((quiz) => quiz.category === category).length,
  );
  const max = Math.max(1, ...counts);
  return {
    labels: quizCategories,
    series: counts.map((value) => Math.round((value / max) * 100)),
  };
}

export function quizPlaysSeries(list: QuizRecord[]) {
  const totals = Array.from({ length: 12 }, (_, month) =>
    list.reduce((sum, quiz) => sum + (quiz.playsSeries[month] ?? 0), 0),
  );
  const max = Math.max(1, ...totals);
  return totals.map((value) => Math.round((value / max) * 100));
}

export function quizDifficultySeries(list: QuizRecord[]) {
  const counts = quizDifficulties.map(
    (level) => list.filter((quiz) => quiz.difficulty === level).length,
  );
  const max = Math.max(1, ...counts);
  return {
    labels: quizDifficulties.map((level, i) => `${level} (${counts[i]})`),
    series: counts.map((value) => Math.round((value / max) * 100)),
  };
}
