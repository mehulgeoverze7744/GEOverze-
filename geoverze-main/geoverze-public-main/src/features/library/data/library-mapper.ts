import { isLibraryMediaPath } from "@/lib/supabase/library-media";
import type { Article, ArticleBlock } from "@/features/library/data/articles";
import { parseLibraryAccessTier } from "@/features/library/lib/access-tier";
import type { Collection } from "@/features/library/data/collections";
import type { Creator } from "@/features/library/data/creators";
import type { CategoryId, ContinentId, DifficultyId } from "@/features/library/data/taxonomy";

type CatalogueRow = Tables<"library_catalogue_resources">;
type ResourceRow = Tables<"library_resources">;
type BlockRow = Tables<"library_resource_blocks">;
type CollectionRow = Tables<"library_collections">;
type CreatorRow = Tables<"library_creators">;
type ArticleSourceRow = ResourceRow | CatalogueRow;

function aggregateCount(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function readEngagement(row: ArticleSourceRow) {
  const catalogue = row as CatalogueRow;
  if ("view_count" in catalogue || "like_count" in catalogue || "bookmark_count" in catalogue) {
    return {
      views: aggregateCount(catalogue.view_count),
      likes: aggregateCount(catalogue.like_count),
      bookmarks: aggregateCount(catalogue.bookmark_count),
    };
  }

  return { views: 0, likes: 0, bookmarks: 0 };
}

function asCategoryId(value: string): CategoryId {
  const allowed: CategoryId[] = [
    "countries",
    "capitals",
    "flags",
    "landmarks",
    "physical",
    "oceans",
    "culture",
    "climate",
    "heritage",
    "basics",
  ];
  return allowed.includes(value as CategoryId) ? (value as CategoryId) : "basics";
}

function asContinentId(value: string): ContinentId {
  const allowed: ContinentId[] = [
    "africa",
    "asia",
    "europe",
    "north-america",
    "south-america",
    "oceania",
    "antarctica",
    "global",
  ];
  return allowed.includes(value as ContinentId) ? (value as ContinentId) : "global";
}

function asDifficultyId(value: Enums<"library_difficulty">): DifficultyId {
  if (value === "beginner" || value === "intermediate" || value === "advanced") return value;
  return "advanced";
}

export function mapBlockPayloadToArticleBlock(
  kind: Enums<"library_block_kind">,
  payload: Record<string, unknown>,
): ArticleBlock {
  switch (kind) {
    case "heading":
      return {
        kind: "heading",
        id: String(payload.id ?? "section"),
        text: String(payload.text ?? ""),
      };
    case "paragraph":
      return { kind: "paragraph", text: String(payload.text ?? "") };
    case "list":
      return {
        kind: "list",
        items: (payload.items as string[] | undefined) ?? [],
        ordered: Boolean(payload.ordered),
      };
    case "quote":
      return {
        kind: "quote",
        text: String(payload.text ?? ""),
        ...(payload.attribution ? { attribution: String(payload.attribution) } : {}),
      };
    case "image": {
      const storagePath = payload.storage_path
        ? String(payload.storage_path)
        : isLibraryMediaPath(String(payload.art ?? ""))
          ? String(payload.art)
          : undefined;
      return {
        kind: "image",
        art: String(payload.art ?? ""),
        caption: String(payload.caption ?? ""),
        ...(storagePath ? { storagePath } : {}),
      };
    }
    case "map":
      return {
        kind: "map",
        region: String(payload.region ?? ""),
        caption: String(payload.caption ?? ""),
      };
    case "facts":
      return {
        kind: "facts",
        title: String(payload.title ?? ""),
        facts: (payload.facts as { label: string; value: string }[] | undefined) ?? [],
      };
    case "didYouKnow":
      return { kind: "didYouKnow", text: String(payload.text ?? "") };
    default:
      return { kind: "paragraph", text: JSON.stringify(payload) };
  }
}

export function mapResourceRowToArticle(
  row: ArticleSourceRow,
  blocks: readonly BlockRow[] = [],
): Article {
  const engagement = readEngagement(row);

  return {
    slug: row.slug,
    resourceId: "id" in row && row.id ? row.id : undefined,
    title: row.title,
    dek: row.dek,
    category: asCategoryId(row.subject_category),
    continent: asContinentId(row.continent),
    difficulty: asDifficultyId(row.difficulty),
    minutes: row.read_time_minutes,
    publishedAt:
      row.published_at?.slice(0, 10) ??
      ("created_at" in row && row.created_at ? row.created_at.slice(0, 10) : ""),
    creator: row.author_handle,
    tags: row.tags ?? [],
    views: engagement.views,
    likes: engagement.likes,
    bookmarks: engagement.bookmarks,
    coverArtKey: row.cover_art_key,
    minAccessTier: parseLibraryAccessTier(row.min_access_tier),
    blocks: blocks.map((block) =>
      mapBlockPayloadToArticleBlock(block.kind, (block.payload ?? {}) as Record<string, unknown>),
    ),
  };
}

export function mapCollectionRowToCollection(
  row: CollectionRow,
  articleSlugs: readonly string[],
): Collection {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    art: row.art_key,
    category: asCategoryId(row.subject_category),
    continent: asContinentId(row.continent),
    curator: row.curator_handle,
    featured: row.featured,
    articles: articleSlugs,
    followers: 0,
  };
}

export function mapCreatorRowToCreator(row: CreatorRow): Creator {
  return {
    handle: row.handle,
    name: row.display_name,
    role: row.role,
    bio: row.bio,
    art: row.art_key,
    verified: row.verified,
    followers: 0,
    likes: 0,
    featuredCollection: row.featured_collection_slug ?? "",
    location: row.location ?? "",
    joinedAt: row.joined_at,
  };
}

export type PublishedArticleRow = ResourceRow & {
  library_resource_blocks?: Pick<BlockRow, "id">[] | null;
};

export type PublishedCollectionRow = CollectionRow & {
  library_collection_items?:
    { position: number; library_resources: Pick<ResourceRow, "slug"> | null }[] | null;
};
