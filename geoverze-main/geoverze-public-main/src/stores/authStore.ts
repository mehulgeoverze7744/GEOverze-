/**
 * Auth session state.
 *
 * Supabase Auth is the authoritative source of truth for whether someone is
 * signed in; this store is a read-only mirror kept in sync by
 * `src/lib/supabase/auth-sync.ts` so the rest of the app can keep reading
 * `useAuthStore` exactly as it always has. Nothing here is persisted by hand —
 * supabase-js already persists the session (see lib/supabase/client.ts) and
 * re-hydrating from a second, separate copy in localStorage would let the two
 * disagree after a sign-out or token refresh.
 */
import { create } from "zustand";

import type { AppRole } from "@/lib/supabase/client";

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
  /** Highest role held by the current user, resolved from public.user_roles. */
  role: AppRole | null;
  setSession: (user: SessionUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  setRole: (role: AppRole | null) => void;
  /** Local-only reset. Does not call Supabase — use the `signOut` action for that. */
  clear: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  status: "unknown",
  user: null,
  role: null,
  setSession: (user) => set({ user, status: user ? "signed-in" : "signed-out" }),
  setStatus: (status) => set({ status }),
  setRole: (role) => set({ role }),
  clear: () => set({ user: null, status: "signed-out", role: null }),
}));

/** Narrow selectors — subscribe to a slice, never the whole store. */
export const selectIsSignedIn = (s: AuthState) => s.status === "signed-in";
export const selectUser = (s: AuthState) => s.user;
export const selectRole = (s: AuthState) => s.role;
