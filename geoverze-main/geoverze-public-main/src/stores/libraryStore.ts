/**
 * GVRZE Library reading state.
 *
 * Anonymous users: persisted under gvrze.library.v1.anon (legacy geoverze.library.v1.anon is dual-read).
 * Authenticated users: persisted under gvrze.library.v1.{userId} and synced with Supabase.
 */
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import {
  syncBookmarkToggle,
  syncLikeToggle,
  syncProgressUpdate,
} from "@/features/library/data/sync-library-state";
import { adjustCachedArticleMetrics } from "@/features/library/lib/library-query-scope";
import { CONTINUE_READING_MIN_PERCENT } from "@/features/library/lib/article-reading-progress";
import {
  emptyLibraryState,
  getActiveLibraryPersistScope,
  libraryPersistKey,
  loadLibraryStateForActiveScope,
  persistActiveLibraryState,
  switchLibraryPersistScope,
} from "@/features/library/lib/library-store-persistence";
import { GVRZE_PERSIST_NAMES, readMigratingValue } from "@/lib/persist-key-migration";
import { useAuthStore } from "@/stores/authStore";

type LibraryState = {
  bookmarks: string[];
  likes: string[];
  progress: Record<string, number>;
  progressReadAt: Record<string, number>;
  completed: string[];
  continueReadingDismissed: string[];
  toggleBookmark: (slug: string) => void;
  toggleLike: (slug: string) => void;
  setProgress: (slug: string, percent: number) => void;
  /** Re-opens a dismissed Continue Reading row when the article is opened again. */
  startReading: (slug: string) => void;
  markComplete: (slug: string) => void;
  dismissFromContinueReading: (slug: string) => void;
  replaceState: (state: {
    bookmarks: string[];
    likes: string[];
    progress: Record<string, number>;
    progressReadAt: Record<string, number>;
    completed: string[];
    continueReadingDismissed: string[];
  }) => void;
  clear: () => void;
};

function maybeSync(userId: string | undefined, fn: () => Promise<void>) {
  if (!userId) return;
  void fn().catch((error) => console.error("GVRZE Library sync failed", error));
}

function snapshotFromState(state: LibraryState) {
  return {
    bookmarks: state.bookmarks,
    likes: state.likes,
    progress: state.progress,
    progressReadAt: state.progressReadAt,
    completed: state.completed,
    continueReadingDismissed: state.continueReadingDismissed,
  };
}

