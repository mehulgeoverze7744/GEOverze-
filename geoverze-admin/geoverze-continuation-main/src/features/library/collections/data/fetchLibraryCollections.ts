import { supabase } from "@/lib/supabase/client";

import { mapCollectionRow } from "../collection-mapper";
import type { LibraryCollection } from "../types";

async function fetchMemberIdsByCollection(collectionIds: string[]) {
  if (collectionIds.length === 0) return new Map<string, string[]>();

  const { data, error } = await supabase
    .from("library_collection_items")
    .select("collection_id, resource_id, position")
    .in("collection_id", collectionIds)
    .order("position", { ascending: true });

  if (error) throw new Error(`Failed to load collection membership: ${error.message}`);

  const map = new Map<string, string[]>();
  for (const row of data ?? []) {
    const list = map.get(row.collection_id) ?? [];
    list.push(row.resource_id);
    map.set(row.collection_id, list);
  }
  return map;
}

export async function fetchLibraryCollections(): Promise<LibraryCollection[]> {
  const { data: rows, error } = await supabase
    .from("library_collections")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`Failed to load collections: ${error.message}`);
  if (!rows?.length) return [];

  const members = await fetchMemberIdsByCollection(rows.map((row) => row.id));
  return rows.map((row) => mapCollectionRow(row, members.get(row.id) ?? []));
}

export async function fetchLibraryCollectionById(id: string): Promise<LibraryCollection> {
  const { data: row, error } = await supabase
    .from("library_collections")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(`Collection "${id}" could not be loaded: ${error.message}`);

  const members = await fetchMemberIdsByCollection([row.id]);
  return mapCollectionRow(row, members.get(row.id) ?? []);
}
