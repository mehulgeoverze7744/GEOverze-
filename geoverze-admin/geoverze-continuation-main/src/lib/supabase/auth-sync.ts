/**
 * Bridges Supabase Auth's session/user objects into `useAuthStore` for the
 * Admin Dashboard, and resolves the caller's role from `public.user_roles`
 * (RLS-protected, server-verified) on every session restore.
 *
 * Call `initAuthSync()` once near the app root; it is idempotent.
 */
import type { Session, User } from "@supabase/supabase-js";

import { useAuthStore, type AdminSessionUser } from "@/stores/authStore";

import { highestRole, supabase, type AppRole } from "./client";

let initialized = false;

function toSessionUser(user: User): AdminSessionUser {
  return { id: user.id, email: user.email ?? "" };
}

async function hydrateRole(user: User) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id);

  if (error) console.error("Failed to load admin role", error);

  // Bail if the session changed while this request was in flight.
  if (useAuthStore.getState().user?.id !== user.id) return;

  const roles = (data ?? []).map((row) => row.role as AppRole);
  useAuthStore.getState().setRole(highestRole(roles));
  useAuthStore.getState().setRoleChecked(true);
}

function applySession(session: Session | null) {
  const { setSession, setRole, setRoleChecked } = useAuthStore.getState();

  if (!session?.user) {
    setSession(null);
    setRole(null);
    setRoleChecked(true);
    return;
  }

  setSession(toSessionUser(session.user));
  setRoleChecked(false);
  void hydrateRole(session.user);
}

export function initAuthSync() {
  if (initialized) return;
  initialized = true;

  void supabase.auth.getSession().then(({ data, error }) => {
    if (error) console.error("Failed to restore session", error);
    applySession(data.session ?? null);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    applySession(session);
  });
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Sign out failed", error);
  useAuthStore.getState().clear();
}
