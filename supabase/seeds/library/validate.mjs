import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { assembleLibrary } from "./assemble.mjs";
import { RESERVED_IDS, RESERVED_TITLES } from "./reserved.mjs";
import { CATEGORIES } from "./titles.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const thumbsTs = join(
  ROOT,
  "geoverze-main",
  "geoverze-public-main",
  "src",
  "features",
  "play",
  "data",
  "quizThumbnails.ts",
);
const generatedThumbs = join(
  ROOT,
  "geoverze-main",
  "geoverze-public-main",
  "src",
  "features",
  "play",
  "data",
  "libraryQuizThumbnails.generated.ts",
);
const quizDir = join(ROOT, "geoverze-main", "geoverze-public-main", "public", "assets", "quizzes");
const sqlPath = join(ROOT, "supabase", "migrations", "20261017210000_thirteen_category_quiz_library.sql");
const countriesSql = join(ROOT, "supabase", "migrations", "20261017200000_countries_quiz_collection.sql");

const quizzes = assembleLibrary();
const errors = [];

if (CATEGORIES.length !== 13) errors.push(`Expected 13 categories, got ${CATEGORIES.length}`);
if (quizzes.length !== 325) errors.push(`Expected 325 quizzes, got ${quizzes.length}`);

const byCat = {};
const byDiff = { Easy: 0, Medium: 0, Hard: 0 };
const ids = new Set();
const titles = new Set();
let questions = 0;

for (const quiz of quizzes) {
  byCat[quiz.categoryId] = (byCat[quiz.categoryId] ?? 0) + 1;
  byDiff[quiz.difficulty] += 1;
  if (ids.has(quiz.id)) errors.push(`Duplicate id ${quiz.id}`);
  if (titles.has(quiz.title)) errors.push(`Duplicate title ${quiz.title}`);
  if (RESERVED_IDS.has(quiz.id)) errors.push(`Reserved id ${quiz.id}`);
  if (RESERVED_TITLES.has(quiz.title)) errors.push(`Reserved title ${quiz.title}`);
  ids.add(quiz.id);
  titles.add(quiz.title);
  if (quiz.questions.length !== 10) errors.push(`${quiz.id} has ${quiz.questions.length} questions`);
  questions += quiz.questions.length;
}

for (const category of CATEGORIES) {
  if (byCat[category.id] !== 25) errors.push(`${category.id} has ${byCat[category.id]} quizzes`);
  const slice = quizzes.filter((q) => q.categoryId === category.id);
  const easy = slice.filter((q) => q.difficulty === "Easy").length;
  const medium = slice.filter((q) => q.difficulty === "Medium").length;
  const hard = slice.filter((q) => q.difficulty === "Hard").length;
  if (easy !== 15 || medium !== 5 || hard !== 5) {
    errors.push(`${category.id} difficulty split ${easy}/${medium}/${hard}`);
  }
}

if (questions !== 3250) errors.push(`Expected 3250 questions, got ${questions}`);
if (byDiff.Easy !== 195 || byDiff.Medium !== 65 || byDiff.Hard !== 65) {
  errors.push(`Overall difficulty ${JSON.stringify(byDiff)}`);
}

const thumbSource = [thumbsTs, generatedThumbs].filter((p) => existsSync(p)).map((p) => readFileSync(p, "utf8")).join("\n");
const missingMap = quizzes.filter((q) => !thumbSource.includes(`"${q.id}"`));
const missingFiles = quizzes.filter((q) => !existsSync(join(quizDir, q.thumbnailFile)));

if (existsSync(sqlPath)) {
  const sql = readFileSync(sqlPath, "utf8");
  if (sql.includes("'q-atlas-sprint'") || sql.includes("'q-flag-frenzy'")) {
    errors.push("Library SQL must not rewrite Atlas Sprint or Countries quizzes");
  }
  const inserted = (sql.match(/^    'q-[a-z0-9-]+',$/gm) || []).length;
  if (inserted !== 325) errors.push(`SQL quiz rows ${inserted}`);
} else {
  errors.push("Library SQL not generated yet");
}

if (existsSync(countriesSql)) {
  const countries = readFileSync(countriesSql, "utf8");
  if (!countries.includes("q-flag-frenzy")) errors.push("Countries SQL unexpectedly changed");
}

console.log({
  categories: CATEGORIES.length,
  quizzes: quizzes.length,
  questions,
  byDiff,
  missingThumbnailMap: missingMap.length,
  missingThumbnailFiles: missingFiles.length,
});

if (missingMap.length) errors.push(`Unmapped thumbnails: ${missingMap.slice(0, 5).map((q) => q.id).join(", ")}`);
if (missingFiles.length) errors.push(`Missing thumbnail files: ${missingFiles.length}`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Library validation passed");
