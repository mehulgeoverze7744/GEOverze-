/**
 * GEOstore promotions: bundles, credit tiers and the current featured drop.
 * Illustrative placeholder merchandising — no payment processing exists yet.
 */

export type Bundle = {
  id: string;
  name: string;
  blurb: string;
  slugs: readonly string[];
  /** Bundle price in minor units. */
  price: number;
  /** Combined list price in minor units. */
  compareAt: number;
  credits: number | null;
};

export const BUNDLES: readonly Bundle[] = [
  {
    id: "b-explorer",
    name: "Explorer Starter Bundle",
    blurb: "The two packs most players buy first, plus the sticker sheet.",
    slugs: ["capitals-mastery-pack", "flags-of-the-world-pack", "flag-sticker-pack"],
    price: 2_400,
    compareAt: 3_000,
    credits: 240,
  },
  {
    id: "b-continental",
    name: "Continental Study Bundle",
    blurb: "Three guided learning paths across Europe, Africa and Asia.",
    slugs: ["europe-learning-path", "africa-learning-path", "asia-learning-path"],
    price: 4_500,
    compareAt: 5_700,
    credits: 450,
  },
  {
    id: "b-desk",
    name: "Desk Setup Bundle",
    blurb: "Poster, mug and notebook — the whole workspace in bronze.",
    slugs: ["bronze-world-map-poster", "old-world-mug", "field-notebook"],
    price: 7_400,
    compareAt: 8_600,
    credits: null,
  },
  {
    id: "b-wear",
    name: "Everyday Wear Bundle",
    blurb: "Tee and cap, sized independently.",
    slugs: ["know-earth-tee", "cartographer-cap"],
    price: 5_400,
    compareAt: 6_000,
    credits: 540,
  },
];

export function bundleById(id: string): Bundle | undefined {
  return BUNDLES.find((b) => b.id === id);
}

/** Credit-redemption ladder mirrored from the progression module. */
export const CREDIT_TIERS = [
  { credits: 40, label: "Profile rewards", note: "Avatars, badges and frames." },
  { credits: 90, label: "Digital packs", note: "Any single quiz or theme pack." },
  { credits: 190, label: "Learning paths", note: "A full continental study route." },
  { credits: 320, label: "Merchandise", note: "Tees, caps and desk objects." },
] as const;

export type Deal = {
  id: string;
  title: string;
  blurb: string;
  slug: string;
  /** Percentage off, whole number. */
  discount: number;
  /** ISO date the deal closes. */
  endsAt: string;
};

export const DEALS: readonly Deal[] = [
  {
    id: "d-1",
    title: "Atlas week",
    blurb: "The 220-page bronze atlas at its lowest price yet.",
    slug: "geoverze-atlas-pdf",
    discount: 20,
    endsAt: "2026-03-14",
  },
  {
    id: "d-2",
    title: "Know Earth restock",
    blurb: "The slogan tee is back in every size.",
    slug: "know-earth-tee",
    discount: 15,
    endsAt: "2026-03-09",
  },
  {
    id: "d-3",
    title: "Poster pairing",
    blurb: "Bronze world map, framed-ready and ships flat.",
    slug: "bronze-world-map-poster",
    discount: 13,
    endsAt: "2026-03-21",
  },
];
