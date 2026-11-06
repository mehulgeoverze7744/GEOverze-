import { readFileSync } from "node:fs";

for (const name of ["q-06.b64", "q-07.b64", "q-08.b64"]) {
  const b = readFileSync(new URL(`./apply-chunks/b64/${name}`, import.meta.url), "utf8").trim();
  const sql = Buffer.from(b, "base64").toString("utf8");
  const ids = [...sql.matchAll(/'(q-emo-[a-z0-9-]+)'/g)].map((m) => m[1]);
  const unique = [...new Set(ids)];
  const bad = sql.includes("::uuid") && !/'[0-9a-f-]{36}'::uuid/.test(sql);
  const casts = [...sql.matchAll(/::uuid/g)].length;
  const quoted = [...sql.matchAll(/'[0-9a-f-]{36}'::uuid/g)].length;
  console.log(JSON.stringify({ name, unique, casts, quoted, starts: sql.slice(0, 40) }));
}
