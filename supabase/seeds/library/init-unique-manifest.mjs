import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { uniqueThumbnailSpecs } from "./unique-prompts.mjs";

const dir = dirname(fileURLToPath(import.meta.url));
const out = join(dir, "unique-thumbnail-manifest.json");
const publicDir = join(dir, "..", "..", "..", "geoverze-main", "geoverze-public-main", "public", "assets", "quizzes");

const existing = existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : { quizzes: {} };
const specs = uniqueThumbnailSpecs();
for (const spec of specs) {
  const prev = existing.quizzes[spec.id] ?? {};
  const dest = join(publicDir, spec.filename);
  existing.quizzes[spec.id] = {
    id: spec.id,
    title: spec.title,
    categoryId: spec.categoryId,
    filename: spec.filename,
    publicPath: `/assets/quizzes/${spec.filename}`,
    prompt: spec.prompt,
    objectPosition: spec.objectPosition,
    status: prev.status && prev.status !== "pending" ? prev.status : existsSync(dest) ? "pending-replace" : "pending",
    generatedPath: prev.generatedPath ?? null,
    bytes: prev.bytes ?? null,
    width: prev.width ?? null,
    height: prev.height ?? null,
    error: prev.error ?? null,
  };
}
existing.updatedAt = new Date().toISOString();
existing.total = specs.length;
mkdirSync(dir, { recursive: true });
writeFileSync(out, JSON.stringify(existing, null, 2));
console.log(`Manifest ${specs.length} quizzes -> ${out}`);
