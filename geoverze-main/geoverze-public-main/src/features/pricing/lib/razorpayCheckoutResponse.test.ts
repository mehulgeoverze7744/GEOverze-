import assert from "node:assert/strict";
import test from "node:test";

import {
  customerFacingPaymentError,
  normalizeRazorpayCheckoutResponse,
} from "./razorpayCheckoutResponse.ts";

test("normalizeRazorpayCheckoutResponse reads subscription authorization fields", () => {
  const normalized = normalizeRazorpayCheckoutResponse({
    razorpay_payment_id: "pay_sub",
    razorpay_subscription_id: "sub_live",
    razorpay_signature: "sig_hex",
  });
  assert.equal(normalized.paymentId, "pay_sub");
  assert.equal(normalized.subscriptionId, "sub_live");
  assert.equal(normalized.signature, "sig_hex");
  assert.equal(normalized.orderId, "");
});

test("normalizeRazorpayCheckoutResponse reads order checkout and camelCase aliases", () => {
  const normalized = normalizeRazorpayCheckoutResponse({
    razorpayPaymentId: "pay_ord",
    razorpayOrderId: "order_1",
    razorpaySignature: "abc",
  });
  assert.equal(normalized.paymentId, "pay_ord");
  assert.equal(normalized.orderId, "order_1");
  assert.equal(normalized.signature, "abc");
});

test("normalizeRazorpayCheckoutResponse does not invent a signature", () => {
  const normalized = normalizeRazorpayCheckoutResponse({
    razorpay_payment_id: "pay_missing",
    razorpay_order_id: "order_missing",
  });
  assert.equal(normalized.paymentId, "pay_missing");
  assert.equal(normalized.signature, "");
});

test("customerFacingPaymentError hides Zod validation dumps", () => {
  const raw =
    'rzp_signature is undefined. Validation error: Expected string, received undefined, path ["rzp_signature"].';
  assert.equal(
    customerFacingPaymentError(new Error(raw)),
    "Payment confirmation was incomplete. If you were charged, membership will activate shortly.",
  );
  assert.equal(
    customerFacingPaymentError(new Error("Payment signature verification failed.")),
    "Payment could not be verified. If you were charged, check your billing dashboard in a moment.",
  );
});
