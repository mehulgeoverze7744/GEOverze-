import {
  catalogDaysAgo,
  contentTags,
  countriesByRegion,
  languages,
  pickFrom,
  quizCategories,
  regions,
  rng,
  topics,
} from "@/lib/catalog";
import {
  questionDifficulties,
  questionTypes,
  type QuestionDifficulty,
  type QuestionOption,
  type QuestionRecord,
  type QuestionStatus,
  type QuestionType,
} from "@/features/questions/types";

const authors = ["A. Okafor", "L. Meyer", "Y. Tanaka", "R. Costa", "S. Patel", "M. Alvarez"];

const promptTemplates: Record<QuestionType, string[]> = {
  "Multiple Choice": [
    "Which city is the capital of {country}?",
    "Which river flows through {country}?",
    "Which mountain range borders {country}?",
  ],
  "True / False": [
    "{country} lies entirely within the northern hemisphere.",
    "{country} shares a land border with more than five countries.",
  ],
  "Fill in the Blank": [
    "The largest lake in {country} is ______.",
    "The currency used in {country} is the ______.",
  ],
  "Image Based": [
    "Which country does this flag belong to?",
    "Identify the landmark shown in the photograph.",
  ],
  "Map Based": [
    "Locate the capital of {country} on the map.",
    "Click the strait that separates the two highlighted landmasses.",
  ],
  Matching: ["Match each country with its capital city."],
  Ordering: ["Order these countries from largest to smallest by land area."],
};

const optionPool = [
  "Oslo",
  "Lisbon",
  "Nairobi",
  "Hanoi",
  "Ottawa",
  "Santiago",
  "Canberra",
  "Rabat",
  "Ankara",
  "Lima",
];

function buildOptions(rand: () => number, type: QuestionType, index: number): QuestionOption[] {
  if (type === "True / False") {
    const trueIsCorrect = rand() > 0.5;
    return [
      { id: `${index}-t`, text: "True", correct: trueIsCorrect },
      { id: `${index}-f`, text: "False", correct: !trueIsCorrect },
    ];
  }
  if (type === "Fill in the Blank" || type === "Map Based") return [];

  const shuffled = [...optionPool].sort(() => rand() - 0.5).slice(0, 4);
  const correctIndex = Math.floor(rand() * shuffled.length);
  return shuffled.map((text, i) => ({
    id: `${index}-${i}`,
    text,
    correct: i === correctIndex,
  }));
}

function buildQuestion(index: number): QuestionRecord {
  const rand = rng(index * 6151 + 977);
  const type = pickFrom(rand, questionTypes);
  const region = pickFrom(rand, regions);
  const country = pickFrom(rand, countriesByRegion[region] ?? ["Worldwide"]);
  const template = pickFrom(rand, promptTemplates[type]);
  const difficulty = pickFrom(rand, questionDifficulties) as QuestionDifficulty;
  const status = pickFrom<QuestionStatus>(rand, [
    "published",
    "published",
    "published",
    "draft",
    "archived",
  ]);
  const needsMedia = type === "Image Based" || type === "Map Based";
  const createdDays = Math.floor(rand() * 640) + 10;

  return {
    id: `QN-${String(2000 + index)}`,
    prompt: template.replace("{country}", country),
    type,
    difficulty,
    category: pickFrom(rand, quizCategories),
    region,
    country,
    topic: pickFrom(rand, topics),
    tags: [pickFrom(rand, contentTags), pickFrom(rand, contentTags)].filter(
      (tag, i, all) => all.indexOf(tag) === i,
    ),
    language: pickFrom(rand, languages),
    explanation:
      rand() > 0.15
        ? `Reference answer verified against the GEOverze atlas dataset for ${country}.`
        : "TBD",
    options: buildOptions(rand, type, index),
    answerText:
      type === "Fill in the Blank" || type === "Map Based"
        ? rand() > 0.12
          ? pickFrom(rand, optionPool)
          : ""
        : "",
    mediaLabel: needsMedia && rand() > 0.2 ? `media/${country.toLowerCase()}-${index}.png` : "",
    requiresMedia: needsMedia,
    usageCount: Math.floor(rand() * 240),
    status,
    author: pickFrom(rand, authors),
    createdAt: catalogDaysAgo(createdDays, 10),
    updatedAt: catalogDaysAgo(Math.max(1, createdDays - Math.floor(rand() * 200)), 15),
  };
}

const records: QuestionRecord[] = Array.from({ length: 96 }, (_, i) => buildQuestion(i + 1));

/** Mock service layer — swap the bodies for Lovable Cloud queries later. */
export function getQuestions(): QuestionRecord[] {
  return records;
}

export function getQuestionById(id: string): QuestionRecord | undefined {
  return records.find((question) => question.id === id);
}

export const questionRecords = records;

export const questionRegions = regions;
export const questionLanguages = languages;
export const questionTopics = topics;

export interface QuestionStatsSummary {
  total: number;
  published: number;
  draft: number;
  archived: number;
  averageUsage: number;
  typeCounts: { label: string; count: number }[];
  difficultyCounts: { label: string; count: number }[];
}

export function summarizeQuestions(list: QuestionRecord[]): QuestionStatsSummary {
  const byStatus = (status: QuestionStatus) => list.filter((q) => q.status === status).length;
  return {
    total: list.length,
    published: byStatus("published"),
    draft: byStatus("draft"),
    archived: byStatus("archived"),
    averageUsage: list.length
      ? Math.round(list.reduce((sum, q) => sum + q.usageCount, 0) / list.length)
      : 0,
    typeCounts: questionTypes.map((type) => ({
      label: type,
      count: list.filter((q) => q.type === type).length,
    })),
    difficultyCounts: questionDifficulties.map((difficulty) => ({
      label: difficulty,
      count: list.filter((q) => q.difficulty === difficulty).length,
    })),
  };
}

export function toChartSeries(counts: { label: string; count: number }[]) {
  const max = Math.max(1, ...counts.map((entry) => entry.count));
  return {
    labels: counts.map((entry) => entry.label),
    series: counts.map((entry) => Math.round((entry.count / max) * 100)),
  };
}
