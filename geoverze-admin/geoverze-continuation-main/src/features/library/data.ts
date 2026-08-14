import {
  allCountries,
  catalogDaysAgo,
  contentTags,
  countriesByRegion,
  languages,
  libraryAuthors,
  libraryCategories,
  pickFrom,
  regions,
  rng,
} from "@/lib/catalog";
import {
  libraryDifficulties,
  type LibraryActivity,
  type LibraryAttachment,
  type LibraryResource,
  type LibraryStatus,
  type LibraryVersion,
} from "@/features/library/types";

const titleLead = [
  "Atlas of",
  "Field Guide to",
  "Inside",
  "Mapping",
  "Understanding",
  "The Geography of",
  "Data Story:",
  "Explainer:",
];

const titleTail = [
  "River Deltas",
  "Mountain Passes",
  "Coastal Cities",
  "Monsoon Systems",
  "Border Regions",
  "Trade Routes",
  "Volcanic Belts",
  "Urban Growth",
  "Glacial Retreat",
  "Island Chains",
];

const statuses: LibraryStatus[] = [
  "published",
  "published",
  "published",
  "draft",
  "pending",
  "archived",
];

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function buildVersions(rand: () => number, author: string, seedDay: number): LibraryVersion[] {
  const count = 2 + Math.floor(rand() * 3);
  return Array.from({ length: count }, (_, index) => ({
    id: `v-${index}`,
    version: `1.${count - index - 1}`,
    author,
    summary: pickFrom(rand, [
      "Updated statistics and sources",
      "Rewrote the introduction",
      "Added new map assets",
      "Fixed typos and captions",
      "Initial draft",
    ]),
    at: catalogDaysAgo(seedDay + index * 9, 10),
  }));
}

function buildActivity(rand: () => number, author: string, title: string): LibraryActivity[] {
  return Array.from({ length: 4 }, (_, index) => ({
    id: `a-${index}`,
    actor: index % 2 === 0 ? author : "Editorial bot",
    action: pickFrom(rand, [
      "published",
      "requested review on",
      "updated SEO for",
      "attached a PDF to",
      "archived",
    ]),
    target: title,
    time: catalogDaysAgo(index * 4 + 1, 14),
  }));
}

function buildAttachments(rand: () => number, index: number): LibraryAttachment[] {
  const count = Math.floor(rand() * 3);
  const kinds: LibraryAttachment["kind"][] = ["PDF", "Image", "Dataset", "Map"];
  return Array.from({ length: count }, (_, i) => {
    const kind = pickFrom(rand, kinds);
    return {
      id: `RES-${index}-att-${i}`,
      name: `${kind.toLowerCase()}-asset-${i + 1}.${kind === "PDF" ? "pdf" : kind === "Dataset" ? "csv" : "png"}`,
      kind,
      size: `${(0.4 + rand() * 8).toFixed(1)} MB`,
    };
  });
}

