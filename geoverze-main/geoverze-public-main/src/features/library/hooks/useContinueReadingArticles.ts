import { useLayoutEffect, useMemo } from "react";

import { articleBySlug, type Article } from "@/features/library/data/articles";
import { mergeLibraryStoreFromDisk } from "@/features/library/lib/merge-library-store-from-disk";
import {
  CONTINUE_READING_MAX_CARDS,
  listContinueReadingSlugs,
} from "@/features/library/lib/continue-reading";
import { useLibraryStore } from "@/stores/libraryStore";

import { useLibraryStoreHydrated } from "./useLibraryStoreHydrated";

export function useContinueReadingArticles(catalogue: readonly Article[]) {
  const hydrated = useLibraryStoreHydrated();
  const progress = useLibraryStore((s) => s.progress);
  const progressReadAt = useLibraryStore((s) => s.progressReadAt);
  const completed = useLibraryStore((s) => s.completed);
  const continueReadingDismissed = useLibraryStore((s) => s.continueReadingDismissed);

  useLayoutEffect(() => {
    mergeLibraryStoreFromDisk();
  }, []);

  return useMemo(() => {
    if (!hydrated) {
      return { status: "loading" as const, articles: [] as Article[] };
    }

    const slugs = listContinueReadingSlugs(
      progress,
      completed,
      continueReadingDismissed,
      progressReadAt,
    ).slice(0, CONTINUE_READING_MAX_CARDS);

    const articles = slugs
      .map((slug) => catalogue.find((entry) => entry.slug === slug) ?? articleBySlug(slug))
      .filter((entry): entry is Article => Boolean(entry));

    if (articles.length === 0) {
      return { status: "empty" as const, articles: [] as Article[] };
    }

    return { status: "ready" as const, articles };
  }, [catalogue, completed, continueReadingDismissed, hydrated, progress, progressReadAt]);
}
