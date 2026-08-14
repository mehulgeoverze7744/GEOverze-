/**
 * Admin auth session state.
 *
 * Supabase Auth is the authoritative source of truth for identity; `role` is
 * resolved from `public.user_roles` on every session restore (see
 * lib/supabase/auth-sync.ts) — never trusted from anywhere else. Nothing here
 * is persisted by hand: supabase-js already persists the session, and the
 * role is re-verified against the database on every load rather than cached
 * across reloads, so a stale/tampered local value can never grant access.
 */
import { create } from "zustand";

import type { AppRole } from "@/lib/supabase/client";

export type AuthStatus = "unknown" | "signed-out" | "signed-in";

export type AdminSessionUser = {
  id: string;
  email: string;
};

type AuthState = {
  status: AuthStatus;
  user: AdminSessionUser | null;
  role: AppRole | null;
  /** True once the initial session + role lookup has resolved, so the route
   *  guard can tell "still checking" apart from "checked, not authorized". */
  roleChecked: boolean;
  setSession: (user: AdminSessionUser | null) => void;
  setRole: (role: AppRole | null) => void;
  setRoleChecked: (checked: boolean) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  status: "unknown",
  user: null,
  role: null,
  roleChecked: false,
  setSession: (user) => set({ user, status: user ? "signed-in" : "signed-out" }),
  setRole: (role) => set({ role }),
  setRoleChecked: (roleChecked) => set({ roleChecked }),
  clear: () => set({ user: null, status: "signed-out", role: null, roleChecked: true }),
}));

export const selectIsSignedIn = (s: AuthState) => s.status === "signed-in";
export const selectUser = (s: AuthState) => s.user;
export const selectRole = (s: AuthState) => s.role;
