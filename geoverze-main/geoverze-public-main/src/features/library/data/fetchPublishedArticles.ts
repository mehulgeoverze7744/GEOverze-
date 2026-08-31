import { supabase } from "@/lib/supabase/client";

import { mapResourceRowToArticle } from "./library-mapper";
import type { Article } from "./articles";

/** Published resources for public GEOlibrary surfaces. RLS restricts to published rows. */
export async function fetchPublishedArticles(): Promise<Article[]> {
  const { data: rows, error } = await supabase
    .from("library_resources")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) throw new Error(`Failed to load GEOlibrary articles: ${error.message}`);
  if (!rows?.length) return [];

  return rows.map((row) => mapResourceRowToArticle(row));
}

export async function fetchPublishedArticleBySlug(slug: string): Promise<Article | null> {
  const { data: row, error } = await supabase
    .from("library_resources")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error(`Failed to load article "${slug}": ${error.message}`);
  if (!row) return null;

  const { data: blockRows, error: blocksError } = await supabase
    .from("library_resource_blocks")
    .select("*")
    .eq("resource_id", row.id)
    .order("position", { ascending: true });

  if (blocksError) {
    throw new Error(`Failed to load blocks for "${slug}": ${blocksError.message}`);
  }

  return mapResourceRowToArticle(row, blockRows ?? []);
}

export async function fetchFeaturedArticles(limit = 6): Promise<Article[]> {
  const { data: rows, error } = await supabase
    .from("library_resources")
    .select("*")
    .eq("status", "published")
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load featured articles: ${error.message}`);
  return (rows ?? []).map((row) => mapResourceRowToArticle(row));
}

export async function fetchRecentArticles(limit = 6): Promise<Article[]> {
  const { data: rows, error } = await supabase
    .from("library_resources")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load recent articles: ${error.message}`);
  return (rows ?? []).map((row) => mapResourceRowToArticle(row));
}

export async function fetchArticlesByCreator(handle: string): Promise<Article[]> {
  const { data: rows, error } = await supabase
    .from("library_resources")
    .select("*")
    .eq("status", "published")
    .eq("author_handle", handle)
    .order("published_at", { ascending: false });

  if (error) throw new Error(`Failed to load creator articles: ${error.message}`);
  return (rows ?? []).map((row) => mapResourceRowToArticle(row));
}
