import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyAuthCallbackFailure,
  completeAuthCallback,
  isRecoveryCallbackType,
  parseAuthCallbackLocation,
  resetAuthCallbackConsumptionForTests,
  stripAuthCallbackParams,
} from "./consumeAuthCallback.ts";

const SESSION = { user: { id: "user-1" } } as never;

test("parseAuthCallbackLocation reads PKCE codes and OAuth errors", () => {
  assert.deepEqual(parseAuthCallbackLocation("https://gvrze.com/auth/callback?code=abc123"), {
    kind: "pkce",
    code: "abc123",
    type: null,
  });
  assert.equal(
    parseAuthCallbackLocation("https://gvrze.com/auth/callback?error=access_denied").kind,
    "oauth_error",
  );
  assert.deepEqual(
    parseAuthCallbackLocation(
      "https://gvrze.com/auth/callback?token_hash=tok&type=signup",
    ),
    { kind: "otp", tokenHash: "tok", type: "signup" },
  );
  assert.equal(parseAuthCallbackLocation("https://gvrze.com/auth/callback").kind, "empty");
});

test("parseAuthCallbackLocation treats recovery type as PKCE recovery", () => {
  const parsed = parseAuthCallbackLocation(
    "https://gvrze.com/auth/reset-password?code=reset1&type=recovery",
  );
  assert.equal(parsed.kind, "pkce");
  if (parsed.kind === "pkce") {
    assert.equal(parsed.type, "recovery");
    assert.equal(isRecoveryCallbackType(parsed.type), true);
  }
});

test("completeAuthCallback exchanges a PKCE code only once", async () => {
  resetAuthCallbackConsumptionForTests();
  let exchanges = 0;
  const deps = {
    exchangeCode: async () => {
      exchanges += 1;
      return { session: SESSION, errorMessage: null };
    },
    verifyOtp: async () => ({ session: null, errorMessage: "unused" }),
    getSession: async () => SESSION,
  };
  const href = "https://gvrze.com/auth/callback?code=once-only";
  const first = completeAuthCallback(href, deps);
  const second = completeAuthCallback(href, deps);
  const [a, b] = await Promise.all([first, second]);
  assert.equal(a.status, "session");
  assert.equal(b.status, "session");
  assert.equal(exchanges, 1);

  const third = await completeAuthCallback(href, deps);
  assert.equal(third.status, "session");
  assert.equal(exchanges, 1);
});

test("completeAuthCallback maps expired and reused codes", async () => {
  resetAuthCallbackConsumptionForTests();
  const result = await completeAuthCallback("https://gvrze.com/auth/callback?code=stale", {
    exchangeCode: async () => ({ session: null, errorMessage: "flow_state not found" }),
    verifyOtp: async () => ({ session: null, errorMessage: null }),
    getSession: async () => null,
  });
  assert.equal(result.status, "error");
  if (result.status === "error") {
    assert.match(result.message, /expired|already been used/i);
  }
});

test("completeAuthCallback maps cancelled Google errors without exchanging", async () => {
  resetAuthCallbackConsumptionForTests();
  let exchanges = 0;
  const result = await completeAuthCallback(
    "https://gvrze.com/auth/callback?error=access_denied&error_description=User+cancelled",
    {
      exchangeCode: async () => {
        exchanges += 1;
        return { session: null, errorMessage: null };
      },
      verifyOtp: async () => ({ session: null, errorMessage: null }),
      getSession: async () => null,
    },
  );
  assert.equal(exchanges, 0);
  assert.equal(result.status, "error");
  if (result.status === "error") assert.match(result.message, /cancelled/i);
});

test("classifyAuthCallbackFailure covers provider-disabled and PKCE mismatches", () => {
  assert.match(classifyAuthCallbackFailure("Unsupported provider: provider is not enabled"), /not enabled/i);
  assert.match(classifyAuthCallbackFailure("bad_code_verifier"), /same device and browser/i);
});

test("stripAuthCallbackParams removes the one-time code from the URL", () => {
  assert.equal(
    stripAuthCallbackParams("https://gvrze.com/auth/callback?code=abc&next=/profile", "/auth/callback"),
    "/auth/callback",
  );
});
