/**
 * Bridges Supabase Auth's session/user objects into `useAuthStore`.
 *
 * This is the only module that reads `supabase.auth` directly for session
 * state — every screen keeps reading `useAuthStore` as before. Call
 * `initAuthSync()` once near the app root; it is idempotent so remounts
 * (React StrictMode, HMR) never register a second listener.
 */
import type { Session, User } from "@supabase/supabase-js";

import { useAuthStore, type SessionUser } from "@/stores/authStore";

import { highestRole, supabase, type AppRole } from "./client";

let initialized = false;

function baseSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    email: user.email ?? "",
  };
}

/** Best-effort profile + role fetch. Never throws — auth must not break if this fails. */
async function hydrateProfileAndRole(user: User) {
  const [{ data: profile, error: profileError }, { data: roleRows, error: roleError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("username, display_name, country_code")
        .eq("id", user.id)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
    ]);

  if (profileError) console.error("Failed to load profile", profileError);
  if (roleError) console.error("Failed to load roles", roleError);

  const { setSession, setRole, user: current } = useAuthStore.getState();

  // Bail if the user has since signed out or switched accounts while this
  // request was in flight.
  if (useAuthStore.getState().user?.id !== user.id) return;

  setSession({
    ...(current?.id === user.id ? current : baseSessionUser(user)),
    id: user.id,
    email: user.email ?? "",
    ...(profile?.display_name ? { displayName: profile.display_name } : {}),
    ...(profile?.username ? { username: profile.username } : {}),
    ...(profile?.country_code ? { country: profile.country_code } : {}),
  });

  const roles = (roleRows ?? []).map((row) => row.role as AppRole);
  setRole(highestRole(roles));
}

function applySession(session: Session | null) {
  const { setSession, setRole } = useAuthStore.getState();

  if (!session?.user) {
    setSession(null);
    setRole(null);
    return;
  }

  setSession(baseSessionUser(session.user));
  void hydrateProfileAndRole(session.user);
}

export function initAuthSync() {
  if (initialized) return;
  initialized = true;

  useAuthStore.getState().setStatus("unknown");

  void supabase.auth.getSession().then(({ data, error }) => {
    if (error) console.error("Failed to restore session", error);
    applySession(data.session ?? null);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    applySession(session);
  });
}

/** Signs out of Supabase and clears the local mirror. Use this, not store.clear(), for user-initiated logout. */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Sign out failed", error);
  useAuthStore.getState().clear();
}
