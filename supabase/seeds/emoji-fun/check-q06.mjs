import { readFileSync } from "node:fs";

const b = readFileSync(new URL("./apply-chunks/b64/q-06.b64", import.meta.url), "utf8").trim();
const sql = Buffer.from(b, "base64").toString("utf8");
const needle = "b461ab92-21d4-4e83-86c5-07255db85a37";
const i = sql.indexOf(needle);
console.log(JSON.stringify({
  found: i,
  around: i >= 0 ? sql.slice(Math.max(0, i - 8), i + needle.length + 12) : null,
  hasQuotedCast: sql.includes(`${needle}'::uuid`),
  bytes: Buffer.byteLength(sql),
}));
