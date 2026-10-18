/**
 * Builds an idempotent SQL migration from countries-collection-data.mjs.
 * Usage: node supabase/seeds/build-countries-collection-sql.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CREATOR, QUIZZES } from "./countries-collection-data.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "migrations");
const OUT = join(ROOT, "20261017200000_countries_quiz_collection.sql");

function sqlStr(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlJson(value) {
  return sqlStr(JSON.stringify(value));
}

function sqlTextArray(values) {
  if (!values?.length) return "NULL";
  return `ARRAY[${values.map(sqlStr).join(",")}]`;
}

function questionTuple(quizId, position, q) {
  const media = q.media ? sqlJson(q.media) : "NULL";
  const options = q.options ? sqlJson(q.options) : "NULL";
  const answerId = q.answer_id ? sqlStr(q.answer_id) : "NULL";
  const answerIds = q.answer_ids ? sqlTextArray(q.answer_ids) : "NULL";
  const answerBool = typeof q.answer_bool === "boolean" ? String(q.answer_bool) : "NULL";
  const accepted = q.accepted ? sqlTextArray(q.accepted) : "NULL";
  const placeholder = q.placeholder ? sqlStr(q.placeholder) : "NULL";

  return `(
  ${sqlStr(quizId)}, ${position}, ${sqlStr(q.type)},
  ${sqlStr(q.prompt)},
  ${sqlStr(q.explanation)},
  ${media},
  ${options},
  ${answerId}, ${answerIds}, ${answerBool},
  NULL, NULL, ${accepted}, ${placeholder}, NULL, NULL
)`;
}

function validate() {
  if (QUIZZES.length !== 24) {
    throw new Error(`Expected 24 new quizzes (Atlas Sprint excluded), got ${QUIZZES.length}`);
  }
  const ids = new Set();
  const titles = new Set();
  let questions = 0;
  const byDiff = { Easy: 0, Medium: 0, Hard: 0 };
  for (const quiz of QUIZZES) {
    if (quiz.id === "q-atlas-sprint") throw new Error("Do not insert Atlas Sprint");
    if (ids.has(quiz.id)) throw new Error(`Duplicate id ${quiz.id}`);
    if (titles.has(quiz.title)) throw new Error(`Duplicate title ${quiz.title}`);
    ids.add(quiz.id);
    titles.add(quiz.title);
    if (quiz.questions.length !== 10) {
      throw new Error(`${quiz.id} has ${quiz.questions.length} questions`);
    }
    questions += quiz.questions.length;
    byDiff[quiz.difficulty] += 1;
    quiz.questions.forEach((q, i) => {
      if (!q.prompt || !q.explanation || !q.type) {
        throw new Error(`${quiz.id} Q${i + 1} missing required fields`);
      }
      if (q.type === "single" || q.type === "image") {
        if (!q.answer_id || !q.options?.length) throw new Error(`${quiz.id} Q${i + 1} invalid ${q.type}`);
      }
      if (q.type === "multiple" && !q.answer_ids?.length) throw new Error(`${quiz.id} Q${i + 1} invalid multiple`);
      if (q.type === "boolean" && typeof q.answer_bool !== "boolean") throw new Error(`${quiz.id} Q${i + 1} invalid boolean`);
      if (q.type === "typed" && !q.accepted?.length) throw new Error(`${quiz.id} Q${i + 1} invalid typed`);
    });
  }
  if (questions !== 240) throw new Error(`Expected 240 questions, got ${questions}`);
  if (byDiff.Easy !== 15 || byDiff.Medium !== 4 || byDiff.Hard !== 5) {
    throw new Error(`Difficulty split ${JSON.stringify(byDiff)} (expect Easy 15, Medium 4 new + Atlas, Hard 5)`);
  }
  return { questions, byDiff };
}

const stats = validate();

const quizValues = QUIZZES.map(
  (quiz) => `  (
    ${sqlStr(quiz.id)},
    ${sqlStr(quiz.title)},
    ${sqlStr(quiz.description)},
    'countries', ${sqlStr(CREATOR)}, ${sqlStr(quiz.art)},
    ${sqlStr(quiz.difficulty)}, ${quiz.minutes}, 'English', ${quiz.xp}, ${quiz.credits}, true
  )`,
).join(",\n");

const questionBlocks = QUIZZES.map((quiz) => {
  const values = quiz.questions.map((q, i) => questionTuple(quiz.id, i + 1, q)).join(",\n");
  return `-- ─── ${quiz.id} (10 questions) ─────────────────────────────────────────
insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
${values}
on conflict (quiz_id, position) do nothing;
`;
}).join("\n");

const sql = `-- =============================================================================
-- Countries collection: 24 new published quizzes + 240 questions.
-- Atlas Sprint (q-atlas-sprint) is already seeded and is intentionally omitted.
--
-- Idempotency:
--   quizzes: ON CONFLICT (id) DO NOTHING
--   quiz_questions: ON CONFLICT (quiz_id, position) DO NOTHING
-- Does not modify quiz_attempts, user_progression, or existing Atlas Sprint rows.
-- =============================================================================

insert into public.quizzes (
  id, title, description, category_id, creator, art,
  difficulty, minutes, language, reward_xp, reward_credits, is_published
)
values
${quizValues}
on conflict (id) do nothing;

${questionBlocks}
`;

writeFileSync(OUT, sql, "utf8");
console.log(`Wrote ${OUT}`);
console.log(`Quizzes: ${QUIZZES.length} (${JSON.stringify(stats.byDiff)})`);
console.log(`Questions: ${stats.questions}`);
console.log("Atlas Sprint: skipped (existing q-atlas-sprint)");
