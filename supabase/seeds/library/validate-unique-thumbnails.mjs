import { createRequire } from "node:module";
import { existsSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
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
const manifestPath = join(dirname(fileURLToPath(import.meta.url)), "unique-thumbnail-manifest.json");
const destDir = join(ROOT, "geoverze-main", "geoverze-public-main", "public", "assets", "quizzes");
const mapPath = join(
  ROOT,
  "geoverze-main",
  "geoverze-public-main",
  "src",
  "features",
  "play",
  "data",
  "libraryQuizThumbnails.generated.ts",
);
const countries = [
  "q-pin-the-place",
  "q-capital-cities",
  "q-atlas-sprint",
  "q-flag-blitz",
  "q-flag-frenzy",
  "q-passport-to-the-planet",
];

function averageHash(pixels, w, h) {
  let bits = "";
  let mean = 0;
  const n = w * h;
  for (let i = 0; i < n; i++) mean += pixels[i];
  mean /= n;
  for (let i = 0; i < n; i++) bits += pixels[i] >= mean ? "1" : "0";
  return bits;
}

function hamming(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d += 1;
  return d;
}

const specs = uniqueThumbnailSpecs();
const errors = [];
if (specs.length !== 325) errors.push(`expected 325 specs, got ${specs.length}`);
const paths = new Set();
const hashes = [];
const byCat = {};
const sizes = [];

for (const spec of specs) {
  byCat[spec.categoryId] = (byCat[spec.categoryId] ?? 0) + 1;
  const dest = join(destDir, spec.filename);
  if (paths.has(spec.filename)) errors.push(`duplicate filename ${spec.filename}`);
  paths.add(spec.filename);
  if (!existsSync(dest)) {
    errors.push(`missing ${spec.filename}`);
    continue;
  }
  const img = sharp(dest);
  const meta = await img.metadata();
  if (!["jpeg", "jpg", "webp"].includes(meta.format ?? "")) errors.push(`format ${spec.filename} ${meta.format}`);
  if ((meta.width ?? 0) < 1200 || (meta.height ?? 0) < 700) {
    errors.push(`small ${spec.filename} ${meta.width}x${meta.height}`);
  }
  const ratio = (meta.width ?? 1) / (meta.height ?? 1);
  if (ratio < 1.3 || ratio > 1.7) errors.push(`aspect ${spec.filename} ${ratio.toFixed(2)}`);
  const { data, info } = await sharp(dest).greyscale().resize(16, 16, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  hashes.push({ id: spec.id, hash: averageHash(data, info.width, info.height), file: spec.filename });
  const st = statSync(dest);
  sizes.push(st.size);
}

const map = readFileSync(mapPath, "utf8");
for (const spec of specs) {
  if (!map.includes(`"${spec.id}"`)) errors.push(`map missing ${spec.id}`);
  if (!map.includes(spec.filename)) errors.push(`map path missing ${spec.filename}`);
}
for (const id of countries) {
  if (map.includes(`"${id}"`)) errors.push(`library map must not include Countries id ${id}`);
}

const near = [];
for (let i = 0; i < hashes.length; i++) {
  for (let j = i + 1; j < hashes.length; j++) {
    const d = hamming(hashes[i].hash, hashes[j].hash);
    if (d <= 6) near.push({ a: hashes[i].id, b: hashes[j].id, distance: d });
  }
}

const small = specs
  .map((spec, i) => ({ id: spec.id, kb: Math.round((sizes[i] ?? 0) / 1024) }))
  .filter((x) => x.kb && x.kb < 80);

if (existsSync(manifestPath) && errors.length === 0) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (const spec of specs) {
    const quiz = manifest.quizzes[spec.id];
    if (!quiz) continue;
    quiz.status = "validated";
    quiz.error = null;
  }
  manifest.validatedCount = specs.length;
  manifest.updatedAt = new Date().toISOString();
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

console.log({
  specs: specs.length,
  uniquePaths: paths.size,
  missing: errors.filter((e) => e.startsWith("missing")).length,
  byCat,
  sizeKb: sizes.length
    ? {
        min: Math.round(Math.min(...sizes) / 1024),
        max: Math.round(Math.max(...sizes) / 1024),
        avg: Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length / 1024),
      }
    : null,
  smallFiles: small,
  nearDuplicates: near,
  errors: errors.slice(0, 40),
  errorCount: errors.length,
});
if (errors.length) process.exitCode = 1;
