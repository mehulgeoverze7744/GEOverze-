import hoodieEarthFromSpace from "@/assets/geostore/hoodie-earth-from-space.jpg";
import hoodieEarthIntelligence from "@/assets/geostore/hoodie-earth-intelligence.jpg";
import hoodieExploreUnknown from "@/assets/geostore/hoodie-explore-the-unknown.jpg";
import hoodieFragmentsOfEarth from "@/assets/geostore/hoodie-fragments-of-earth.jpg";
import hoodieKnowEarthThinkGlobal from "@/assets/geostore/hoodie-know-earth-think-global.jpg";
import tshirtBornToRoam from "@/assets/geostore/tshirt-born-to-roam.jpg";
import tshirtCommonSense from "@/assets/geostore/tshirt-common-sense-geography.jpg";
import tshirtGpsTrustIssues from "@/assets/geostore/tshirt-gps-trust-issues.jpg";
import tshirtKnowTheCapital from "@/assets/geostore/tshirt-i-know-the-capital.jpg";
import tshirtMyCountryIsBetter from "@/assets/geostore/tshirt-my-country-is-better.jpg";
import tshirtRecalculating from "@/assets/geostore/tshirt-recalculating-since-2024.jpg";
import tshirtTooClosePerfect from "@/assets/geostore/tshirt-too-close-perfect.jpg";

export type MerchCategory = "t-shirt" | "hoodie";

export type GeostoreMerchProduct = {
  id: string;
  title: string;
  category: MerchCategory;
  categoryLabel: "T-SHIRT" | "HOODIE";
  image: string;
  alt: string;
  /** Short card copy — one line preferred. */
  tagline: string;
  /** USD minor units (cents). */
  price: number;
  /** Whole GEO credits when hybrid pricing applies. */
  credits: number;
  /** Hidden from storefront listings but retained in catalogue data. */
  listed?: boolean;
};

/** Merch IDs hidden from visible shelves (V2 catalog curation). */
const HIDDEN_MERCH_IDS = new Set(["tshirt-my-country-is-better", "tshirt-common-sense"]);

