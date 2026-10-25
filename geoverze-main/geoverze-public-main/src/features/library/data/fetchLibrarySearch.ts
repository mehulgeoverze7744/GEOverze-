import type { LinkProps } from "@tanstack/react-router";

import { supabase } from "@/lib/supabase/client";

import { GVRZE_STUDIO } from "./creators";
import { LIBRARY_CATALOGUE } from "../lib/library-catalogue";
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
    .from(LIBRARY_CATALOGUE)
    .select("slug, title, read_time_minutes, dek")
    .textSearch("search_vector", q, { type: "websearch", config: "english" })
    .limit(limit);

  if (error) throw new Error(`Library search failed: ${error.message}`);

  return (data ?? []).map((row, index) => ({
    id: `lib-${row.slug}`,
    group: "articles" as const,
    title: row.title,
    meta: `GVRZE Library · ${row.read_time_minutes} min read`,
    to: `/geolibrary/article/${row.slug}` as NonNullable<LinkProps["to"]>,
    score: 100 - index,
  }));
}

/** Library-scoped search hits for in-app library search utilities. */
export async function fetchLibraryScopedHits(query: string, limit = 24): Promise<LibraryHit[]> {
  const q = query.trim();
  if (q.length === 0) return [];

  const { data, error } = await supabase
    .from(LIBRARY_CATALOGUE)
    .select("slug, title, read_time_minutes")
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

/** Search the official Library creator. Placeholder studio names are not returned. */
export async function fetchCreatorSearchHits(query: string, limit = 8): Promise<LibraryHit[]> {
  const q = query.trim().toLowerCase();
  if (q.length === 0 || limit < 1) return [];

  const creator = GVRZE_STUDIO;
  const matched = [creator.name, creator.handle, creator.role, creator.location].some((value) =>
    value.toLowerCase().includes(q),
  );
  if (!matched) return [];

  return [
    {
      id: `cr-${creator.handle}`,
      kind: "creator" as const,
      title: creator.name,
      meta: `Creator · ${creator.role}`,
      score: 80,
      icon: kindIcon("creator"),
      target: { type: "creator" as const, slug: creator.handle },
    },
  ];
}
