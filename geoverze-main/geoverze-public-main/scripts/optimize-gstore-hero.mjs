/**
 * Ultra HD hero pipeline — upscale campaign master to 4K, then emit AVIF / WebP / JPEG variants.
 *
 * Source must be the original campaign PNG (not a browser capture).
 * Upscaling uses high-quality Lanczos resampling + conservative sharpen only
 * (no generative / AI reinterpretation of the scene).
 *
 * Usage: node scripts/optimize-gstore-hero.mjs [path-to-source.png]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public/assets/gvrze-storefront");
const DEFAULT_SOURCE = path.join(OUT_DIR, "gvrze-graphic-tees-studio-trio-master.png");
const BASE_NAME = "gvrze-graphic-tees-studio-trio";
const UHD_PATH = path.join(OUT_DIR, `${BASE_NAME}-uhd-master.png`);
const TARGET_MAX_WIDTH = 3840;

/** Breakpoints served via srcset (mobile → 4K desktop / retina). */
const WIDTHS = [640, 960, 1280, 1920, 2560, 3840];

const sourcePath = process.argv[2] ?? DEFAULT_SOURCE;

if (!fs.existsSync(sourcePath)) {
  console.error(`Source not found: ${sourcePath}`);
  process.exit(1);
}

const sourceMeta = await sharp(sourcePath).metadata();
const aspect = (sourceMeta.width ?? 1) / (sourceMeta.height ?? 1);

const upscaleWidth = Math.min(TARGET_MAX_WIDTH, Math.max(sourceMeta.width ?? 0, TARGET_MAX_WIDTH));
const upscaleHeight = Math.round(upscaleWidth / aspect);

console.log(
  `Campaign source ${sourceMeta.width}x${sourceMeta.height} (${fs.statSync(sourcePath).size} bytes)`,
);

/** Build 4K working master from original — upscale only when source is below target width. */
async function ensureUhdMaster() {
  const needsUpscale = (sourceMeta.width ?? 0) < TARGET_MAX_WIDTH;
  const input = sharp(sourcePath).rotate();

  const pipeline = needsUpscale
    ? input.resize(upscaleWidth, upscaleHeight, {
        kernel: sharp.kernel.lanczos3,
        fit: "fill",
      })
    : input.resize(upscaleWidth, upscaleHeight, {
        kernel: sharp.kernel.lanczos3,
        fit: "inside",
        withoutEnlargement: true,
      });

  await pipeline
    .sharpen({ sigma: 0.55, m1: 0.6, m2: 1.8, x1: 2, y2: 8, y3: 16 })
    .png({ compressionLevel: 8, adaptiveFiltering: true })
    .toFile(UHD_PATH);

  const uhdMeta = await sharp(UHD_PATH).metadata();
  console.log(
    `UHD master ${uhdMeta.width}x${uhdMeta.height} (${fs.statSync(UHD_PATH).size} bytes) → ${UHD_PATH}`,
  );
  return uhdMeta;
}

const uhdMeta = await ensureUhdMaster();
const maxWidth = uhdMeta.width ?? upscaleWidth;
const maxHeight = uhdMeta.height ?? upscaleHeight;

function fileSuffix(width) {
  return width === maxWidth ? "" : `-${width}w`;
}

function fileName(width, format) {
  const ext = format === "jpeg" ? "jpg" : format;
  return `${BASE_NAME}${fileSuffix(width)}.${ext}`;
}

async function writeVariant(width, format) {
  const height = Math.round(width / aspect);
  const outPath = path.join(OUT_DIR, fileName(width, format));

  let pipeline = sharp(UHD_PATH).resize(width, height, {
    fit: "cover",
    position: "centre",
    kernel: sharp.kernel.lanczos3,
    withoutEnlargement: true,
  });

  if (format === "avif") {
    const q = width >= 2560 ? 64 : width >= 1920 ? 60 : width >= 1280 ? 56 : 52;
    pipeline = pipeline.avif({ quality: q, effort: 7, chromaSubsampling: "4:2:0" });
  } else if (format === "webp") {
    const q = width >= 1920 ? 88 : 86;
    pipeline = pipeline.webp({ quality: q, effort: 5, smartSubsample: true });
  } else {
    const q = width >= 1920 ? 92 : 88;
    pipeline = pipeline.jpeg({ quality: q, mozjpeg: true, chromaSubsampling: "4:4:4" });
  }

  await pipeline.toFile(outPath);
  return {
    fileName: path.basename(outPath),
    width,
    height,
    size: fs.statSync(outPath).size,
    format: format === "jpeg" ? "jpg" : format,
  };
}

const stats = [];

for (const width of WIDTHS) {
  if (width > maxWidth) continue;
  for (const format of ["avif", "webp"]) {
    stats.push(await writeVariant(width, format));
  }
  stats.push(await writeVariant(width, "jpeg"));
}

console.log("\nGenerated:");
for (const row of stats) {
  console.log(
    `  ${row.fileName}  ${row.width}x${row.height}  ${(row.size / 1024).toFixed(1)} KiB (${row.format})`,
  );
}

console.log(`\nUpdate SF_HERO_NATIVE to { width: ${maxWidth}, height: ${maxHeight} }`);