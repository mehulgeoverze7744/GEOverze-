import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateMembershipCheckoutIntent,
  resolvePaymentResultKind,
} from "./membershipCheckoutGuard.ts";

const activeBasicMonthly = {
  id: "sub-1",
  plan_tier: "basic",
  billing_interval: "monthly",
  status: "active",
};

test("evaluateMembershipCheckoutIntent blocks same-plan repurchase", () => {
  const result = evaluateMembershipCheckoutIntent({
    existing: activeBasicMonthly,
    targetTier: "basic",
    targetInterval: "monthly",
  });
  assert.equal(result.action, "already_active");
});

test("evaluateMembershipCheckoutIntent allows Basic → Pro upgrades", () => {
  const result = evaluateMembershipCheckoutIntent({
    existing: activeBasicMonthly,
    targetTier: "pro",
    targetInterval: "monthly",
  });
  assert.equal(result.action, "upgrade");
});

test("evaluateMembershipCheckoutIntent allows monthly → annual conversion", () => {
  const result = evaluateMembershipCheckoutIntent({
    existing: activeBasicMonthly,
    targetTier: "basic",
    targetInterval: "annual",
  });
  assert.equal(result.action, "upgrade");
});

test("evaluateMembershipCheckoutIntent allows new checkout when none exists", () => {
  const result = evaluateMembershipCheckoutIntent({
    existing: null,
    targetTier: "basic",
    targetInterval: "monthly",
  });
  assert.equal(result.action, "create");
});

test("evaluateMembershipCheckoutIntent allows past_due retry", () => {
  const result = evaluateMembershipCheckoutIntent({
    existing: { ...activeBasicMonthly, status: "past_due" },
    targetTier: "basic",
    targetInterval: "monthly",
  });
  assert.equal(result.action, "create");
});

test("evaluateMembershipCheckoutIntent allows repurchase after cancel", () => {
  const result = evaluateMembershipCheckoutIntent({
    existing: { ...activeBasicMonthly, status: "cancelled" },
    targetTier: "basic",
    targetInterval: "monthly",
  });
  assert.equal(result.action, "create");
});

test("resolvePaymentResultKind prefers confirmed checkout over URL hints", () => {
  assert.equal(
    resolvePaymentResultKind({
      authReady: true,
      signedIn: true,
      hinted: "processing",
      checkoutActivated: true,
      checkoutPending: false,
      existingActive: true,
    }),
    "confirmed",
  );
});

test("resolvePaymentResultKind keeps upgrades pending even with an existing membership", () => {
  assert.equal(
    resolvePaymentResultKind({
      authReady: true,
      signedIn: true,
      hinted: "processing",
      checkoutActivated: false,
      checkoutPending: true,
      existingActive: true,
    }),
    "pending",
  );
});

test("resolvePaymentResultKind shows existing membership when no new checkout is pending", () => {
  assert.equal(
    resolvePaymentResultKind({
      authReady: true,
      signedIn: true,
      hinted: "existing",
      checkoutActivated: true,
      checkoutPending: false,
      existingActive: true,
    }),
    "existing",
  );
});

test("resolvePaymentResultKind stays pending until the server activates", () => {
  assert.equal(
    resolvePaymentResultKind({
      authReady: true,
      signedIn: true,
      hinted: "success",
      checkoutActivated: false,
      checkoutPending: false,
      existingActive: false,
    }),
    "pending",
  );
});

test("resolvePaymentResultKind shows failure without requiring a session", () => {
  assert.equal(
    resolvePaymentResultKind({
      authReady: true,
      signedIn: false,
      hinted: "failed",
      checkoutActivated: false,
      checkoutPending: false,
      existingActive: false,
    }),
    "failed",
  );
});
