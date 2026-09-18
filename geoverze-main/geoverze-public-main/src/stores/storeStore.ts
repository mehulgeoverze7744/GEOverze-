/**
 * GEOstore shopper state.
 *
 * Wishlist syncs to Supabase when authenticated; scoped localStorage caches per user.
 * Recently viewed and recent searches remain local per scope.
 * Credit balance and ownership are server-side.
 */
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import { syncWishlistToggle } from "@/features/store/data/sync-store-wishlist";
import {
  emptyStoreSnapshot,
  getActiveStorePersistScope,
  loadStoreSnapshotForActiveScope,
  persistActiveStoreSnapshot,
  readLegacyStoreSnapshot,
  storePersistKey,
  switchStorePersistScope,
  type PersistedStoreSnapshot,
} from "@/features/store/lib/store-store-persistence";
import { useAuthStore } from "@/stores/authStore";

type PersistedStoreState = {
  wishlist: string[];
  recentlyViewed: string[];
  recentSearches: string[];
};

type StoreState = PersistedStoreState & {
  toggleWishlist: (slug: string) => void;
  removeWishlist: (slug: string) => void;
  replaceWishlist: (slugs: string[]) => void;
  view: (slug: string) => void;
  rememberSearch: (query: string) => void;
  clearRecentSearches: () => void;
  reset: () => void;
};

const MAX_RECENT_SEARCHES = 8;

function snapshotFromState(state: StoreState): PersistedStoreSnapshot {
  return {
    wishlist: state.wishlist,
    recentlyViewed: state.recentlyViewed,
    recentSearches: state.recentSearches,
  };
}

function maybeSyncWishlist(userId: string | undefined, slug: string, saved: boolean) {
  if (!userId) return;
  void syncWishlistToggle(userId, slug, saved).catch((error) =>
    console.error("GEOstore wishlist sync failed", error),
  );
}

const scopedStorage: StateStorage = {
  getItem: () => localStorage.getItem(storePersistKey(getActiveStorePersistScope())),
  setItem: (_name, value) => {
    localStorage.setItem(storePersistKey(getActiveStorePersistScope()), value);
  },
  removeItem: () => {
    localStorage.removeItem(storePersistKey(getActiveStorePersistScope()));
  },
};

export const useStoreStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...emptyStoreSnapshot,
      toggleWishlist: (slug) => {
        const wasSaved = get().wishlist.includes(slug);
        set((state) => ({
          wishlist: wasSaved
            ? state.wishlist.filter((entry) => entry !== slug)
            : [slug, ...state.wishlist],
        }));
        persistActiveStoreSnapshot(snapshotFromState(get()));
        maybeSyncWishlist(useAuthStore.getState().user?.id, slug, !wasSaved);
      },
      removeWishlist: (slug) => {
        if (!get().wishlist.includes(slug)) return;
        set((state) => ({ wishlist: state.wishlist.filter((entry) => entry !== slug) }));
        persistActiveStoreSnapshot(snapshotFromState(get()));
        maybeSyncWishlist(useAuthStore.getState().user?.id, slug, false);
      },
      replaceWishlist: (slugs) => {
        set({ wishlist: [...new Set(slugs)] });
        persistActiveStoreSnapshot(snapshotFromState(get()));
      },
      view: (slug) =>
        set((state) => ({
          recentlyViewed: [slug, ...state.recentlyViewed.filter((entry) => entry !== slug)].slice(
            0,
            8,
          ),
        })),
      rememberSearch: (query) => {
        const normalized = query.trim().replace(/\s+/g, " ");
        if (!normalized) return;
        set((state) => {
          const next = [
            normalized,
            ...state.recentSearches.filter(
              (entry) => entry.toLowerCase() !== normalized.toLowerCase(),
            ),
          ].slice(0, MAX_RECENT_SEARCHES);
          return { recentSearches: next };
        });
        persistActiveStoreSnapshot(snapshotFromState(get()));
      },
      clearRecentSearches: () => {
        set({ recentSearches: [] });
        persistActiveStoreSnapshot(snapshotFromState(get()));
      },
      reset: () => {
        set(emptyStoreSnapshot);
        persistActiveStoreSnapshot(emptyStoreSnapshot);
      },
    }),
    {
      name: "geoverze.store.scoped",
      storage: createJSONStorage(() => scopedStorage),
      partialize: (state) => ({
        wishlist: state.wishlist,
        recentlyViewed: state.recentlyViewed,
        recentSearches: state.recentSearches,
      }),
    },
  ),
);

/** Switch persisted scope and load that user's local store snapshot. */
export function activateStorePersistScope(nextScope: string) {
  const current = snapshotFromState(useStoreStore.getState());
  switchStorePersistScope(nextScope, current);

  let loaded = loadStoreSnapshotForActiveScope();
  if (
    nextScope === "anon" &&
    loaded.wishlist.length === 0 &&
    loaded.recentlyViewed.length === 0 &&
    loaded.recentSearches.length === 0
  ) {
    const legacy = readLegacyStoreSnapshot();
    if (legacy) loaded = legacy;
  }

  useStoreStore.setState({
    wishlist: loaded.wishlist,
    recentlyViewed: loaded.recentlyViewed,
    recentSearches: loaded.recentSearches,
  });
  persistActiveStoreSnapshot(loaded);
}

export const selectWishlist = (s: StoreState) => s.wishlist;
export const selectWishlistCount = (s: StoreState) => s.wishlist.length;
export const selectRecentlyViewed = (s: StoreState) => s.recentlyViewed;
export const selectRecentSearches = (s: StoreState) => s.recentSearches;

/** Lift legacy single-key wishlist into scoped anon storage once. */
function bootstrapLegacyStoreSnapshot() {
  const current = loadStoreSnapshotForActiveScope();
  if (
    current.wishlist.length > 0 ||
    current.recentlyViewed.length > 0 ||
    current.recentSearches.length > 0
  ) {
    return;
  }

  const legacy = readLegacyStoreSnapshot();
  if (
    !legacy ||
    (legacy.wishlist.length === 0 &&
      legacy.recentlyViewed.length === 0 &&
      legacy.recentSearches.length === 0)
  ) {
    return;
  }

  persistActiveStoreSnapshot(legacy);
  useStoreStore.setState({
    wishlist: legacy.wishlist,
    recentlyViewed: legacy.recentlyViewed,
    recentSearches: legacy.recentSearches,
  });
}

bootstrapLegacyStoreSnapshot();
