/**
 * Optimize generated sources into public quiz JPEG slots.
 * Default: only failed / missing / unverified IDs. Never rewrite validated files.
 * Flags: --all (rewrite everything)  --ids=a,b  --failed
 */
import { createRequire } from "node:module";
import { existsSync, readdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

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
const manifestPath = join(dirname(fileURLToPath(import.meta.url)), "unique-thumbnail-manifest.json");
const destDir = join(ROOT, "geoverze-main", "geoverze-public-main", "public", "assets", "quizzes");

const args = process.argv.slice(2);
const rewriteAll = args.includes("--all");
const onlyFailed = args.includes("--failed") || !rewriteAll;
const idArg = args.find((a) => a.startsWith("--ids="));
const onlyIds = idArg ? new Set(idArg.slice(6).split(",").filter(Boolean)) : null;

function walk(dir, acc = [], depth = 0) {
  if (!existsSync(dir) || depth > 4) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "optimized") continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc, depth + 1);
    else if (/\.(png|jpe?g|webp)$/i.test(entry.name) && !entry.name.endsWith(".tmp.jpg")) acc.push(p);
  }
  return acc;
}

const extraDirs = args.filter((a) => !a.startsWith("--"));
const searchDirs = [
  join(ROOT, "supabase", "seeds", "library", "generated-raw"),
  join(process.env.USERPROFILE ?? "", ".cursor", "projects", "c-Users-pansa-OneDrive-Desktop-GEOverze", "assets"),
  ...extraDirs,
];

const aliases = {
  "map-surveyors-gauntlet": "map-surveyor-s-gauntlet",
  "lmk-architects-atlas": "lmk-architect-s-atlas",
};

const byStem = new Map();
for (const file of searchDirs.flatMap((d) => walk(d))) {
  const rawStem = basename(file, extname(file));
  const stem = rawStem.replace(/-quiz$/i, "");
  if (!byStem.has(rawStem) || file.includes("generated-raw")) byStem.set(rawStem, file);
  if (!byStem.has(stem) || file.includes("generated-raw")) byStem.set(stem, file);
  if (aliases[stem] && !byStem.has(aliases[stem])) byStem.set(aliases[stem], file);
  if (aliases[rawStem] && !byStem.has(aliases[rawStem])) byStem.set(aliases[rawStem], file);
}

function shouldProcess(quiz) {
  if (onlyIds) return onlyIds.has(quiz.id);
  if (rewriteAll) return true;
  if (quiz.status === "validated") return false;
  if (quiz.status === "optimized" && quiz.bytes && quiz.width && !quiz.error) return false;
  return onlyFailed;
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
let ingested = 0;
let skipped = 0;
const failed = [];

for (const quiz of Object.values(manifest.quizzes)) {
  if (!shouldProcess(quiz)) {
    skipped += 1;
    continue;
  }
  const stem = quiz.filename.replace(/-quiz\.jpg$/i, "");
  const source = byStem.get(stem);
  if (!source) {
    quiz.status = "failed";
    quiz.error = "missing source";
    failed.push(quiz.id);
    continue;
  }
  const dest = join(destDir, quiz.filename);
  const tmp = `${dest}.tmp.jpg`;
  try {
    const buf = await sharp(source)
      .rotate()
      .resize(1536, 1024, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    const check = await sharp(buf).metadata();
    if ((check.width ?? 0) < 1200 || (check.height ?? 0) < 700) {
      throw new Error(`bad output ${check.width}x${check.height}`);
    }
    writeFileSync(tmp, buf);
    try {
      renameSync(tmp, dest);
    } catch (error) {
      const msg = String(error);
      if (/ENOSPC|no space/i.test(msg)) throw new Error(`disk-full: ${msg}`);
      if (/EPERM|EBUSY|EACCES|unknown error, open/i.test(msg)) {
        throw new Error(`file-lock: ${dest}`);
      }
      writeFileSync(dest, buf);
      if (existsSync(tmp)) unlinkSync(tmp);
    }
    const onDisk = await sharp(dest).metadata();
    quiz.status = "optimized";
    quiz.generatedPath = source;
    quiz.bytes = buf.length;
    quiz.width = onDisk.width;
    quiz.height = onDisk.height;
    quiz.error = null;
    ingested += 1;
  } catch (error) {
    quiz.error = String(error);
    quiz.status = "failed";
    failed.push(quiz.id);
  }
}

manifest.updatedAt = new Date().toISOString();
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ ingested, skipped, failed, mode: rewriteAll ? "all" : "failed-or-ids" }, null, 2));
