import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import { assembleLibrary } from "./assemble.mjs";
import { hashSeed } from "./helpers.mjs";
import { CATEGORIES } from "./titles.mjs";

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
const catDir = join(ROOT, "geoverze-main", "geoverze-public-main", "public", "assets", "play", "categories");
const outDir = join(ROOT, "geoverze-main", "geoverze-public-main", "public", "assets", "quizzes");

const sourceByCategory = Object.fromEntries(CATEGORIES.map((c) => [c.id, join(catDir, c.source)]));

export async function renderLibraryThumbnails() {
  throw new Error(
    "Do not re-run render-thumbnails.mjs — it recopies category stock photos. Use unique-prompts.mjs + ingest-unique-thumbnails.mjs.",
  );
  mkdirSync(outDir, { recursive: true });
  const quizzes = assembleLibrary();
  for (const quiz of quizzes) {
    const source = sourceByCategory[quiz.categoryId];
    const seed = hashSeed(quiz.id);
    const hue = (seed % 21) - 10;
    const sat = 1 + ((seed % 9) - 4) / 40;
    const bright = 1 + ((Math.floor(seed / 11) % 7) - 3) / 50;
    const meta = await sharp(source).metadata();
    const width = meta.width ?? 1280;
    const height = meta.height ?? 720;
    const cropW = Math.max(320, Math.floor(width * (0.86 + (seed % 10) / 100)));
    const cropH = Math.max(180, Math.floor(height * (0.86 + (Math.floor(seed / 7) % 10) / 100)));
    const left = Math.min(width - cropW, Math.floor(((seed % 97) / 97) * (width - cropW)));
    const top = Math.min(height - cropH, Math.floor(((Math.floor(seed / 13) % 89) / 89) * (height - cropH)));
    await sharp(source)
      .extract({ left, top, width: cropW, height: cropH })
      .resize(1280, 720, { fit: "cover" })
      .modulate({ hue, saturation: sat, brightness: bright })
      .jpeg({ quality: 82 })
      .toFile(join(outDir, quiz.thumbnailFile));
  }
  return quizzes.length;
}

if (process.argv[1]) {
  renderLibraryThumbnails()
    .then((n) => console.log(`Rendered ${n} thumbnails`))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
