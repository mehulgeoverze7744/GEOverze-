import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { questionsFromPairs } from "./build-from-pairs.mjs";
import { EASY as CAP_E, HARD as CAP_H, MEDIUM as CAP_M } from "./facts/capitals.mjs";
import {
  FLAGS_EASY,
  FLAGS_HARD,
  FLAGS_MEDIUM,
  LANDMARKS_EASY,
  LANDMARKS_HARD,
  LANDMARKS_MEDIUM,
} from "./facts/world.mjs";
import {
  MAPS_EASY,
  MAPS_HARD,
  MAPS_MEDIUM,
  MOUNTAINS_EASY,
  MOUNTAINS_HARD,
  MOUNTAINS_MEDIUM,
} from "./facts/world-more.mjs";
import {
  HISTORY_EASY,
  HISTORY_HARD,
  HISTORY_MEDIUM,
  OCEANS_EASY,
  OCEANS_HARD,
  OCEANS_MEDIUM,
  RIVERS_EASY,
  RIVERS_HARD,
  RIVERS_MEDIUM,
} from "./facts/world-rest.mjs";
import {
  CULTURE_EASY,
  CULTURE_HARD,
  CULTURE_MEDIUM,
  MIXED_EASY,
  MIXED_HARD,
  MIXED_MEDIUM,
  NATURE_EASY,
  NATURE_HARD,
  NATURE_MEDIUM,
  RECORDS_EASY,
  RECORDS_HARD,
  RECORDS_MEDIUM,
  UNESCO_EASY,
  UNESCO_HARD,
  UNESCO_MEDIUM,
} from "./facts/world-final.mjs";
import { CREATOR, REWARDS, assertQuestion, quizId } from "./helpers.mjs";
import { RESERVED_IDS, RESERVED_TITLES } from "./reserved.mjs";
import { CATEGORIES } from "./titles.mjs";

const FACTS = {
  capitals: { Easy: CAP_E, Medium: CAP_M, Hard: CAP_H, placeholder: "Type a capital or country" },
  flags: { Easy: FLAGS_EASY, Medium: FLAGS_MEDIUM, Hard: FLAGS_HARD, placeholder: "Type a flag fact" },
  maps: { Easy: MAPS_EASY, Medium: MAPS_MEDIUM, Hard: MAPS_HARD, placeholder: "Type a map term" },
  landmarks: {
    Easy: LANDMARKS_EASY,
    Medium: LANDMARKS_MEDIUM,
    Hard: LANDMARKS_HARD,
    placeholder: "Type a country or place",
  },
  history: { Easy: HISTORY_EASY, Medium: HISTORY_MEDIUM, Hard: HISTORY_HARD, placeholder: "Type a year or name" },
  mountains: {
    Easy: MOUNTAINS_EASY,
    Medium: MOUNTAINS_MEDIUM,
    Hard: MOUNTAINS_HARD,
    placeholder: "Type a peak or place",
  },
  rivers: { Easy: RIVERS_EASY, Medium: RIVERS_MEDIUM, Hard: RIVERS_HARD, placeholder: "Type a river or sea" },
  oceans: { Easy: OCEANS_EASY, Medium: OCEANS_MEDIUM, Hard: OCEANS_HARD, placeholder: "Type an ocean fact" },
  culture: { Easy: CULTURE_EASY, Medium: CULTURE_MEDIUM, Hard: CULTURE_HARD, placeholder: "Type a culture fact" },
  mixed: { Easy: MIXED_EASY, Medium: MIXED_MEDIUM, Hard: MIXED_HARD, placeholder: "Type your answer" },
  nature: { Easy: NATURE_EASY, Medium: NATURE_MEDIUM, Hard: NATURE_HARD, placeholder: "Type a nature fact" },
  unesco: { Easy: UNESCO_EASY, Medium: UNESCO_MEDIUM, Hard: UNESCO_HARD, placeholder: "Type a heritage fact" },
  records: { Easy: RECORDS_EASY, Medium: RECORDS_MEDIUM, Hard: RECORDS_HARD, placeholder: "Type a record fact" },
};

function difficultyForIndex(index) {
  if (index < 15) return "Easy";
  if (index < 20) return "Medium";
  return "Hard";
}

export function assembleLibrary() {
  const quizzes = [];
  const usedPrompts = new Set();

  for (const category of CATEGORIES) {
    if (category.titles.length !== 25) {
      throw new Error(`${category.id} has ${category.titles.length} titles`);
    }
    const bank = FACTS[category.id];
    if (!bank) throw new Error(`No facts for ${category.id}`);

    const pools = {
      Easy: questionsFromPairs(bank.Easy, {
        target: 150,
        seedKey: `${category.id}-easy`,
        typedPlaceholder: bank.placeholder,
        label: "",
      }),
      Medium: questionsFromPairs(bank.Medium, {
        target: 50,
        seedKey: `${category.id}-medium`,
        typedPlaceholder: bank.placeholder,
        label: "",
      }),
      Hard: questionsFromPairs(bank.Hard, {
        target: 50,
        seedKey: `${category.id}-hard`,
        typedPlaceholder: bank.placeholder,
        label: "",
      }),
    };

    const cursor = { Easy: 0, Medium: 0, Hard: 0 };
    const usedPromptsInCategory = new Set();

    category.titles.forEach((title, index) => {
      const difficulty = difficultyForIndex(index);
      const id = quizId(category.prefix, title);
      if (RESERVED_IDS.has(id)) throw new Error(`Reserved id collision: ${id}`);
      if (RESERVED_TITLES.has(title)) throw new Error(`Reserved title collision: ${title}`);
      const rewards = REWARDS[difficulty];
      const start = cursor[difficulty];
      const questions = pools[difficulty].slice(start, start + 10);
      cursor[difficulty] += 10;
      if (questions.length !== 10) {
        throw new Error(`${id} expected 10 ${difficulty} questions`);
      }
      questions.forEach((q, qi) => {
        assertQuestion(q, `${id} Q${qi + 1}`);
        const key = q.prompt.trim().toLowerCase();
        if (usedPromptsInCategory.has(key)) {
          throw new Error(`Duplicate prompt in ${id}: ${q.prompt}`);
        }
        usedPromptsInCategory.add(key);
        usedPrompts.add(key);
      });
      quizzes.push({
        id,
        title,
        description: `${title} is ${difficulty === "Easy" ? "an" : "a"} ${difficulty.toLowerCase()} GEOverze Studio quiz in the ${category.id} category, with ten original questions.`,
        categoryId: category.id,
        art: category.art,
        difficulty,
        minutes: rewards.minutes,
        xp: rewards.xp,
        credits: rewards.credits,
        thumbnailFile: `${id.replace(/^q-/, "")}-quiz.jpg`,
        questions,
      });
    });
  }

  return quizzes;
}

const here = dirname(fileURLToPath(import.meta.url));
export const MANIFEST_PATH = join(here, "library-manifest.json");

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const quizzes = assembleLibrary();
  writeFileSync(
    MANIFEST_PATH,
    JSON.stringify(
      {
        creator: CREATOR,
        generatedAt: new Date().toISOString(),
        quizCount: quizzes.length,
        questionCount: quizzes.reduce((n, q) => n + q.questions.length, 0),
        quizzes: quizzes.map(({ questions, ...meta }) => ({
          ...meta,
          questionCount: questions.length,
        })),
      },
      null,
      2,
    ),
  );
  console.log(`Assembled ${quizzes.length} quizzes, wrote ${MANIFEST_PATH}`);
}
