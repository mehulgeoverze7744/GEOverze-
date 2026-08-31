/**
 * GEOlibrary reading state.
 *
 * Anonymous users: persisted in localStorage only.
 * Authenticated users: synced with Supabase user_library_* tables on sign-in
 * and after each mutation (see sync-library-state.ts).
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  syncBookmarkToggle,
  syncLikeToggle,
  syncProgressUpdate,
} from "@/features/library/data/sync-library-state";
import { useAuthStore } from "@/stores/authStore";

type LibraryState = {
  /** Article slugs saved for later. */
  bookmarks: string[];
  /** Article slugs the reader liked. */
  likes: string[];
  /** Article slug -> furthest scroll depth reached, 0–100. */
  progress: Record<string, number>;
  /** Article slugs read to the end. */
  completed: string[];
  toggleBookmark: (slug: string) => void;
  toggleLike: (slug: string) => void;
  /** Records progress, only ever moving forward. */
  setProgress: (slug: string, percent: number) => void;
  markComplete: (slug: string) => void;
  /** Replace all fields after server merge (does not sync back). */
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
        const userId = useAuthStore.getState().user?.id;
        maybeSync(userId, () => syncBookmarkToggle(userId!, slug, !wasSaved));
      },
      toggleLike: (slug) => {
        const wasLiked = get().likes.includes(slug);
        set((s) => ({
          likes: wasLiked ? s.likes.filter((x) => x !== slug) : [slug, ...s.likes],
        }));
        const userId = useAuthStore.getState().user?.id;
        maybeSync(userId, () => syncLikeToggle(userId!, slug, !wasLiked));
      },
      setProgress: (slug, percent) => {
        const prev = get().progress[slug] ?? 0;
        const nextPercent = Math.max(0, Math.min(100, Math.round(percent)));
        if (prev >= nextPercent) return;
        set((s) => ({ progress: { ...s.progress, [slug]: nextPercent } }));
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
        const userId = useAuthStore.getState().user?.id;
        maybeSync(userId, () => syncProgressUpdate(userId!, slug, 100, true));
      },
      replaceState: (state) => set(state),
      clear: () => set({ bookmarks: [], likes: [], progress: {}, completed: [] }),
    }),
    { name: "geoverze.library" },
  ),
);

export const selectLibraryBookmarks = (s: LibraryState) => s.bookmarks;
export const selectLibraryLikes = (s: LibraryState) => s.likes;
export const selectLibraryProgress = (s: LibraryState) => s.progress;
export const selectLibraryCompleted = (s: LibraryState) => s.completed;
