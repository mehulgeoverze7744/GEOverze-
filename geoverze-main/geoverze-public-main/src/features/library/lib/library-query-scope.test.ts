import assert from "node:assert/strict";
import test from "node:test";

import {
  mapCachedArticleMetricDelta,
  mapCachedArticleMetrics,
} from "./article-metric-cache.ts";

const article = {
  slug: "the-nile-and-the-amazon",
  title: "The Nile and the Amazon",
  views: 20,
  likes: 1,
  bookmarks: 2,
};

test("catalogue cache updates one article without touching the others", () => {
  const cached = [article, { ...article, slug: "other", views: 4, likes: 0, bookmarks: 0 }];
  const next = mapCachedArticleMetrics(cached, article.slug, { views: 21, likes: 2 }) as typeof cached;

  assert.equal(next[0]?.views, 21);
  assert.equal(next[0]?.likes, 2);
  assert.equal(next[0]?.bookmarks, 2);
  assert.equal(next[1]?.views, 4);
  assert.equal(next[0]?.title, article.title);
});

test("like and bookmark deltas clamp at zero and roll back", () => {
  const liked = mapCachedArticleMetricDelta([article], article.slug, { likes: 1, bookmarks: 1 }) as (typeof article)[];
  assert.equal(liked[0]?.likes, 2);
  assert.equal(liked[0]?.bookmarks, 3);

  const rolledBack = mapCachedArticleMetricDelta(liked, article.slug, { likes: -1, bookmarks: -1 }) as (typeof article)[];
  assert.equal(rolledBack[0]?.likes, 1);
  assert.equal(rolledBack[0]?.bookmarks, 2);

  const clamped = mapCachedArticleMetricDelta([{ ...article, likes: 0, bookmarks: 0 }], article.slug, {
    likes: -1,
    bookmarks: -1,
  }) as (typeof article)[];
  assert.equal(clamped[0]?.likes, 0);
  assert.equal(clamped[0]?.bookmarks, 0);
});

test("article page cache keeps the ready payload shape", () => {
  const page = { status: "ready" as const, article };
  const next = mapCachedArticleMetrics(page, article.slug, { bookmarks: 3 }) as typeof page;

  assert.equal(next.status, "ready");
  assert.equal(next.article.bookmarks, 3);
  assert.equal(next.article.views, 20);
});
