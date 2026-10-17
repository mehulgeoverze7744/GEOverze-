import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { assembleLibrary } from "./assemble.mjs";
import { CREATOR } from "./helpers.mjs";
import { CATEGORIES } from "./titles.mjs";

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
  ${media}, ${options}, ${answerId}, ${answerIds}, ${answerBool},
  NULL, NULL, ${accepted}, ${placeholder}, NULL, NULL
)`;
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), "sql-chunks");
mkdirSync(outDir, { recursive: true });
const quizzes = assembleLibrary();

for (const category of CATEGORIES) {
  const slice = quizzes.filter((q) => q.categoryId === category.id);
  const quizValues = slice
    .map(
      (quiz) => `  (
    ${sqlStr(quiz.id)},
    ${sqlStr(quiz.title)},
    ${sqlStr(quiz.description)},
    ${sqlStr(quiz.categoryId)}, ${sqlStr(CREATOR)}, ${sqlStr(quiz.art)},
    ${sqlStr(quiz.difficulty)}, ${quiz.minutes}, 'English', ${quiz.xp}, ${quiz.credits}, true
  )`,
    )
    .join(",\n");
  const questionBlocks = slice
    .map((quiz) => {
      const values = quiz.questions.map((q, i) => questionTuple(quiz.id, i + 1, q)).join(",\n");
      return `insert into public.quiz_questions (
  quiz_id, position, type, prompt, explanation, media,
  options, answer_id, answer_ids, answer_bool,
  regions, board_art, accepted, placeholder, items, targets
)
values
${values}
on conflict (quiz_id, position) do nothing;`;
    })
    .join("\n\n");
  const sql = `insert into public.quizzes (
  id, title, description, category_id, creator, art,
  difficulty, minutes, language, reward_xp, reward_credits, is_published
)
values
${quizValues}
on conflict (id) do nothing;

${questionBlocks}
`;
  writeFileSync(join(outDir, `${category.id}.sql`), sql, "utf8");
}
console.log(`Wrote ${CATEGORIES.length} SQL chunks to ${outDir}`);
