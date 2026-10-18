import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { assembleLibrary } from "./assemble.mjs";
import { CREATOR } from "./helpers.mjs";

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

function questionRow(quizId, position, q) {
  const media = q.media ? sqlJson(q.media) : "NULL";
  const options = q.options ? sqlJson(q.options) : "NULL";
  const answerId = q.answer_id ? sqlStr(q.answer_id) : "NULL";
  const answerIds = q.answer_ids ? sqlTextArray(q.answer_ids) : "NULL";
  const answerBool = typeof q.answer_bool === "boolean" ? String(q.answer_bool) : "NULL";
  const accepted = q.accepted ? sqlTextArray(q.accepted) : "NULL";
  const placeholder = q.placeholder ? sqlStr(q.placeholder) : "NULL";
  return `(${sqlStr(quizId)},${position},${sqlStr(q.type)},${sqlStr(q.prompt)},${sqlStr(q.explanation)},${media},${options},${answerId},${answerIds},${answerBool},NULL,NULL,${accepted},${placeholder},NULL,NULL)`;
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), "sql-batches");
mkdirSync(outDir, { recursive: true });

const quizzes = assembleLibrary();
const byCat = new Map();
for (const quiz of quizzes) {
  if (!byCat.has(quiz.categoryId)) byCat.set(quiz.categoryId, []);
  byCat.get(quiz.categoryId).push(quiz);
}

const index = [];
for (const [categoryId, catQuizzes] of byCat) {
  const quizSql = `insert into public.quizzes (id,title,description,category_id,creator,art,difficulty,minutes,language,reward_xp,reward_credits,is_published) values ${catQuizzes
    .map(
      (quiz) =>
        `(${sqlStr(quiz.id)},${sqlStr(quiz.title)},${sqlStr(quiz.description)},${sqlStr(quiz.categoryId)},${sqlStr(CREATOR)},${sqlStr(quiz.art)},${sqlStr(quiz.difficulty)},${quiz.minutes},'English',${quiz.xp},${quiz.credits},true)`,
    )
    .join(",") } on conflict (id) do nothing;`;
  const quizFile = `${categoryId}-quizzes.sql`;
  writeFileSync(join(outDir, quizFile), quizSql, "utf8");
  index.push({ file: quizFile, bytes: quizSql.length, kind: "quizzes", categoryId });

  const chunkSize = 5;
  for (let i = 0; i < catQuizzes.length; i += chunkSize) {
    const slice = catQuizzes.slice(i, i + chunkSize);
    const qSql = `insert into public.quiz_questions (quiz_id,position,type,prompt,explanation,media,options,answer_id,answer_ids,answer_bool,regions,board_art,accepted,placeholder,items,targets) values ${slice
      .flatMap((quiz) => quiz.questions.map((q, qi) => questionRow(quiz.id, qi + 1, q)))
      .join(",")} on conflict (quiz_id, position) do nothing;`;
    const qFile = `${categoryId}-questions-${String(i / chunkSize + 1).padStart(2, "0")}.sql`;
    writeFileSync(join(outDir, qFile), qSql, "utf8");
    index.push({ file: qFile, bytes: qSql.length, kind: "questions", categoryId });
  }
}

writeFileSync(join(outDir, "index.json"), JSON.stringify(index, null, 2));
console.log(`Wrote ${index.length} batch files`);
index.forEach((row) => console.log(`${row.file}\t${row.bytes}`));
