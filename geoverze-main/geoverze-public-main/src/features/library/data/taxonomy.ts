/**
 * GEOlibrary taxonomy.
 *
 * Every facet the browse surface can filter on, expressed as data so the
 * filter rail, the chips and the search index all read from one place.
 */
import {
  BookOpen,
  Building2,
  Coins,
  Flag,
  Globe2,
  Landmark,
  Languages,
  Layers,
  Mountain,
  Palette,
  Users,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ContinentId =
  | "africa"
  | "asia"
  | "europe"
  | "north-america"
  | "south-america"
  | "oceania"
  | "antarctica"
  | "global";

export type DifficultyId = "beginner" | "intermediate" | "advanced";

export type CategoryId =
  | "countries"
  | "capitals"
  | "flags"
  | "landmarks"
  | "physical"
  | "oceans"
  | "culture"
  | "climate"
  | "heritage"
  | "basics";

export type ReadingTimeId = "short" | "medium" | "long";

export type SortId = "popular" | "newest" | "bookmarked" | "quickest";

export type Facet<T extends string> = { id: T; label: string };

export const CONTINENTS: readonly Facet<ContinentId>[] = [
  { id: "global", label: "Global" },
  { id: "africa", label: "Africa" },
  { id: "asia", label: "Asia" },
  { id: "europe", label: "Europe" },
  { id: "north-america", label: "North America" },
  { id: "south-america", label: "South America" },
  { id: "oceania", label: "Oceania" },
  { id: "antarctica", label: "Antarctica" },
] as const;

export const DIFFICULTIES: readonly Facet<DifficultyId>[] = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
] as const;

export const READING_TIMES: readonly (Facet<ReadingTimeId> & { max: number })[] = [
  { id: "short", label: "Under 5 min", max: 5 },
  { id: "medium", label: "5 – 10 min", max: 10 },
  { id: "long", label: "Over 10 min", max: Number.POSITIVE_INFINITY },
] as const;

export const CATEGORIES: readonly (Facet<CategoryId> & { icon: LucideIcon })[] = [
  { id: "countries", label: "Countries", icon: Globe2 },
  { id: "capitals", label: "Capitals & cities", icon: Building2 },
  { id: "flags", label: "Flags & symbols", icon: Flag },
  { id: "landmarks", label: "Landmarks", icon: Landmark },
  { id: "physical", label: "Physical geography", icon: Mountain },
  { id: "oceans", label: "Oceans & rivers", icon: Waves },
  { id: "culture", label: "Cultures & languages", icon: Languages },
  { id: "climate", label: "Climate & environment", icon: Layers },
  { id: "heritage", label: "UNESCO heritage", icon: Palette },
  { id: "basics", label: "Geography basics", icon: BookOpen },
] as const;

export const SORTS: readonly Facet<SortId>[] = [
  { id: "popular", label: "Popularity" },
  { id: "newest", label: "Newest" },
  { id: "bookmarked", label: "Most saved" },
  { id: "quickest", label: "Quickest read" },
] as const;

const CONTINENT_LABELS = new Map(CONTINENTS.map((c) => [c.id, c.label]));
const CATEGORY_LABELS = new Map(CATEGORIES.map((c) => [c.id, c.label]));
const CATEGORY_ICONS = new Map(CATEGORIES.map((c) => [c.id, c.icon]));
const DIFFICULTY_LABELS = new Map(DIFFICULTIES.map((d) => [d.id, d.label]));

export const continentLabel = (id: ContinentId) => CONTINENT_LABELS.get(id) ?? "Global";
export const categoryLabel = (id: CategoryId) => CATEGORY_LABELS.get(id) ?? "Geography";
export const categoryIcon = (id: CategoryId): LucideIcon => CATEGORY_ICONS.get(id) ?? BookOpen;
export const difficultyLabel = (id: DifficultyId) => DIFFICULTY_LABELS.get(id) ?? "Beginner";

/** Which reading-time bucket a duration falls into. */
export function readingTimeBucket(minutes: number): ReadingTimeId {
  if (minutes < 5) return "short";
  if (minutes <= 10) return "medium";
  return "long";
}

/** Entity kinds the library search can return. */
export type EntityKind =
  | "article"
  | "collection"
  | "creator"
  | "country"
  | "capital"
  | "flag"
  | "landmark"
  | "mountain"
  | "river"
  | "lake"
  | "ocean"
  | "continent"
  | "culture"
  | "language"
  | "currency"
  | "unesco";

export const ENTITY_KINDS: readonly (Facet<EntityKind> & { icon: LucideIcon })[] = [
  { id: "article", label: "Articles", icon: BookOpen },
  { id: "collection", label: "Collections", icon: Layers },
  { id: "creator", label: "Creators", icon: Users },
  { id: "country", label: "Countries", icon: Globe2 },
  { id: "capital", label: "Capitals", icon: Building2 },
  { id: "flag", label: "Flags", icon: Flag },
  { id: "landmark", label: "Landmarks", icon: Landmark },
  { id: "mountain", label: "Mountains", icon: Mountain },
  { id: "river", label: "Rivers", icon: Waves },
  { id: "lake", label: "Lakes", icon: Waves },
  { id: "ocean", label: "Oceans", icon: Waves },
  { id: "continent", label: "Continents", icon: Globe2 },
  { id: "culture", label: "Cultures", icon: Palette },
  { id: "language", label: "Languages", icon: Languages },
  { id: "currency", label: "Currencies", icon: Coins },
  { id: "unesco", label: "UNESCO sites", icon: Landmark },
] as const;

const KIND_LABELS = new Map(ENTITY_KINDS.map((k) => [k.id, k.label]));
const KIND_ICONS = new Map(ENTITY_KINDS.map((k) => [k.id, k.icon]));

export const kindLabel = (id: EntityKind) => KIND_LABELS.get(id) ?? "Entries";
export const kindIcon = (id: EntityKind): LucideIcon => KIND_ICONS.get(id) ?? BookOpen;
