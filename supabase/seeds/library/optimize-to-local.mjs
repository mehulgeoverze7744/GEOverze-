import { createRequire } from "node:module";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { uniqueThumbnailSpecs } from "./unique-prompts.mjs";

const require = createRequire(import.meta.url);
const sharp = require(join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "geoverze-main",
  "geoverze-public-main",
  "node_modules",
  "sharp",
));

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const localOut = join(
  process.env.USERPROFILE ?? "",
  ".cursor",
  "projects",
  "c-Users-pansa-OneDrive-Desktop-GEOverze",
  "assets",
  "optimized",
);
mkdirSync(localOut, { recursive: true });

const searchDirs = [
  join(ROOT, "supabase", "seeds", "library", "generated-raw"),
  join(process.env.USERPROFILE ?? "", ".cursor", "projects", "c-Users-pansa-OneDrive-Desktop-GEOverze", "assets"),
];

function walk(dir, acc = [], depth = 0) {
  if (!existsSync(dir) || depth > 3) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "optimized") continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc, depth + 1);
    else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) acc.push(p);
  }
  return acc;
}

const aliases = {
  "map-surveyors-gauntlet": "map-surveyor-s-gauntlet",
  "lmk-architects-atlas": "lmk-architect-s-atlas",
};

const byStem = new Map();
for (const file of searchDirs.flatMap((d) => walk(d))) {
  const stem = basename(file, extname(file)).replace(/-quiz$/i, "");
  byStem.set(stem, file);
  if (aliases[stem]) byStem.set(aliases[stem], file);
}

const missing = [];
let written = 0;
for (const spec of uniqueThumbnailSpecs()) {
  const stem = spec.filename.replace(/-quiz\.jpg$/i, "");
  const source = byStem.get(stem);
  const dest = join(localOut, spec.filename);
  if (existsSync(dest)) {
    written += 1;
    continue;
  }
  if (!source) {
    missing.push(spec.id);
    continue;
  }
  const buf = await sharp(source)
    .rotate()
    .resize(1536, 1024, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  writeFileSync(dest, buf);
  written += 1;
}
console.log(JSON.stringify({ written, missing, out: localOut }, null, 2));
