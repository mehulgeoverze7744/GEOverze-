/**
 * Editable profile fields.
 *
 * Identity that already exists elsewhere (email, avatar, interests, skill
 * level) stays in the session and onboarding stores — this store only holds
 * what the profile editor owns, plus the local join date so the profile has a
 * stable "member since" without a backend.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProfileState = {
  displayName: string | null;
  username: string | null;
  bio: string | null;
  country: string | null;
  /** ISO date string, set the first time the profile is read. */
  joinedAt: string | null;
  update: (patch: Partial<Omit<ProfileState, "update" | "ensureJoinDate" | "reset">>) => void;
  ensureJoinDate: () => void;
  reset: () => void;
};

const initial = {
  displayName: null,
  username: null,
  bio: null,
  country: null,
  joinedAt: null,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...initial,
      update: (patch) => set(patch),
      ensureJoinDate: () => {
        if (!get().joinedAt) set({ joinedAt: new Date().toISOString() });
      },
      reset: () => set({ ...initial }),
    }),
    { name: "geoverze.profile" },
  ),
);
