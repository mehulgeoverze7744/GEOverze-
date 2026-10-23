/**
 * Cache of the signed-in user's `public.profiles` row.
 *
 * Fields are scoped by `ownerId` (the Supabase user id). A persisted cache is
 * shown only for that account. Email, auth status, and role stay in the
 * session store.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ProfileLoadStatus } from "@/features/profile/lib/profileIdentity";
import { createBrandStateStorage, GVRZE_PERSIST_NAMES } from "@/lib/persist-key-migration";

export type ProfileData = {
  ownerId: string | null;
  displayName: string | null;
  username: string | null;
  bio: string | null;
  country: string | null;
  /** ISO date string from `profiles.created_at` when the server has one. */
  joinedAt: string | null;
  avatarId: string | null;
  avatarUrl: string | null;
  /** True once a profile row has been applied for `ownerId`. */
  loaded: boolean;
  status: ProfileLoadStatus;
  loadError: string | null;
};

type ProfileState = ProfileData & {
  update: (patch: Partial<ProfileData>) => void;
  ensureJoinDate: () => void;
  reset: () => void;
};

const initial: ProfileData = {
  ownerId: null,
  displayName: null,
  username: null,
  bio: null,
  country: null,
  joinedAt: null,
  avatarId: null,
  avatarUrl: null,
  loaded: false,
  status: "idle",
  loadError: null,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...initial,
      update: (patch) => set(patch),
      ensureJoinDate: () => {
        if (!get().ownerId || get().joinedAt) return;
        set({ joinedAt: new Date().toISOString() });
      },
      reset: () => set({ ...initial }),
    }),
    {
      name: GVRZE_PERSIST_NAMES.profile,
      storage: createJSONStorage(() => createBrandStateStorage()),
      partialize: (state) => ({
        ownerId: state.ownerId,
        displayName: state.displayName,
        username: state.username,
        bio: state.bio,
        country: state.country,
        joinedAt: state.joinedAt,
        avatarId: state.avatarId,
        avatarUrl: state.avatarUrl,
        loaded: state.loaded,
      }),
      merge: (persisted, current) => {
        if (current.loaded && current.ownerId) return current;
        return {
          ...current,
          ...(persisted as Partial<ProfileData>),
          status: "idle" as const,
          loadError: null,
        };
      },
    },
  ),
);
