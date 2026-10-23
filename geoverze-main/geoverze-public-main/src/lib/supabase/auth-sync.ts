/**
 * Bridges Supabase Auth's session/user objects into `useAuthStore`.
 *
 * This is the only module that reads `supabase.auth` directly for session
 * state — every screen keeps reading `useAuthStore` as before. Call
 * `initAuthSync()` once near the app root. It returns a cleanup. Remounts
 * (React StrictMode) unsubscribe the previous listener before subscribing
 * again, so listeners do not accumulate.
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
import { calendarDateInZone, liveCurrentStreak } from "@/features/progression/lib/streakStats";
import { decideAuthTransition } from "@/lib/supabase/authLifecycle";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import {
  isToggleKey,
  usePreferencesStore,
  type MotionPreference,
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
import { notificationSeeds } from "@/features/profile/data/notifications";
import {
  PROFILE_LOAD_ERROR,
  canonicalProfileFromRow,
  currentProfileEpoch,
  retainSessionIdentity,
  sessionIdentityFromProfile,
  shouldApplyProfilePayload,
  shouldStartProfileHydration,
} from "@/features/profile/lib/profileIdentity";
import {
  hydrateStoreWishlist,
  resetStoreWishlistHydration,
} from "@/features/store/data/sync-store-wishlist";
import { mergeLibraryStoreFromDisk } from "@/features/library/lib/merge-library-store-from-disk";
import { activateLibraryPersistScope } from "@/stores/libraryStore";
import { useNotificationsStore } from "@/stores/notificationsStore";
import { useProfileStore } from "@/stores/profileStore";
import { activateStorePersistScope } from "@/stores/storeStore";

import { highestRole, supabase, type AppRole } from "./client";

let initialized = false;
let appQueryClient: QueryClient | null = null;
let hydrateToken = 0;
let inFlightUserId: string | null = null;

/**
 * Best-effort progression hydration. Fetches user_progression and seeds
 * progressionStore so XP, level, credits and streaks show real values.
 * Never throws — auth must not break if this fails.
 */
async function hydrateProgression(user: User) {
  const { data, error } = await supabase
    .from("user_progression")
    .select(
      "xp, level, credits, total_quizzes, total_correct, total_answered, current_streak, longest_streak, last_played_date",
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
    currentStreak: liveCurrentStreak(
      data.current_streak,
      data.last_played_date,
      calendarDateInZone(new Date()),
    ),
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
      if (typeof value === "boolean" && isToggleKey(key)) {
        prefs.setToggle(key, value);
      }
    }
  }
}

/** Best-effort profile + role fetch. Never throws — auth must not break if this fails. */
async function hydrateProfileAndRole(user: User, event: string) {
  const cache = useProfileStore.getState();
  if (
    !shouldStartProfileHydration({
      event,
      userId: user.id,
      inFlightUserId,
      profileRequestFailed: cache.ownerId === user.id && cache.status === "error",
    })
  ) {
    return;
  }

  const requestEpoch = currentProfileEpoch();
  const token = ++hydrateToken;
  inFlightUserId = user.id;

  try {
    const [{ data: profile, error: profileError }, { data: roleRows, error: roleError }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select(
            "username, display_name, bio, country_code, avatar_id, avatar_url, created_at",
          )
          .eq("id", user.id)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);

    if (token !== hydrateToken) return;
    if (
      !shouldApplyProfilePayload({
        requestUserId: user.id,
        activeUserId: useAuthStore.getState().user?.id ?? null,
        requestEpoch,
        currentEpoch: currentProfileEpoch(),
      })
    ) {
      return;
    }

    if (roleError) console.error("Failed to load roles", roleError);
    const roles = (roleRows ?? []).map((row) => row.role as AppRole);
    useAuthStore.getState().setRole(highestRole(roles));

    if (profileError) {
      console.error("Failed to load profile", profileError);
      // A failed profile read is not a signed-out session.
      const currentCache = useProfileStore.getState();
      if (currentCache.ownerId !== user.id) useProfileStore.getState().reset();
      useProfileStore.getState().update({
        ownerId: user.id,
        status: "error",
        loadError: PROFILE_LOAD_ERROR,
      });
    } else {
      const previous = useProfileStore.getState();
      const canonical = canonicalProfileFromRow(
        user.id,
        profile
          ? {
              display_name: profile.display_name,
              username: profile.username,
              bio: profile.bio,
              country_code: profile.country_code,
              avatar_id: profile.avatar_id,
              avatar_url: profile.avatar_url,
              created_at: profile.created_at,
            }
          : null,
        previous.ownerId === user.id ? previous.joinedAt : null,
      );
      useProfileStore.getState().update(canonical);
      const email = useAuthStore.getState().user?.email || user.email || "";
      useAuthStore.getState().setSession(sessionIdentityFromProfile({ id: user.id, email }, canonical));
    }

    // Hydrate the rest of the signed-in mirrors after the profile attempt.
    void hydratePreferences(user);
    void hydrateProgression(user);
    void hydrateLibraryState(user);
    void hydrateStoreWishlist(user);
  } finally {
    if (token === hydrateToken) inFlightUserId = null;
  }
}

function syncNotifications(userId: string | null) {
  const { syncForUser, seed } = useNotificationsStore.getState();
  syncForUser(userId);
  if (userId) seed(notificationSeeds());
}

