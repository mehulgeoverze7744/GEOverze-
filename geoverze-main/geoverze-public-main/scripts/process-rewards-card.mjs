import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const input = path.join(root, 'public/assets/rewards/geoverze-rewards-card-source.jpg');
const outputPng = path.join(root, 'public/assets/rewards/geoverze-rewards-card-transparent.png');
const outputWebp = path.join(root, 'public/assets/rewards/geoverze-rewards-card-transparent.webp');

function isGreenScreen(r, g, b, a) {
  if (a < 10) return true;
  const maxRb = Math.max(r, b);
  const greenDominance = g - maxRb;
  const brightness = (r + g + b) / 3;
  if (g > 80 && greenDominance > 25 && g > r * 1.15 && g > b * 1.15) return true;
  if (g > 140 && greenDominance > 15) return true;
  if (brightness > 40 && g > r + 20 && g > b + 20) return true;
  return false;
}

function featherAlpha(data, width, height) {
  const out = Buffer.from(data);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4 + 3;
      if (out[i] === 0) continue;
      let transparentNeighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ni = ((y + dy) * width + (x + dx)) * 4 + 3;
          if (out[ni] === 0) transparentNeighbors++;
        }
      }
      if (transparentNeighbors >= 3) out[i] = Math.min(out[i], 180);
      else if (transparentNeighbors >= 1) out[i] = Math.min(out[i], 230);
    }
  }
  return out;
}

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

for (let i = 0; i < data.length; i += channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (isGreenScreen(r, g, b, data[i + 3])) {
    data[i + 3] = 0;
  }
}

const feathered = featherAlpha(data, width, height);

await sharp(feathered, { raw: { width, height, channels } })
  .png({ compressionLevel: 9 })
  .toFile(outputPng);

await sharp(feathered, { raw: { width, height, channels } })
  .webp({ quality: 92, alphaQuality: 100, lossless: false })
  .toFile(outputWebp);

console.log(`Processed ${width}x${height}`);
console.log(`Wrote ${outputPng}`);
console.log(`Wrote ${outputWebp}`);
