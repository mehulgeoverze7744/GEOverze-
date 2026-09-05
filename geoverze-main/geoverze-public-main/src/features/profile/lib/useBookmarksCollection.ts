import { useMemo } from "react";

import { categoryLabel } from "@/features/library/data/taxonomy";
import { articleCardImageSrc } from "@/features/library/data/article-card-images";
import { usePublishedArticles } from "@/features/library/hooks/usePublishedArticles";
import { QUIZ_CATEGORIES } from "@/features/play/data/categories";
import { quizThumbnailForId } from "@/features/play/data/quizThumbnails";
import { usePublishedQuizzes } from "@/features/play/hooks/usePublishedQuizzes";
import {
  BOOKMARK_SECTIONS,
  type BookmarkFilterId,
  type BookmarkKind,
  type SavedBookmark,
} from "@/features/profile/data/bookmarks";
import { useBookmarksStore } from "@/stores/bookmarksStore";
import { useLibraryStore } from "@/stores/libraryStore";

const QUIZ_CATEGORY_LABELS = new Map(QUIZ_CATEGORIES.map((c) => [c.id, c.title]));

function articleBookmarks(
  slugs: readonly string[],
  articles: ReturnType<typeof usePublishedArticles>["articles"],
): SavedBookmark[] {
  return slugs
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .map((article) => ({
      id: `article:${article.slug}`,
      kind: "articles" as const,
      typeLabel: "Article",
      category: categoryLabel(article.category),
      title: article.title,
      description: article.dek,
      meta: `${article.minutes} min read`,
      actionLabel: "Read article",
      to: "/geolibrary/article/$slug" as const,
      params: { slug: article.slug },
      imageSrc: articleCardImageSrc(article.slug),
      imageAlt: "",
    }));
}

function quizBookmarks(
  ids: readonly string[],
  quizzes: ReturnType<typeof usePublishedQuizzes>["quizzes"],
): SavedBookmark[] {
  return ids
    .map((id) => quizzes.find((q) => q.id === id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))
    .map((quiz) => {
      const thumbnail = quizThumbnailForId(quiz.id);
      return {
        id: `quiz:${quiz.id}`,
        kind: "quizzes" as const,
        typeLabel: "Quiz",
        category: QUIZ_CATEGORY_LABELS.get(quiz.categoryId) ?? "Quiz",
        title: quiz.title,
        description: `by ${quiz.creator}`,
        meta: `${quiz.questions} questions · ${quiz.difficulty}`,
        actionLabel: "Open quiz",
        to: "/play/quiz" as const,
        search: { quiz: quiz.id },
        imageSrc: thumbnail?.src,
        imageAlt: thumbnail?.alt ?? "",
        art: quiz.art,
        categoryId: quiz.categoryId,
      };
    });
}

export function useBookmarksCollection() {
  const libraryBookmarks = useLibraryStore((s) => s.bookmarks);
  const toggleArticleBookmark = useLibraryStore((s) => s.toggleBookmark);
  const quizBookmarkIds = useBookmarksStore((s) => s.ids);
  const toggleQuizBookmark = useBookmarksStore((s) => s.toggle);
  const { articles, loading: articlesLoading } = usePublishedArticles();
  const { quizzes, loading: quizzesLoading } = usePublishedQuizzes();

  const byKind = useMemo(() => {
    const articlesList = articleBookmarks(libraryBookmarks, articles);
    const quizzesList = quizBookmarks(quizBookmarkIds, quizzes);
    const mapsList: SavedBookmark[] = [];
    const pathsList: SavedBookmark[] = [];

    return {
      articles: articlesList,
      quizzes: quizzesList,
      maps: mapsList,
      paths: pathsList,
    } satisfies Record<BookmarkKind, SavedBookmark[]>;
  }, [articles, libraryBookmarks, quizBookmarkIds, quizzes]);

  const all = useMemo(
    () => [...byKind.articles, ...byKind.quizzes, ...byKind.maps, ...byKind.paths],
    [byKind],
  );

  const counts = useMemo(
    () => ({
      all: all.length,
      articles: byKind.articles.length,
      quizzes: byKind.quizzes.length,
      maps: byKind.maps.length,
      paths: byKind.paths.length,
    }),
    [all.length, byKind],
  );

  const loading = articlesLoading || quizzesLoading;

  function itemsForFilter(filter: BookmarkFilterId): SavedBookmark[] {
    if (filter === "all") return all;
    return byKind[filter];
  }

  function removeBookmark(item: SavedBookmark) {
    if (item.kind === "articles") {
      const slug = item.params && "slug" in item.params ? item.params.slug : undefined;
      if (typeof slug === "string") toggleArticleBookmark(slug);
      return;
    }
    if (item.kind === "quizzes") {
      const quizId =
        item.search && typeof item.search === "object" && "quiz" in item.search
          ? item.search.quiz
          : undefined;
      if (typeof quizId === "string") toggleQuizBookmark(quizId);
    }
  }

  return {
    sections: BOOKMARK_SECTIONS,
    byKind,
    all,
    counts,
    loading,
    itemsForFilter,
    removeBookmark,
  };
}
