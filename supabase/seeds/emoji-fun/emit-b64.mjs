import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const sql = readFileSync(
  new URL("../../migrations/20261022180000_emoji_fun_rebus_quizzes.sql", import.meta.url),
);
const text = sql.toString("utf8");
const qStart = text.indexOf("insert into public.quiz_questions");
const conflictAt = text.indexOf("on conflict (quiz_id, position)");
const updateAt = text.indexOf("update public.quizzes");
const headerEnd = text.indexOf("values", qStart) + "values".length;
const body = text.slice(headerEnd, conflictAt).trim().replace(/,\s*$/, "");
const rows = body.split(/\n\),\n\(/).map((row, index, all) => {
  let next = row.trim();
  if (index > 0) next = `(${next}`;
  if (index < all.length - 1) next = `${next})`;
  return next;
});
if (rows.length !== 500) throw new Error(`expected 500 rows, found ${rows.length}`);

const header = text.slice(qStart, headerEnd);
const conflict = text.slice(conflictAt, updateAt).trim();
const out = new URL("./apply-chunks/b64/", import.meta.url);
mkdirSync(out, { recursive: true });

const size = 25;
const names = [];
for (let i = 0; i < rows.length; i += size) {
  const statement = `${header}\n${rows.slice(i, i + size).join(",\n")}\n${conflict}\n`;
  const name = `q-${String(i / size + 1).padStart(2, "0")}.b64`;
  writeFileSync(new URL(name, out), Buffer.from(statement, "utf8").toString("base64"));
  names.push({ name, bytes: Buffer.byteLength(statement), questions: Math.min(size, rows.length - i) });
}
console.log(JSON.stringify({ files: names.length, names }, null, 2));
