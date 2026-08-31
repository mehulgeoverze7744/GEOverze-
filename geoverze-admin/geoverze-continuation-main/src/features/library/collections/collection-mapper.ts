import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";

import type { LibraryCollection } from "./types";

type CollectionRow = Tables<"library_collections">;

const REGION_TO_CONTINENT: Record<string, string> = {
  Africa: "africa",
  Asia: "asia",
  Europe: "europe",
  "North America": "north-america",
  "South America": "south-america",
  Oceania: "oceania",
  Global: "global",
};

const CONTINENT_TO_REGION: Record<string, string> = Object.fromEntries(
  Object.entries(REGION_TO_CONTINENT).map(([k, v]) => [v, k]),
);

export function mapCollectionRow(
  row: CollectionRow,
  memberResourceIds: string[] = [],
): LibraryCollection {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    artKey: row.art_key,
    subjectCategory: row.subject_category,
    continent: row.continent,
    curatorHandle: row.curator_handle,
    featured: row.featured,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    memberResourceIds,
  };
}

export function collectionToInsert(
  collection: LibraryCollection,
): TablesInsert<"library_collections"> {
  return {
    slug: collection.slug.trim(),
    title: collection.title.trim(),
    description: collection.description.trim(),
    art_key: collection.artKey.trim() || `collection-${collection.slug}`,
    subject_category: collection.subjectCategory,
    continent: collection.continent,
    curator_handle: collection.curatorHandle,
    featured: collection.featured,
    status: collection.status,
    published_at: collection.publishedAt,
  };
}

export function collectionToUpdate(
  collection: LibraryCollection,
): TablesUpdate<"library_collections"> {
  return collectionToInsert(collection);
}

export function regionToContinent(region: string): string {
  return REGION_TO_CONTINENT[region] ?? "global";
}

export function continentToRegion(continent: string): string {
  return CONTINENT_TO_REGION[continent] ?? "Global";
}