const scopedStorage: StateStorage = {
  getItem: () =>
    readMigratingValue(localStorage, libraryPersistKey(getActiveLibraryPersistScope())),
  setItem: (_name, value) => {
    localStorage.setItem(libraryPersistKey(getActiveLibraryPersistScope()), value);
  },
  removeItem: () => {
    localStorage.removeItem(libraryPersistKey(getActiveLibraryPersistScope()));
  },
};

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      likes: [],
      progress: {},
      progressReadAt: {},
      completed: [],
      continueReadingDismissed: [],
      toggleBookmark: (slug) => {
        const wasSaved = get().bookmarks.includes(slug);
        set((s) => ({
          bookmarks: wasSaved ? s.bookmarks.filter((x) => x !== slug) : [slug, ...s.bookmarks],
        }));
        persistActiveLibraryState(snapshotFromState(get()));
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        const delta = wasSaved ? -1 : 1;
        adjustCachedArticleMetrics(slug, { bookmarks: delta });
        void syncBookmarkToggle(userId, slug, !wasSaved).catch((error) => {
          console.error("GVRZE Library sync failed", error);
          set((s) => ({
            bookmarks: wasSaved
              ? s.bookmarks.includes(slug)
                ? s.bookmarks
                : [slug, ...s.bookmarks]
              : s.bookmarks.filter((entry) => entry !== slug),
          }));
          persistActiveLibraryState(snapshotFromState(get()));
          adjustCachedArticleMetrics(slug, { bookmarks: -delta });
        });
      },
      toggleLike: (slug) => {
        const wasLiked = get().likes.includes(slug);
        set((s) => ({
          likes: wasLiked ? s.likes.filter((x) => x !== slug) : [slug, ...s.likes],
        }));
        persistActiveLibraryState(snapshotFromState(get()));
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        const delta = wasLiked ? -1 : 1;
        adjustCachedArticleMetrics(slug, { likes: delta });
        void syncLikeToggle(userId, slug, !wasLiked).catch((error) => {
          console.error("GVRZE Library sync failed", error);
          set((s) => ({
            likes: wasLiked
              ? s.likes.includes(slug)
                ? s.likes
                : [slug, ...s.likes]
              : s.likes.filter((entry) => entry !== slug),
          }));
          persistActiveLibraryState(snapshotFromState(get()));
          adjustCachedArticleMetrics(slug, { likes: -delta });
        });
      },
      setProgress: (slug, percent) => {
        const prev = get().progress[slug] ?? 0;
        const nextPercent = Math.max(0, Math.min(100, Math.round(percent)));
        if (prev >= nextPercent) return;
        if (nextPercent <= 0) return;
        set((s) => ({
          progress: { ...s.progress, [slug]: nextPercent },
          progressReadAt: { ...s.progressReadAt, [slug]: Date.now() },
        }));
        persistActiveLibraryState(snapshotFromState(get()));
        const userId = useAuthStore.getState().user?.id;
        maybeSync(userId, () => syncProgressUpdate(userId!, slug, nextPercent, false));
      },
      startReading: (slug) => {
        const state = get();
        if (state.completed.includes(slug)) return;

        const percent = state.progress[slug];
        const touchReadAt =
          percent != null && percent > CONTINUE_READING_MIN_PERCENT && percent < 100;

        set((s) => ({
          continueReadingDismissed: s.continueReadingDismissed.filter((entry) => entry !== slug),
          ...(touchReadAt ? { progressReadAt: { ...s.progressReadAt, [slug]: Date.now() } } : null),
        }));
        persistActiveLibraryState(snapshotFromState(get()));
      },
      markComplete: (slug) => {
        set((s) =>
          s.completed.includes(slug)
            ? s
            : {
                completed: [slug, ...s.completed],
                progress: { ...s.progress, [slug]: 100 },
                progressReadAt: { ...s.progressReadAt, [slug]: Date.now() },
              },
        );
        persistActiveLibraryState(snapshotFromState(get()));
        const userId = useAuthStore.getState().user?.id;
        maybeSync(userId, () => syncProgressUpdate(userId!, slug, 100, true));
      },
      dismissFromContinueReading: (slug) => {
        set((s) =>
          s.continueReadingDismissed.includes(slug)
            ? s
            : { continueReadingDismissed: [...s.continueReadingDismissed, slug] },
        );
        persistActiveLibraryState(snapshotFromState(get()));
      },
      replaceState: (state) => {
        set(state);
        persistActiveLibraryState(state);
      },
      clear: () => {
        set(emptyLibraryState);
        persistActiveLibraryState(emptyLibraryState);
      },
    }),
    {
      name: GVRZE_PERSIST_NAMES.library,
      storage: createJSONStorage(() => scopedStorage),
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        likes: state.likes,
        progress: state.progress,
        progressReadAt: state.progressReadAt,
        completed: state.completed,
        continueReadingDismissed: state.continueReadingDismissed,
      }),
    },
  ),
);

/** Switch persisted scope and load that user's local library snapshot. */
export function activateLibraryPersistScope(nextScope: string) {
  const current = snapshotFromState(useLibraryStore.getState());
  switchLibraryPersistScope(nextScope, current);

  useLibraryStore.getState().replaceState(loadLibraryStateForActiveScope());
}

export const selectLibraryBookmarks = (s: LibraryState) => s.bookmarks;
export const selectLibraryLikes = (s: LibraryState) => s.likes;
export const selectLibraryProgress = (s: LibraryState) => s.progress;
export const selectLibraryCompleted = (s: LibraryState) => s.completed;
