/**
 * Shared content taxonomy for the quiz catalogue and the question bank.
 * Single source of truth so filters in both modules stay in sync.
 */
export const quizCategories = [
  "Capitals",
  "Physical Geography",
  "Flags",
  "Climate",
  "Oceans",
  "Borders",
  "Landmarks",
  "Population",
];

export const regions = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
  "Global",
];

export const countriesByRegion: Record<string, string[]> = {
  Africa: ["Nigeria", "Kenya", "Morocco", "South Africa"],
  Asia: ["Japan", "India", "Vietnam", "Turkey"],
  Europe: ["Norway", "Germany", "Spain", "Portugal"],
  "North America": ["Canada", "Mexico", "United States"],
  "South America": ["Brazil", "Chile", "Peru"],
  Oceania: ["Australia", "New Zealand", "Fiji"],
  Global: ["Worldwide"],
};

export const languages = ["English", "Spanish", "French", "German", "Portuguese", "Japanese"];

export const topics = [
  "Capital cities",
  "Rivers",
  "Mountain ranges",
  "National flags",
  "Climate zones",
  "Ocean currents",
  "Border disputes",
  "Time zones",
];

export const contentTags = [
  "beginner",
  "map-first",
  "timed",
  "classroom",
  "trivia-night",
  "advanced",
  "visual",
  "seasonal",
];

export const quizVisibilities = ["Public", "Unlisted", "Private"] as const;

/** Deterministic pseudo-random so SSR and client render identically. */
export function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

export const pickFrom = <T>(rand: () => number, arr: readonly T[]): T =>
  arr[Math.floor(rand() * arr.length)] as T;

export const CATALOG_NOW = Date.UTC(2026, 7, 6);

export function catalogDaysAgo(days: number, hourSeed = 9) {
  return new Date(CATALOG_NOW - days * 86400000 + hourSeed * 3600000).toISOString();
}

export function catalogDaysSince(iso: string) {
  return Math.max(0, Math.floor((CATALOG_NOW - new Date(iso).getTime()) / 86400000));
}

export const catalogMonths = [
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
];

/** GEOlibrary taxonomy — shared by the library directory, editor and filters. */
export const libraryCategories = [
  "Article",
  "Country Profile",
  "Continent Collection",
  "Map",
  "Infographic",
  "PDF",
  "Educational Resource",
] as const;

export const libraryAuthors = [
  "Amara Osei",
  "Lucas Ferreira",
  "Mika Tanaka",
  "Sofia Marín",
  "Noah Bergström",
  "Priya Raman",
  "Elena Kovač",
  "Daniel Okafor",
];

export const allCountries = Object.values(countriesByRegion).flat();

/** GEOstore taxonomy. */
export const storeCategories = [
  "Apparel",
  "Posters & Maps",
  "Stationery",
  "Digital Downloads",
  "Credit Packs",
  "Gift Cards",
  "Accessories",
] as const;

export const storeCollections = [
  "Explorer Essentials",
  "Cartography Classics",
  "Classroom Kit",
  "Season Rewards",
  "Limited Edition",
];

export const orderChannels = ["Web", "iOS", "Android", "Partner"];
