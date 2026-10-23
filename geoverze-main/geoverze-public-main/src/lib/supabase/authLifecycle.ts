/**
 * Pure decisions for the single Supabase auth listener.
 * A missing profile, a slow session read, or a stale snapshot must not
 * turn a signed-in user into the sign-in wall.
 */

export type AuthPhase = "unknown" | "signed-out" | "signed-in";

export type AuthTransition =
  | { type: "ignore"; reason: string }
  | { type: "authenticated"; reason: string; clearPreviousProfile: boolean }
  | { type: "unauthenticated"; reason: string };

export function decideAuthTransition(input: {
  event: string;
  incomingUserId: string | null;
  phase: AuthPhase;
  currentUserId: string | null;
  listenerHasSpoken: boolean;
  /** True once the one-shot getSession() read has settled, including a null session. */
  getSessionSettled: boolean;
}): AuthTransition {
  if (input.incomingUserId) {
    // A late getSession must not replace a user the subscription already established.
    if (input.event === "getSession" && input.listenerHasSpoken && input.phase === "signed-in") {
      return { type: "ignore", reason: "subscription-already-authoritative" };
    }
    return {
      type: "authenticated",
      reason: input.event,
      clearPreviousProfile: Boolean(
        input.currentUserId && input.currentUserId !== input.incomingUserId,
      ),
    };
  }

  if (input.event === "SIGNED_OUT") {
    return { type: "unauthenticated", reason: "signed-out" };
  }

  if (input.event === "TOKEN_REFRESHED" && input.phase === "signed-in") {
    return { type: "unauthenticated", reason: "refresh-without-session" };
  }

  // Supabase emits INITIAL_SESSION null for a missing session and also for a
  // transient network failure. A null here is not allowed to clear a user who
  // is already signed in, and it is not confirmed until getSession agrees.
  if (input.event === "INITIAL_SESSION") {
    if (input.phase === "signed-in") {
      return { type: "ignore", reason: "initial-null-kept-session" };
    }
    if (!input.getSessionSettled) {
      return { type: "ignore", reason: "waiting-for-session-read" };
    }
    return { type: "unauthenticated", reason: "no-session" };
  }

  if (input.event === "getSession") {
    if (input.listenerHasSpoken && input.phase !== "signed-in") {
      return { type: "unauthenticated", reason: "no-session" };
    }
    return {
      type: "ignore",
      reason: input.listenerHasSpoken ? "subscription-already-authoritative" : "session-still-restoring",
    };
  }

  if (input.phase === "signed-in") {
    return { type: "ignore", reason: "null-snapshot-kept-session" };
  }

  return { type: "ignore", reason: "waiting-for-session" };
}

/** A profile query failing is not evidence that the session ended. */
export function profileFailureKeepsSession(): boolean {
  return true;
}

/** The sign-in wall is only for a confirmed absence of a session. */
export function shouldShowSignIn(phase: AuthPhase): boolean {
  return phase === "signed-out";
}

/** The dashboard stays mounted while the profile loads or a refresh is in flight. */
export function shouldKeepDashboardMounted(phase: AuthPhase): boolean {
  return phase === "signed-in";
}

export function nextAuthListenerCount(active: number, action: "mount" | "unmount"): number {
  if (action === "mount") return active + 1;
  return active > 0 ? active - 1 : 0;
}
