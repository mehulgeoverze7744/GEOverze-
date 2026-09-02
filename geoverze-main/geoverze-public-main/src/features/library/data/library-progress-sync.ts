import { useAuthStore } from "@/stores/authStore";

import { fetchResourceIdsBySlugs, upsertProgress } from "./user-library-state";

type PendingProgressSync = {
  percent: number;
  completed: boolean;
};

const pendingProgressSyncs = new Map<string, PendingProgressSync>();

function logProgressSyncDiagnostic(message: string, detail?: unknown) {
  if (import.meta.env.DEV) {
    console.warn(`[GEOlibrary progress] ${message}`, detail ?? "");
  }
}

export function queuePendingProgressSync(slug: string, percent: number, completed: boolean) {
  pendingProgressSyncs.set(slug, { percent, completed });
}

/** Best-effort progress sync with catalogue slug resolution and local retention on failure. */
export async function syncProgressUpdate(
  userId: string,
  slug: string,
  percent: number,
  completed = false,
): Promise<boolean> {
  void userId;

  try {
    const slugToId = await fetchResourceIdsBySlugs([slug]);
    const resourceId = slugToId.get(slug);
    if (!resourceId) {
      logProgressSyncDiagnostic(
        `Could not resolve slug "${slug}" in catalogue; local progress retained`,
      );
      pendingProgressSyncs.set(slug, { percent, completed });
      return false;
    }

    await upsertProgress(resourceId, percent, completed);
    pendingProgressSyncs.delete(slug);
    return true;
  } catch (error) {
    logProgressSyncDiagnostic(`Failed to sync progress for "${slug}"`, error);
    pendingProgressSyncs.set(slug, { percent, completed });
    return false;
  }
}

/** Retry any progress writes that failed or could not resolve earlier. */
export async function retryPendingProgressSyncs(userId: string): Promise<void> {
  if (pendingProgressSyncs.size === 0) return;

  const pending = [...pendingProgressSyncs.entries()];
  for (const [slug, entry] of pending) {
    await syncProgressUpdate(userId, slug, entry.percent, entry.completed);
  }
}

export function hasPendingProgressSyncs() {
  return pendingProgressSyncs.size > 0;
}

let flushRegistered = false;

/** Flush pending progress sync when the tab hides or the page unloads. */
export function registerProgressSyncFlush() {
  if (flushRegistered || typeof window === "undefined") return;
  flushRegistered = true;

  const flush = () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId || pendingProgressSyncs.size === 0) return;
    void retryPendingProgressSyncs(userId);
  };

  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}