function storeAuthScope(userId: string | null | undefined) {
  return userId ?? "anon";
}

function applyScope(previousUserId: string | null | undefined, nextUserId: string | null | undefined) {
  const prevScope = libraryAuthScope(previousUserId);
  const nextScope = libraryAuthScope(nextUserId);
  syncLibraryQueryScope(nextScope);
  if (nextScope !== prevScope) {
    activateLibraryPersistScope(nextScope);
    resetLibraryHydration();
    resetLibrarySubscriptionTierTracking();
    appQueryClient?.removeQueries({ queryKey: ["billing"] });
  }

  const prevStoreScope = storeAuthScope(previousUserId);
  const nextStoreScope = storeAuthScope(nextUserId);
  if (nextStoreScope !== prevStoreScope) {
    activateStorePersistScope(nextStoreScope);
    resetStoreWishlistHydration();
  }
}

function applySession(
  session: Session | null,
  event: string,
  listenerAlreadySpoke: boolean,
  sessionReadSettled: boolean,
) {
  const store = useAuthStore.getState();
  const decision = decideAuthTransition({
    event,
    incomingUserId: session?.user?.id ?? null,
    phase: store.status,
    currentUserId: store.user?.id ?? null,
    listenerHasSpoken: listenerAlreadySpoke,
    getSessionSettled: sessionReadSettled,
  });

  if (decision.type === "ignore") {
    if (import.meta.env.DEV && store.status === "signed-in" && !session?.user) {
      console.info("[auth] kept session", { event, reason: decision.reason });
    }
    return;
  }

  if (decision.type === "unauthenticated") {
    applyScope(store.user?.id, null);
    hydrateToken += 1;
    inFlightUserId = null;
    store.setSession(null);
    store.setRole(null);
    syncNotifications(null);
    useProfileStore.getState().reset();
    return;
  }

  const incoming = session?.user;
  if (!incoming) return;

  applyScope(store.user?.id, incoming.id);
  const { setSession } = useAuthStore.getState();

  const current = useAuthStore.getState().user;
  if (decision.clearPreviousProfile) useProfileStore.getState().reset();

  // Keep an already hydrated identity when the same account emits another
  // auth event. Replacing the session with id + email was the flicker.
  setSession(
    retainSessionIdentity(current, {
      id: incoming.id,
      email: incoming.email ?? "",
    }),
  );
  syncNotifications(incoming.id);

  const user = incoming;
  const startHydration = () => {
    void hydrateProfileAndRole(user, event);
  };
  // getSession is already outside the auth lock. Listener callbacks must
  // return before issuing another Supabase query, or the client can re-enter
  // and emit another session event.
  if (event === "getSession") startHydration();
  else setTimeout(startHydration, 0);
}

let authRefs = 0;
let authGeneration = 0;
let listenerHasSpoken = false;
let getSessionSettled = false;
let authSubscription: { unsubscribe: () => void } | null = null;

function startAuthListener() {
  const generation = ++authGeneration;
  listenerHasSpoken = false;
  getSessionSettled = false;
  if (useAuthStore.getState().status !== "signed-in") {
    useAuthStore.getState().setStatus("unknown");
  }

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (generation !== authGeneration) return;
    listenerHasSpoken = true;
    applySession(session, event, true, getSessionSettled);
  });
  authSubscription = data.subscription;

  void supabase.auth.getSession().then(({ data: sessionData, error }) => {
    if (generation !== authGeneration) return;
    if (error) {
      // A failed read is not proof that the session is gone.
      console.error("Failed to restore session", error);
      return;
    }
    getSessionSettled = true;
    applySession(sessionData.session ?? null, "getSession", listenerHasSpoken, true);
  });
}

function stopAuthListener() {
  authGeneration += 1;
  listenerHasSpoken = false;
  getSessionSettled = false;
  authSubscription?.unsubscribe();
  authSubscription = null;
}

export function initAuthSync(queryClient?: QueryClient) {
  if (queryClient) {
    registerLibraryQueryClient(queryClient);
    appQueryClient = queryClient;
  }
  if (!initialized) {
    initialized = true;
    registerProgressSyncFlush();
    if (typeof window !== "undefined") {
      queueMicrotask(() => mergeLibraryStoreFromDisk());
    }
  }

  authRefs += 1;
  if (authRefs === 1) startAuthListener();

  return () => {
    authRefs = Math.max(0, authRefs - 1);
    if (authRefs === 0) stopAuthListener();
  };
}

/** Signs out of Supabase and clears the local mirror. Use this, not store.clear(), for user-initiated logout. */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Sign out failed", error);
  useAuthStore.getState().clear();
  useProfileStore.getState().reset();
}

/** Reload the signed-in user's profile row. Does not schedule itself again on failure. */
export function refreshCurrentProfile() {
  const sessionUser = useAuthStore.getState().user;
  if (!sessionUser) return;
  void hydrateProfileAndRole({ id: sessionUser.id, email: sessionUser.email } as User, "manual");
}

/** Re-fetch user_progression into progressionStore (e.g. after PvP reward settlement). */
export async function refreshProgression(userId: string) {
  const sessionUser = useAuthStore.getState().user;
  if (!sessionUser || sessionUser.id !== userId) return;
  await hydrateProgression({ id: userId, email: sessionUser.email } as User);
}
