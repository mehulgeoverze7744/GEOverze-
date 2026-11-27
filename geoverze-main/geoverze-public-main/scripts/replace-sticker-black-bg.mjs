/**
 * Replace connected near-black canvas background with white (border flood-fill).
 * Preserves dark pixels inside sticker artwork that do not touch the sheet edge.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "src", "assets", "geostore");

const FILES = [
  "different-by-default.jpg",
  "off-the-map.jpg",
  "main-character-energy.jpg",
  "the-random-archive.jpg",
];

const TOLERANCE = 32;

function isBackgroundPixel(data, channels, index) {
  const r = data[index * channels];
  const g = data[index * channels + 1];
  const b = data[index * channels + 2];
  return r <= TOLERANCE && g <= TOLERANCE && b <= TOLERANCE;
}

function floodFillBackground(data, width, height, channels) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  const trySeed = (x, y) => {
    const index = y * width + x;
    if (visited[index] || !isBackgroundPixel(data, channels, index)) return;
    visited[index] = 1;
    queue.push(index);
  };

  for (let x = 0; x < width; x += 1) {
    trySeed(x, 0);
    trySeed(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    trySeed(0, y);
    trySeed(width - 1, y);
  }

  while (queue.length > 0) {
    const index = queue.pop();
    const x = index % width;
    const y = Math.floor(index / width);
    const offsets = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (const [dx, dy] of offsets) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const ni = ny * width + nx;
      if (visited[ni] || !isBackgroundPixel(data, channels, ni)) continue;
      visited[ni] = 1;
      queue.push(ni);
    }
  }

  for (let i = 0; i < visited.length; i += 1) {
    if (!visited[i]) continue;
    const px = i * channels;
    data[px] = 255;
    data[px + 1] = 255;
    data[px + 2] = 255;
    if (channels === 4) data[px + 3] = 255;
  }
}

async function processFile(name) {
  const filePath = path.join(root, name);
  const input = readFileSync(filePath);
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const buffer = Buffer.from(data);
  floodFillBackground(buffer, info.width, info.height, info.channels);
  await sharp(buffer, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(filePath);
  console.log(`processed ${name} (${info.width}x${info.height})`);
}

for (const file of FILES) {
  await processFile(file);
}