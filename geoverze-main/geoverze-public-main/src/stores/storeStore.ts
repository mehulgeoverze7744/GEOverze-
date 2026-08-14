/**
 * GEOstore shopper state.
 *
 * Wishlist, recently viewed, unlocked items, spent credits and the order
 * ledger. Persisted locally; a future backend will hydrate the same shape.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { SEED_ORDERS, type Order } from "@/features/store/data/orders";

type StoreState = {
  wishlist: string[];
  recentlyViewed: string[];
  /** Slugs of digital products and rewards already unlocked. */
  owned: string[];
  /** Credits spent through the store this month. */
  creditsSpent: number;
  orders: Order[];
  toggleWishlist: (slug: string) => void;
  removeWishlist: (slug: string) => void;
  view: (slug: string) => void;
  unlock: (slugs: string[]) => void;
  spendCredits: (amount: number) => void;
  addOrder: (order: Order) => void;
  reset: () => void;
};

export const useStoreStore = create<StoreState>()(
  persist(
    (set) => ({
      wishlist: [],
      recentlyViewed: [],
      owned: [],
      creditsSpent: 0,
      orders: [...SEED_ORDERS],
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
      unlock: (slugs) => set((s) => ({ owned: [...new Set([...slugs, ...s.owned])] })),
      spendCredits: (amount) =>
        set((s) => ({ creditsSpent: s.creditsSpent + Math.max(0, amount) })),
      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
      reset: () =>
        set({
          wishlist: [],
          recentlyViewed: [],
          owned: [],
          creditsSpent: 0,
          orders: [...SEED_ORDERS],
        }),
    }),
    { name: "geoverze.store", version: 1 },
  ),
);

export const selectWishlist = (s: StoreState) => s.wishlist;
export const selectRecentlyViewed = (s: StoreState) => s.recentlyViewed;
export const selectOwned = (s: StoreState) => s.owned;
export const selectOrders = (s: StoreState) => s.orders;
export const selectCreditsSpent = (s: StoreState) => s.creditsSpent;
