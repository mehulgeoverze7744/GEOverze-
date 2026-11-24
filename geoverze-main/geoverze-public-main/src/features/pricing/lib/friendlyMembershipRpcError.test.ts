import assert from "node:assert/strict";
import test from "node:test";

import { friendlyMembershipRpcError } from "./subscriptionServerFns.ts";

test("friendlyMembershipRpcError maps missing begin_razorpay_upgrade", () => {
  const raw =
    "Could not find the function public.begin_razorpay_upgrade(p_billing_interval, p_idempotency_key, p_target_plan_tier) in the schema cache";
  const friendly = friendlyMembershipRpcError(raw, "upgrade");
  assert.match(friendly, /temporarily unavailable/i);
  assert.doesNotMatch(friendly, /schema cache/i);
});

test("friendlyMembershipRpcError maps auth and interval errors", () => {
  assert.match(friendlyMembershipRpcError("Authentication required", "subscription"), /Sign in/i);
  assert.match(
    friendlyMembershipRpcError("Billing interval mismatch: current=monthly, requested=annual. P0008", "upgrade"),
    /same billing cycle/i,
  );
});

test("friendlyMembershipRpcError preserves unknown server messages", () => {
  const msg = "Razorpay is not configured on the server.";
  assert.equal(friendlyMembershipRpcError(msg, "subscription"), msg);
});