import type { LinkProps } from "@tanstack/react-router";

import { supabase } from "@/lib/supabase/client";

import type { LibraryHit } from "../lib/search";
import { kindIcon } from "../data/taxonomy";

export type GlobalLibrarySearchHit = {
  id: string;
  group: "articles";
  title: string;
  meta: string;
  to: NonNullable<LinkProps["to"]>;
  score: number;
};

/** FTS over published library resources for global search and library search. */
export async function fetchLibrarySearchHits(
  query: string,
  limit = 12,
): Promise<GlobalLibrarySearchHit[]> {
  const q = query.trim();
  if (q.length === 0) return [];

  const { data, error } = await supabase
    .from("library_resources")
    .select("slug, title, read_time_minutes, dek")
    .eq("status", "published")
    .textSearch("search_vector", q, { type: "websearch", config: "english" })
    .limit(limit);

  if (error) throw new Error(`Library search failed: ${error.message}`);

  return (data ?? []).map((row, index) => ({
    id: `lib-${row.slug}`,
    group: "articles" as const,
    title: row.title,
    meta: `GEOlibrary · ${row.read_time_minutes} min read`,
    to: `/geolibrary/article/${row.slug}` as NonNullable<LinkProps["to"]>,
    score: 100 - index,
  }));
}

/** Library-scoped search hits for in-app library search utilities. */
export async function fetchLibraryScopedHits(query: string, limit = 24): Promise<LibraryHit[]> {
  const q = query.trim();
  if (q.length === 0) return [];

  const { data, error } = await supabase
    .from("library_resources")
    .select("slug, title, read_time_minutes")
    .eq("status", "published")
    .textSearch("search_vector", q, { type: "websearch", config: "english" })
    .limit(limit);

  if (error) throw new Error(`Library search failed: ${error.message}`);

  return (data ?? []).map((row, index) => ({
    id: `a-${row.slug}`,
    kind: "article" as const,
    title: row.title,
    meta: `Article · ${row.read_time_minutes} min read`,
    score: 100 - index,
    icon: kindIcon("article"),
    target: { type: "article" as const, slug: row.slug },
  }));
}

/** Search published creators by name/handle (client-filtered listing). */
export async function fetchCreatorSearchHits(query: string, limit = 8): Promise<LibraryHit[]> {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  const { data, error } = await supabase
    .from("library_creators")
    .select("handle, display_name, role");

  if (error) throw new Error(`Creator search failed: ${error.message}`);

  return (data ?? [])
    .filter(
      (row) =>
        row.display_name.toLowerCase().includes(q) ||
        row.handle.toLowerCase().includes(q) ||
        row.role.toLowerCase().includes(q),
    )
    .slice(0, limit)
    .map((row) => ({
      id: `cr-${row.handle}`,
      kind: "creator" as const,
      title: row.display_name,
      meta: `Creator · ${row.role}`,
      score: 80,
      icon: kindIcon("creator"),
      target: { type: "creator" as const, slug: row.handle },
    }));
}
