/**
 * GEOstore shopper state.
 *
 * Wishlist and recently viewed remain local. Credit balance, ownership, and
 * purchase history are server-authoritative (PAY-1e).
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

type PersistedStoreState = {
  wishlist: string[];
  recentlyViewed: string[];
};

type StoreState = PersistedStoreState & {
  toggleWishlist: (slug: string) => void;
  removeWishlist: (slug: string) => void;
  view: (slug: string) => void;
  reset: () => void;
};

const EMPTY: PersistedStoreState = {
  wishlist: [],
  recentlyViewed: [],
};

export const useStoreStore = create<StoreState>()(
  persist(
    (set) => ({
      ...EMPTY,
      toggleWishlist: (slug) =>
        set((s) => ({
          wishlist: s.wishlist.includes(slug)
            ? s.wishlist.filter((x) => x !== slug)
            : [slug, ...s.wishlist],
        })),
      removeWishlist: (slug) => set((s) => ({ wishlist: s.wishlist.filter((x) => x !== slug) })),
      view: (slug) =>
        set((s) => ({
          recentlyViewed: [slug, ...s.recentlyViewed.filter((x) => x !== slug)].slice(0, 8),
        })),
      reset: () => set({ ...EMPTY }),
    }),
    {
      name: "geoverze.store",
      version: 2,
      migrate: (persisted, version) => {
        if (version < 2 && persisted && typeof persisted === "object") {
          const state = persisted as Partial<PersistedStoreState>;
          return {
            wishlist: Array.isArray(state.wishlist) ? state.wishlist : [],
            recentlyViewed: Array.isArray(state.recentlyViewed) ? state.recentlyViewed : [],
          };
        }
        return persisted as PersistedStoreState;
      },
      partialize: (state) => ({
        wishlist: state.wishlist,
        recentlyViewed: state.recentlyViewed,
      }),
    },
  ),
);

export const selectWishlist = (s: StoreState) => s.wishlist;
export const selectRecentlyViewed = (s: StoreState) => s.recentlyViewed;
