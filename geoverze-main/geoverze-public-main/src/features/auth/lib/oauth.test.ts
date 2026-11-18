import assert from "node:assert/strict";
import test from "node:test";

import {
  isDuplicateSignupUser,
  mapAuthError,
  mapOAuthCallbackError,
  postAuthDestinationFromProfile,
  safeInternalPath,
} from "./oauth.ts";

test("safeInternalPath accepts same-origin app paths", () => {
  assert.equal(safeInternalPath("/community"), "/community");
  assert.equal(safeInternalPath("/geostore/checkout"), "/geostore/checkout");
  assert.equal(safeInternalPath("/profile"), "/profile");
  assert.equal(safeInternalPath("/pricing?plan=pro"), "/pricing?plan=pro");
});

test("safeInternalPath rejects open redirects and auth loops", () => {
  assert.equal(safeInternalPath("https://evil.example"), null);
  assert.equal(safeInternalPath("//evil.example"), null);
  assert.equal(safeInternalPath("/\\evil.example"), null);
  assert.equal(safeInternalPath("/auth/login"), null);
  assert.equal(safeInternalPath("/auth/callback"), null);
  assert.equal(safeInternalPath("javascript:alert(1)"), null);
  assert.equal(safeInternalPath(""), null);
  assert.equal(safeInternalPath(undefined), null);
});

test("duplicate signup users have an empty identities array", () => {
  assert.equal(isDuplicateSignupUser({ identities: [] }), true);
  assert.equal(isDuplicateSignupUser({ identities: [{ id: "1" }] }), false);
  assert.equal(isDuplicateSignupUser(null), false);
});

test("mapAuthError covers duplicate, credentials, and provider failures", () => {
  assert.match(mapAuthError("User already registered"), /already exists/i);
  assert.match(mapAuthError("Invalid login credentials"), /incorrect/i);
  assert.match(mapAuthError("Invalid login credentials"), /confirm your email/i);
  assert.match(mapAuthError("Email not confirmed"), /confirm your email/i);
  assert.match(mapAuthError("Password should be at least 8 characters"), /stronger password/i);
  assert.match(mapAuthError("Unsupported provider: provider is not enabled"), /Google sign-in is not enabled/i);
  assert.match(mapAuthError("Failed to fetch"), /authentication service/i);
  assert.match(mapAuthError("email rate limit exceeded", "over_email_send_rate_limit"), /confirmation email/i);
  assert.match(mapAuthError("Database error saving new user"), /profile/i);
  assert.equal(mapAuthError(""), "Something went wrong. Please try again.");
});

test("mapAuthError covers login, unverified, and logout-safe copy", () => {
  assert.match(mapAuthError("Invalid login credentials", "invalid_credentials"), /incorrect/i);
  assert.match(mapAuthError("Email not confirmed", "email_not_confirmed"), /confirm your email/i);
  assert.match(mapAuthError("Token has expired or is invalid"), /expired/i);
  assert.doesNotMatch(mapAuthError("Invalid login credentials"), /@/);
});

test("postAuthDestinationFromProfile skips age verification and sends new users to onboarding", () => {
  assert.equal(postAuthDestinationFromProfile(null, null, null), "/auth/onboarding");
  assert.equal(
    postAuthDestinationFromProfile({ avatar_id: null }, { skill_level: null }, "/play"),
    "/auth/onboarding",
  );
  assert.equal(
    postAuthDestinationFromProfile({ avatar_id: "atlas" }, null, "/play"),
    "/play",
  );
  assert.equal(
    postAuthDestinationFromProfile(null, { skill_level: "beginner" }, "/community"),
    "/community",
  );
  assert.equal(
    postAuthDestinationFromProfile({ avatar_id: "atlas" }, { skill_level: "beginner" }, "/auth/age-verification"),
    "/profile",
  );
});

test("mapOAuthCallbackError treats cancellation as a recoverable state", () => {
  assert.match(mapOAuthCallbackError("access_denied"), /cancelled/i);
  assert.match(mapOAuthCallbackError("flow_state not found"), /expired/i);
  assert.match(mapOAuthCallbackError("otp_expired"), /confirmation or sign-in link/i);
  assert.match(mapOAuthCallbackError("invalid_grant"), /could not be completed/i);
});
