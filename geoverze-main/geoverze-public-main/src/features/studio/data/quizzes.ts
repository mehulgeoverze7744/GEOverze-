/** Placeholder quiz catalogue owned by the signed-in creator. */
import type { StudioQuestion, StudioQuiz, StudioQuestionType } from "./types";

export const QUESTION_TYPE_META: {
  id: StudioQuestionType;
  label: string;
  hint: string;
  available: boolean;
}[] = [
  { id: "mcq", label: "Multiple choice", hint: "Four options, one correct", available: true },
  { id: "image", label: "Image question", hint: "Pick the right picture", available: true },
  { id: "text", label: "Text answer", hint: "Typed, forgiving match", available: true },
  { id: "flag", label: "Flag question", hint: "Identify the flag", available: true },
  { id: "shape", label: "Country shape", hint: "Identify the outline", available: true },
  { id: "capital", label: "Capital", hint: "Name the capital city", available: true },
  { id: "order", label: "Arrange in order", hint: "Coming soon", available: false },
  { id: "dragdrop", label: "Drag & drop", hint: "Coming soon", available: false },
  { id: "audio", label: "Audio clue", hint: "Coming soon", available: false },
  { id: "video", label: "Video clue", hint: "Coming soon", available: false },
];

export function questionTypeLabel(type: StudioQuestionType): string {
  return QUESTION_TYPE_META.find((t) => t.id === type)?.label ?? type;
}

function option(id: string, label: string, correct = false) {
  return { id, label, correct };
}

const RIVER_QUESTIONS: StudioQuestion[] = [
  {
    id: "q-riv-1",
    type: "mcq",
    prompt: "Which river carries the greatest volume of water to the ocean?",
    options: [
      option("a", "Nile"),
      option("b", "Amazon", true),
      option("c", "Yangtze"),
      option("d", "Mississippi"),
    ],
    accepted: [],
    explanation:
      "The Amazon discharges roughly 209,000 cubic metres per second — about a fifth of all river water reaching the oceans.",
    difficulty: "Easy",
    imageKey: null,
  },
  {
    id: "q-riv-2",
    type: "image",
    prompt: "Which delta is shown in this satellite image?",
    options: [
      option("a", "Ganges delta", true),
      option("b", "Rhine delta"),
      option("c", "Volga delta"),
      option("d", "Danube delta"),
    ],
    accepted: [],
    explanation: "The Ganges–Brahmaputra delta is the largest river delta on Earth.",
    difficulty: "Medium",
    imageKey: "asset-delta-01",
  },
  {
    id: "q-riv-3",
    type: "text",
    prompt: "Name the longest river entirely within one country.",
    options: [],
    accepted: ["yangtze", "yangtze river", "chang jiang"],
    explanation: "The Yangtze runs 6,300 km and never leaves China.",
    difficulty: "Hard",
    imageKey: null,
  },
];

const FLAG_QUESTIONS: StudioQuestion[] = [
  {
    id: "q-flag-1",
    type: "flag",
    prompt: "Which country uses this flag?",
    options: [
      option("a", "Chad"),
      option("b", "Romania", true),
      option("c", "Moldova"),
      option("d", "Andorra"),
    ],
    accepted: [],
    explanation: "Romania and Chad share near-identical tricolours; the blue shade differs.",
    difficulty: "Hard",
    imageKey: "asset-flag-ro",
  },
  {
    id: "q-flag-2",
    type: "capital",
    prompt: "What is the capital of Kazakhstan?",
    options: [],
    accepted: ["astana", "nur-sultan"],
    explanation: "Renamed Nur-Sultan in 2019 and back to Astana in 2022.",
    difficulty: "Medium",
    imageKey: null,
  },
];

const SHAPE_QUESTIONS: StudioQuestion[] = [
  {
    id: "q-shape-1",
    type: "shape",
    prompt: "Which country has this outline?",
    options: [
      option("a", "Chile", true),
      option("b", "Norway"),
      option("c", "Vietnam"),
      option("d", "Italy"),
    ],
    accepted: [],
    explanation: "Chile stretches 4,300 km north to south but averages only 177 km wide.",
    difficulty: "Easy",
    imageKey: "asset-shape-cl",
  },
];

