import type { User } from "@supabase/supabase-js";

import { useLibraryStore } from "@/stores/libraryStore";

import { queuePendingProgressSync, retryPendingProgressSyncs } from "./library-progress-sync";
import { invalidateLibraryCatalogueQueries } from "@/features/library/lib/library-query-scope";

import {
  deleteBookmark,
  deleteLike,
  fetchResourceIdsBySlugs,
  fetchServerLibraryState,
  insertBookmark,
  insertLike,
  upsertProgress,
} from "./user-library-state";

export type MergedLibraryState = {
  bookmarks: string[];
  likes: string[];
  progress: Record<string, number>;
  completed: string[];
};

function logHydrationDiagnostic(message: string, detail?: unknown) {
  if (import.meta.env.DEV) {
    console.warn(`[GEOlibrary hydrate] ${message}`, detail ?? "");
  }
}

/** Merge local Zustand state with server rows. Preserves union + max progress. */
export function mergeLibraryState(
  local: MergedLibraryState,
  server: Awaited<ReturnType<typeof fetchServerLibraryState>>,
): MergedLibraryState {
  const bookmarkSet = new Set([...local.bookmarks, ...server.bookmarks.keys()]);
  const likeSet = new Set([...local.likes, ...server.likes.keys()]);

  const progress: Record<string, number> = { ...local.progress };
  const completed = new Set(local.completed);

  for (const [slug, entry] of server.progress) {
    progress[slug] = Math.max(progress[slug] ?? 0, entry.percent);
    if (entry.completed || (progress[slug] ?? 0) >= 100) completed.add(slug);
  }

  for (const slug of local.completed) {
    progress[slug] = 100;
    completed.add(slug);
  }

  return {
    bookmarks: [...bookmarkSet],
    likes: [...likeSet],
    progress,
    completed: [...completed],
  };
}

/** Push merged local-only deltas to Supabase after sign-in merge. */
async function pushMergedToServer(
  userId: string,
  merged: MergedLibraryState,
  server: Awaited<ReturnType<typeof fetchServerLibraryState>>,
  slugToId: Map<string, string>,
) {
  for (const slug of merged.bookmarks) {
    if (server.bookmarks.has(slug)) continue;
    const resourceId = slugToId.get(slug);
    if (!resourceId) {
      logHydrationDiagnostic(`Skipping bookmark sync for unresolved slug "${slug}"`);
      continue;
    }
    try {
      await insertBookmark(userId, resourceId);
    } catch (error) {
      logHydrationDiagnostic(`Failed to push bookmark for "${slug}"`, error);
    }
  }

  for (const slug of merged.likes) {
    if (server.likes.has(slug)) continue;
    const resourceId = slugToId.get(slug);
    if (!resourceId) {
      logHydrationDiagnostic(`Skipping like sync for unresolved slug "${slug}"`);
      continue;
    }
    try {
      await insertLike(userId, resourceId);
    } catch (error) {
      logHydrationDiagnostic(`Failed to push like for "${slug}"`, error);
    }
  }

  for (const slug of merged.completed) {
    const resourceId = slugToId.get(slug);
    if (!resourceId) {
      logHydrationDiagnostic(`Skipping completed progress sync for unresolved slug "${slug}"`);
      continue;
    }
    const serverEntry = server.progress.get(slug);
    const localPercent = merged.progress[slug] ?? 100;
    const serverPercent = serverEntry?.percent ?? 0;
    if (localPercent > serverPercent || !serverEntry?.completed) {
      try {
        await upsertProgress(resourceId, Math.max(localPercent, 100), true);
      } catch (error) {
        logHydrationDiagnostic(`Failed to push completed progress for "${slug}"`, error);
        queuePendingProgressSync(slug, Math.max(localPercent, 100), true);
      }
    }
  }

  for (const [slug, percent] of Object.entries(merged.progress)) {
    if (merged.completed.includes(slug)) continue;
    const resourceId = slugToId.get(slug);
    if (!resourceId) {
      logHydrationDiagnostic(`Skipping progress sync for unresolved slug "${slug}"`);
      continue;
    }
    const serverPercent = server.progress.get(slug)?.percent ?? 0;
    if (percent > serverPercent) {
      try {
        await upsertProgress(resourceId, percent, false);
      } catch (error) {
        logHydrationDiagnostic(`Failed to push progress for "${slug}"`, error);
        queuePendingProgressSync(slug, percent, false);
      }
    }
  }
}

let lastHydratedUserId: string | null = null;

/** Hydrate library store from Supabase, merging with existing localStorage state. */
export async function hydrateLibraryState(user: User) {
  if (lastHydratedUserId === user.id) return;

  const local = useLibraryStore.getState();
  const localSnapshot: MergedLibraryState = {
    bookmarks: [...local.bookmarks],
    likes: [...local.likes],
    progress: { ...local.progress },
    completed: [...local.completed],
  };

  try {
    const server = await fetchServerLibraryState(user.id);
    const allSlugs = [
      ...new Set([
        ...localSnapshot.bookmarks,
        ...localSnapshot.likes,
        ...Object.keys(localSnapshot.progress),
        ...localSnapshot.completed,
        ...server.bookmarks.keys(),
        ...server.likes.keys(),
        ...server.progress.keys(),
      ]),
    ];
    const slugToId = await fetchResourceIdsBySlugs(allSlugs);
    const merged = mergeLibraryState(localSnapshot, server);

    await pushMergedToServer(user.id, merged, server, slugToId);
    useLibraryStore.getState().replaceState(merged);
    lastHydratedUserId = user.id;
    await retryPendingProgressSyncs(user.id);
  } catch (error) {
    console.error("Failed to hydrate GEOlibrary state", error);
    await retryPendingProgressSyncs(user.id);
  }
}

export function resetLibraryHydration() {
  lastHydratedUserId = null;
}

/** Resolve slug and sync a bookmark toggle when authenticated. */
export async function syncBookmarkToggle(userId: string, slug: string, saved: boolean) {
  const slugToId = await fetchResourceIdsBySlugs([slug]);
  const resourceId = slugToId.get(slug);
  if (!resourceId) return;
  if (saved) await insertBookmark(userId, resourceId);
  else await deleteBookmark(userId, resourceId);
  invalidateLibraryCatalogueQueries();
}

export async function syncLikeToggle(userId: string, slug: string, liked: boolean) {
  const slugToId = await fetchResourceIdsBySlugs([slug]);
  const resourceId = slugToId.get(slug);
  if (!resourceId) return;
  if (liked) await insertLike(userId, resourceId);
  else await deleteLike(userId, resourceId);
  invalidateLibraryCatalogueQueries();
}

export { syncProgressUpdate } from "./library-progress-sync";
