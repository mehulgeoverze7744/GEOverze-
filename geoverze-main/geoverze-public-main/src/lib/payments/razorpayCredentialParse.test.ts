import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyRazorpayKeyPrefix,
  encodeRazorpayBasicAuth,
  formatRazorpayHttpError,
  parseRazorpayErrorBody,
  razorpayKeyFingerprint,
  resolveRazorpayCredentialPair,
  secretLooksLikeKeyId,
  stripEnvValue,
  usableRazorpaySecret,
} from "./razorpayCredentialParse.ts";

test("stripEnvValue removes BOM, quotes, whitespace, and inline comments", () => {
  assert.equal(stripEnvValue('  "rzp_test_abc"  '), "rzp_test_abc");
  assert.equal(stripEnvValue("secret  # comment"), "secret");
  assert.equal(stripEnvValue("\uFEFFplain"), "plain");
  assert.equal(stripEnvValue(""), "");
  assert.equal(stripEnvValue(undefined), "");
});

test("usableRazorpaySecret rejects placeholders", () => {
  assert.equal(usableRazorpaySecret("placeholder"), "");
  assert.equal(usableRazorpaySecret("your_key_secret"), "");
  assert.equal(usableRazorpaySecret("  real-secret  "), "real-secret");
});

test("resolveRazorpayCredentialPair never mixes local and runtime sources", () => {
  const mixed = resolveRazorpayCredentialPair({
    allowLocal: true,
    localKeyId: "rzp_test_local",
    localKeySecret: "",
    runtimeKeyId: "rzp_test_runtime",
    runtimeKeySecret: "runtime-secret",
  });
  assert.equal(mixed.source, "runtime");
  assert.equal(mixed.keyId, "rzp_test_runtime");
  assert.equal(mixed.keySecret, "runtime-secret");

  const local = resolveRazorpayCredentialPair({
    allowLocal: true,
    localKeyId: "rzp_test_local",
    localKeySecret: "local-secret",
    runtimeKeyId: "rzp_test_runtime",
    runtimeKeySecret: "runtime-secret",
  });
  assert.equal(local.source, "dotenv-local");
  assert.equal(local.keyId, "rzp_test_local");
  assert.equal(local.keySecret, "local-secret");

  const vercel = resolveRazorpayCredentialPair({
    allowLocal: false,
    localKeyId: "rzp_test_local",
    localKeySecret: "local-secret",
    runtimeKeyId: "rzp_test_runtime",
    runtimeKeySecret: "runtime-secret",
  });
  assert.equal(vercel.source, "runtime");
  assert.equal(vercel.keyId, "rzp_test_runtime");
});

test("classifyRazorpayKeyPrefix and fingerprint are public-safe", () => {
  assert.equal(classifyRazorpayKeyPrefix("rzp_test_TzwYQMglWjrtBS"), "rzp_test_");
  assert.equal(classifyRazorpayKeyPrefix("rzp_live_abc"), "rzp_live_");
  assert.equal(classifyRazorpayKeyPrefix(""), "missing");
  assert.equal(razorpayKeyFingerprint("rzp_test_TzwYQMglWjrtBS"), "rtBS");
  assert.equal(secretLooksLikeKeyId("rzp_test_TzwYQMglWjrtBS"), true);
  assert.equal(secretLooksLikeKeyId("gIDLnotakeyid"), false);
});

test("formatRazorpayHttpError sanitizes 401 without leaking credentials", () => {
  const message = formatRazorpayHttpError({
    status: 401,
    method: "POST",
    path: "/plans",
    bodyText: JSON.stringify({
      error: {
        code: "BAD_REQUEST_ERROR",
        description: "Authentication failed",
      },
    }),
    keyPrefix: "rzp_test_",
    secretConfigured: true,
    secretLooksLikeKeyId: false,
  });
  assert.match(message, /401/);
  assert.match(message, /POST \/plans/);
  assert.match(message, /rzp_test_/);
  assert.match(message, /Authentication failed/);
  assert.equal(message.includes("Basic "), false);
  assert.equal(/rzp_test_[A-Za-z0-9]{6,}/.test(message), false);
});

test("parseRazorpayErrorBody redacts key ids in descriptions", () => {
  const parsed = parseRazorpayErrorBody(
    JSON.stringify({
      error: { description: "Invalid key rzp_test_ABCDEFG12345" },
    }),
  );
  assert.equal(parsed.description.includes("ABCDEFG12345"), false);
  assert.match(parsed.description, /rzp_test_\*\*\*/);
});

test("encodeRazorpayBasicAuth is username=keyId password=secret", () => {
  const encoded = encodeRazorpayBasicAuth("key", "secret");
  assert.equal(Buffer.from(encoded, "base64").toString("utf8"), "key:secret");
});
