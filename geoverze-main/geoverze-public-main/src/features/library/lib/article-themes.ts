import type { Article } from "@/features/library/data/articles";

export type ArticleThemeId = "default" | "atlas-parchment";

export type AtlasParchmentPresentation = {
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

const ATLAS_PARCHMENT_BY_SLUG: Record<string, AtlasParchmentPresentation> = {
  "europes-smallest-states": {
    theme: "atlas-parchment",
    displayTitle: "Europe's Smallest States",
    displayDek:
      "Six tiny countries, six very different stories of survival, sovereignty and identity.",
    authorLine: "GEOlibrary · Geography & History",
    topicTags: ["History", "Europe", "Microstates"],
    heroImage: {
      src: "/assets/geolibrary/collections/countries-of-europe.jpg",
      alt: "Map of Europe highlighting Vatican City, Monaco, San Marino, Liechtenstein, Malta and Andorra",
      caption:
        "Six sovereign states whose territories are small enough to vanish on a continental map — yet each occupies a distinct place in European history.",
      credit: "GEOlibrary editorial map art",
    },
  },
};

export function getArticleTheme(slug: string): ArticleThemeId {
  return ATLAS_PARCHMENT_BY_SLUG[slug]?.theme ?? "default";
}

export function getAtlasParchmentPresentation(
  slug: string,
): AtlasParchmentPresentation | undefined {
  return ATLAS_PARCHMENT_BY_SLUG[slug];
}

/** Optional catalogue overrides for themed articles (fixture / display). */
export function applyArticleThemeCatalogueFields(article: Article): Article {
  const presentation = ATLAS_PARCHMENT_BY_SLUG[article.slug];
  if (!presentation) return article;
  return {
    ...article,
    title: presentation.displayTitle,
    dek: presentation.displayDek,
  };
}
