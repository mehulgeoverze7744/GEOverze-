/**
 * Auth session state.
 *
 * There is still no auth backend. `signInAsDemo` is the single seam that a real
 * session replaces — every auth screen goes through it, so nothing else in the
 * app needs to change when Lovable Cloud is enabled.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthStatus = "unknown" | "signed-out" | "signed-in";

export type SessionUser = {
  id: string;
  email: string;
  displayName?: string;
  username?: string;
  country?: string;
  avatarId?: string;
};

type AuthState = {
  status: AuthStatus;
  user: SessionUser | null;
  setSession: (user: SessionUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  /** Frontend-only stand-in for a real sign-in. Replaced in the backend phase. */
  signInAsDemo: (user: Omit<SessionUser, "id"> & { id?: string }) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      status: "unknown",
      user: null,
      setSession: (user) => set({ user, status: user ? "signed-in" : "signed-out" }),
      setStatus: (status) => set({ status }),
      signInAsDemo: ({ id, ...rest }) =>
        set({
          user: { id: id ?? `demo-${rest.email.toLowerCase()}`, ...rest },
          status: "signed-in",
        }),
      clear: () => set({ user: null, status: "signed-out" }),
    }),
    {
      name: "geoverze.session",
      partialize: (state) => ({ status: state.status, user: state.user }),
    },
  ),
);

/** Narrow selectors — subscribe to a slice, never the whole store. */
export const selectIsSignedIn = (s: AuthState) => s.status === "signed-in";
export const selectUser = (s: AuthState) => s.user;
