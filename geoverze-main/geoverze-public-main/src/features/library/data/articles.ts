/**
 * GVRZE Library articles — canonical seed fixture / development reference.
 *
 * Production read paths use Supabase via fetchPublishedArticles.ts.
 * This module remains the GL-4 seed source of truth.
 */
import type { LibraryAccessTier } from "@/features/library/lib/access-tier";

import type { CategoryId, ContinentId, DifficultyId } from "./taxonomy";
import { EUROPES_SMALLEST_STATES_BLOCKS } from "./europes-smallest-states-blocks";
import { EXPANDED_ARTICLE_BLOCKS } from "./article-expanded/index";
import { estimateReadingMinutes } from "@/features/library/lib/article-content-utils";

export type ArticleBlock =
  | { kind: "heading"; id: string; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: readonly string[]; ordered?: boolean }
  | { kind: "quote"; text: string; attribution?: string }
  | {
      kind: "image";
      art: string;
      caption: string;
      storagePath?: string;
      externalSrc?: string;
      credit?: string;
    }
  | { kind: "map"; region: string; caption: string }
  | {
      kind: "facts";
      title: string;
      facts: readonly { label: string; value: string }[];
      layout?: "default" | "survival-cards";
    }
  | {
      kind: "table";
      title?: string;
      columns: readonly string[];
      rows: readonly (readonly string[])[];
    }
  | { kind: "didYouKnow"; text?: string; items?: readonly string[] }
  | {
      kind: "callout";
      variant: "key-idea" | "did-you-know" | "geography-note" | "history-note" | "by-the-numbers";
      text: string;
    }
  | {
      kind: "sizeComparison";
      title?: string;
      items: readonly { label: string; areaKm2: number }[];
    }
  | {
      kind: "timeline";
      title?: string;
      events: readonly { date: string; text: string }[];
    }
  | {
      kind: "stateGlance";
      title?: string;
      states: readonly {
        name: string;
        fields: readonly { label: string; value: string }[];
      }[];
    }
  | { kind: "geoDiagram"; title?: string; nodes: readonly string[] }
  | {
      kind: "dualCompare";
      title: string;
      leftTitle: string;
      leftItems: readonly string[];
      rightTitle: string;
      rightItems: readonly string[];
    }
  | {
      kind: "profileStrip";
      title?: string;
      profiles: readonly { name: string; theme: string; text: string }[];
    }
  | {
      kind: "crossLinks";
      title?: string;
      links: readonly { label: string; href: string; description?: string }[];
    };

export type Article = {
  slug: string;
  /** Supabase library_resources.id when loaded from live data. */
  resourceId?: string;
  title: string;
  dek: string;
  category: CategoryId;
  continent: ContinentId;
  difficulty: DifficultyId;
  /** Estimated reading time in minutes. */
  minutes: number;
  publishedAt: string;
  creator: string;
  tags: readonly string[];
  views: number;
  likes: number;
  bookmarks: number;
  /** library-media cover object path */
  coverArtKey?: string | null;
  /** Minimum subscription tier when set; null means free/public. */
  minAccessTier?: LibraryAccessTier | null;
  blocks: readonly ArticleBlock[];
};

/**
 * Local editorial fixtures. Views, likes, and bookmarks here are not display
 * counts — live cards read library_catalogue_resources instead.
 */
