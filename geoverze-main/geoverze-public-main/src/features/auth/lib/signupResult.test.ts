import assert from "node:assert/strict";
import test from "node:test";

import { interpretSignupResult } from "./signupResult.ts";

test("interpretSignupResult maps Auth errors", () => {
  const outcome = interpretSignupResult(null, {
    message: "email rate limit exceeded",
    code: "over_email_send_rate_limit",
    status: 429,
  });
  assert.equal(outcome.kind, "error");
  if (outcome.kind === "error") {
    assert.match(outcome.message, /confirmation email/i);
  }
});

test("interpretSignupResult treats a session as signed in", () => {
  assert.equal(
    interpretSignupResult(
      {
        user: { identities: [{ id: "1" }], email_confirmed_at: "2026-01-01T00:00:00Z" },
        session: { user: { email_confirmed_at: "2026-01-01T00:00:00Z" } },
      },
      null,
    ).kind,
    "signed_in",
  );
});

test("interpretSignupResult does not treat an unconfirmed session as signed in", () => {
  assert.equal(
    interpretSignupResult({ user: { identities: [{ id: "1" }] }, session: { user: {} } }, null).kind,
    "needs_confirmation",
  );
});

test("interpretSignupResult treats empty identities as an existing account", () => {
  const outcome = interpretSignupResult({ user: { identities: [] }, session: null }, null);
  assert.equal(outcome.kind, "existing_account");
});

test("interpretSignupResult sends new unconfirmed users to verification", () => {
  assert.equal(
    interpretSignupResult({ user: { identities: [{ id: "1" }], email: "a@b.c" }, session: null }, null)
      .kind,
    "needs_confirmation",
  );
});

test("interpretSignupResult treats a null user with no error as confirmation pending", () => {
  assert.equal(interpretSignupResult({ user: null, session: null }, null).kind, "needs_confirmation");
});
