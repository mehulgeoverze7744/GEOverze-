import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const sql = readFileSync(
  new URL("../../migrations/20261022180000_emoji_fun_rebus_quizzes.sql", import.meta.url),
  "utf8",
);
const qStart = sql.indexOf("insert into public.quiz_questions");
const conflictAt = sql.indexOf("on conflict (quiz_id, position)");
const updateAt = sql.indexOf("update public.quizzes");
if (qStart < 0 || conflictAt < 0 || updateAt < 0) {
  throw new Error(`markers ${qStart} ${conflictAt} ${updateAt}`);
}

const quizzes = `${sql.slice(0, qStart).trim()}\n`;
const conflict = sql.slice(conflictAt, updateAt).trim();
const unpublish = `${sql.slice(updateAt).trim()}\n`;
const valuesPart = sql.slice(qStart, conflictAt);
const valuesIdx = valuesPart.indexOf("values");
const header = valuesPart.slice(0, valuesIdx + "values".length);
const body = valuesPart.slice(valuesIdx + "values".length).trim().replace(/,\s*$/, "");
const rows = body.split(/\n\),\n\(/).map((row, index, all) => {
  let next = row.trim();
  if (index > 0) next = `(${next}`;
  if (index < all.length - 1) next = `${next})`;
  return next;
});
if (rows.length !== 500) throw new Error(`expected 500 question rows, found ${rows.length}`);

const out = new URL("./apply-chunks/", import.meta.url);
mkdirSync(out, { recursive: true });
writeFileSync(new URL("01-quizzes.sql", out), quizzes);
let batch = 2;
for (let i = 0; i < rows.length; i += 100) {
  const text = `${header}\n${rows.slice(i, i + 100).join(",\n")}\n${conflict}\n`;
  writeFileSync(new URL(`${String(batch).padStart(2, "0")}-questions.sql`, out), text);
  batch += 1;
}
writeFileSync(new URL(`${String(batch).padStart(2, "0")}-unpublish.sql`, out), unpublish);
console.log(JSON.stringify({ batches: batch, bytes: sql.length, out: join(out.pathname) }));
