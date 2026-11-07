/** Local Figma assets for GMake Studio / Try-On. Never use temporary Figma URLs. */
const BASE = "/assets/gvrze-gmake";

export const GMAKE_ASSETS = {
  wordmark: "/assets/home/gvrze-wordmark.png",
  creamTee: `${BASE}/cream-tee-mockup.png`,
  blackTee: `${BASE}/black-tee-mockup.png`,
  maroonTee: `${BASE}/maroon-tee-mockup.png`,
  creamPrinted: `${BASE}/oversized-graphic-tees.png`,
  placementPlus: `${BASE}/placement-plus.svg`,
  uploadCloud: `${BASE}/upload-cloud.svg`,
  infoIcon: `${BASE}/info-icon.svg`,
  plusCircle: `${BASE}/plus-circle.svg`,
  chevron: `${BASE}/chevron-right.svg`,
  arrowNext: `${BASE}/arrow-next.svg`,
  arrowPrev: `${BASE}/arrow-prev.svg`,
  ruler: `${BASE}/ruler.svg`,
} as const;

export const GMAKE_PRINTS = {
  "cherry-blossom-tshirt": "/assets/gvrze-tryon/cherry-blossom-back-print.webp",
  "midnight-black-tshirt": "/assets/gvrze-tryon/midnight-black-back-print.webp",
  "golden-arc-tshirt": "/assets/gvrze-tryon/golden-arc-front-print.webp",
  "new-age-tshirt": "/assets/gvrze-tryon/new-age-back-print.webp",
} as const;

export function gmakeProductTitle(name: string): string {
  return name.replace(" Oversized Graphic T-Shirt", " T-Shirt");
}

export function formatRsPaise(paise: number): string {
  const rupees = paise / 100;
  const rounded = Number.isInteger(rupees) ? rupees : Number(rupees.toFixed(2));
  return `Rs. ${rounded.toLocaleString("en-IN")}`;
}
