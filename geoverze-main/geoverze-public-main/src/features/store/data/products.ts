/**
 * GEOstore catalogue.
 *
 * Placeholder merchandising data with the shape a real commerce backend would
 * return. Money is stored in minor units (cents) and credits are whole GEO
 * credits, so a product can be money-only, credits-only or hybrid.
 */
import { categoryById, type StoreCategoryId, type StoreGroupId } from "./taxonomy";

export type StockState = "in-stock" | "low" | "preorder" | "sold-out";
export type PriceMode = "money" | "credits" | "hybrid";

export type ProductOption = {
  label: string;
  values: readonly string[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: StoreCategoryId;
  group: StoreGroupId;
  /** Price in USD minor units. `null` for credits-only items. */
  price: number | null;
  /** Struck-through reference price in minor units, or `null`. */
  compareAt: number | null;
  /** Credit cost, or `null` when the item cannot be claimed with credits. */
  credits: number | null;
  mode: PriceMode;
  rating: number;
  reviews: number;
  popularity: number;
  stock: StockState;
  releasedAt: string;
  limited: boolean;
  featured: boolean;
  bestSeller: boolean;
  options: readonly ProductOption[];
  features: readonly string[];
  specs: readonly { label: string; value: string }[];
  tags: readonly string[];
};

type Draft = Partial<Product> & {
  slug: string;
  name: string;
  tagline: string;
  category: StoreCategoryId;
};

let seq = 0;

function make(draft: Draft): Product {
  seq += 1;
  const group = categoryById(draft.category)?.group ?? "merch";
  const price = draft.price ?? null;
  const credits = draft.credits ?? null;
  const mode: PriceMode =
    price !== null && credits !== null ? "hybrid" : price !== null ? "money" : "credits";

  return {
    id: `p-${String(seq).padStart(3, "0")}`,
    slug: draft.slug,
    name: draft.name,
    tagline: draft.tagline,
    description:
      draft.description ??
      `${draft.name} — part of the GEOverze collection. Designed in the same bronze-on-charcoal language as the platform and made to survive daily use.`,
    category: draft.category,
    group,
    price,
    compareAt: draft.compareAt ?? null,
    credits,
    mode,
    rating: draft.rating ?? 4.6,
    reviews: draft.reviews ?? 48,
    popularity: draft.popularity ?? 50,
    stock: draft.stock ?? "in-stock",
    releasedAt: draft.releasedAt ?? "2025-09-01",
    limited: draft.limited ?? false,
    featured: draft.featured ?? false,
    bestSeller: draft.bestSeller ?? false,
    options: draft.options ?? [],
    features: draft.features ?? [
      "Designed in-house by the GEOverze studio",
      "Bronze foil emblem",
      "Ships worldwide",
    ],
    specs: draft.specs ?? [],
    tags: draft.tags ?? [],
  };
}

const APPAREL_SIZES: ProductOption = {
  label: "Size",
  values: ["XS", "S", "M", "L", "XL", "XXL"],
};

const APPAREL_COLOURS: ProductOption = {
  label: "Colour",
  values: ["Charcoal", "Deep space", "Bronze sand"],
};

export const PRODUCTS: readonly Product[] = [
  // ---------------------------------------------------------------- merch
  make({
    slug: "i-know-the-capital-you-know-the-vibes",
    name: "I KNOW THE CAPITAL, YOU KNOW THE VIBES.",
    tagline: "A bold geography statement tee for explorers who know their capitals — and know the vibes.",
    category: "tshirts",
    price: 3_600,
    credits: 360,
    rating: 4.8,
    reviews: 214,
    popularity: 98,
    bestSeller: true,
    featured: true,
    options: [APPAREL_SIZES, APPAREL_COLOURS],
    features: [
      "240 gsm combed organic cotton",
      "Capital-city artwork across the back",
      "Pre-shrunk, garment dyed",
    ],
    specs: [
      { label: "Material", value: "100% organic cotton" },
      { label: "Weight", value: "240 gsm" },
      { label: "Fit", value: "Relaxed" },
      { label: "Care", value: "Cold wash, inside out" },
    ],
    tags: ["apparel", "slogan", "bestseller"],
  }),
  make({
    slug: "meridian-tee",
    name: "Meridian Tee",
    tagline: "Longitude lines wrapping the torso.",
    category: "tshirts",
    price: 3_400,
    credits: 340,
    rating: 4.6,
    reviews: 96,
    popularity: 74,
    options: [APPAREL_SIZES, APPAREL_COLOURS],
    tags: ["apparel", "cartography"],
  }),
  make({
    slug: "continents-tee",
    name: "Seven Continents Tee",
    tagline: "All seven landmasses, one seam-to-seam print.",
    category: "tshirts",
    price: 3_400,
    credits: 340,
    rating: 4.5,
    reviews: 61,
    popularity: 63,
    stock: "low",
    options: [APPAREL_SIZES],
    tags: ["apparel", "continents"],
  }),
  make({
    slug: "explore-the-unknown",
    name: "EXPLORE THE UNKNOWN",
    tagline:
      "Heavyweight explorer hoodie featuring a world map and compass-inspired design for the journey beyond the familiar.",
    category: "hoodies",
    price: 8_200,
    credits: 820,
    rating: 4.9,
    reviews: 178,
    popularity: 95,
    bestSeller: true,
    featured: true,
    options: [APPAREL_SIZES, APPAREL_COLOURS],
    features: [
      "420 gsm brushed fleece",
      "World map and compass artwork across the back",
      "Double-lined hood with metal tips",
    ],
    specs: [
      { label: "Material", value: "80% cotton / 20% recycled polyester" },
      { label: "Weight", value: "420 gsm" },
      { label: "Fit", value: "Oversized" },
    ],
    tags: ["apparel", "winter", "bestseller"],
  }),
  make({
    slug: "expedition-zip-hoodie",
    name: "Expedition Zip Hoodie",
    tagline: "Full-zip, field-ready, bronze pull.",
    category: "hoodies",
    price: 8_600,
    credits: 860,
    rating: 4.7,
    reviews: 84,
    popularity: 71,
    options: [APPAREL_SIZES],
    tags: ["apparel", "winter"],
  }),
  make({
    slug: "cartographer-cap",
    name: "Cartographer Cap",
    tagline: "Six-panel, embroidered emblem, bronze eyelets.",
    category: "caps",
    price: 2_800,
    credits: 280,
    rating: 4.6,
    reviews: 120,
    popularity: 80,
    options: [{ label: "Colour", values: ["Charcoal", "Deep space"] }],
    tags: ["headwear"],
  }),
  make({
    slug: "polar-beanie",
    name: "Polar Beanie",
    tagline: "Ribbed wool for the coldest latitudes.",
    category: "caps",
    price: 2_400,
    credits: 240,
    rating: 4.4,
    reviews: 39,
    popularity: 52,
    stock: "low",
    tags: ["headwear", "winter"],
  }),
  make({
    slug: "old-world-mug",
    name: "Old World Mug",
    tagline: "Glazed ceramic with an antique projection.",
    category: "mugs",
    price: 2_200,
    credits: 220,
    rating: 4.7,
    reviews: 143,
    popularity: 90,
    features: ["350 ml stoneware", "Dishwasher and microwave safe", "Hand-glazed bronze rim"],
    specs: [
      { label: "Capacity", value: "350 ml" },
      { label: "Material", value: "Stoneware" },
    ],
    tags: ["desk", "gift"],
  }),
  make({
    slug: "expedition-enamel-mug",
    name: "Expedition Enamel Mug",
    tagline: "Camp-grade enamel with a bronze rim.",
    category: "mugs",
    price: 2_600,
    credits: 260,
    rating: 4.5,
    reviews: 58,
    popularity: 85,
    tags: ["desk", "outdoor"],
  }),
  make({
    slug: "navigator-compass-mug",
    name: "Navigator Compass Mug",
    tagline: "Dark ceramic with a bronze compass emblem.",
    category: "mugs",
    price: 2_400,
    credits: 240,
    rating: 4.6,
    reviews: 72,
    popularity: 80,
    tags: ["desk", "gift"],
  }),
  make({
    slug: "world-map-mug",
    name: "World Map Mug",
    tagline: "Antique bronze world map on deep charcoal ceramic.",
    category: "mugs",
    price: 2_800,
    credits: 280,
    rating: 4.7,
    reviews: 96,
    popularity: 75,
    tags: ["desk", "gift"],
  }),
  make({
    slug: "latitude-longitude-mug",
    name: "Latitude Longitude Mug",
    tagline: "Geographic grid lines in bronze on matte charcoal ceramic.",
    category: "mugs",
    price: 2_700,
    credits: 270,
    rating: 4.5,
    reviews: 64,
    popularity: 70,
    tags: ["desk", "gift"],
  }),
  make({
    slug: "antique-expedition-mug",
    name: "Antique Expedition Mug",
    tagline: "Vintage map glaze inspired by old-world exploration.",
    category: "mugs",
    price: 3_000,
    credits: 300,
    rating: 4.8,
    reviews: 88,
    popularity: 65,
    tags: ["desk", "gift"],
  }),
  make({
    slug: "flag-sticker-pack",
    name: "Flag Sticker Pack",
    tagline: "Fifty die-cut flags, weatherproof vinyl.",
    category: "stickers",
    price: 1_200,
    credits: 120,
    rating: 4.8,
    reviews: 302,
    popularity: 90,
    bestSeller: true,
    features: ["50 die-cut vinyl stickers", "UV and water resistant", "Laptop-safe adhesive"],
    tags: ["flags", "gift", "bestseller"],
  }),
  make({
    slug: "continent-sticker-set",
    name: "Continent Sticker Set",
    tagline: "Seven landmasses, matte finish.",
    category: "stickers",
    price: 900,
    credits: 90,
    rating: 4.4,
    reviews: 88,
    popularity: 85,
    tags: ["continents"],
  }),
  make({
    slug: "vintage-expedition-sticker-collection",
    name: "Vintage Expedition Sticker Collection",
    tagline: "Vintage explorer badges, maps and navigation emblems.",
    category: "stickers",
    price: 1_800,
    credits: 180,
    popularity: 80,
    tags: ["exploration", "gift"],
  }),
  make({
    slug: "bronze-world-map-poster",
    name: "Bronze World Map Poster",
    tagline: "Archival print, 70 × 50 cm.",
    category: "posters",
    price: 4_500,
    compareAt: 5_200,
    credits: 450,
    rating: 4.9,
    reviews: 167,
    popularity: 92,
    featured: true,
    features: [
      "Giclée print on 250 gsm archival stock",
      "Bronze ink detailing",
      "Ships in a rigid tube",
    ],
    specs: [
      { label: "Size", value: "70 × 50 cm" },
      { label: "Stock", value: "250 gsm matte archival" },
    ],
    tags: ["wall", "cartography"],
  }),
  make({
    slug: "night-sky-poster",
    name: "Night Sky Poster",
    tagline: "The Milky Way as seen from the equator.",
    category: "posters",
    price: 4_200,
    credits: 420,
    rating: 4.6,
    reviews: 47,
    popularity: 55,
    tags: ["wall", "space"],
  }),
  make({
    slug: "tectonic-plates-poster",
    name: "Tectonic Plates Poster",
    tagline: "Every plate boundary, annotated.",
    category: "posters",
    price: 4_200,
    credits: 420,
    rating: 4.7,
    reviews: 36,
    popularity: 49,
    stock: "preorder",
    tags: ["wall", "geology"],
  }),
  make({
    slug: "field-notebook",
    name: "Field Notebook",
    tagline: "Dot-grid field notebook with a bronze GEOverze emblem.",
    category: "accessories",
    price: 1_900,
    credits: 190,
    rating: 4.7,
    reviews: 112,
    popularity: 76,
    features: ["A5, 192 dot-grid pages", "Lay-flat binding", "Elastic closure"],
    tags: ["desk", "study"],
  }),
  make({
    slug: "desk-globe-mini",
    name: "Mini Desk Globe",
    tagline: "12 cm desk globe with a bronze meridian.",
    category: "accessories",
    price: 9_800,
    credits: 980,
    rating: 4.9,
    reviews: 28,
    popularity: 70,
    limited: true,
    stock: "preorder",
    specs: [
      { label: "Diameter", value: "12 cm" },
      { label: "Base", value: "Solid brass" },
    ],
    tags: ["collectible", "desk", "limited"],
  }),
  make({
    slug: "expedition-keychain",
    name: "Expedition Keychain",
    tagline: "Bronze-finished explorer keychain with a compass and globe emblem.",
    category: "accessories",
    price: 1_600,
    credits: 160,
    popularity: 68,
    tags: ["gift", "collectible"],
  }),
  make({
    slug: "explorers-compass",
    name: "Explorer's Compass",
    tagline: "Vintage-style pocket compass with an antique world map dial.",
    category: "accessories",
    price: 3_200,
    credits: 320,
    popularity: 65,
    tags: ["gift", "collectible"],
  }),
  // -------------------------------------------------------------- digital
  make({
    slug: "capitals-mastery-pack",
    name: "Capitals Mastery Pack",
    tagline: "600 questions covering every capital city.",
    category: "quiz-packs",
    price: 900,
    credits: 90,
    rating: 4.8,
    reviews: 421,
    popularity: 97,
    bestSeller: true,
    featured: true,
    features: ["600 curated questions", "Adaptive difficulty", "Unlocks instantly, yours forever"],
    specs: [
      { label: "Questions", value: "600" },
      { label: "Difficulty", value: "Easy to expert" },
      { label: "Delivery", value: "Instant unlock" },
    ],
    tags: ["capitals", "instant"],
  }),
  make({
    slug: "flags-of-the-world-pack",
    name: "Flags of the World Pack",
    tagline: "Every sovereign flag, plus the tricky territories.",
    category: "quiz-packs",
    price: 900,
    credits: 90,
    rating: 4.9,
    reviews: 388,
    popularity: 96,
    bestSeller: true,
    tags: ["flags", "instant"],
  }),
  make({
    slug: "rivers-and-lakes-pack",
    name: "Rivers & Lakes Pack",
    tagline: "Trace the world's water from source to mouth.",
    category: "quiz-packs",
    price: 800,
    credits: 80,
    rating: 4.6,
    reviews: 133,
    popularity: 72,
    tags: ["hydrology"],
  }),
  make({
    slug: "mountains-and-peaks-pack",
    name: "Mountains & Peaks Pack",
    tagline: "Ranges, summits and the passes between them.",
    category: "quiz-packs",
    price: 800,
    credits: 80,
    rating: 4.5,
    reviews: 97,
    popularity: 64,
    tags: ["geology"],
  }),
  make({
    slug: "world-heritage-pack",
    name: "World Heritage Pack",
    tagline: "300 protected sites and why they matter.",
    category: "quiz-packs",
    price: 1_000,
    credits: 100,
    rating: 4.7,
    reviews: 118,
    popularity: 69,
    tags: ["culture", "heritage"],
  }),
  make({
    slug: "europe-learning-path",
    name: "Europe Learning Path",
    tagline: "Twelve guided lessons across the continent.",
    category: "learning-packs",
    price: 1_900,
    credits: 190,
    rating: 4.8,
    reviews: 156,
    popularity: 88,
    featured: true,
    features: [
      "12 guided lessons",
      "Checkpoint quizzes after each module",
      "Printable revision sheets",
    ],
    tags: ["europe", "study"],
  }),
  make({
    slug: "africa-learning-path",
    name: "Africa Learning Path",
    tagline: "Fifty-four countries, one structured route.",
    category: "learning-packs",
    price: 1_900,
    credits: 190,
    rating: 4.7,
    reviews: 102,
    popularity: 78,
    tags: ["africa", "study"],
  }),
  make({
    slug: "asia-learning-path",
    name: "Asia Learning Path",
    tagline: "From the Levant to the Pacific rim.",
    category: "learning-packs",
    price: 1_900,
    credits: 190,
    rating: 4.6,
    reviews: 88,
    popularity: 73,
    tags: ["asia", "study"],
  }),
  make({
    slug: "japan-collection",
    name: "Japan Collection",
    tagline: "Prefectures, peaks, islands and cities.",
    category: "country-collections",
    price: 700,
    credits: 70,
    rating: 4.8,
    reviews: 144,
    popularity: 82,
    tags: ["japan", "country"],
  }),
  make({
    slug: "brazil-collection",
    name: "Brazil Collection",
    tagline: "States, basins and the Amazon in detail.",
    category: "country-collections",
    price: 700,
    credits: 70,
    rating: 4.6,
    reviews: 71,
    popularity: 61,
    tags: ["brazil", "country"],
  }),
  make({
    slug: "india-collection",
    name: "India Collection",
    tagline: "States, rivers, ranges and heritage sites.",
    category: "country-collections",
    price: 700,
    credits: 70,
    rating: 4.7,
    reviews: 129,
    popularity: 79,
    tags: ["india", "country"],
  }),
  make({
    slug: "norway-collection",
    name: "Norway Collection",
    tagline: "Fjords, counties and the Arctic north.",
    category: "country-collections",
    price: 700,
    credits: 70,
    rating: 4.5,
    reviews: 42,
    popularity: 47,
    tags: ["norway", "country"],
  }),
  make({
    slug: "climate-zones-theme",
    name: "Climate Zones Theme Pack",
    tagline: "Köppen classification made playable.",
    category: "theme-packs",
    price: 1_100,
    credits: 110,
    rating: 4.6,
    reviews: 64,
    popularity: 57,
    tags: ["climate"],
  }),
  make({
    slug: "borders-and-enclaves-theme",
    name: "Borders & Enclaves Theme Pack",
    tagline: "The strangest lines humans ever drew.",
    category: "theme-packs",
    price: 1_100,
    credits: 110,
    rating: 4.9,
    reviews: 87,
    popularity: 75,
    limited: true,
    tags: ["borders", "limited"],
  }),
  make({
    slug: "time-zones-theme",
    name: "Time Zones Theme Pack",
    tagline: "UTC offsets, oddities and the date line.",
    category: "theme-packs",
    price: 1_000,
    credits: 100,
    rating: 4.4,
    reviews: 38,
    popularity: 44,
    tags: ["time"],
  }),
  make({
    slug: "geoverze-atlas-pdf",
    name: "GEOverze Atlas (PDF)",
    tagline: "220 pages of bronze cartography, print ready.",
    category: "premium-resources",
    price: 2_400,
    compareAt: 3_000,
    credits: 240,
    rating: 4.9,
    reviews: 209,
    popularity: 91,
    featured: true,
    features: ["220 pages, vector maps", "Print-ready at A3", "Free updates for a year"],
    specs: [
      { label: "Format", value: "PDF, 180 MB" },
      { label: "Pages", value: "220" },
    ],
    tags: ["atlas", "download"],
  }),
  make({
    slug: "teacher-worksheet-bundle",
    name: "Teacher Worksheet Bundle",
    tagline: "Sixty classroom sheets with answer keys.",
    category: "premium-resources",
    price: 3_600,
    credits: null,
    rating: 4.8,
    reviews: 54,
    popularity: 59,
    features: ["60 worksheets", "Answer keys included", "Classroom licence for 35 students"],
    tags: ["teaching", "download"],
  }),
  make({
    slug: "country-dataset-csv",
    name: "Country Dataset (CSV)",
    tagline: "195 countries, 40 verified fields each.",
    category: "premium-resources",
    price: 1_800,
    credits: null,
    rating: 4.5,
    reviews: 31,
    popularity: 40,
    tags: ["data", "download"],
  }),
  // -------------------------------------------------------------- rewards
  make({
    slug: "avatar-navigator",
    name: "Navigator Avatar",
    tagline: "Bronze-plated explorer portrait.",
    category: "avatars",
    price: null,
    credits: 40,
    rating: 4.7,
    reviews: 88,
    popularity: 85,
    features: [
      "Applies to your profile instantly",
      "Visible on leaderboards",
      "Reversible any time",
    ],
    tags: ["profile", "credits"],
  }),
  make({
    slug: "avatar-astronomer",
    name: "Astronomer Avatar",
    tagline: "For the ones who read the sky first.",
    category: "avatars",
    price: null,
    credits: 55,
    rating: 4.6,
    reviews: 51,
    popularity: 66,
    tags: ["profile", "credits"],
  }),
  make({
    slug: "badge-continental-sweep",
    name: "Continental Sweep Badge",
    tagline: "Display honour for clearing every continent.",
    category: "badges",
    price: null,
    credits: 65,
    rating: 4.8,
    reviews: 44,
    popularity: 72,
    limited: true,
    tags: ["honour", "credits", "limited"],
  }),
  make({
    slug: "badge-streak-keeper",
    name: "Streak Keeper Badge",
    tagline: "Shown beside your name for 90 days.",
    category: "badges",
    price: null,
    credits: 35,
    rating: 4.5,
    reviews: 62,
    popularity: 64,
    tags: ["honour", "credits"],
  }),
  make({
    slug: "frame-bronze-meridian",
    name: "Bronze Meridian Frame",
    tagline: "Machined bronze ring for your avatar.",
    category: "frames",
    price: null,
    credits: 50,
    rating: 4.9,
    reviews: 97,
    popularity: 89,
    featured: true,
    tags: ["profile", "credits"],
  }),
  make({
    slug: "frame-obsidian-edge",
    name: "Obsidian Edge Frame",
    tagline: "Matte black with a single bronze notch.",
    category: "frames",
    price: null,
    credits: 45,
    rating: 4.6,
    reviews: 40,
    popularity: 58,
    tags: ["profile", "credits"],
  }),
  make({
    slug: "theme-deep-space",
    name: "Deep Space Theme",
    tagline: "Darker interface, brighter starfield.",
    category: "themes",
    price: null,
    credits: 75,
    rating: 4.8,
    reviews: 73,
    popularity: 81,
    tags: ["interface", "credits"],
  }),
  make({
    slug: "theme-sandstone",
    name: "Sandstone Theme",
    tagline: "Warm desert light over the same bronze.",
    category: "themes",
    price: null,
    credits: 70,
    rating: 4.4,
    reviews: 29,
    popularity: 46,
    stock: "low",
    tags: ["interface", "credits"],
  }),
  make({
    slug: "boost-double-xp",
    name: "Double XP Boost",
    tagline: "Two hours of doubled experience.",
    category: "boosts",
    price: null,
    credits: 25,
    rating: 4.3,
    reviews: 18,
    popularity: 38,
    stock: "sold-out",
    features: ["Doubles XP for two hours", "Stacks with streak bonuses", "Restocks weekly"],
    tags: ["gameplay", "credits"],
  }),
];

export function productBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function productById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function productsInCategory(id: string): readonly Product[] {
  return PRODUCTS.filter((p) => p.category === id);
}

export function productsInGroup(group: StoreGroupId): readonly Product[] {
  return PRODUCTS.filter((p) => p.group === group);
}

/** Same-category neighbours, falling back to the same group. */
export function relatedProducts(product: Product, limit = 4): readonly Product[] {
  const sameCategory = PRODUCTS.filter(
    (p) => p.slug !== product.slug && p.category === product.category,
  );
  const sameGroup = PRODUCTS.filter(
    (p) => p.slug !== product.slug && p.group === product.group && p.category !== product.category,
  );
  return [...sameCategory, ...sameGroup].slice(0, limit);
}
