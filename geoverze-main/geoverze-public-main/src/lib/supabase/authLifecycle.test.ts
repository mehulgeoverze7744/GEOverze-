import assert from "node:assert/strict";
import test from "node:test";

import {
  decideAuthTransition,
  nextAuthListenerCount,
  profileFailureKeepsSession,
  shouldKeepDashboardMounted,
  shouldShowSignIn,
  type AuthPhase,
} from "./authLifecycle.ts";

const USER_A = "user-a";
const USER_B = "user-b";

function step(input: {
  phase: AuthPhase;
  userId: string | null;
  event: string;
  incomingUserId: string | null;
  listenerHasSpoken?: boolean;
  getSessionSettled?: boolean;
}) {
  const decision = decideAuthTransition({
    event: input.event,
    incomingUserId: input.incomingUserId,
    phase: input.phase,
    currentUserId: input.userId,
    listenerHasSpoken: input.listenerHasSpoken ?? false,
    getSessionSettled: input.getSessionSettled ?? false,
  });
  if (decision.type === "ignore") {
    return { phase: input.phase, userId: input.userId, decision };
  }
  if (decision.type === "unauthenticated") {
    return { phase: "signed-out" as const, userId: null, decision };
  }
  return { phase: "signed-in" as const, userId: input.incomingUserId, decision };
}

test("an existing session is restored without showing the sign-in wall", () => {
  const phases: AuthPhase[] = ["unknown"];
  let state = step({
    phase: "unknown",
    userId: null,
    event: "getSession",
    incomingUserId: null,
    listenerHasSpoken: false,
  });
  phases.push(state.phase);
  state = step({
    phase: state.phase,
    userId: state.userId,
    event: "INITIAL_SESSION",
    incomingUserId: USER_A,
    listenerHasSpoken: true,
  });
  phases.push(state.phase);

  assert.deepEqual(phases, ["unknown", "unknown", "signed-in"]);
  assert.equal(phases.some((phase) => shouldShowSignIn(phase)), false);
  assert.equal(state.userId, USER_A);

  const transientNull = step({
    phase: "unknown",
    userId: null,
    event: "INITIAL_SESSION",
    incomingUserId: null,
    listenerHasSpoken: true,
    getSessionSettled: false,
  });
  const repaired = step({
    phase: transientNull.phase,
    userId: transientNull.userId,
    event: "getSession",
    incomingUserId: USER_A,
    listenerHasSpoken: true,
    getSessionSettled: true,
  });
  assert.equal(transientNull.phase, "unknown");
  assert.equal(shouldShowSignIn(transientNull.phase), false);
  assert.equal(repaired.phase, "signed-in");
  assert.equal(repaired.userId, USER_A);
});

test("a profile request does not clear a valid authenticated user", () => {
  assert.equal(profileFailureKeepsSession(), true);
  const state = step({
    phase: "signed-in",
    userId: USER_A,
    event: "TOKEN_REFRESHED",
    incomingUserId: USER_A,
  });
  assert.equal(state.phase, "signed-in");
  assert.equal(state.userId, USER_A);
  assert.equal(state.decision.type === "authenticated" && state.decision.clearPreviousProfile, false);
});

test("a delayed initial session response cannot overwrite a newer auth event", () => {
  const restored = step({
    phase: "unknown",
    userId: null,
    event: "INITIAL_SESSION",
    incomingUserId: USER_A,
    listenerHasSpoken: true,
  });
  const late = step({
    phase: restored.phase,
    userId: restored.userId,
    event: "getSession",
    incomingUserId: null,
    listenerHasSpoken: true,
  });
  assert.equal(late.phase, "signed-in");
  assert.equal(late.userId, USER_A);
  assert.equal(late.decision.type, "ignore");
  assert.equal(shouldShowSignIn(late.phase), false);

  const nullInitial = step({
    phase: restored.phase,
    userId: restored.userId,
    event: "INITIAL_SESSION",
    incomingUserId: null,
    listenerHasSpoken: true,
    getSessionSettled: true,
  });
  assert.equal(nullInitial.phase, "signed-in");
  assert.equal(nullInitial.userId, USER_A);
  assert.equal(nullInitial.decision.type, "ignore");
});

