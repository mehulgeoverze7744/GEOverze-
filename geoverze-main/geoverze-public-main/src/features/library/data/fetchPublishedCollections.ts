import { supabase } from "@/lib/supabase/client";

import { fetchBrowseCollections } from "./fetchBrowseCollections";
import { mapCollectionRowToCollection, mapResourceRowToArticle } from "./library-mapper";
import type { Article } from "./articles";
import type { Collection } from "./collections";

export async function fetchPublishedCollections(): Promise<Collection[]> {
  return fetchBrowseCollections();
}

export async function fetchPublishedCollectionBySlug(
  slug: string,
): Promise<{ collection: Collection; articles: Article[] } | null> {
  const { data: row, error } = await supabase
    .from("library_collections")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error(`Failed to load collection "${slug}": ${error.message}`);
  if (!row) return null;

  const { data: items, error: itemsError } = await supabase
    .from("library_collection_items")
    .select("position, library_resources!inner(*)")
    .eq("collection_id", row.id)
    .eq("library_resources.status", "published")
    .order("position", { ascending: true });

  if (itemsError) {
    throw new Error(`Failed to load collection items for "${slug}": ${itemsError.message}`);
  }

  const articles: Article[] = [];
  const slugs: string[] = [];

  for (const item of items ?? []) {
    const resourceRow = item.library_resources as Parameters<typeof mapResourceRowToArticle>[0] | null;
    if (!resourceRow) continue;

    const { data: blockRows, error: blocksError } = await supabase
      .from("library_resource_blocks")
      .select("*")
      .eq("resource_id", resourceRow.id)
      .order("position", { ascending: true });

    if (blocksError) {
      throw new Error(`Failed to load blocks for collection article: ${blocksError.message}`);
    }

    const article = mapResourceRowToArticle(resourceRow, blockRows ?? []);
    articles.push(article);
    slugs.push(article.slug);
  }

  return {
    collection: mapCollectionRowToCollection(row, slugs),
    articles,
  };
}

export async function fetchCollectionsByCurator(handle: string): Promise<Collection[]> {
  const all = await fetchPublishedCollections();
  return all.filter((collection) => collection.curator === handle);
}
