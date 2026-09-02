/**
 * Bridges Supabase Auth's session/user objects into `useAuthStore`.
 *
 * This is the only module that reads `supabase.auth` directly for session
 * state — every screen keeps reading `useAuthStore` as before. Call
 * `initAuthSync()` once near the app root; it is idempotent so remounts
 * (React StrictMode, HMR) never register a second listener.
 *
 * Phase 2B: also hydrates onboarding and preferences stores from
 * `profile_preferences` on every sign-in so localStorage becomes a
 * DB-backed cache rather than the source of truth.
 *
 * Phase 2C: hydrates progressionStore from `user_progression` so the player
 * snapshot shows real XP, level, credits, and streak data.
 */
import type { QueryClient } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";

import type { SkillLevelId } from "@/features/auth/data/onboarding";
import { getLevelTitle, getXpProgress } from "@/features/progression/lib/progress";
import { useAuthStore, type SessionUser } from "@/stores/authStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import {
  usePreferencesStore,
  type MotionPreference,
  type ToggleKey,
  type UnitSystem,
} from "@/stores/preferencesStore";
import { useProgressionStore } from "@/stores/progressionStore";

import { registerProgressSyncFlush } from "@/features/library/data/library-progress-sync";
import {
  hydrateLibraryState,
  resetLibraryHydration,
} from "@/features/library/data/sync-library-state";
import {
  libraryAuthScope,
  registerLibraryQueryClient,
  resetLibrarySubscriptionTierTracking,
  syncLibraryQueryScope,
} from "@/features/library/lib/library-query-scope";
import { activateLibraryPersistScope } from "@/stores/libraryStore";

import { highestRole, supabase, type AppRole } from "./client";

let initialized = false;

function baseSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    email: user.email ?? "",
  };
}

/**
 * Best-effort progression hydration. Fetches user_progression and seeds
 * progressionStore so XP, level, credits and streaks show real values.
 * Never throws — auth must not break if this fails.
 */
async function hydrateProgression(user: User) {
  const { data, error } = await supabase
    .from("user_progression")
    .select(
      "xp, level, credits, total_quizzes, total_correct, total_answered, current_streak, longest_streak",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load progression", error);
    return;
  }

  if (!data) return; // No row yet — placeholder store values remain

  if (useAuthStore.getState().user?.id !== user.id) return;

  const accuracy =
    data.total_answered > 0
      ? Math.round((data.total_correct / data.total_answered) * 1000) / 10
      : 0;

  const { xpIntoLevel, xpForLevel } = getXpProgress(data.xp, data.level);

  useProgressionStore.getState().setPlayer({
    level: data.level,
    levelTitle: getLevelTitle(data.level),
    xp: data.xp,
    xpIntoLevel,
    xpForLevel,
    credits: data.credits,
    monthlyGoal: 100,
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    accuracy,
    totalQuizzes: data.total_quizzes,
    // Phase 3: derived from quiz_attempts geography tagging
    countriesExplored: 0,
    countriesTotal: 195,
    favoriteCategory: "",
  });
}

/** Best-effort preferences hydration. Never throws. */
async function hydratePreferences(user: User) {
  const { data, error } = await supabase
    .from("profile_preferences")
    .select("interests, skill_level, locale, motion_pref, units_pref, toggles")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load preferences", error);
    return;
  }

  if (!data) return; // No row yet — first-time user, localStorage defaults remain

  // Bail if the user changed while this was in flight.
  if (useAuthStore.getState().user?.id !== user.id) return;

  const onboarding = useOnboardingStore.getState();
  const prefs = usePreferencesStore.getState();

  if (data.interests) {
    useOnboardingStore.setState({ interests: data.interests });
  }
  if (data.skill_level) {
    onboarding.setSkillLevel(data.skill_level as SkillLevelId);
  }
  if (data.locale) prefs.setLocale(data.locale);
  if (data.motion_pref) prefs.setMotion(data.motion_pref as MotionPreference);
  if (data.units_pref) prefs.setUnits(data.units_pref as UnitSystem);
  if (data.toggles && typeof data.toggles === "object" && !Array.isArray(data.toggles)) {
    for (const [key, value] of Object.entries(data.toggles as Record<string, unknown>)) {
      if (typeof value === "boolean") {
        prefs.setToggle(key as ToggleKey, value);
      }
    }
  }
}

/** Best-effort profile + role fetch. Never throws — auth must not break if this fails. */
async function hydrateProfileAndRole(user: User) {
  const [{ data: profile, error: profileError }, { data: roleRows, error: roleError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("username, display_name, country_code, avatar_id")
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
    ...(profile?.avatar_id ? { avatarId: profile.avatar_id } : {}),
  });

  const roles = (roleRows ?? []).map((row) => row.role as AppRole);
  setRole(highestRole(roles));

  // Hydrate preferences after profile is resolved (non-blocking).
  void hydratePreferences(user);
  // Hydrate progression after profile is resolved (non-blocking).
  void hydrateProgression(user);
  // Hydrate GEOlibrary bookmarks/progress/likes (non-blocking).
  void hydrateLibraryState(user);
}

function applySession(session: Session | null) {
  const prevScope = libraryAuthScope(useAuthStore.getState().user?.id);
  const nextScope = libraryAuthScope(session?.user?.id);

  syncLibraryQueryScope(nextScope);

  if (nextScope !== prevScope) {
    activateLibraryPersistScope(nextScope);
    resetLibraryHydration();
    resetLibrarySubscriptionTierTracking();
  }

  const { setSession, setRole } = useAuthStore.getState();

  if (!session?.user) {
    setSession(null);
    setRole(null);
    return;
  }

  setSession(baseSessionUser(session.user));
  void hydrateProfileAndRole(session.user);
}

export function initAuthSync(queryClient?: QueryClient) {
  if (queryClient) {
    registerLibraryQueryClient(queryClient);
  }
  if (initialized) return;
  initialized = true;

  registerProgressSyncFlush();

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

/** Re-fetch user_progression into progressionStore (e.g. after PvP reward settlement). */
export async function refreshProgression(userId: string) {
  const sessionUser = useAuthStore.getState().user;
  if (!sessionUser || sessionUser.id !== userId) return;
  await hydrateProgression({ id: userId, email: sessionUser.email } as User);
}
