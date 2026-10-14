/**
 * Dual-read persistence for the GVRZE key rename.
 *
 * New writes go to `gvrze.*` (or `gvrze-admin-theme`). Reads prefer that key
 * and copy valid legacy `geoverze.*` data only when the new key is absent.
 * Legacy keys are never deleted here.
 */

export type PersistLikeStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem?: (key: string) => void;
};

const GEOVERZE_DOT = "geoverze.";
const GVRZE_DOT = "gvrze.";

export const ADMIN_THEME_NEXT_KEY = "gvrze-admin-theme";
export const ADMIN_THEME_LEGACY_KEY = "geoverze-admin-theme";
export const QUIZ_RESULT_NEXT_KEY = "gvrze.quiz.lastResult";
export const QUIZ_RESULT_LEGACY_KEY = "geoVerze.quiz.lastResult";

/** Confirmed Zustand persist names after migration. */
export const GVRZE_PERSIST_NAMES = {
  cart: "gvrze.cart",
  bookmarks: "gvrze.bookmarks",
  preferences: "gvrze.preferences",
  profile: "gvrze.profile",
  onboarding: "gvrze.onboarding",
  community: "gvrze.community",
  studio: "gvrze.studio",
  library: "gvrze.library",
  storeScoped: "gvrze.store.scoped",
} as const;

export function toGvrzePersistKey(legacyKey: string): string {
  if (legacyKey === ADMIN_THEME_LEGACY_KEY) return ADMIN_THEME_NEXT_KEY;
  if (legacyKey === QUIZ_RESULT_LEGACY_KEY) return QUIZ_RESULT_NEXT_KEY;
  if (legacyKey.startsWith(GEOVERZE_DOT)) {
    return `${GVRZE_DOT}${legacyKey.slice(GEOVERZE_DOT.length)}`;
  }
  return legacyKey;
}

export function toLegacyPersistKey(nextKey: string): string | null {
  if (nextKey === ADMIN_THEME_NEXT_KEY) return ADMIN_THEME_LEGACY_KEY;
  if (nextKey === QUIZ_RESULT_NEXT_KEY) return QUIZ_RESULT_LEGACY_KEY;
  if (nextKey.startsWith(GVRZE_DOT)) {
    return `${GEOVERZE_DOT}${nextKey.slice(GVRZE_DOT.length)}`;
  }
  return null;
}

export function isUsablePersistedValue(raw: string | null | undefined): raw is string {
  if (raw == null) return false;
  const trimmed = raw.trim();
  return trimmed !== "" && trimmed !== "undefined" && trimmed !== "null";
}

/** True when a key is occupied, even if the payload cannot be parsed. */
export function isOccupiedPersistSlot(raw: string | null | undefined): boolean {
  return raw != null && raw.trim() !== "";
}

export function isParseablePersistedJson(raw: string): boolean {
  try {
    JSON.parse(raw);
    return true;
  } catch {
    return false;
  }
}

function safeGet(storage: PersistLikeStorage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: PersistLikeStorage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    // Quota / private mode — hydration can still proceed from the returned value.
  }
}

/**
 * Prefer `nextKey`. If it is absent, copy a valid legacy value onto `nextKey`
 * and return it. A present-but-malformed primary is never replaced by legacy.
 */
export function readMigratingValue(storage: PersistLikeStorage, nextKey: string): string | null {
  const primary = safeGet(storage, nextKey);
  if (isOccupiedPersistSlot(primary)) {
    if (isUsablePersistedValue(primary) && isParseablePersistedJson(primary)) return primary;
    return null;
  }

  const legacyKey = toLegacyPersistKey(nextKey);
  if (!legacyKey) return null;

  const fallback = safeGet(storage, legacyKey);
  if (!isUsablePersistedValue(fallback) || !isParseablePersistedJson(fallback)) return null;

  safeSet(storage, nextKey, fallback);
  return fallback;
}

export function writePrimaryValue(storage: PersistLikeStorage, nextKey: string, value: string) {
  safeSet(storage, nextKey, value);
}

export function createBrandStateStorage(backend?: PersistLikeStorage): {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
} {
  const storage: PersistLikeStorage | undefined =
    backend ?? (typeof localStorage === "undefined" ? undefined : localStorage);

  return {
    getItem: (name) => {
      if (!storage) return null;
      return readMigratingValue(storage, name);
    },
    setItem: (name, value) => {
      if (!storage) return;
      writePrimaryValue(storage, name, value);
    },
    removeItem: (name) => {
      if (!storage?.removeItem) return;
      try {
        storage.removeItem(name);
      } catch {
        // Ignore; legacy keys stay until a later cleanup release.
      }
    },
  };
}
