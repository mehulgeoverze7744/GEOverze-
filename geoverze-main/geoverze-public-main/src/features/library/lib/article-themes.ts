import type { Article } from "@/features/library/data/articles";
import { articleCardImageSrc } from "@/features/library/data/article-card-images";
import { categoryLabel } from "@/features/library/data/taxonomy";
import { libraryImageCredit } from "@/features/library/lib/library-image-delivery";

export type ArticleThemeId = "atlas-parchment";

export type ArticleReaderPresentation = {
  theme: "atlas-parchment";
  displayTitle: string;
  displayDek: string;
  authorLine: string;
  topicTags: readonly string[];
  heroImage: {
    src: string;
    alt: string;
    caption: string;
    credit: string;
  };
};

const DEFAULT_HERO = "/assets/geolibrary/collections/geography-basics.jpg";

function formatTag(tag: string): string {
  return tag
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** All GVRZE Library articles use the atlas parchment reading experience. */
export function getArticleTheme(_slug: string): ArticleThemeId {
  return "atlas-parchment";
}

export function getArticleReaderPresentation(article: Article): ArticleReaderPresentation {
  const heroSrc = articleCardImageSrc(article.slug) ?? DEFAULT_HERO;
  const tags = article.tags.length > 0 ? article.tags.slice(0, 4) : [article.category];

  return {
    theme: "atlas-parchment",
    displayTitle: article.title,
    displayDek: article.dek,
    authorLine: `GVRZE Studio · ${categoryLabel(article.category)}`,
    topicTags: tags.map(formatTag),
    heroImage: {
      src: heroSrc,
      alt: article.title,
      caption: article.dek,
      credit: libraryImageCredit(heroSrc) ?? "Wikimedia Commons",
    },
  };
}

/** @deprecated Use getArticleReaderPresentation */
export function getAtlasParchmentPresentation(slug: string, article?: Article) {
  if (article) return getArticleReaderPresentation(article);
  return undefined;
}

/** Optional catalogue display sync — titles/deks already come from Supabase/seed. */
export function applyArticleThemeCatalogueFields(article: Article): Article {
  return article;
}
