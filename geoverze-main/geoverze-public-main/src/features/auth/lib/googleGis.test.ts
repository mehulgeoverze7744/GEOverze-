import assert from "node:assert/strict";
import test from "node:test";

import {
  assertValidGoogleCredential,
  exchangeGoogleIdToken,
  generateGoogleAuthNonce,
  mapGoogleIdentityError,
  mapGooglePromptDismissal,
  readGoogleClientId,
  resetGoogleSignInInFlightForTests,
  sha256HexNonce,
  GOOGLE_GIS_SCRIPT_URL,
  isGoogleSignInInFlight,
} from "./googleGis.ts";
import type { GooglePromptMomentNotification } from "./googleGis.types.ts";

function fakeJwt(): string {
  return "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature";
}

test("GIS script URL uses the official Google Identity Services endpoint", () => {
  assert.equal(GOOGLE_GIS_SCRIPT_URL, "https://accounts.google.com/gsi/client");
});

test("generateGoogleAuthNonce produces distinct base64 values", () => {
  const a = generateGoogleAuthNonce();
  const b = generateGoogleAuthNonce();
  assert.notEqual(a, b);
  assert.ok(a.length >= 32);
});

test("sha256HexNonce hashes the raw nonce to a 64-char hex string", async () => {
  const raw = "test-nonce-value";
  const hashed = await sha256HexNonce(raw);
  assert.equal(hashed.length, 64);
  assert.match(hashed, /^[0-9a-f]+$/);
  assert.equal(await sha256HexNonce(raw), hashed);
});

test("assertValidGoogleCredential rejects missing and malformed credentials", () => {
  assert.throws(() => assertValidGoogleCredential(""), /did not return credentials/i);
  assert.throws(() => assertValidGoogleCredential("not-a-jwt"), /could not be completed/i);
  assert.equal(assertValidGoogleCredential(fakeJwt()), fakeJwt());
});

test("mapGoogleIdentityError covers nonce and token failures", () => {
  assert.match(mapGoogleIdentityError("Nonces mismatch"), /could not be verified/i);
  assert.match(mapGoogleIdentityError("Token has expired or is invalid"), /expired or was invalid/i);
  assert.match(mapGoogleIdentityError("Popup blocked"), /blocked by the browser/i);
});

test("mapGooglePromptDismissal treats user cancellation as recoverable", () => {
  const dismissed: GooglePromptMomentNotification = {
    isDisplayMoment: () => false,
    isDisplayed: () => false,
    isNotDisplayed: () => false,
    getNotDisplayedReason: () => "",
    isSkippedMoment: () => false,
    getSkippedReason: () => "",
    isDismissedMoment: () => true,
    getDismissedReason: () => "user_cancel",
    getMomentType: () => "dismissed",
  };
  const cancellationMessage = mapGooglePromptDismissal(dismissed);
  assert.ok(cancellationMessage);
  assert.match(cancellationMessage, /cancelled/i);
});

test("exchangeGoogleIdToken calls signInWithIdToken with raw nonce and credential", async () => {
  resetGoogleSignInInFlightForTests();
  type GoogleSignInPayload = { provider: "google"; token: string; nonce: string };
  const captured: { payload: GoogleSignInPayload | null } = { payload: null };
  const session = {
    access_token: "at",
    refresh_token: "rt",
    expires_in: 3600,
    token_type: "bearer",
    user: { id: "user-1", email: "explorer@gvrze.com" },
  };

  const result = await exchangeGoogleIdToken(fakeJwt(), "raw-nonce-abc", {
    signInWithIdToken: async (payload) => {
      captured.payload = payload;
      return { data: { session: session as never }, error: null };
    },
  });

  assert.ok(captured.payload);
  assert.equal(captured.payload.provider, "google");
  assert.equal(captured.payload.token, fakeJwt());
  assert.equal(captured.payload.nonce, "raw-nonce-abc");
  assert.equal(result.user.id, "user-1");
  assert.equal(isGoogleSignInInFlight(), false);
});

test("exchangeGoogleIdToken surfaces invalid token errors without logging the JWT", async () => {
  resetGoogleSignInInFlightForTests();
  await assert.rejects(
    () =>
      exchangeGoogleIdToken(fakeJwt(), "nonce-1", {
        signInWithIdToken: async () => ({
          data: { session: null },
          error: { message: "Invalid nonce", code: "invalid_nonce" },
        }),
      }),
    /could not be verified/i,
  );
});

test("exchangeGoogleIdToken blocks duplicate in-flight exchanges", async () => {
  resetGoogleSignInInFlightForTests();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  const first = exchangeGoogleIdToken(fakeJwt(), "nonce-a", {
    signInWithIdToken: async () => {
      await gate;
      return {
        data: {
          session: {
            access_token: "a",
            refresh_token: "b",
            expires_in: 1,
            token_type: "bearer",
            user: { id: "u1", email: "a@b.com" },
          } as never,
        },
        error: null,
      };
    },
  });

  assert.equal(isGoogleSignInInFlight(), true);
  await assert.rejects(
    () => exchangeGoogleIdToken(fakeJwt(), "nonce-b", {
      signInWithIdToken: async () => ({ data: { session: null }, error: null }),
    }),
    /GOOGLE_SIGNIN_IN_FLIGHT/,
  );

  release();
  await first;
});

test("readGoogleClientId is empty when VITE_GOOGLE_CLIENT_ID is unset in tests", () => {
  assert.equal(readGoogleClientId(), "");
});