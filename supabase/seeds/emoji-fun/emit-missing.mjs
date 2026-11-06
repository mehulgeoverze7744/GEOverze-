import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const missing = new Set([
  "q-emo-ocean-glyph-garden",
  "q-emo-capital-soundboard",
  "q-emo-first-look-landmarks",
  "q-emo-harbour-homophones",
  "q-emo-easy-street-atlas",
  "q-emo-picture-postcard-puzzles",
  "q-emo-globe-sticker-studio",
  "q-emo-river-sound-chart",
]);

const text = readFileSync(
  new URL("../../migrations/20261022180000_emoji_fun_rebus_quizzes.sql", import.meta.url),
  "utf8",
);
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
const selected = rows.filter((row) => [...missing].some((id) => row.includes(`'${id}'`)));
if (selected.length !== 80) throw new Error(`expected 80 rows, found ${selected.length}`);

const header = text.slice(qStart, headerEnd);
const conflict = text.slice(conflictAt, updateAt).trim();
const out = new URL("./apply-chunks/b64-missing/", import.meta.url);
mkdirSync(out, { recursive: true });

const size = 10;
for (let i = 0; i < selected.length; i += size) {
  const statement = `${header}\n${selected.slice(i, i + size).join(",\n")}\n${conflict}\n`;
  const quoted = [...statement.matchAll(/'[0-9a-f-]{36}'::uuid/g)].length;
  if (quoted !== Math.min(size, selected.length - i)) throw new Error(`quote mismatch at ${i}`);
  const name = `m-${String(i / size + 1).padStart(2, "0")}.b64`;
  writeFileSync(new URL(name, out), Buffer.from(statement, "utf8").toString("base64"));
  console.log(name, Buffer.byteLength(statement));
}
