import assert from "node:assert/strict";
import test from "node:test";

import {
  describeMembershipCheckout,
  evaluateMembershipCheckoutIntent,
  pickMembershipForCheckout,
  resolvePaymentResultKind,
} from "./membershipCheckoutGuard.ts";

const activeBasicMonthly = {
  id: "sub-1",
  plan_tier: "basic",
  billing_interval: "monthly",
  status: "active",
};

const activeProMonthly = {
  id: "sub-2",
  plan_tier: "pro",
  billing_interval: "monthly",
  status: "active",
};

const activeAdvanceAnnual = {
  id: "sub-3",
  plan_tier: "advance",
  billing_interval: "annual",
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

test("evaluateMembershipCheckoutIntent blocks monthly → annual conversion on checkout", () => {
  const result = evaluateMembershipCheckoutIntent({
    existing: activeBasicMonthly,
    targetTier: "basic",
    targetInterval: "annual",
  });
  assert.equal(result.action, "already_active");
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

test("evaluateMembershipCheckoutIntent blocks Pro → Pro repurchase", () => {
  const result = evaluateMembershipCheckoutIntent({
    existing: activeProMonthly,
    targetTier: "pro",
    targetInterval: "monthly",
  });
  assert.equal(result.action, "already_active");
});

test("evaluateMembershipCheckoutIntent blocks Pro → Basic downgrade", () => {
  const result = evaluateMembershipCheckoutIntent({
    existing: activeProMonthly,
    targetTier: "basic",
    targetInterval: "monthly",
  });
  assert.equal(result.action, "already_active");
});

test("evaluateMembershipCheckoutIntent blocks Advance → Pro downgrade", () => {
  const result = evaluateMembershipCheckoutIntent({
    existing: activeAdvanceAnnual,
    targetTier: "pro",
    targetInterval: "annual",
  });
  assert.equal(result.action, "already_active");
});

test("evaluateMembershipCheckoutIntent blocks pending authorization duplicates", () => {
  const result = evaluateMembershipCheckoutIntent({
    existing: { ...activeBasicMonthly, status: "pending" },
    targetTier: "pro",
    targetInterval: "monthly",
  });
  assert.equal(result.action, "pending_authorization");
});

test("evaluateMembershipCheckoutIntent blocks incomplete authorization duplicates", () => {
  const result = evaluateMembershipCheckoutIntent({
    existing: { ...activeBasicMonthly, status: "incomplete" },
    targetTier: "basic",
    targetInterval: "monthly",
  });
  assert.equal(result.action, "pending_authorization");
});

test("evaluateMembershipCheckoutIntent blocks Advance → Basic downgrade", () => {
  const result = evaluateMembershipCheckoutIntent({
    existing: activeAdvanceAnnual,
    targetTier: "basic",
    targetInterval: "annual",
  });
  assert.equal(result.action, "already_active");
});

test("pickMembershipForCheckout prefers active over pending", () => {
  const picked = pickMembershipForCheckout([
    { ...activeBasicMonthly, status: "pending", id: "pending" },
    activeProMonthly,
  ]);
  assert.equal(picked?.id, "sub-2");
});

test("describeMembershipCheckout shows Basic upgrade CTA", () => {
  const notice = describeMembershipCheckout({
    action: "already_active",
    existingPlan: "basic",
    targetPlan: "basic",
  });
  assert.equal(notice.paymentAllowed, false);
  assert.equal(notice.cta, "upgrade_pro");
  assert.match(notice.title, /Basic/);
});

test("describeMembershipCheckout shows Pro manage CTA", () => {
  const notice = describeMembershipCheckout({
    action: "already_active",
    existingPlan: "pro",
    targetPlan: "pro",
  });
  assert.equal(notice.paymentAllowed, false);
  assert.equal(notice.cta, "manage");
});

test("describeMembershipCheckout shows Advance manage CTA", () => {
  const notice = describeMembershipCheckout({
    action: "already_active",
    existingPlan: "advance",
    targetPlan: "pro",
  });
  assert.equal(notice.paymentAllowed, false);
  assert.equal(notice.cta, "manage");
  assert.match(notice.title, /Advance/);
});

test("describeMembershipCheckout allows paying an upgrade", () => {
  const notice = describeMembershipCheckout({
    action: "upgrade",
    existingPlan: "basic",
    targetPlan: "pro",
  });
  assert.equal(notice.paymentAllowed, true);
  assert.match(notice.title, /Basic/);
  assert.match(notice.body, /Pro/);
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
