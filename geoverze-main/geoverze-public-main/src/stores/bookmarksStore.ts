/**
 * Locally saved quizzes. Persisted so the Bookmarks rail reflects real user
 * action before any backend exists.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

type BookmarksState = {
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
};

export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id],
        })),
      clear: () => set({ ids: [] }),
    }),
    { name: "geoverze.bookmarks" },
  ),
);

export const selectBookmarkIds = (s: BookmarksState) => s.ids;
