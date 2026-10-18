import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { QUIZZES } from "./countries-collection-data.mjs";

const thumbsFile = join(
  "geoverze-main",
  "geoverze-public-main",
  "src",
  "features",
  "play",
  "data",
  "quizThumbnails.ts",
);
const dir = join("geoverze-main", "geoverze-public-main", "public", "assets", "quizzes");
const sqlPath = join("supabase", "migrations", "20261017200000_countries_quiz_collection.sql");

const thumbs = readFileSync(thumbsFile, "utf8");
const srcs = [...thumbs.matchAll(/\$\{QUIZ_COVER_BASE\}\/([^`]+)/g)].map((m) => m[1]);
const missing = srcs.filter((s) => !existsSync(join(dir, s)));

const sql = readFileSync(sqlPath, "utf8");
const questionRows = (sql.match(/, (?:[1-9]|10), '(?:single|multiple|boolean|image|typed)'/g) || []).length;

const collectionIds = [
  ...QUIZZES.map((q) => q.id),
  "q-atlas-sprint",
];
const missingThumbsForCollection = collectionIds.filter((id) => !thumbs.includes(`"${id}"`));

console.log("new quizzes", QUIZZES.length);
console.log("new questions", QUIZZES.reduce((n, q) => n + q.questions.length, 0));
console.log("sql question rows", questionRows);
console.log("thumbnail files missing", missing);
console.log("collection ids missing thumbnail map", missingThumbsForCollection);
console.log("atlas in sql", sql.includes("q-atlas-sprint") && !sql.includes("'q-atlas-sprint'"));

if (missing.length || missingThumbsForCollection.length || questionRows !== 240) {
  process.exit(1);
}