function buildResource(index: number): LibraryResource {
  const rand = rng(9200 + index * 37);
  const region = pickFrom(rand, regions);
  const country = pickFrom(rand, countriesByRegion[region] ?? allCountries);
  const title = `${pickFrom(rand, titleLead)} ${country} ${pickFrom(rand, titleTail)}`;
  const author = pickFrom(rand, libraryAuthors);
  const status = pickFrom(rand, statuses);
  const createdDays = 30 + Math.floor(rand() * 500);
  const updatedDays = Math.floor(rand() * 28);
  const views =
    status === "published" ? 400 + Math.floor(rand() * 48000) : Math.floor(rand() * 400);
  const slug = slugify(title);

  return {
    id: `RES-${String(1000 + index)}`,
    title,
    slug,
    category: pickFrom(rand, libraryCategories),
    country,
    region,
    difficulty: pickFrom(rand, libraryDifficulties),
    tags: [pickFrom(rand, contentTags), pickFrom(rand, contentTags)].filter(
      (tag, i, list) => list.indexOf(tag) === i,
    ),
    language: pickFrom(rand, languages),
    author,
    status,
    featured: rand() > 0.84 && status === "published",
    views,
    bookmarks: Math.floor(views * (0.02 + rand() * 0.08)),
    readTime: 3 + Math.floor(rand() * 18),
    description: `A ${pickFrom(rand, ["visual", "data-led", "classroom-ready", "long-form"])} look at ${country} and the wider ${region} region.`,
    body: [
      `## Overview`,
      `${title} explores how geography shapes life across ${country}.`,
      ``,
      `## Key points`,
      `- Physical setting and terrain`,
      `- Population distribution and settlement`,
      `- Economic and climate pressures`,
      ``,
      `## Further reading`,
      `Linked datasets, maps and the GEOverze quiz catalogue.`,
    ].join("\n"),
    coverLabel: `${country} · ${region}`,
    gallery: Array.from(
      { length: 1 + Math.floor(rand() * 4) },
      (_, i) => `${slug}-figure-${i + 1}`,
    ),
    attachments: buildAttachments(rand, index),
    seo: {
      metaTitle: `${title} — GEOlibrary`,
      metaDescription: `Explore ${title.toLowerCase()} with maps, data and classroom notes.`,
      canonicalUrl: `/library/${slug}`,
      ogTitle: title,
      ogDescription: `GEOlibrary resource covering ${country}.`,
      keywords: [country.toLowerCase(), region.toLowerCase(), "geography"],
    },
    createdAt: catalogDaysAgo(createdDays, 9),
    updatedAt: catalogDaysAgo(updatedDays, 11),
    viewsSeries: Array.from({ length: 12 }, () => 20 + Math.floor(rand() * 80)),
    versions: buildVersions(rand, author, updatedDays),
    activity: buildActivity(rand, author, title),
  };
}

export const libraryResources: LibraryResource[] = Array.from({ length: 120 }, (_, index) =>
  buildResource(index),
);

export interface LibraryStatsSummary {
  total: number;
  published: number;
  draft: number;
  pending: number;
  archived: number;
  featured: number;
  views: number;
  bookmarks: number;
  topArticle: LibraryResource | undefined;
}

export function summarizeLibrary(list: LibraryResource[]): LibraryStatsSummary {
  const by = (status: string) => list.filter((item) => item.status === status).length;
  return {
    total: list.length,
    published: by("published"),
    draft: by("draft"),
    pending: by("pending"),
    archived: by("archived"),
    featured: list.filter((item) => item.featured).length,
    views: list.reduce((sum, item) => sum + item.views, 0),
    bookmarks: list.reduce((sum, item) => sum + item.bookmarks, 0),
    topArticle: [...list].sort((a, b) => b.views - a.views)[0],
  };
}

function normalize(values: number[]) {
  const max = Math.max(1, ...values);
  return values.map((value) => Math.round((value / max) * 100));
}

export function libraryViewsSeries(list: LibraryResource[]) {
  const totals = Array.from({ length: 12 }, (_, month) =>
    list.reduce((sum, item) => sum + (item.viewsSeries[month] ?? 0), 0),
  );
  return normalize(totals);
}

export function libraryCategorySeries(list: LibraryResource[]) {
  const labels = [...libraryCategories];
  const counts = labels.map((label) => list.filter((item) => item.category === label).length);
  return {
    labels: labels.map((label) => label.split(" ")[0] ?? label),
    series: normalize(counts),
    counts,
  };
}

export function libraryRegionSeries(list: LibraryResource[]) {
  const counts = regions.map((region) => list.filter((item) => item.region === region).length);
  return { labels: regions.map((r) => r.slice(0, 3)), series: normalize(counts) };
}

export function topArticles(list: LibraryResource[], limit = 5) {
  return [...list].sort((a, b) => b.views - a.views).slice(0, limit);
}

export function popularCategories(list: LibraryResource[], limit = 5) {
  const map = new Map<string, number>();
  for (const item of list) map.set(item.category, (map.get(item.category) ?? 0) + item.views);
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, views]) => ({ label, views }));
}

export function findResource(list: LibraryResource[], id: string) {
  return list.find((item) => item.id === id || item.slug === id);
}
