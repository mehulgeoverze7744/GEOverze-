import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
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

const dir = dirname(fileURLToPath(import.meta.url));
const manifestPath = join(dir, "unique-thumbnail-manifest.json");
const destDir = join(dir, "..", "..", "..", "geoverze-main", "geoverze-public-main", "public", "assets", "quizzes");
const skip = new Set(process.argv.slice(2));
const ids = [
  "q-cap-moved-capitals",
  "q-flg-stripe-school",
  "q-flg-banner-variants",
  "q-map-contour-clues",
  "q-map-isogonic-inquiry",
  "q-map-surveyor-s-gauntlet",
  "q-lmk-hidden-landmarks",
  "q-lmk-architect-s-atlas",
  "q-riv-tributary-trail",
  "q-riv-basin-basics",
  "q-riv-transboundary-rivers",
  "q-riv-confluence-quiz",
  "q-ocn-ocean-unknown",
  "q-ocn-sea-room",
  "q-ocn-thermohaline-trail",
  "q-mix-crosswind-quiz",
];

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
for (const id of ids) {
  if (skip.has(id)) continue;
  const quiz = manifest.quizzes[id];
  const dest = join(destDir, quiz.filename);
  if (!existsSync(dest)) throw new Error(`missing ${dest}`);
  const meta = await sharp(dest).metadata();
  const st = statSync(dest);
  quiz.status = "validated";
  quiz.bytes = st.size;
  quiz.width = meta.width;
  quiz.height = meta.height;
  quiz.error = null;
  quiz.review = "visual-ok-unique-subject";
}
manifest.updatedAt = new Date().toISOString();
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log("marked", ids.filter((id) => !skip.has(id)).length);
