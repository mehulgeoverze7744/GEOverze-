/**
 * Library search.
 *
 * Production paths use Supabase FTS via `searchLibraryAsync`.
 * Mock index below is retained for offline/dev fixtures only.
 */
import type { LucideIcon } from "lucide-react";

import { fetchCreatorSearchHits, fetchLibraryScopedHits } from "../data/fetchLibrarySearch";
import { ARTICLES } from "../data/articles";
import { COLLECTIONS } from "../data/collections";
import { CREATORS } from "../data/creators";
import { ENTITIES, type EntityTarget } from "../data/entities";
import { ENTITY_KINDS, kindIcon, kindLabel, type EntityKind } from "../data/taxonomy";

export type LibraryHit = {
  id: string;
  kind: EntityKind;
  title: string;
  meta: string;
  score: number;
  icon: LucideIcon;
  /** Where the hit navigates. Creators resolve to their profile. */
  target: EntityTarget | { type: "creator"; slug: string };
};

type Indexed = {
  id: string;
  kind: EntityKind;
  title: string;
  meta: string;
  keywords: readonly string[];
  target: LibraryHit["target"];
};

/** Dev/offline mock index — not used by browse or global search in production. */
export const LIBRARY_INDEX: readonly Indexed[] = [
  ...ARTICLES.map((a) => ({
    id: `a-${a.slug}`,
    kind: "article" as const,
    title: a.title,
    meta: `Article · ${a.minutes} min read`,
    keywords: a.tags,
    target: { type: "article" as const, slug: a.slug },
  })),
  ...COLLECTIONS.map((c) => ({
    id: `col-${c.slug}`,
    kind: "collection" as const,
    title: c.title,
    meta: `Collection · ${c.articles.length} entries`,
    keywords: [c.category, c.continent],
    target: { type: "collection" as const, slug: c.slug },
  })),
  ...CREATORS.map((c) => ({
    id: `cr-${c.handle}`,
    kind: "creator" as const,
    title: c.name,
    meta: `Creator · ${c.role}`,
    keywords: [c.handle, c.role],
    target: { type: "creator" as const, slug: c.handle },
  })),
  ...ENTITIES.map((e) => ({
    id: e.id,
    kind: e.kind,
    title: e.name,
    meta: e.meta,
    keywords: e.keywords,
    target: e.target,
  })),
];

/** Supabase FTS + creator lookup for library-scoped search. */
export async function searchLibraryAsync(query: string, limit = 24): Promise<LibraryHit[]> {
  const q = query.trim();
  if (q.length === 0) return [];

  const [articles, creators] = await Promise.all([
    fetchLibraryScopedHits(q, limit),
    fetchCreatorSearchHits(q, Math.min(8, limit)),
  ]);

  return [...articles, ...creators]
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}

/** Mock prefix ranking — dev/offline only. */
export function searchLibrary(query: string, limit = 24): LibraryHit[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  const hits: LibraryHit[] = [];
  for (const record of LIBRARY_INDEX) {
    const title = record.title.toLowerCase();
    let score = 0;
    if (title === q) score = 120;
    else if (title.startsWith(q)) score = 100;
    else if (title.includes(q)) score = 72;
    else if (record.keywords.some((k) => k.toLowerCase().includes(q))) score = 48;
    else if (record.meta.toLowerCase().includes(q)) score = 24;
    if (score === 0) continue;

    hits.push({
      id: record.id,
      kind: record.kind,
      title: record.title,
      meta: record.meta,
      score,
      icon: kindIcon(record.kind),
      target: record.target,
    });
  }

  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit);
}

/** Group hits by kind, preserving the taxonomy order. */
export function groupLibraryHits(hits: readonly LibraryHit[]) {
  return ENTITY_KINDS.map((kind) => ({
    kind: kind.id,
    label: kindLabel(kind.id),
    icon: kind.icon,
    hits: hits.filter((h) => h.kind === kind.id),
  })).filter((group) => group.hits.length > 0);
}
