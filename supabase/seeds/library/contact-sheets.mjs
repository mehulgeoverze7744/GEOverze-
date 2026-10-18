import { createRequire } from "node:module";
import { mkdirSync, existsSync } from "node:fs";
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
const destDir = join(ROOT, "geoverze-main", "geoverze-public-main", "public", "assets", "quizzes");
const outDir = join(ROOT, ".review", "contact-sheets");
mkdirSync(outDir, { recursive: true });

const specs = uniqueThumbnailSpecs();
const cats = [...new Set(specs.map((s) => s.categoryId))];
const cellW = 320;
const cellH = 232;
const labelH = 28;
const cols = 5;
const gap = 8;

function escapeXml(s) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

for (const cat of cats) {
  const items = specs.filter((s) => s.categoryId === cat);
  const rows = Math.ceil(items.length / cols);
  const width = cols * cellW + (cols + 1) * gap;
  const height = rows * cellH + (rows + 1) * gap;
  const composites = [];
  for (let i = 0; i < items.length; i++) {
    const src = join(destDir, items[i].filename);
    const left = gap + (i % cols) * (cellW + gap);
    const top = gap + Math.floor(i / cols) * (cellH + gap);
    if (!existsSync(src)) continue;
    const img = await sharp(src)
      .resize(cellW, cellH - labelH, { fit: "cover" })
      .jpeg({ quality: 72 })
      .toBuffer();
    const label = Buffer.from(
      `<svg width="${cellW}" height="${labelH}"><rect width="100%" height="100%" fill="#161410"/><text x="8" y="19" fill="#e8d5b0" font-size="12" font-family="Segoe UI, sans-serif">${escapeXml(items[i].title).replaceAll(" ", "&#160;")}</text></svg>`,
    );
    composites.push({ input: img, left, top });
    composites.push({ input: label, left, top: top + cellH - labelH });
  }
  await sharp({
    create: { width, height, channels: 3, background: { r: 18, g: 16, b: 13 } },
  })
    .composite(composites)
    .jpeg({ quality: 78 })
    .toFile(join(outDir, `${cat}-contact-sheet.jpg`));
  console.log(cat, composites.length / 2);
}
