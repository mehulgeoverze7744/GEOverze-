import { createRequire } from "node:module";
import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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
const assets = join(
  process.env.USERPROFILE ?? "",
  ".cursor",
  "projects",
  "c-Users-pansa-OneDrive-Desktop-GEOverze",
  "assets",
);
const raw = join(dirname(fileURLToPath(import.meta.url)), "generated-raw");

const IDS = [
  ["q-cap-moved-capitals", "cap-moved-capitals-quiz.jpg", ["cap-moved-capitals.jpg", "cap-moved-capitals.png"]],
  ["q-flg-stripe-school", "flg-stripe-school-quiz.jpg", ["flg-stripe-school.jpg", "flg-stripe-school.png"]],
  ["q-flg-banner-variants", "flg-banner-variants-quiz.jpg", ["flg-banner-variants.jpg", "flg-banner-variants.png"]],
  ["q-map-contour-clues", "map-contour-clues-quiz.jpg", ["map-contour-clues.png", "map-contour-clues.jpg"]],
  ["q-map-isogonic-inquiry", "map-isogonic-inquiry-quiz.jpg", ["map-isogonic-inquiry.png", "map-isogonic-inquiry.jpg"]],
  ["q-map-surveyor-s-gauntlet", "map-surveyor-s-gauntlet-quiz.jpg", ["map-surveyors-gauntlet.png", "map-surveyor-s-gauntlet.jpg"]],
  ["q-lmk-hidden-landmarks", "lmk-hidden-landmarks-quiz.jpg", ["lmk-hidden-landmarks.png", "lmk-hidden-landmarks.jpg"]],
  ["q-lmk-architect-s-atlas", "lmk-architect-s-atlas-quiz.jpg", ["lmk-architects-atlas.png", "lmk-architect-s-atlas.jpg"]],
  ["q-riv-tributary-trail", "riv-tributary-trail-quiz.jpg", ["riv-tributary-trail.jpg", "riv-tributary-trail.png"]],
  ["q-riv-basin-basics", "riv-basin-basics-quiz.jpg", ["riv-basin-basics.jpg", "riv-basin-basics.png"]],
  ["q-riv-transboundary-rivers", "riv-transboundary-rivers-quiz.jpg", ["riv-transboundary-rivers.jpg", "riv-transboundary-rivers.png"]],
  ["q-riv-confluence-quiz", "riv-confluence-quiz-quiz.jpg", ["riv-confluence-quiz.jpg", "riv-confluence-quiz.png"]],
  ["q-ocn-ocean-unknown", "ocn-ocean-unknown-quiz.jpg", ["ocn-ocean-unknown.jpg", "ocn-ocean-unknown.png"]],
  ["q-ocn-sea-room", "ocn-sea-room-quiz.jpg", ["ocn-sea-room.jpg", "ocn-sea-room.png"]],
  ["q-ocn-thermohaline-trail", "ocn-thermohaline-trail-quiz.jpg", ["ocn-thermohaline-trail.jpg", "ocn-thermohaline-trail.png"]],
  ["q-mix-crosswind-quiz", "mix-crosswind-quiz-quiz.jpg", ["mix-crosswind-quiz.jpg", "mix-crosswind-quiz.png"]],
];

async function ahash(file) {
  const { data, info } = await sharp(file).greyscale().resize(16, 16, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  let mean = 0;
  for (const v of data) mean += v;
  mean /= data.length;
  return [...data].map((v) => (v >= mean ? "1" : "0")).join("");
}

function ham(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d += 1;
  return d;
}

function findSource(names) {
  for (const n of names) {
    for (const dir of [assets, raw]) {
      const p = join(dir, n);
      if (existsSync(p)) return p;
    }
  }
  return null;
}

for (const [id, filename, names] of IDS) {
  const dest = join(destDir, filename);
  const tmp = `${dest}.tmp.jpg`;
  const source = findSource(names);
  const destStat = existsSync(dest) ? statSync(dest) : null;
  const tmpStat = existsSync(tmp) ? statSync(tmp) : null;
  const destMeta = destStat ? await sharp(dest).metadata() : null;
  const srcHash = source ? await ahash(source) : null;
  const destHash = dest ? await ahash(dest) : null;
  const tmpHash = tmpStat ? await ahash(tmp) : null;
  console.log(
    JSON.stringify({
      id,
      destKb: destStat ? Math.round(destStat.size / 1024) : null,
      destDim: destMeta ? `${destMeta.width}x${destMeta.height}` : null,
      tmpKb: tmpStat ? Math.round(tmpStat.size / 1024) : null,
      source: source ? source.replace(/\\/g, "/").split("/").slice(-2).join("/") : null,
      destVsSource: srcHash && destHash ? ham(srcHash, destHash) : null,
      tmpVsSource: srcHash && tmpHash ? ham(srcHash, tmpHash) : null,
    }),
  );
}
