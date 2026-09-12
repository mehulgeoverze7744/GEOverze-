import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const input = path.join(root, "public/assets/rewards/geoverze-rewards-card-source.jpg");
const output = path.join(root, "public/assets/rewards/geoverze-rewards-card-content.png");

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

const meta = await sharp(input).metadata();
const { width, height } = meta;

const left = Math.round(width * 0.115);
const top = Math.round(height * 0.195);
const cropWidth = Math.round(width * 0.77);
const cropHeight = Math.round(height * 0.625);

const { data, info } = await sharp(input)
  .extract({ left, top, width: cropWidth, height: cropHeight })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += info.channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (isGreenScreen(r, g, b, data[i + 3])) {
    data[i + 3] = 0;
  }
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
  .png({ compressionLevel: 9 })
  .toFile(output);

console.log(`Wrote inner content ${info.width}x${info.height} -> ${output}`);
