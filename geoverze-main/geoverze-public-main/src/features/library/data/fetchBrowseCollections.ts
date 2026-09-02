import { supabase } from "@/lib/supabase/client";

import { LIBRARY_CATALOGUE } from "../lib/library-catalogue";
import { mapCollectionRowToCollection } from "./library-mapper";
import type { Collection } from "./collections";
import type { CategoryId, ContinentId } from "./taxonomy";

export type CollectionBrowseQuery = {
  q?: string;
  category?: CategoryId | "all";
  continent?: ContinentId | "all";
  featured?: boolean;
};

/** Published collections with optional server-side filters. */
export async function fetchBrowseCollections(
  query: CollectionBrowseQuery = {},
): Promise<Collection[]> {
  let request = supabase.from("library_collections").select("*").eq("status", "published");

  if (query.featured) {
    request = request.eq("featured", true);
  }
  if (query.category && query.category !== "all") {
    request = request.eq("subject_category", query.category);
  }
  if (query.continent && query.continent !== "all") {
    request = request.eq("continent", query.continent);
  }

  const q = query.q?.trim();
  if (q) {
    request = request.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  request = request.order("featured", { ascending: false }).order("title", { ascending: true });

  const { data: rows, error } = await request;
  if (error) throw new Error(`Failed to load collections: ${error.message}`);
  if (!rows?.length) return [];

  const ids = rows.map((row) => row.id);
  const { data: items, error: itemsError } = await supabase
    .from("library_collection_items")
    .select("collection_id, position, resource_id")
    .in("collection_id", ids)
    .order("position", { ascending: true });

  if (itemsError) throw new Error(`Failed to load collection items: ${itemsError.message}`);

  const resourceIds = [...new Set((items ?? []).map((item) => item.resource_id))];
  const slugByResourceId = new Map<string, string>();

  if (resourceIds.length > 0) {
    const { data: catalogueRows, error: catalogueError } = await supabase
      .from(LIBRARY_CATALOGUE)
      .select("id, slug")
      .in("id", resourceIds);

    if (catalogueError) {
      throw new Error(`Failed to load collection catalogue entries: ${catalogueError.message}`);
    }

    for (const row of catalogueRows ?? []) {
      slugByResourceId.set(row.id, row.slug);
    }
  }

  const slugsByCollection = new Map<string, string[]>();
  for (const item of items ?? []) {
    const slug = slugByResourceId.get(item.resource_id);
    if (!slug) continue;
    const list = slugsByCollection.get(item.collection_id) ?? [];
    list.push(slug);
    slugsByCollection.set(item.collection_id, list);
  }

  return rows.map((row) => mapCollectionRowToCollection(row, slugsByCollection.get(row.id) ?? []));
}