/** Static frontend catalogue — replaceable with server GEOstore data later. */
export const geostoreMerchProducts: readonly GeostoreMerchProduct[] = [
  {
    id: "tshirt-born-to-roam",
    title: "0% LOCAL. 100% GLOBAL. BORN TO ROAM.",
    category: "t-shirt",
    categoryLabel: "T-SHIRT",
    image: tshirtBornToRoam,
    alt: "GEOverze black T-shirt — front and back views with 0% LOCAL. 100% GLOBAL. BORN TO ROAM. design",
    tagline: "For explorers who treat every border as an invitation.",
    price: 3_700,
    credits: 300,
  },
  {
    id: "tshirt-common-sense",
    title: "COMMON SENSE ≠ GEOGRAPHICAL KNOWLEDGE.",
    category: "t-shirt",
    categoryLabel: "T-SHIRT",
    image: tshirtCommonSense,
    alt: "GEOverze black T-shirt — front and back views with Common Sense versus Geographical Knowledge design",
    tagline: "Geography beats assumptions. Every time.",
    price: 3_600,
    credits: 360,
    listed: false,
  },
  {
    id: "tshirt-know-the-capital",
    title: "I KNOW THE CAPITAL. YOU KNOW THE VIBES.",
    category: "t-shirt",
    categoryLabel: "T-SHIRT",
    image: tshirtKnowTheCapital,
    alt: "GEOverze black T-shirt — front and back views with I Know The Capital. You Know The Vibes. design",
    tagline: "Capital cities, confident energy.",
    price: 3_700,
    credits: 300,
  },
  {
    id: "tshirt-my-country-is-better",
    title: "MY COUNTRY IS BETTER.",
    category: "t-shirt",
    categoryLabel: "T-SHIRT",
    image: tshirtMyCountryIsBetter,
    alt: "GEOverze black T-shirt — front and back views with My Country Is Better. design",
    tagline: "Bold patriotism with a geography wink.",
    price: 3_600,
    credits: 360,
    listed: false,
  },
  {
    id: "tshirt-recalculating",
    title: "RECALCULATING SINCE 2024.",
    category: "t-shirt",
    categoryLabel: "T-SHIRT",
    image: tshirtRecalculating,
    alt: "GEOverze black T-shirt — front and back views with Recalculating Since 2024 navigation design",
    tagline: "Navigation humor for the eternally rerouting.",
    price: 3_700,
    credits: 300,
  },
  {
    id: "tshirt-too-close-perfect",
    title: "TOO CLOSE? PERFECT.",
    category: "t-shirt",
    categoryLabel: "T-SHIRT",
    image: tshirtTooClosePerfect,
    alt: "GEOverze black T-shirt — front and back views with Too Close? Perfect. radar design",
    tagline: "Radar-close detail for map obsessives.",
    price: 3_700,
    credits: 300,
  },
  {
    id: "tshirt-gps-trust-issues",
    title: "YOUR GPS HAS TRUST ISSUES.",
    category: "t-shirt",
    categoryLabel: "T-SHIRT",
    image: tshirtGpsTrustIssues,
    alt: "GEOverze black T-shirt — front and back views with Your GPS Has Trust Issues. map design",
    tagline: "When the route and reality disagree.",
    price: 3_700,
    credits: 300,
  },
  {
    id: "hoodie-earth-from-space",
    title: "KNOW EARTH — FROM HERE, EVERYTHING IS GLOBAL",
    category: "hoodie",
    categoryLabel: "HOODIE",
    image: hoodieEarthFromSpace,
    alt: "GEOverze black hoodie — front, back and side views with Earth From Space Know Earth design",
    tagline: "Orbital perspective on heavyweight fleece.",
    price: 6_800,
    credits: 680,
  },
  {
    id: "hoodie-explore-unknown",
    title: "EXPLORE THE UNKNOWN",
    category: "hoodie",
    categoryLabel: "HOODIE",
    image: hoodieExploreUnknown,
    alt: "GEOverze charcoal hoodie — front and back views with Explore The Unknown world map design",
    tagline: "World-map warmth for long sessions.",
    price: 6_800,
    credits: 680,
  },
  {
    id: "hoodie-fragments-of-earth",
    title: "FRAGMENTS OF EARTH",
    category: "hoodie",
    categoryLabel: "HOODIE",
    image: hoodieFragmentsOfEarth,
    alt: "GEOverze black hoodie — back and sleeve views with Fragments Of Earth low-poly globe design",
    tagline: "Low-poly globe art on brushed fleece.",
    price: 6_800,
    credits: 680,
  },
  {
    id: "hoodie-earth-intelligence",
    title: "EARTH INTELLIGENCE",
    category: "hoodie",
    categoryLabel: "HOODIE",
    image: hoodieEarthIntelligence,
    alt: "GEOverze black hoodie — front and back views with Earth Intelligence orbital globe design",
    tagline: "Orbital intelligence, everyday comfort.",
    price: 6_800,
    credits: 680,
  },
  {
    id: "hoodie-know-earth-think-global",
    title: "GEOVERZE — KNOW EARTH · THINK GLOBAL",
    category: "hoodie",
    categoryLabel: "HOODIE",
    image: hoodieKnowEarthThinkGlobal,
    alt: "GEOverze black hoodie — front and back views with Know Earth Think Global bronze globe design",
    tagline: "Signature bronze globe on premium fleece.",
    price: 6_800,
    credits: 680,
  },
] as const;

/** GEOstore category route slugs backed by static merchandise. */
export type MerchStoreCategorySlug = "tshirts" | "hoodies";

export function isMerchStoreCategory(slug: string): slug is MerchStoreCategorySlug {
  return slug === "tshirts" || slug === "hoodies";
}

export function isMerchProductListed(product: GeostoreMerchProduct): boolean {
  if (product.listed === false || HIDDEN_MERCH_IDS.has(product.id)) return false;
  return true;
}

export function merchProductsForStoreCategory(
  slug: MerchStoreCategorySlug,
): GeostoreMerchProduct[] {
  return geostoreMerchProducts.filter(
    (p) =>
      isMerchProductListed(p) &&
      (slug === "tshirts" ? p.category === "t-shirt" : p.category === "hoodie"),
  );
}

export function merchProductById(id: string): GeostoreMerchProduct | undefined {
  return geostoreMerchProducts.find((p) => p.id === id);
}

export function isMerchProductId(id: string): boolean {
  return geostoreMerchProducts.some((p) => p.id === id);
}

export function merchCountForStoreCategory(slug: MerchStoreCategorySlug): number {
  return merchProductsForStoreCategory(slug).length;
}
