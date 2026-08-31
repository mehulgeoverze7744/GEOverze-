import type { Enums, Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";
import { libraryCategories } from "@/lib/catalog";
import type {
  LibraryDifficulty,
  LibraryResource,
  LibraryStatus,
} from "@/features/library/types";

import type { CanonicalBlock } from "./markdown-blocks";
import { blocksToMarkdown } from "./markdown-blocks";

type ResourceRow = Tables<"library_resources">;
type BlockRow = Tables<"library_resource_blocks">;
type CreatorRow = Tables<"library_creators">;

const RESOURCE_KIND_TO_LABEL: Record<Enums<"library_resource_kind">, string> = {
  article: "Article",
  country_profile: "Country Profile",
  continent_collection: "Continent Collection",
  map: "Map",
  infographic: "Infographic",
  pdf: "PDF",
  educational_resource: "Educational Resource",
};

const LABEL_TO_RESOURCE_KIND: Record<string, Enums<"library_resource_kind">> = {
  Article: "article",
  "Country Profile": "country_profile",
  "Continent Collection": "continent_collection",
  Map: "map",
  Infographic: "infographic",
  PDF: "pdf",
  "Educational Resource": "educational_resource",
};

const DIFFICULTY_TO_ADMIN: Record<Enums<"library_difficulty">, LibraryDifficulty> = {
  beginner: "Easy",
  intermediate: "Medium",
  advanced: "Hard",
  expert: "Expert",
};

const ADMIN_TO_DIFFICULTY: Record<LibraryDifficulty, Enums<"library_difficulty">> = {
  Easy: "beginner",
  Medium: "intermediate",
  Hard: "advanced",
  Expert: "expert",
};

const REGION_TO_CONTINENT: Record<string, string> = {
  Africa: "africa",
  Asia: "asia",
  Europe: "europe",
  "North America": "north-america",
  "South America": "south-america",
  Oceania: "oceania",
  Global: "global",
};

const CONTINENT_TO_REGION: Record<string, string> = Object.fromEntries(
  Object.entries(REGION_TO_CONTINENT).map(([k, v]) => [v, k]),
);

export function mapBlockRow(row: BlockRow): CanonicalBlock {
  return {
    kind: row.kind,
    payload: (row.payload ?? {}) as Record<string, unknown>,
  };
}

export interface MapResourceRowOptions {
  blocks?: CanonicalBlock[];
  authorDisplayName?: string;
}

export function mapResourceRow(
  row: ResourceRow,
  options: MapResourceRowOptions = {},
): LibraryResource {
  const blocks = options.blocks ?? [];
  const body = blocks.length > 0 ? blocksToMarkdown(blocks) : "";
  const attachments = Array.isArray(row.attachments)
    ? (row.attachments as LibraryResource["attachments"])
    : [];

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: RESOURCE_KIND_TO_LABEL[row.resource_kind] ?? "Article",
    country: row.country ?? "Worldwide",
    region: row.region ?? CONTINENT_TO_REGION[row.continent] ?? "Global",
    difficulty: DIFFICULTY_TO_ADMIN[row.difficulty] ?? "Easy",
    tags: row.tags ?? [],
    language: row.language,
    author: options.authorDisplayName ?? row.author_handle,
    authorHandle: row.author_handle,
    subjectCategory: row.subject_category,
    status: row.status as LibraryStatus,
    featured: row.featured,
    minAccessTier: row.min_access_tier,
    views: 0,
    bookmarks: 0,
    readTime: row.read_time_minutes,
    description: row.dek,
    body,
    coverLabel: row.cover_label ?? "",
    coverArtKey: row.cover_art_key,
    gallery: row.gallery_paths ?? [],
    attachments,
    seo: {
      metaTitle: row.seo_meta_title ?? "",
      metaDescription: row.seo_meta_description ?? "",
      canonicalUrl: row.seo_canonical_path ?? "",
      ogTitle: row.seo_og_title ?? "",
      ogDescription: row.seo_og_description ?? "",
      keywords: row.seo_keywords ?? [],
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    viewsSeries: Array.from({ length: 12 }, () => 0),
    versions: [],
    activity: [],
  };
}

export function creatorDisplayName(creators: CreatorRow[], handle: string): string {
  return creators.find((c) => c.handle === handle)?.display_name ?? handle;
}

export function resolveAuthorHandle(
  authorLabel: string,
  authorHandle: string | undefined,
  creators: CreatorRow[],
): string {
  if (authorHandle) return authorHandle;
  const byDisplay = creators.find((c) => c.display_name === authorLabel);
  if (byDisplay) return byDisplay.handle;
  const byHandle = creators.find((c) => c.handle === authorLabel);
  if (byHandle) return byHandle.handle;
  return creators[0]?.handle ?? "atlas-studio";
}

export function resourceRecordToInsert(
  resource: LibraryResource,
  creators: CreatorRow[],
): TablesInsert<"library_resources"> {
  const resourceKind =
    LABEL_TO_RESOURCE_KIND[resource.category] ??
    (libraryCategories.includes(resource.category as (typeof libraryCategories)[number])
      ? LABEL_TO_RESOURCE_KIND[resource.category] ?? "article"
      : "article");

  const continent = REGION_TO_CONTINENT[resource.region] ?? "global";

  return {
    slug: resource.slug.trim(),
    title: resource.title.trim(),
    dek: resource.description.trim(),
    resource_kind: resourceKind,
    subject_category: resource.subjectCategory ?? "basics",
    continent,
    difficulty: ADMIN_TO_DIFFICULTY[resource.difficulty] ?? "beginner",
    read_time_minutes: Math.max(1, resource.readTime || 5),
    language: resource.language,
    country: resource.country === "Worldwide" ? null : resource.country,
    region: resource.region,
    tags: resource.tags,
    status: resource.status,
    featured: resource.featured,
    min_access_tier: resource.minAccessTier,
    author_handle: resolveAuthorHandle(resource.author, resource.authorHandle, creators),
    cover_art_key: resource.coverArtKey,
    cover_label: resource.coverLabel || null,
    gallery_paths: resource.gallery,
    attachments: resource.attachments,
    seo_meta_title: resource.seo.metaTitle || null,
    seo_meta_description: resource.seo.metaDescription || null,
    seo_canonical_path: resource.seo.canonicalUrl || null,
    seo_og_title: resource.seo.ogTitle || null,
    seo_og_description: resource.seo.ogDescription || null,
    seo_keywords: resource.seo.keywords,
  };
}

export function resourceRecordToUpdate(
  resource: LibraryResource,
  creators: CreatorRow[],
): TablesUpdate<"library_resources"> {
  return resourceRecordToInsert(resource, creators);
}
