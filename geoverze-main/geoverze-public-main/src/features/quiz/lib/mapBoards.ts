import africaMap from "@/assets/maps/africa.png";
import asiaMap from "@/assets/maps/asia.png";
import europeMap from "@/assets/maps/europe.png";
import mercatorMap from "@/assets/maps/mercator.jpg";
import northAmericaMap from "@/assets/maps/north-america.png";
import oceaniaMap from "@/assets/maps/oceania.png";
import southAmericaMap from "@/assets/maps/south-america.png";
import worldMap from "@/assets/maps/world.png";

import type { MapRegion } from "../data/types";

const BOARD_BY_FAMILY = {
  africa: africaMap,
  europe: europeMap,
  asia: asiaMap,
  samerica: southAmericaMap,
  "south-america": southAmericaMap,
  oceania: oceaniaMap,
  australia: oceaniaMap,
  namerica: northAmericaMap,
  "north-america": northAmericaMap,
  caribbean: northAmericaMap,
  world: worldMap,
  mercator: mercatorMap,
  projection: mercatorMap,
} as const;

type BoardFamily = keyof typeof BOARD_BY_FAMILY;

const BOARD_LABEL: Record<BoardFamily, string> = {
  africa: "Map of Africa",
  europe: "Map of Europe",
  asia: "Map of Asia",
  samerica: "Map of South America",
  "south-america": "Map of South America",
  oceania: "Map of Australia",
  australia: "Map of Australia",
  namerica: "Map of North America",
  "north-america": "Map of North America",
  caribbean: "Map of North America",
  world: "World map",
  mercator: "Mercator world map",
  projection: "Mercator world map",
};

/**
 * Pin positions as percent of the geographic PNG (not the 16:10 card).
 * Shared across every quiz — keyed by place label, not quiz id.
 */
const PIN_COORDS: Record<string, Record<string, { x: number; y: number }>> = {
  europe: {
    "strait of gibraltar": { x: 22, y: 81 },
    gibraltar: { x: 22, y: 81 },
    bosphorus: { x: 71, y: 63 },
    bosporus: { x: 71, y: 63 },
    oresund: { x: 49, y: 45 },
    "english channel": { x: 26, y: 54 },
  },
  oceania: {
    "perth coast": { x: 12, y: 58 },
    perth: { x: 12, y: 58 },
    "great barrier reef": { x: 90, y: 32 },
    tasmania: { x: 78, y: 93 },
    "gulf of carpentaria": { x: 57, y: 18 },
  },
  australia: {
    "perth coast": { x: 12, y: 58 },
    perth: { x: 12, y: 58 },
    "great barrier reef": { x: 90, y: 32 },
    tasmania: { x: 78, y: 93 },
    "gulf of carpentaria": { x: 57, y: 18 },
  },
  samerica: {
    atacama: { x: 24, y: 42 },
    "amazon basin": { x: 54, y: 30 },
    amazon: { x: 54, y: 30 },
    patagonia: { x: 30, y: 84 },
    pampas: { x: 44, y: 70 },
  },
  "south-america": {
    atacama: { x: 24, y: 42 },
    "amazon basin": { x: 54, y: 30 },
    amazon: { x: 54, y: 30 },
    patagonia: { x: 30, y: 84 },
    pampas: { x: 44, y: 70 },
  },
  asia: {
    "ural mountains": { x: 20, y: 26 },
    urals: { x: 20, y: 26 },
    himalaya: { x: 40, y: 44 },
    himalayas: { x: 40, y: 44 },
    "japanese archipelago": { x: 88, y: 38 },
    japan: { x: 88, y: 38 },
    "arabian peninsula": { x: 15, y: 52 },
    arabia: { x: 15, y: 52 },
  },
  africa: {
    dakar: { x: 10, y: 30 },
    cairo: { x: 52, y: 11 },
    nairobi: { x: 58, y: 50 },
    "cape town": { x: 40, y: 88 },
    marrakesh: { x: 16, y: 14 },
    giza: { x: 52, y: 12 },
    lagos: { x: 26, y: 40 },
    zanzibar: { x: 58, y: 55 },
  },
};

const TEXT_FAMILY_RULES: ReadonlyArray<readonly [RegExp, BoardFamily]> = [
  [/\b(africa|nairobi|dakar|cairo|giza|lagos|zanzibar|marrakesh|cape town|sahara|sahel|nile)\b/, "africa"],
  [/\b(europe|gibraltar|bosphorus|bosporus|oresund|english channel|alps|danube|iberia)\b/, "europe"],
  [/\b(asia|himalaya|ural|japan|arabia|arabian)\b/, "asia"],
  [/\b(amazon|atacama|patagonia|pampas|south america|andes)\b/, "samerica"],
  [/\b(australia|oceania|perth|barrier reef|tasmania|carpentaria)\b/, "oceania"],
  [/\b(north america|canada|caribbean|mexico|united states)\b/, "namerica"],
  [/\b(mercator|projection|greenland|world grid|graticule|rectangular world)\b/, "mercator"],
  [/\b(world|globe|earth)\b/, "world"],
];

