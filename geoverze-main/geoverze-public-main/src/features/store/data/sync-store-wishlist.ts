import type { User } from "@supabase/supabase-js";

import { useAuthStore } from "@/stores/authStore";
import { useStoreStore } from "@/stores/storeStore";

import { deleteWishlistItem, fetchServerWishlist, insertWishlistItem } from "./user-store-wishlist";

/** Union local + server slugs, preserving server order then local-only additions. */
export function mergeWishlist(local: string[], server: string[]): string[] {
  const merged = [...server];
  for (const slug of local) {
    if (!merged.includes(slug)) merged.unshift(slug);
  }
  return merged;
}

let lastHydratedUserId: string | null = null;

/** Hydrate store wishlist from Supabase, merging with scoped localStorage. */
export async function hydrateStoreWishlist(user: User) {
  if (lastHydratedUserId === user.id) return;

  const local = [...useStoreStore.getState().wishlist];

  try {
    const server = await fetchServerWishlist(user.id);
    const merged = mergeWishlist(local, server);

    for (const slug of merged) {
      if (server.includes(slug)) continue;
      try {
        await insertWishlistItem(user.id, slug);
      } catch (error) {
        console.error(`Failed to push wishlist item "${slug}"`, error);
      }
    }

    if (authUserStill(user.id)) {
      useStoreStore.getState().replaceWishlist(merged);
      lastHydratedUserId = user.id;
    }
  } catch (error) {
    console.error("Failed to hydrate GEOstore wishlist", error);
  }
}

function authUserStill(userId: string) {
  return useAuthStore.getState().user?.id === userId;
}

export function resetStoreWishlistHydration() {
  lastHydratedUserId = null;
}

/** Sync a wishlist toggle to Supabase when authenticated. */
export async function syncWishlistToggle(userId: string, slug: string, saved: boolean) {
  if (saved) await insertWishlistItem(userId, slug);
  else await deleteWishlistItem(userId, slug);
}
