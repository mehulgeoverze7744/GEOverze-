import type { MergedLibraryState } from "@/features/library/data/sync-library-state";

const STORAGE_PREFIX = "geoverze.library.v1";

const EMPTY_STATE: MergedLibraryState = {
  bookmarks: [],
  likes: [],
  progress: {},
  completed: [],
};

export function libraryPersistKey(scope: string) {
  return `${STORAGE_PREFIX}.${scope}`;
}

let activeScope = "anon";

export function getActiveLibraryPersistScope() {
  return activeScope;
}

function readPersistedState(scope: string): MergedLibraryState | null {
  try {
    const raw = localStorage.getItem(libraryPersistKey(scope));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: MergedLibraryState };
    const state = parsed.state ?? (parsed as unknown as MergedLibraryState);
    if (!state || typeof state !== "object") return null;
    return {
      bookmarks: Array.isArray(state.bookmarks) ? state.bookmarks : [],
      likes: Array.isArray(state.likes) ? state.likes : [],
      progress: state.progress && typeof state.progress === "object" ? state.progress : {},
      completed: Array.isArray(state.completed) ? state.completed : [],
    };
  } catch {
    return null;
  }
}

function writePersistedState(scope: string, state: MergedLibraryState) {
  localStorage.setItem(
    libraryPersistKey(scope),
    JSON.stringify({
      state,
      version: 0,
    }),
  );
}

/** Persist in-memory library fields under the active scope key. */
export function persistActiveLibraryState(state: MergedLibraryState) {
  writePersistedState(activeScope, state);
}

/**
 * Switch persisted library scope without merging unrelated users.
 * Outgoing scope is flushed; incoming scope is loaded or reset to empty.
 */
export function switchLibraryPersistScope(nextScope: string, snapshot?: MergedLibraryState) {
  if (activeScope === nextScope) return;

  if (snapshot) {
    writePersistedState(activeScope, snapshot);
  }

  activeScope = nextScope;
}

export function loadLibraryStateForActiveScope(): MergedLibraryState {
  return readPersistedState(activeScope) ?? EMPTY_STATE;
}

export { EMPTY_STATE as emptyLibraryState };
