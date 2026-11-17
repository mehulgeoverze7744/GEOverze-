import assert from "node:assert/strict";
import test from "node:test";

import { expectedAutomaticLinkingOutcome } from "./identityLinking.ts";

test("verified email/password plus matching Google email stays on the same user", () => {
  const outcome = expectedAutomaticLinkingOutcome("verified_email_password_same_google_email");
  assert.equal(outcome.sameUserId, true);
  assert.equal(outcome.createsNewUser, false);
  assert.equal(outcome.attachesGoogleIdentity, true);
  assert.equal(outcome.requiresDashboardAutomaticLinking, true);
  assert.equal(outcome.preservesCreditsMembershipOrders, true);
});

test("unverified email/password is not auto-linked to Google", () => {
  const outcome = expectedAutomaticLinkingOutcome("unverified_email_password_same_google_email");
  assert.equal(outcome.sameUserId, false);
  assert.equal(outcome.createsNewUser, true);
  assert.equal(outcome.attachesGoogleIdentity, false);
});

test("new and returning Google users and mismatched emails stay separate", () => {
  assert.equal(expectedAutomaticLinkingOutcome("new_google_email").createsNewUser, true);
  assert.equal(expectedAutomaticLinkingOutcome("returning_google_user").sameUserId, true);
  assert.equal(
    expectedAutomaticLinkingOutcome("google_email_different_from_existing_account").createsNewUser,
    true,
  );
});
