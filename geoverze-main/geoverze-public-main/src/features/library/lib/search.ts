/**
 * Library search.
 *
 * Pure ranking over the local article, collection, creator and entity records.
 * A full-text backend query later replaces `searchLibrary` only.
 */
import type { LucideIcon } from "lucide-react";

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

/** One flat index across every searchable kind. */
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

/** Prefix, substring and keyword ranking. */
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
