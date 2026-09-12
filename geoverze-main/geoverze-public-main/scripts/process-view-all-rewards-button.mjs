import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const input =
  process.argv[2] ??
  "C:/Users/pansa/.cursor/projects/c-Users-pansa-OneDrive-Desktop-GEOverze/assets/c__Users_pansa_AppData_Roaming_Cursor_User_workspaceStorage_21f926ffe12fc7c0e927c3e9c6880d2f_images_View_all_rewards_button-a6a1eaab-1178-4891-8efd-96c88ec90c50.jpg";
const output = path.join(root, "public/assets/rewards/view-all-rewards-button.png");

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

for (let i = 0; i < data.length; i += channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const lum = (r + g + b) / 3;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;

  // Remove near-black background while preserving dark bronze shadows.
  if (lum < 24 && chroma < 18 && r < 30 && g < 30 && b < 30) {
    data[i + 3] = 0;
  }
}

await sharp(data, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(output);

const meta = await sharp(output).metadata();
console.log(`Wrote ${output} (${meta.width}x${meta.height})`);
