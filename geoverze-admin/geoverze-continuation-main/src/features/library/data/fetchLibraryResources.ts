import { supabase } from "@/lib/supabase/client";
import type { LibraryResource } from "@/features/library/types";

import {
  creatorDisplayName,
  mapBlockRow,
  mapResourceRow,
} from "./library-mapper";

export type LibraryResourceDetail = {
  resource: LibraryResource;
};

async function fetchCreators() {
  const { data, error } = await supabase.from("library_creators").select("*");
  if (error) throw new Error(`Failed to load creators: ${error.message}`);
  return data ?? [];
}

/** Read-only catalogue fetch for Admin GEOlibrary. */
export async function fetchLibraryResources(): Promise<LibraryResource[]> {
  const { data: rows, error } = await supabase
    .from("library_resources")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`Failed to load library resources: ${error.message}`);
  if (!rows?.length) return [];

  const creators = await fetchCreators();

  return rows.map((row) =>
    mapResourceRow(row, {
      authorDisplayName: creatorDisplayName(creators, row.author_handle),
    }),
  );
}

/** Read-only resource detail including ordered blocks converted to Markdown body. */
export async function fetchLibraryResourceById(id: string): Promise<LibraryResourceDetail> {
  const { data: row, error } = await supabase
    .from("library_resources")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(`Resource "${id}" could not be loaded: ${error.message}`);
  if (!row) throw new Error(`Resource "${id}" not found`);

  const { data: blockRows, error: blocksError } = await supabase
    .from("library_resource_blocks")
    .select("*")
    .eq("resource_id", id)
    .order("position", { ascending: true });

  if (blocksError) {
    throw new Error(`Blocks for resource "${id}" could not be loaded: ${blocksError.message}`);
  }

  const creators = await fetchCreators();
  const blocks = (blockRows ?? []).map(mapBlockRow);

  return {
    resource: mapResourceRow(row, {
      blocks,
      authorDisplayName: creatorDisplayName(creators, row.author_handle),
    }),
  };
}

export async function fetchLibraryCreators() {
  return fetchCreators();
}
