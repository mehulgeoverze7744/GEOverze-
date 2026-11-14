import assert from "node:assert/strict";
import test from "node:test";

import {
  assertCapturedPayment,
  hmacSha256Hex,
  timingSafeHexEqual,
  verifyRazorpayOrderSignature,
  verifyRazorpaySubscriptionSignature,
  verifyRazorpayWebhookSignature,
} from "./razorpayCrypto.ts";

const SECRET = "test_key_secret";

test("timingSafeHexEqual accepts matching hex and rejects mismatches", () => {
  assert.equal(timingSafeHexEqual("abc123", "abc123"), true);
  assert.equal(timingSafeHexEqual("ABC123", "abc123"), true);
  assert.equal(timingSafeHexEqual("abc123", "abc124"), false);
  assert.equal(timingSafeHexEqual("abc", "abcd"), false);
  assert.equal(timingSafeHexEqual("", ""), false);
});

test("verifyRazorpayOrderSignature matches Razorpay order|payment HMAC", () => {
  const orderId = "order_ABC";
  const paymentId = "pay_XYZ";
  const signature = hmacSha256Hex(SECRET, `${orderId}|${paymentId}`);
  assert.equal(
    verifyRazorpayOrderSignature({
      keySecret: SECRET,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
    }),
    true,
  );
  assert.equal(
    verifyRazorpayOrderSignature({
      keySecret: SECRET,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: "deadbeef",
    }),
    false,
  );
});

test("verifyRazorpaySubscriptionSignature uses paymentId|subscriptionId", () => {
  const paymentId = "pay_SUB";
  const subscriptionId = "sub_LIVE";
  const signature = hmacSha256Hex(SECRET, `${paymentId}|${subscriptionId}`);
  assert.equal(
    verifyRazorpaySubscriptionSignature({
      keySecret: SECRET,
      razorpayPaymentId: paymentId,
      razorpaySubscriptionId: subscriptionId,
      razorpaySignature: signature,
    }),
    true,
  );
  const swapped = hmacSha256Hex(SECRET, `${subscriptionId}|${paymentId}`);
  assert.equal(
    verifyRazorpaySubscriptionSignature({
      keySecret: SECRET,
      razorpayPaymentId: paymentId,
      razorpaySubscriptionId: subscriptionId,
      razorpaySignature: swapped,
    }),
    false,
  );
  assert.equal(
    verifyRazorpaySubscriptionSignature({
      keySecret: SECRET,
      razorpayPaymentId: paymentId,
      razorpaySubscriptionId: subscriptionId,
      razorpaySignature: "",
    }),
    false,
  );
});

test("verifyRazorpayWebhookSignature hashes the raw body", () => {
  const rawBody = '{"event":"payment.captured"}';
  const signature = hmacSha256Hex("whsec_test", rawBody);
  assert.equal(
    verifyRazorpayWebhookSignature({
      webhookSecret: "whsec_test",
      rawBody,
      signature,
    }),
    true,
  );
  assert.equal(
    verifyRazorpayWebhookSignature({
      webhookSecret: "whsec_test",
      rawBody,
      signature: hmacSha256Hex("whsec_test", '{"event":"other"}'),
    }),
    false,
  );
});

test("assertCapturedPayment rejects authorized, amount mismatch, and currency mismatch", () => {
  const base = {
    status: "captured",
    amount: 299900,
    currency: "INR",
    orderId: "order_1",
    captured: true,
  };
  assert.deepEqual(
    assertCapturedPayment(base, { amountMinor: 299900, currency: "INR", orderId: "order_1" }),
    { ok: true },
  );
  assert.equal(
    assertCapturedPayment(
      { ...base, status: "authorized", captured: false },
      { amountMinor: 299900, currency: "INR" },
    ).ok,
    false,
  );
  assert.equal(
    assertCapturedPayment(base, { amountMinor: 100, currency: "INR" }).ok,
    false,
  );
  assert.equal(
    assertCapturedPayment(base, { amountMinor: 299900, currency: "USD" }).ok,
    false,
  );
});