export const ARTICLES: readonly Article[] = [
  {
    slug: "why-some-countries-have-two-capitals",
    title: "Why some countries have two capitals",
    dek: "Bolivia, South Africa, the Netherlands — splitting a capital is more common, and more deliberate, than most maps suggest.",
    category: "capitals",
    continent: "global",
    difficulty: "beginner",
    minutes: estimateReadingMinutes(
      EXPANDED_ARTICLE_BLOCKS["why-some-countries-have-two-capitals"],
    ),
    publishedAt: "2026-08-01",
    creator: "gvrze-studio",
    tags: ["capitals", "government", "politics"],
    views: 0,
    likes: 0,
    bookmarks: 0,
    blocks: EXPANDED_ARTICLE_BLOCKS["why-some-countries-have-two-capitals"],
  },
  {
    slug: "how-the-himalayas-keep-growing",
    title: "How the Himalayas keep growing",
    dek: "India is still driving north at roughly the speed your fingernails grow, and the roof of the world is the receipt.",
    category: "physical",
    continent: "asia",
    difficulty: "intermediate",
    minutes: estimateReadingMinutes(EXPANDED_ARTICLE_BLOCKS["how-the-himalayas-keep-growing"]),
    publishedAt: "2026-07-28",
    creator: "gvrze-studio",
    tags: ["himalaya", "mountains", "tectonics", "everest"],
    views: 0,
    likes: 0,
    bookmarks: 0,
    blocks: EXPANDED_ARTICLE_BLOCKS["how-the-himalayas-keep-growing"],
  },
  {
    slug: "the-sahel-explained",
    title: "The Sahel, explained",
    dek: "A 5,000 km belt of semi-arid land where the Sahara negotiates with the savanna — and where climate and politics meet head-on.",
    category: "climate",
    continent: "africa",
    difficulty: "intermediate",
    minutes: estimateReadingMinutes(EXPANDED_ARTICLE_BLOCKS["the-sahel-explained"]),
    publishedAt: "2026-07-21",
    creator: "gvrze-studio",
    tags: ["sahel", "africa", "climate", "desert"],
    views: 0,
    likes: 0,
    bookmarks: 0,
    blocks: EXPANDED_ARTICLE_BLOCKS["the-sahel-explained"],
  },
  {
    slug: "the-straightest-borders-on-earth",
    title: "The straightest borders on Earth",
    dek: "Where a boundary follows a parallel instead of a river, someone drew it in a room far away.",
    category: "countries",
    continent: "global",
    difficulty: "beginner",
    minutes: estimateReadingMinutes(EXPANDED_ARTICLE_BLOCKS["the-straightest-borders-on-earth"]),
    publishedAt: "2026-07-14",
    creator: "gvrze-studio",
    tags: ["borders", "colonial", "surveying"],
    views: 0,
    likes: 0,
    bookmarks: 0,
    blocks: EXPANDED_ARTICLE_BLOCKS["the-straightest-borders-on-earth"],
  },
  {
    slug: "reading-a-flag-in-thirty-seconds",
    title: "Reading a flag in thirty seconds",
    dek: "Colours, charges and proportions carry more information than most people expect. Here is the grammar.",
    category: "flags",
    continent: "global",
    difficulty: "beginner",
    minutes: estimateReadingMinutes(EXPANDED_ARTICLE_BLOCKS["reading-a-flag-in-thirty-seconds"]),
    publishedAt: "2026-07-09",
    creator: "gvrze-studio",
    tags: ["flags", "vexillology", "symbols"],
    views: 0,
    likes: 0,
    bookmarks: 0,
    blocks: EXPANDED_ARTICLE_BLOCKS["reading-a-flag-in-thirty-seconds"],
  },
  {
    slug: "the-nile-and-the-amazon",
    title: "The Nile and the Amazon: which is longest?",
    dek: "A measurement argument that has run for a century, and why the answer depends on where you decide a river begins.",
    category: "oceans",
    continent: "global",
    difficulty: "intermediate",
    minutes: estimateReadingMinutes(EXPANDED_ARTICLE_BLOCKS["the-nile-and-the-amazon"]),
    publishedAt: "2026-07-02",
    creator: "gvrze-studio",
    tags: ["rivers", "nile", "amazon", "hydrology"],
    views: 0,
    likes: 0,
    bookmarks: 0,
    blocks: EXPANDED_ARTICLE_BLOCKS["the-nile-and-the-amazon"],
  },
  {
    slug: "how-unesco-picks-a-world-heritage-site",
    title: "How UNESCO picks a World Heritage site",
    dek: "Ten criteria, one committee and a long queue. Inside the process that turns a place into a protected one.",
    category: "heritage",
    continent: "global",
    difficulty: "beginner",
    minutes: estimateReadingMinutes(
      EXPANDED_ARTICLE_BLOCKS["how-unesco-picks-a-world-heritage-site"],
    ),
    publishedAt: "2026-06-25",
    creator: "gvrze-studio",
    tags: ["unesco", "heritage", "conservation"],
    views: 0,
    likes: 0,
    bookmarks: 0,
    blocks: EXPANDED_ARTICLE_BLOCKS["how-unesco-picks-a-world-heritage-site"],
  },
  {
    slug: "why-there-are-five-oceans-now",
    title: "Why there are five oceans now",
    dek: "The Southern Ocean was recognised in 2021, and the reason is a current rather than a coastline.",
    category: "oceans",
    continent: "antarctica",
    difficulty: "beginner",
    minutes: estimateReadingMinutes(EXPANDED_ARTICLE_BLOCKS["why-there-are-five-oceans-now"]),
    publishedAt: "2026-06-18",
    creator: "gvrze-studio",
    tags: ["oceans", "southern ocean", "antarctica", "currents"],
    views: 0,
    likes: 0,
    bookmarks: 0,
    blocks: EXPANDED_ARTICLE_BLOCKS["why-there-are-five-oceans-now"],
  },
  {
    slug: "languages-that-cross-the-most-borders",
    title: "Languages that cross the most borders",
    dek: "Official status is politics; everyday speech is geography. The two rarely line up.",
    category: "culture",
    continent: "global",
    difficulty: "intermediate",
    minutes: estimateReadingMinutes(
      EXPANDED_ARTICLE_BLOCKS["languages-that-cross-the-most-borders"],
    ),
    publishedAt: "2026-06-10",
    creator: "gvrze-studio",
    tags: ["languages", "culture", "linguistics"],
    views: 0,
    likes: 0,
    bookmarks: 0,
    blocks: EXPANDED_ARTICLE_BLOCKS["languages-that-cross-the-most-borders"],
  },
  {
    slug: "what-a-currency-tells-you-about-a-country",
    title: "What a currency tells you about a country",
    dek: "Pegs, unions and dollarisation are geography problems disguised as monetary ones.",
    category: "culture",
    continent: "global",
    difficulty: "advanced",
    minutes: estimateReadingMinutes(
      EXPANDED_ARTICLE_BLOCKS["what-a-currency-tells-you-about-a-country"],
    ),
    publishedAt: "2026-06-03",
    creator: "gvrze-studio",
    tags: ["currencies", "economics", "trade"],
    views: 0,
    likes: 0,
    bookmarks: 0,
    blocks: EXPANDED_ARTICLE_BLOCKS["what-a-currency-tells-you-about-a-country"],
  },
  {
    slug: "the-landmarks-everyone-misplaces",
    title: "The landmarks everyone misplaces",
    dek: "Machu Picchu is not in the Andes' highest range, and the Sphinx is younger than you think.",
    category: "landmarks",
    continent: "global",
    difficulty: "beginner",
    minutes: estimateReadingMinutes(EXPANDED_ARTICLE_BLOCKS["the-landmarks-everyone-misplaces"]),
    publishedAt: "2026-05-27",
    creator: "gvrze-studio",
    tags: ["landmarks", "monuments", "misconceptions"],
    views: 0,
    likes: 0,
    bookmarks: 0,
    blocks: EXPANDED_ARTICLE_BLOCKS["the-landmarks-everyone-misplaces"],
  },
  {
    slug: "how-to-read-a-topographic-map",
    title: "How to read a topographic map",
    dek: "Contours, intervals and the three shapes that tell you everything about terrain.",
    category: "basics",
    continent: "global",
    difficulty: "beginner",
    minutes: estimateReadingMinutes(EXPANDED_ARTICLE_BLOCKS["how-to-read-a-topographic-map"]),
    publishedAt: "2026-05-20",
    creator: "gvrze-studio",
    tags: ["maps", "contours", "basics", "navigation"],
    views: 0,
    likes: 0,
    bookmarks: 0,
    blocks: EXPANDED_ARTICLE_BLOCKS["how-to-read-a-topographic-map"],
  },
  {
    slug: "europes-smallest-states",
    title: "Europe's Smallest States",
    dek: "Six tiny countries, six very different stories of survival, sovereignty and identity.",
    category: "countries",
    continent: "europe",
    difficulty: "beginner",
    minutes: 26,
    publishedAt: "2026-05-12",
    creator: "gvrze-studio",
    tags: ["europe", "microstates", "countries", "vatican", "history"],
    views: 0,
    likes: 0,
    bookmarks: 0,
    blocks: EUROPES_SMALLEST_STATES_BLOCKS,
  },
  {
    slug: "megacities-and-the-limits-of-growth",
    title: "Megacities and the limits of growth",
    dek: "Thirty-three cities now pass ten million people. Water, not land, decides which of them keep growing.",
    category: "capitals",
    continent: "asia",
    difficulty: "advanced",
    minutes: estimateReadingMinutes(EXPANDED_ARTICLE_BLOCKS["megacities-and-the-limits-of-growth"]),
    publishedAt: "2026-05-04",
    creator: "gvrze-studio",
    tags: ["cities", "urban", "population", "water"],
    views: 0,
    likes: 0,
    bookmarks: 0,
    blocks: EXPANDED_ARTICLE_BLOCKS["megacities-and-the-limits-of-growth"],
  },
] as const;

const BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));

export const articleBySlug = (slug: string): Article | undefined => BY_SLUG.get(slug);

import { compareRelated } from "../lib/engagement";

/** Articles sharing taxonomy signals, ranked by match then engagement. */
export function relatedArticles(
  article: Article,
  limit = 3,
  source: readonly Article[] = ARTICLES,
): Article[] {
  return source
    .filter((candidate) => candidate.slug !== article.slug)
    .sort((a, b) => compareRelated(article, a, b))
    .slice(0, limit);
}

/** Headings, used for the table of contents. */
export function articleHeadings(article: Article) {
  return article.blocks.filter(
    (b): b is Extract<ArticleBlock, { kind: "heading" }> => b.kind === "heading",
  );
}
