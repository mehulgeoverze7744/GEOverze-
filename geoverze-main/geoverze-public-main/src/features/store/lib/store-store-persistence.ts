export type PersistedStoreSnapshot = {
  wishlist: string[];
  recentlyViewed: string[];
};

const STORAGE_PREFIX = "geoverze.store.v2";

const EMPTY_SNAPSHOT: PersistedStoreSnapshot = {
  wishlist: [],
  recentlyViewed: [],
};

export function storePersistKey(scope: string) {
  return `${STORAGE_PREFIX}.${scope}`;
}

let activeScope = "anon";

export function getActiveStorePersistScope() {
  return activeScope;
}

function readPersistedSnapshot(scope: string): PersistedStoreSnapshot | null {
  try {
    const raw = localStorage.getItem(storePersistKey(scope));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: PersistedStoreSnapshot };
    const state = parsed.state ?? (parsed as unknown as PersistedStoreSnapshot);
    if (!state || typeof state !== "object") return null;
    return {
      wishlist: Array.isArray(state.wishlist) ? state.wishlist : [],
      recentlyViewed: Array.isArray(state.recentlyViewed) ? state.recentlyViewed : [],
    };
  } catch {
    return null;
  }
}

function writePersistedSnapshot(scope: string, snapshot: PersistedStoreSnapshot) {
  localStorage.setItem(
    storePersistKey(scope),
    JSON.stringify({
      state: snapshot,
      version: 2,
    }),
  );
}

/** Persist in-memory store fields under the active scope key. */
export function persistActiveStoreSnapshot(snapshot: PersistedStoreSnapshot) {
  writePersistedSnapshot(activeScope, snapshot);
}

/**
 * Switch persisted store scope without merging unrelated users.
 * Outgoing scope is flushed; incoming scope is loaded or reset to empty.
 */
export function switchStorePersistScope(nextScope: string, snapshot?: PersistedStoreSnapshot) {
  if (activeScope === nextScope) return;

  if (snapshot) {
    writePersistedSnapshot(activeScope, snapshot);
  }

  activeScope = nextScope;
}

export function loadStoreSnapshotForActiveScope(): PersistedStoreSnapshot {
  return readPersistedSnapshot(activeScope) ?? EMPTY_SNAPSHOT;
}

/** One-time lift from legacy single-key storage into the anon scope. */
export function readLegacyStoreSnapshot(): PersistedStoreSnapshot | null {
  try {
    const raw = localStorage.getItem("geoverze.store");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: PersistedStoreSnapshot };
    const state = parsed.state ?? (parsed as unknown as PersistedStoreSnapshot);
    if (!state || typeof state !== "object") return null;
    return {
      wishlist: Array.isArray(state.wishlist) ? state.wishlist : [],
      recentlyViewed: Array.isArray(state.recentlyViewed) ? state.recentlyViewed : [],
    };
  } catch {
    return null;
  }
}

export { EMPTY_SNAPSHOT as emptyStoreSnapshot };
