/**
 * GEOlibrary reading state.
 *
 * Persisted locally so bookmarks, likes and reading progress survive reloads
 * before any backend exists. Kept separate from the quiz `bookmarksStore` so
 * saved reading and saved quizzes never collide.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  clear: () => void;
};

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      bookmarks: [],
      likes: [],
      progress: {},
      completed: [],
      toggleBookmark: (slug) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(slug)
            ? s.bookmarks.filter((x) => x !== slug)
            : [slug, ...s.bookmarks],
        })),
      toggleLike: (slug) =>
        set((s) => ({
          likes: s.likes.includes(slug) ? s.likes.filter((x) => x !== slug) : [slug, ...s.likes],
        })),
      setProgress: (slug, percent) =>
        set((s) => {
          const next = Math.max(0, Math.min(100, Math.round(percent)));
          if ((s.progress[slug] ?? 0) >= next) return s;
          return { progress: { ...s.progress, [slug]: next } };
        }),
      markComplete: (slug) =>
        set((s) =>
          s.completed.includes(slug)
            ? s
            : { completed: [slug, ...s.completed], progress: { ...s.progress, [slug]: 100 } },
        ),
      clear: () => set({ bookmarks: [], likes: [], progress: {}, completed: [] }),
    }),
    { name: "geoverze.library" },
  ),
);

export const selectLibraryBookmarks = (s: LibraryState) => s.bookmarks;
export const selectLibraryLikes = (s: LibraryState) => s.likes;
export const selectLibraryProgress = (s: LibraryState) => s.progress;
export const selectLibraryCompleted = (s: LibraryState) => s.completed;
