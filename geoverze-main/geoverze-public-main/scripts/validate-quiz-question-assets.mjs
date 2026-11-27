/**
 * Audits quiz question media in SQL migrations + checks local asset files.
 * Run: node scripts/validate-quiz-question-assets.mjs
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = join(here, "..");
const repoRoot = join(appRoot, "..", "..");
const quizDir = join(appRoot, "public", "assets", "quizzes");
const migDir = join(repoRoot, "supabase", "migrations");
const appMigDir = join(appRoot, "supabase", "migrations");

const errors = [];
const report = {
  migrationFiles: 0,
  mediaBlocks: 0,
  emojiRebus: 0,
  flagGlyphs: 0,
  localArtKeys: 0,
  missingLocalFiles: 0,
};

function scanSql(path) {
  if (!existsSync(path)) return;
  report.migrationFiles += 1;
  const sql = readFileSync(path, "utf8");
  const mediaMatches = sql.matchAll(/'\{"kind":"[^"]+"(?:[^'\\]|\\.|'')*'\}'::jsonb/g);
  const glyphPlus = (sql.match(/"glyph":"[^"]*\+[^"]*"/g) || []).length;
  report.emojiRebus += glyphPlus;
  for (const match of mediaMatches) {
    report.mediaBlocks += 1;
    const raw = match[0].slice(1, -9);
    try {
      const media = JSON.parse(raw.replace(/''/g, "'"));
      if (media.kind === "flag" && media.glyph) {
        if (/\s\+\s|\+/.test(media.glyph) || /[^\u0000-\u007f]/.test(media.glyph)) {
          report.emojiRebus += 1;
        } else if (/^[\u{1F1E6}-\u{1F1FF}]{2}$/u.test(media.glyph) || media.glyph.includes("🇦")) {
          report.flagGlyphs += 1;
        }
      }
      const art = media.art;
      if (art?.startsWith("outline-")) {
        report.localArtKeys += 1;
        const file = join(quizDir, "outlines", `${art}.svg`);
        if (!existsSync(file)) {
          report.missingLocalFiles += 1;
          errors.push(`missing outline asset: ${art}`);
        }
      }
      if (art?.startsWith("/assets/")) {
        report.localArtKeys += 1;
        const file = join(appRoot, "public", art.replace(/^\//, ""));
        if (!existsSync(file)) {
          report.missingLocalFiles += 1;
          errors.push(`missing public asset: ${art}`);
        }
      }
    } catch {
      // non-JSON media fragments — skip
    }
  }
}

for (const dir of [migDir, appMigDir]) {
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir).filter((n) => n.endsWith(".sql"))) {
    scanSql(join(dir, name));
  }
}

const jpgCount = readdirSync(quizDir).filter((n) => n.endsWith(".jpg")).length;
console.log({ ...report, quizCoverJpgOnDisk: jpgCount });

if (errors.length) {
  console.error("Asset validation errors:", errors.slice(0, 40));
  if (errors.length > 40) console.error(`…and ${errors.length - 40} more`);
  process.exit(1);
}

console.log("Quiz question asset validation passed.");