const FAMILIES = Object.keys(BOARD_BY_FAMILY) as BoardFamily[];

export type MapBoardInput = {
  boardArt?: string | null;
  mediaArt?: string | null;
  prompt?: string | null;
  caption?: string | null;
  regions?: ReadonlyArray<{ label: string }> | null;
};

export type ResolvedMapBoard = {
  src: string;
  family: BoardFamily | null;
  label: string;
};

function pathOnly(value: string): string {
  return value.split("?")[0] ?? value;
}

function fileStem(value: string): string {
  const path = pathOnly(value);
  const slash = path.lastIndexOf("/");
  const file = slash >= 0 ? path.slice(slash + 1) : path;
  return file.replace(/\.(svg|png|jpe?g|webp)$/i, "");
}

function asFamily(value: string): BoardFamily | null {
  const key = value.replace(/^map-/, "") as BoardFamily;
  return FAMILIES.includes(key) ? key : null;
}

function normalizePinLabel(label: string): string {
  return label
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ø/g, "o")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function familyFromText(text: string | null | undefined): BoardFamily | null {
  if (!text) return null;
  const normalised = normalizePinLabel(text);
  for (const [pattern, family] of TEXT_FAMILY_RULES) {
    if (pattern.test(normalised)) return family;
  }
  return asFamily(normalised);
}

function familyFromRegions(regions: ReadonlyArray<{ label: string }> | null | undefined): BoardFamily | null {
  if (!regions?.length) return null;
  const votes = new Map<BoardFamily, number>();
  for (const region of regions) {
    const key = normalizePinLabel(region.label);
    let matched: BoardFamily | null = familyFromText(region.label);
    if (!matched) {
      for (const family of FAMILIES) {
        const table = PIN_COORDS[family];
        if (table?.[key]) {
          matched = family;
          break;
        }
      }
    }
    if (!matched) continue;
    votes.set(matched, (votes.get(matched) ?? 0) + 1);
  }
  let best: BoardFamily | null = null;
  let bestCount = 0;
  for (const [family, count] of votes) {
    if (count > bestCount) {
      best = family;
      bestCount = count;
    }
  }
  return best;
}

function familyFromArt(art: string | null | undefined): BoardFamily | null {
  if (!art) return null;
  const trimmed = art.trim();
  if (!trimmed) return null;
  return asFamily(trimmed) ?? asFamily(fileStem(trimmed)) ?? familyFromText(trimmed);
}

/** Continent / region key for a stored board_art or media art value. */
export function mapBoardFamily(boardArt: string | undefined | null): BoardFamily | null {
  return familyFromArt(boardArt);
}

/**
 * Shared resolver for every map-based quiz question.
 * Uses board_art, media art, pin labels and the prompt — never a blank land-shape.
 */
export function resolveMapBoard(input: MapBoardInput): ResolvedMapBoard | null {
  const family =
    familyFromArt(input.boardArt) ??
    familyFromArt(input.mediaArt) ??
    familyFromRegions(input.regions) ??
    familyFromText(input.prompt) ??
    familyFromText(input.caption);

  if (family) {
    return { src: BOARD_BY_FAMILY[family], family, label: BOARD_LABEL[family] };
  }

  for (const candidate of [input.boardArt, input.mediaArt]) {
    const trimmed = candidate?.trim();
    if (!trimmed) continue;
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) {
      return { src: trimmed, family: null, label: "Geographic map" };
    }
  }

  return null;
}

/**
 * Resolve a question's board_art to a bundled geographic image.
 * Legacy keys and `/assets/maps/*.svg` rows remap to the real maps.
 */
export function mapBoardSrc(boardArt: string | undefined | null): string | null {
  return resolveMapBoard({ boardArt })?.src ?? null;
}

export function mapBoardLabel(boardArt: string | undefined | null): string {
  return resolveMapBoard({ boardArt })?.label ?? "Geographic map";
}

/** Overlay pin percents onto the geographic image for a known board. */
export function calibrateMapRegions(
  boardArt: string | undefined | null,
  regions: MapRegion[],
  prompt?: string | null,
): MapRegion[] {
  const resolved = resolveMapBoard({ boardArt, regions, prompt });
  const family = resolved?.family;
  const table = family ? PIN_COORDS[family] : undefined;
  if (!table) return regions;
  return regions.map((region) => {
    const key = normalizePinLabel(region.label);
    const coords = table[key];
    return coords ? { ...region, x: coords.x, y: coords.y } : region;
  });
}
