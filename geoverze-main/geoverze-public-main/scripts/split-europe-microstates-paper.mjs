/**
 * Builds parchment background layers from europe-microstates-paper.png:
 * - crown: top of sheet (shown once)
 * - tile: center grain only (seamless repeat-y, no edges/mountains)
 * - mountains: bottom artwork (shown once)
 *
 * Usage: node scripts/split-europe-microstates-paper.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dir = path.join(root, "public/assets/geolibrary");
const input = path.join(dir, "europe-microstates-paper.png");

const meta = await sharp(input).metadata();
const w = meta.width ?? 1200;
const h = meta.height ?? 1600;

/** Decorative footer (mountains + bottom edge) starts here. */
const mountainStart = Math.round(h * 0.76);

/** Top sheet with side vignette — once at article top. */
const crownHeight = Math.round(h * 0.11);

/** Plain grain band — center of sheet, away from vignette and footer art. */
const tileTop = Math.round(h * 0.2);
const tileHeight = Math.max(32, Math.round(h * 0.045));

const crownOut = path.join(dir, "europe-microstates-paper-crown.png");
const tileOut = path.join(dir, "europe-microstates-paper-tile.png");
const mtnOut = path.join(dir, "europe-microstates-paper-mountains.png");

await sharp(input)
  .extract({ left: 0, top: 0, width: w, height: crownHeight })
  .png()
  .toFile(crownOut);

await sharp(input)
  .extract({ left: 0, top: tileTop, width: w, height: tileHeight })
  .png()
  .toFile(tileOut);

await sharp(input)
  .extract({ left: 0, top: mountainStart, width: w, height: h - mountainStart })
  .png()
  .toFile(mtnOut);

console.log(
  `crown ${w}x${crownHeight}, tile ${w}x${tileHeight} @y${tileTop}, mountains ${w}x${h - mountainStart}`,
);
