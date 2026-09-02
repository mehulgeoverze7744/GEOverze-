/**
 * GEOlibrary reading state.
 *
 * Anonymous users: persisted under geoverze.library.v1.anon.
 * Authenticated users: persisted under geoverze.library.v1.{userId} and synced with Supabase.
 */
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import {
  syncBookmarkToggle,
  syncLikeToggle,
  syncProgressUpdate,
} from "@/features/library/data/sync-library-state";
import {
  emptyLibraryState,
  getActiveLibraryPersistScope,
  libraryPersistKey,
  persistActiveLibraryState,
  switchLibraryPersistScope,
} from "@/features/library/lib/library-store-persistence";
import { useAuthStore } from "@/stores/authStore";

type LibraryState = {
  bookmarks: string[];
  likes: string[];
  progress: Record<string, number>;
  completed: string[];
  toggleBookmark: (slug: string) => void;
  toggleLike: (slug: string) => void;
  setProgress: (slug: string, percent: number) => void;
  markComplete: (slug: string) => void;
  replaceState: (state: {
    bookmarks: string[];
    likes: string[];
    progress: Record<string, number>;
    completed: string[];
  }) => void;
  clear: () => void;
};

function maybeSync(userId: string | undefined, fn: () => Promise<void>) {
  if (!userId) return;
  void fn().catch((error) => console.error("GEOlibrary sync failed", error));
}

function snapshotFromState(state: LibraryState) {
  return {
    bookmarks: state.bookmarks,
    likes: state.likes,
    progress: state.progress,
    completed: state.completed,
  };
}

const scopedStorage: StateStorage = {
  getItem: () => localStorage.getItem(libraryPersistKey(getActiveLibraryPersistScope())),
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
      completed: [],
      toggleBookmark: (slug) => {
        const wasSaved = get().bookmarks.includes(slug);
        set((s) => ({
          bookmarks: wasSaved ? s.bookmarks.filter((x) => x !== slug) : [slug, ...s.bookmarks],
        }));
        persistActiveLibraryState(snapshotFromState(get()));
        const userId = useAuthStore.getState().user?.id;
        maybeSync(userId, () => syncBookmarkToggle(userId!, slug, !wasSaved));
      },
      toggleLike: (slug) => {
        const wasLiked = get().likes.includes(slug);
        set((s) => ({
          likes: wasLiked ? s.likes.filter((x) => x !== slug) : [slug, ...s.likes],
        }));
        persistActiveLibraryState(snapshotFromState(get()));
        const userId = useAuthStore.getState().user?.id;
        maybeSync(userId, () => syncLikeToggle(userId!, slug, !wasLiked));
      },
      setProgress: (slug, percent) => {
        const prev = get().progress[slug] ?? 0;
        const nextPercent = Math.max(0, Math.min(100, Math.round(percent)));
        if (prev >= nextPercent) return;
        set((s) => ({ progress: { ...s.progress, [slug]: nextPercent } }));
        persistActiveLibraryState(snapshotFromState(get()));
        const userId = useAuthStore.getState().user?.id;
        maybeSync(userId, () => syncProgressUpdate(userId!, slug, nextPercent, false));
      },
      markComplete: (slug) => {
        set((s) =>
          s.completed.includes(slug)
            ? s
            : {
                completed: [slug, ...s.completed],
                progress: { ...s.progress, [slug]: 100 },
              },
        );
        persistActiveLibraryState(snapshotFromState(get()));
        const userId = useAuthStore.getState().user?.id;
        maybeSync(userId, () => syncProgressUpdate(userId!, slug, 100, true));
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
      name: "geoverze.library",
      storage: createJSONStorage(() => scopedStorage),
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        likes: state.likes,
        progress: state.progress,
        completed: state.completed,
      }),
    },
  ),
);

/** Switch persisted scope and load that user's local library snapshot. */
export function activateLibraryPersistScope(nextScope: string) {
  const current = snapshotFromState(useLibraryStore.getState());
  switchLibraryPersistScope(nextScope, current);

  let loaded = emptyLibraryState;
  try {
    const raw = localStorage.getItem(libraryPersistKey(nextScope));
    if (raw) {
      const parsed = JSON.parse(raw) as {
        state?: {
          bookmarks?: string[];
          likes?: string[];
          progress?: Record<string, number>;
          completed?: string[];
        };
      };
      const state = parsed.state;
      if (state) {
        loaded = {
          bookmarks: Array.isArray(state.bookmarks) ? state.bookmarks : [],
          likes: Array.isArray(state.likes) ? state.likes : [],
          progress: state.progress && typeof state.progress === "object" ? state.progress : {},
          completed: Array.isArray(state.completed) ? state.completed : [],
        };
      }
    }
  } catch {
    // Keep empty state for corrupt storage entries.
  }

  useLibraryStore.getState().replaceState(loaded);
}

export const selectLibraryBookmarks = (s: LibraryState) => s.bookmarks;
export const selectLibraryLikes = (s: LibraryState) => s.likes;
export const selectLibraryProgress = (s: LibraryState) => s.progress;
export const selectLibraryCompleted = (s: LibraryState) => s.completed;
