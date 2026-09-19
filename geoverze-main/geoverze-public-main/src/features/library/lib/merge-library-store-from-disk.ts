import { loadLibraryStateForActiveScope } from "@/features/library/lib/library-store-persistence";
import { useLibraryStore } from "@/stores/libraryStore";

/** Merge scoped localStorage snapshot into the in-memory library store (max progress wins). */
export function mergeLibraryStoreFromDisk() {
  if (typeof window === "undefined") return;

  const disk = loadLibraryStateForActiveScope();
  const live = useLibraryStore.getState();

  const progress = { ...disk.progress, ...live.progress };
  for (const slug of new Set([...Object.keys(disk.progress), ...Object.keys(live.progress)])) {
    progress[slug] = Math.max(disk.progress[slug] ?? 0, live.progress[slug] ?? 0);
  }

  const progressReadAt = { ...disk.progressReadAt, ...live.progressReadAt };
  for (const slug of Object.keys(progress)) {
    if (progressReadAt[slug] == null && (progress[slug] ?? 0) > 0) {
      progressReadAt[slug] = Date.now();
    }
  }

  useLibraryStore.getState().replaceState({
    bookmarks: [...new Set([...disk.bookmarks, ...live.bookmarks])],
    likes: [...new Set([...disk.likes, ...live.likes])],
    progress,
    progressReadAt,
    completed: [...new Set([...disk.completed, ...live.completed])],
    continueReadingDismissed: [
      ...new Set([...disk.continueReadingDismissed, ...live.continueReadingDismissed]),
    ],
  });
}
