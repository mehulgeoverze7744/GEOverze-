import { supabase } from "@/lib/supabase/client";

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
    .select("collection_id, position, resource_id, library_resources!inner(slug, status)")
    .in("collection_id", ids)
    .eq("library_resources.status", "published")
    .order("position", { ascending: true });

  if (itemsError) throw new Error(`Failed to load collection items: ${itemsError.message}`);

  const slugsByCollection = new Map<string, string[]>();
  for (const item of items ?? []) {
    const resource = item.library_resources as { slug: string } | null;
    if (!resource) continue;
    const list = slugsByCollection.get(item.collection_id) ?? [];
    list.push(resource.slug);
    slugsByCollection.set(item.collection_id, list);
  }

  return rows.map((row) => mapCollectionRowToCollection(row, slugsByCollection.get(row.id) ?? []));
}