export const STUDIO_QUIZZES: StudioQuiz[] = [
  {
    id: "rivers-of-the-world",
    title: "Rivers of the World",
    description:
      "Twelve questions on discharge, deltas and the drainage basins that shaped early civilisation.",
    categoryId: "oceans",
    difficulty: "Medium",
    mode: "Timed",
    timeLimit: 30,
    questionLimit: 12,
    coverKey: "studio-rivers",
    tags: ["rivers", "hydrology", "deltas"],
    status: "published",
    updatedAt: "2026-08-02T09:14:00Z",
    plays: 18_420,
    completionRate: 0.78,
    averageScore: 0.71,
    questions: RIVER_QUESTIONS,
  },
  {
    id: "confusing-flags",
    title: "Flags That Fool Everyone",
    description: "Near-identical tricolours, subtle crests and the details that give them away.",
    categoryId: "flags",
    difficulty: "Hard",
    mode: "Head to head",
    timeLimit: 15,
    questionLimit: 20,
    coverKey: "studio-flags",
    tags: ["flags", "vexillology"],
    status: "published",
    updatedAt: "2026-07-28T16:40:00Z",
    plays: 26_130,
    completionRate: 0.64,
    averageScore: 0.58,
    questions: FLAG_QUESTIONS,
  },
  {
    id: "silhouettes",
    title: "Country Silhouettes",
    description: "Identify nations from their outline alone. No labels, no borders, no mercy.",
    categoryId: "borders",
    difficulty: "Expert",
    mode: "Solo",
    timeLimit: 20,
    questionLimit: 15,
    coverKey: "studio-shapes",
    tags: ["shapes", "borders"],
    status: "in-review",
    updatedAt: "2026-08-05T11:05:00Z",
    plays: 0,
    completionRate: 0,
    averageScore: 0,
    questions: SHAPE_QUESTIONS,
  },
  {
    id: "monsoon-systems",
    title: "Monsoon Systems",
    description: "How pressure gradients move half the planet's rainfall on a schedule.",
    categoryId: "climate",
    difficulty: "Hard",
    mode: "Practice",
    timeLimit: 0,
    questionLimit: 10,
    coverKey: "studio-monsoon",
    tags: ["climate", "asia"],
    status: "draft",
    updatedAt: "2026-08-06T07:22:00Z",
    plays: 0,
    completionRate: 0,
    averageScore: 0,
    questions: [],
  },
  {
    id: "capital-sprint",
    title: "Capital Sprint",
    description: "Sixty seconds, as many capitals as you can name.",
    categoryId: "capitals",
    difficulty: "Easy",
    mode: "Multiplayer",
    timeLimit: 10,
    questionLimit: 25,
    coverKey: "studio-capitals",
    tags: ["capitals", "speed"],
    status: "scheduled",
    updatedAt: "2026-08-04T13:00:00Z",
    plays: 0,
    completionRate: 0,
    averageScore: 0,
    questions: [],
  },
  {
    id: "trade-winds",
    title: "Trade Winds & Currents",
    description: "The circulation loops that built the age of sail.",
    categoryId: "climate",
    difficulty: "Medium",
    mode: "Solo",
    timeLimit: 30,
    questionLimit: 12,
    coverKey: "studio-winds",
    tags: ["oceans", "wind"],
    status: "rejected",
    updatedAt: "2026-07-19T08:30:00Z",
    plays: 0,
    completionRate: 0,
    averageScore: 0,
    questions: [],
  },
  {
    id: "borderlands",
    title: "Borderlands",
    description: "Enclaves, exclaves and the strangest lines ever drawn on a map.",
    categoryId: "borders",
    difficulty: "Expert",
    mode: "Solo",
    timeLimit: 25,
    questionLimit: 18,
    coverKey: "studio-borders",
    tags: ["borders", "enclaves"],
    status: "archived",
    updatedAt: "2026-05-11T10:00:00Z",
    plays: 9_240,
    completionRate: 0.52,
    averageScore: 0.49,
    questions: [],
  },
];

export function findQuiz(id: string): StudioQuiz | undefined {
  return STUDIO_QUIZZES.find((q) => q.id === id);
}

/** A blank quiz used by the "new quiz" route. */
export function emptyQuiz(): StudioQuiz {
  return {
    id: "new",
    title: "",
    description: "",
    categoryId: "physical",
    difficulty: "Medium",
    mode: "Solo",
    timeLimit: 30,
    questionLimit: 10,
    coverKey: "studio-new",
    tags: [],
    status: "draft",
    updatedAt: new Date().toISOString(),
    plays: 0,
    completionRate: 0,
    averageScore: 0,
    questions: [],
  };
}

export function emptyQuestion(type: StudioQuestionType, index: number): StudioQuestion {
  const needsOptions = type === "mcq" || type === "image" || type === "flag" || type === "shape";
  return {
    id: `q-new-${index}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    prompt: "",
    options: needsOptions
      ? [option("a", ""), option("b", ""), option("c", ""), option("d", "")]
      : [],
    accepted: [],
    explanation: "",
    difficulty: "Medium",
    imageKey: null,
  };
}
