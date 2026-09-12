import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const input = path.join(root, "public/assets/rewards/geoverze-rewards-card-blank.jpg");
const outputPng = path.join(root, "public/assets/rewards/geoverze-rewards-card-blank-transparent.png");
const outputWebp = path.join(root, "public/assets/rewards/geoverze-rewards-card-blank-transparent.webp");

/** Corner starfield void — conservative so bronze/card pixels are never matched. */
function isOuterSpace(r, g, b) {
  const lum = (r + g + b) / 3;

  // Warm bronze/copper metal
  if (r > 50 && g > 30 && r >= b && lum > 32) return false;

  // Inner cosmic blues / nebula
  if (b >= r - 4 && b > 35 && lum > 22) return false;

  // Neutral dark starfield outside the card
  const neutral = Math.abs(r - g) < 18 && Math.abs(g - b) < 18;
  return lum < 42 && neutral;
}

function shouldCutBottomRight(r, g, b, x, y, width, height) {
  if (x <= width * 0.74 || y <= height * 0.74) return false;
  // Preserve bronze gear ornament in the corner
  if (r > 48 && g > 28 && r >= b - 2 && (r + g + b) / 3 > 30) return false;
  return true;
}

function isGeminiSparkle(r, g, b) {
  const lum = (r + g + b) / 3;
  const deltaRG = Math.abs(r - g);
  const deltaGB = Math.abs(g - b);
  const neutral = deltaRG < 15 && deltaGB < 15;

  // Lower-right gray sparkle / watermark text residue
  if (neutral && deltaRG < 14 && deltaGB < 14 && lum >= 72 && lum <= 230) {
    return true;
  }

  // Primary Gemini mark — bright neutral vertical sparkle on lower frame
  return neutral && lum >= 200 && lum <= 250;
}

function sampleBronze(data, width, height, channels, x, y) {
  for (const [dx, dy] of [
    [-6, 0],
    [6, 0],
    [0, -6],
    [0, 6],
    [-8, -8],
    [8, 8],
  ]) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
    const i = (ny * width + nx) * channels;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = (r + g + b) / 3;
    if (r > 48 && g > 28 && r >= b - 6 && lum > 30 && lum < 180) {
      return [r, g, b];
    }
  }
  return [62, 40, 28];
}

/** Upper empty metallic/blue slot — inpaint with surrounding bronze plate. */
function isUpperSlotPixel(r, g, b, x, y, width, height) {
  const cy = height * 0.798;
  const halfW = width * 0.31;
  const halfH = height * 0.052;
  const nx = (x - width / 2) / halfW;
  const ny = (y - cy) / halfH;
  if (nx * nx + ny * ny > 1.22) return false;

  const lum = (r + g + b) / 3;
  // Blue glass interior
  if (b >= r - 6 && b > g - 8 && lum >= 22 && lum <= 130) return true;
  // Metallic slot bezel
  return r > 55 && g > 38 && r >= b - 8 && lum >= 35 && lum <= 175;
}

function sampleUpperPlateBackground(data, width, height, channels, x) {
  const sy = Math.floor(height * 0.768);
  const idx = sy * width + x;
  const i = idx * channels;
  return [data[i], data[i + 1], data[i + 2]];
}

function eraseUpperSlot(data, width, height, channels) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const i = idx * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (!isUpperSlotPixel(r, g, b, x, y, width, height)) continue;
      const [sr, sg, sb] = sampleUpperPlateBackground(data, width, height, channels, x);
      data[i] = sr;
      data[i + 1] = sg;
      data[i + 2] = sb;
    }
  }
}

/** Remove Gemini/AI sparkle watermark baked into the lower frame. */
function eraseGeminiWatermark(data, width, height, channels) {
  for (let y = Math.floor(height * 0.72); y < height; y++) {
    for (let x = Math.floor(width * 0.5); x < width; x++) {
      const idx = y * width + x;
      const i = idx * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (!isGeminiSparkle(r, g, b)) continue;

      const [br, bg, bb] = sampleBronze(data, width, height, channels, x, y);
      data[i] = br;
      data[i + 1] = bg;
      data[i + 2] = bb;
    }
  }
}

function featherAlpha(data, width, height, channels) {
  const out = Buffer.from(data);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * channels + 3;
      if (out[i] === 0) continue;
      let transparentNeighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ni = ((y + dy) * width + (x + dx)) * channels + 3;
          if (out[ni] === 0) transparentNeighbors++;
        }
      }
      if (transparentNeighbors >= 3) out[i] = Math.min(out[i], 170);
      else if (transparentNeighbors >= 1) out[i] = Math.min(out[i], 220);
    }
  }
  return out;
}

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

eraseGeminiWatermark(data, width, height, channels);

const background = new Uint8Array(width * height);
const visited = new Uint8Array(width * height);
const queue = [];

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (x !== 0 && x !== width - 1 && y !== 0 && y !== height - 1) continue;
    const idx = y * width + x;
    const i = idx * channels;
    if (isOuterSpace(data[i], data[i + 1], data[i + 2])) {
      visited[idx] = 1;
      queue.push(idx);
    }
  }
}

while (queue.length) {
  const idx = queue.pop();
  background[idx] = 1;
  const x = idx % width;
  const y = (idx - x) / width;

  for (const [dx, dy] of [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
    const nIdx = ny * width + nx;
    if (visited[nIdx]) continue;
    const i = nIdx * channels;
    if (!isOuterSpace(data[i], data[i + 1], data[i + 2])) continue;
    visited[nIdx] = 1;
    queue.push(nIdx);
  }
}

let opaque = 0;
let transparent = 0;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = y * width + x;
    const i = idx * channels;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const cut =
      background[idx] === 1 || shouldCutBottomRight(r, g, b, x, y, width, height);
    data[i + 3] = cut ? 0 : 255;
    if (cut) transparent++;
    else opaque++;
  }
}

const feathered = featherAlpha(data, width, height, channels);

await sharp(feathered, { raw: { width, height, channels } })
  .png({ compressionLevel: 9 })
  .toFile(outputPng);

await sharp(feathered, { raw: { width, height, channels } })
  .webp({ quality: 92, alphaQuality: 100 })
  .toFile(outputWebp);

console.log(`Isolated card ${width}x${height} — ${opaque} opaque, ${transparent} transparent`);
console.log(`Wrote ${outputPng}`);
