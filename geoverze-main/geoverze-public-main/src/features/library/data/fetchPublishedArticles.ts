import { supabase } from "@/lib/supabase/client";

import { parseLibraryAccessTier, type LibraryAccessTier } from "@/features/library/lib/access-tier";

import { LIBRARY_CATALOGUE } from "../lib/library-catalogue";

import { mapResourceRowToArticle } from "./library-mapper";
import type { Article } from "./articles";

export type ArticlePageState =
  | { status: "ready"; article: Article }
  | {
      status: "restricted";
      slug: string;
      requiredTier: LibraryAccessTier | null;
      title: string | null;
    }
  | { status: "not_found"; slug: string };

/** Discovery-safe catalogue metadata for route SEO — no blocks, no protected content. */
export type ArticleCatalogueMeta = {
  slug: string;
  title: string;
  dek: string;
};

/** Catalogue metadata for article route head — uses library_catalogue_resources only. */
export async function fetchArticleCatalogueMeta(
  slug: string,
): Promise<ArticleCatalogueMeta | null> {
  const { data, error } = await supabase
    .from(LIBRARY_CATALOGUE)
    .select("slug, title, dek")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load article SEO metadata for "${slug}": ${error.message}`);
  }

  if (!data?.slug || !data.title) return null;

  return {
    slug: data.slug,
    title: data.title,
    dek: data.dek ?? "",
  };
}

/** Published catalogue metadata for GEOlibrary browse/list surfaces. */
export async function fetchPublishedArticles(): Promise<Article[]> {
  const { data: rows, error } = await supabase
    .from(LIBRARY_CATALOGUE)
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) throw new Error(`Failed to load GEOlibrary articles: ${error.message}`);
  if (!rows?.length) return [];

  return rows.map((row) => mapResourceRowToArticle(row));
}

/** Catalogue metadata for specific slugs — metadata only, no blocks. */
export async function fetchCatalogueArticlesBySlugs(slugs: readonly string[]): Promise<Article[]> {
  const unique = [...new Set(slugs.filter(Boolean))];
  if (unique.length === 0) return [];

  const { data: rows, error } = await supabase
    .from(LIBRARY_CATALOGUE)
    .select("*")
    .in("slug", unique);

  if (error) {
    throw new Error(`Failed to load progress article metadata: ${error.message}`);
  }

  return (rows ?? []).map((row) => mapResourceRowToArticle(row));
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

/**
 * Article page loader with distinct unavailable outcomes.
 * Full content uses tier-aware RLS; catalogue view supplies restricted metadata.
 */
export async function fetchArticlePageState(slug: string): Promise<ArticlePageState> {
  const article = await fetchPublishedArticleBySlug(slug);
  if (article) return { status: "ready", article };

  const { data: meta, error: metaError } = await supabase
    .from(LIBRARY_CATALOGUE)
    .select("slug, title, min_access_tier")
    .eq("slug", slug)
    .maybeSingle();

  if (metaError) {
    throw new Error(`Failed to resolve article access for "${slug}": ${metaError.message}`);
  }

  if (meta) {
    return {
      status: "restricted",
      slug,
      requiredTier: parseLibraryAccessTier(meta.min_access_tier),
      title: meta.title,
    };
  }

  return { status: "not_found", slug };
}

export async function fetchFeaturedArticles(limit = 6): Promise<Article[]> {
  const { data: rows, error } = await supabase
    .from(LIBRARY_CATALOGUE)
    .select("*")
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load featured articles: ${error.message}`);
  return (rows ?? []).map((row) => mapResourceRowToArticle(row));
}

export async function fetchRecentArticles(limit = 6): Promise<Article[]> {
  const { data: rows, error } = await supabase
    .from(LIBRARY_CATALOGUE)
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load recent articles: ${error.message}`);
  return (rows ?? []).map((row) => mapResourceRowToArticle(row));
}

export async function fetchArticlesByCreator(handle: string): Promise<Article[]> {
  const { data: rows, error } = await supabase
    .from(LIBRARY_CATALOGUE)
    .select("*")
    .eq("author_handle", handle)
    .order("published_at", { ascending: false });

  if (error) throw new Error(`Failed to load creator articles: ${error.message}`);
  return (rows ?? []).map((row) => mapResourceRowToArticle(row));
}
