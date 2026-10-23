/**
 * File-level checks for the emoji-fun replacement.
 * Does not connect to Supabase and does not change data.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RESERVED_IDS, RESERVED_TITLES } from "../library/reserved.mjs";
import { PROMPTS, QUIZZES, REWARDS } from "./quizzes.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..", "..");
const migrationPath = join(repo, "supabase", "migrations", "20261022180000_emoji_fun_rebus_quizzes.sql");
const mapPath = join(
  repo,
  "geoverze-main",
  "geoverze-public-main",
  "src",
  "features",
  "play",
  "data",
  "emojiFunQuizThumbnails.generated.ts",
);
const imageDir = join(repo, "geoverze-main", "geoverze-public-main", "public", "assets", "quizzes");
const migrationsDir = join(repo, "supabase", "migrations");

const errors = [];
const diff = { Easy: 0, Medium: 0, Hard: 0 };
const glyphs = new Map();
const ids = new Set();
const titles = new Set();
let questions = 0;

if (QUIZZES.length !== 50) errors.push(`quiz count ${QUIZZES.length}`);

for (const quiz of QUIZZES) {
  diff[quiz.difficulty] = (diff[quiz.difficulty] ?? 0) + 1;
  if (!quiz.id.startsWith("q-emo-")) errors.push(`id prefix ${quiz.id}`);
  if (RESERVED_IDS.has(quiz.id)) errors.push(`reserved id ${quiz.id}`);
  if (RESERVED_TITLES.has(quiz.title)) errors.push(`reserved title ${quiz.title}`);
  if (ids.has(quiz.id)) errors.push(`dup id ${quiz.id}`);
  if (titles.has(quiz.title)) errors.push(`dup title ${quiz.title}`);
  ids.add(quiz.id);
  titles.add(quiz.title);
  if (!REWARDS[quiz.difficulty]) errors.push(`reward ${quiz.id}`);
  if (quiz.questions.length !== 10) errors.push(`${quiz.id} count ${quiz.questions.length}`);
  for (const q of quiz.questions) {
    questions += 1;
    if (!PROMPTS[q.kind]) errors.push(`kind ${quiz.id} ${q.kind}`);
    if (!q.why || q.why.length < 12) errors.push(`explanation ${quiz.id} ${q.answer}`);
    if (q.distractors.length !== 3) errors.push(`distractors ${quiz.id} ${q.answer}`);
    const norm = (s) => s.toLowerCase().replace(/['’.\s-]/g, "");
    if (new Set([q.answer, ...q.distractors].map(norm)).size !== 4) {
      errors.push(`options ${quiz.id}: ${q.answer} | ${q.distractors.join(" / ")}`);
    }
    if (q.glyph.toLowerCase().includes(q.answer.toLowerCase())) {
      errors.push(`answer in glyph ${quiz.id}: ${q.glyph} -> ${q.answer}`);
    }
    if (!/[^\u0000-\u007f]/.test(q.glyph)) errors.push(`no emoji ${quiz.id}: ${q.glyph}`);
    if (glyphs.has(q.glyph)) errors.push(`dup glyph ${q.glyph}`);
    glyphs.set(q.glyph, q.answer);
    for (const d of q.distractors) {
      if (/\bis (set|unique|not|the capital)\b|Wait |duplicate/i.test(d)) {
        errors.push(`junk ${quiz.id}: ${d}`);
      }
    }
  }
}

if (questions !== 500) errors.push(`question count ${questions}`);
if (diff.Easy !== 30 || diff.Medium !== 15 || diff.Hard !== 5) errors.push(`difficulty ${JSON.stringify(diff)}`);

const sql = existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "";
if (!sql) errors.push("missing migration");
if (/delete\s+from/i.test(sql)) errors.push("migration deletes rows");
if (/grant\s+|create\s+policy|disable\s+row\s+level\s+security/i.test(sql)) errors.push("migration changes access");
if (!sql.includes("category_id = 'emoji-fun'") || !sql.includes("is_published = false")) {
  errors.push("migration does not unpublish leftover emoji-fun rows");
}
const singleCount = sql.split("'single'").length - 1;
if (singleCount !== 500) errors.push(`sql single count ${singleCount}`);
for (const id of ids) {
  const hits = sql.split(id).length - 1;
  if (hits < 11) errors.push(`sql hits ${id} = ${hits}`);
}

for (const file of readdirSync(migrationsDir)) {
  if (file === "20261022180000_emoji_fun_rebus_quizzes.sql") continue;
  const text = readFileSync(join(migrationsDir, file), "utf8");
  for (const id of ids) {
    if (text.includes(id)) errors.push(`${id} already in ${file}`);
  }
}

const map = existsSync(mapPath) ? readFileSync(mapPath, "utf8") : "";
if (!map) errors.push("missing thumbnail map");
const missingImages = [];
for (const quiz of QUIZZES) {
  const file = `${quiz.id.slice(2)}-quiz.jpg`;
  if (!map.includes(quiz.id) || !map.includes(file)) errors.push(`map missing ${quiz.id}`);
  if (!existsSync(join(imageDir, file))) missingImages.push(file);
}

console.log(JSON.stringify({
  quizzes: QUIZZES.length,
  questions,
  difficulty: diff,
  uniqueGlyphs: glyphs.size,
  sqlQuestions: singleCount,
  missingImages: missingImages.length,
  errors: errors.length,
}, null, 2));
for (const e of errors) console.log(`ERROR ${e}`);
if (missingImages.length) {
  console.log("PENDING THUMBNAILS");
  for (const file of missingImages) console.log(file);
}
if (errors.length || missingImages.length) process.exit(1);
