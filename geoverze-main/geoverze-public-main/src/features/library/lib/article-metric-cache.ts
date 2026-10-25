type ArticleMetricSnapshot = {
  slug: string;
  views: number;
  likes: number;
  bookmarks: number;
};

export type ArticleMetricPatch = {
  views?: number;
  likes?: number;
  bookmarks?: number;
};

export type ArticleMetricDelta = {
  likes?: number;
  bookmarks?: number;
};

function isArticleMetricSnapshot(value: unknown): value is ArticleMetricSnapshot {
  if (!value || typeof value !== "object") return false;
  const article = value as ArticleMetricSnapshot;
  return (
    typeof article.slug === "string" &&
    typeof article.views === "number" &&
    typeof article.likes === "number" &&
    typeof article.bookmarks === "number"
  );
}

/** Update one article's counts inside a React Query cache entry without refetching the list. */
export function mapCachedArticleMetrics(
  data: unknown,
  slug: string,
  patch: ArticleMetricPatch,
): unknown {
  if (Array.isArray(data)) {
    let changed = false;
    const next = data.map((item) => {
      const patched = mapCachedArticleMetrics(item, slug, patch);
      if (patched !== item) changed = true;
      return patched;
    });
    return changed ? next : data;
  }

  if (isArticleMetricSnapshot(data)) {
    if (data.slug !== slug) return data;
    return {
      ...data,
      views: patch.views ?? data.views,
      likes: patch.likes ?? data.likes,
      bookmarks: patch.bookmarks ?? data.bookmarks,
    };
  }

  if (data && typeof data === "object" && "article" in data && "status" in data) {
    const page = data as { status: string; article: unknown };
    if (page.status === "ready") {
      const article = mapCachedArticleMetrics(page.article, slug, patch);
      if (article !== page.article) return { ...page, article };
    }
  }

  return data;
}

/** Add to cached like or bookmark totals. Counts never drop below zero. */
export function mapCachedArticleMetricDelta(
  data: unknown,
  slug: string,
  delta: ArticleMetricDelta,
): unknown {
  if (Array.isArray(data)) {
    let changed = false;
    const next = data.map((item) => {
      const patched = mapCachedArticleMetricDelta(item, slug, delta);
      if (patched !== item) changed = true;
      return patched;
    });
    return changed ? next : data;
  }

  if (isArticleMetricSnapshot(data)) {
    if (data.slug !== slug) return data;
    return {
      ...data,
      likes: Math.max(0, data.likes + (delta.likes ?? 0)),
      bookmarks: Math.max(0, data.bookmarks + (delta.bookmarks ?? 0)),
    };
  }

  if (data && typeof data === "object" && "article" in data && "status" in data) {
    const page = data as { status: string; article: unknown };
    if (page.status === "ready") {
      const article = mapCachedArticleMetricDelta(page.article, slug, delta);
      if (article !== page.article) return { ...page, article };
    }
  }

  return data;
}
