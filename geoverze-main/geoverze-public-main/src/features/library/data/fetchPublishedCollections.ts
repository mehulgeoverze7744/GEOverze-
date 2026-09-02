import { supabase } from "@/lib/supabase/client";

import { LIBRARY_CATALOGUE } from "../lib/library-catalogue";
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
    .select("position, resource_id")
    .eq("collection_id", row.id)
    .order("position", { ascending: true });

  if (itemsError) {
    throw new Error(`Failed to load collection items for "${slug}": ${itemsError.message}`);
  }

  const resourceIds = (items ?? []).map((item) => item.resource_id);
  const catalogueById = new Map<string, Parameters<typeof mapResourceRowToArticle>[0]>();

  if (resourceIds.length > 0) {
    const { data: catalogueRows, error: catalogueError } = await supabase
      .from(LIBRARY_CATALOGUE)
      .select("*")
      .in("id", resourceIds);

    if (catalogueError) {
      throw new Error(
        `Failed to load collection catalogue for "${slug}": ${catalogueError.message}`,
      );
    }

    for (const catalogueRow of catalogueRows ?? []) {
      catalogueById.set(catalogueRow.id, catalogueRow);
    }
  }

  const articles: Article[] = [];
  const slugs: string[] = [];

  for (const item of items ?? []) {
    const catalogueRow = catalogueById.get(item.resource_id);
    if (!catalogueRow) continue;

    const article = mapResourceRowToArticle(catalogueRow);
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
