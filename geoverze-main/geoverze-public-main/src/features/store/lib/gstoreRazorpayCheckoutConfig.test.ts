import assert from "node:assert/strict";
import test from "node:test";

import {
  GSTORE_RAZORPAY_ALLOWED_METHODS,
  GSTORE_RAZORPAY_DISPLAY_CONFIG,
  gstoreCheckoutHidesUpi,
  gstoreRazorpayCheckoutExtras,
  gstoreUpiFlows,
} from "./gstoreRazorpayCheckoutConfig.ts";

test("Gstore checkout allows UPI with cards, netbanking and wallets", () => {
  assert.equal(GSTORE_RAZORPAY_ALLOWED_METHODS.upi, true);
  assert.equal(GSTORE_RAZORPAY_ALLOWED_METHODS.card, true);
  assert.equal(GSTORE_RAZORPAY_ALLOWED_METHODS.netbanking, true);
  assert.equal(GSTORE_RAZORPAY_ALLOWED_METHODS.wallet, true);
  assert.equal(gstoreCheckoutHidesUpi(), false);
});

test("Gstore checkout requests UPI Intent and QR and does not use Collect", () => {
  const flows = gstoreUpiFlows();
  assert.deepEqual([...flows].sort(), ["intent", "qr"]);
  assert.equal(flows.includes("collect"), false);
  assert.equal(GSTORE_RAZORPAY_DISPLAY_CONFIG.display.sequence[0], "block.upi");
});

test("checkout extras keep INR currency and do not hide UPI", () => {
  const extras = gstoreRazorpayCheckoutExtras();
  assert.equal(extras.currency, "INR");
  assert.equal(extras.method.upi, true);
  assert.equal("hide" in extras.config.display, false);
});