test("a profile request failure does not sign the user out", () => {
  assert.equal(profileFailureKeepsSession(), true);
  assert.equal(shouldShowSignIn("signed-in"), false);
  assert.equal(shouldKeepDashboardMounted("signed-in"), true);
});

test("repeated auth events do not cause a sign-in redirect", () => {
  let state = step({
    phase: "unknown",
    userId: null,
    event: "INITIAL_SESSION",
    incomingUserId: USER_A,
  });
  for (const event of ["SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED", "TOKEN_REFRESHED"]) {
    state = step({
      phase: state.phase,
      userId: state.userId,
      event,
      incomingUserId: USER_A,
      listenerHasSpoken: true,
    });
    assert.equal(shouldShowSignIn(state.phase), false);
    assert.equal(shouldKeepDashboardMounted(state.phase), true);
  }
  assert.equal(state.userId, USER_A);
});

test("the dashboard stays mounted while profile data refreshes", () => {
  const refreshing = step({
    phase: "signed-in",
    userId: USER_A,
    event: "TOKEN_REFRESHED",
    incomingUserId: USER_A,
    listenerHasSpoken: true,
  });
  assert.equal(shouldKeepDashboardMounted(refreshing.phase), true);
  assert.equal(refreshing.decision.type === "authenticated" && refreshing.decision.clearPreviousProfile, false);
});

test("a genuine sign-out displays the sign-in screen", () => {
  const state = step({
    phase: "signed-in",
    userId: USER_A,
    event: "SIGNED_OUT",
    incomingUserId: null,
    listenerHasSpoken: true,
  });
  assert.equal(state.phase, "signed-out");
  assert.equal(state.userId, null);
  assert.equal(shouldShowSignIn(state.phase), true);
  assert.equal(shouldKeepDashboardMounted(state.phase), false);

  const pending = step({
    phase: "unknown",
    userId: null,
    event: "INITIAL_SESSION",
    incomingUserId: null,
    listenerHasSpoken: true,
    getSessionSettled: false,
  });
  const confirmed = step({
    phase: pending.phase,
    userId: pending.userId,
    event: "getSession",
    incomingUserId: null,
    listenerHasSpoken: true,
    getSessionSettled: true,
  });
  assert.equal(shouldShowSignIn(pending.phase), false);
  assert.equal(confirmed.phase, "signed-out");
  assert.equal(shouldShowSignIn(confirmed.phase), true);
});

test("an expired or revoked session is signed out", () => {
  const state = step({
    phase: "signed-in",
    userId: USER_A,
    event: "TOKEN_REFRESHED",
    incomingUserId: null,
    listenerHasSpoken: true,
  });
  assert.equal(state.phase, "signed-out");
  assert.equal(state.decision.type === "unauthenticated" && state.decision.reason, "refresh-without-session");
  assert.equal(shouldShowSignIn(state.phase), true);
});

test("switching accounts does not keep the previous user's profile", () => {
  const switched = step({
    phase: "signed-in",
    userId: USER_A,
    event: "SIGNED_IN",
    incomingUserId: USER_B,
    listenerHasSpoken: true,
  });
  assert.equal(switched.userId, USER_B);
  assert.equal(switched.decision.type === "authenticated" && switched.decision.clearPreviousProfile, true);

  const stale = step({
    phase: "signed-in",
    userId: USER_A,
    event: "getSession",
    incomingUserId: USER_B,
    listenerHasSpoken: true,
  });
  assert.equal(stale.userId, USER_A);
  assert.equal(stale.decision.type, "ignore");
});

test("auth subscriptions are cleaned up and do not accumulate after remounts", () => {
  let active = 0;
  active = nextAuthListenerCount(active, "mount");
  active = nextAuthListenerCount(active, "unmount");
  active = nextAuthListenerCount(active, "mount");
  assert.equal(active, 1);

  for (let i = 0; i < 4; i += 1) active = nextAuthListenerCount(active, "mount");
  for (let i = 0; i < 5; i += 1) active = nextAuthListenerCount(active, "unmount");
  assert.equal(active, 0);
  assert.equal(nextAuthListenerCount(0, "unmount"), 0);
});
