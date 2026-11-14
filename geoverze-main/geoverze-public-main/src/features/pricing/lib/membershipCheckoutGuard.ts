/**
 * Pure membership checkout decisions. Used by the Razorpay create path and
 * payment-result UI so duplicate charges are not created for an already
 * continuing GVRZE membership. Upgrade / annual conversion stay allowed.
 */

import { TIER_ORDER, type BillingCycle, type TierId } from "../data/plans.ts";

function isUpgradeTo(currentTier: TierId, targetTier: TierId): boolean {
  const currentIdx = TIER_ORDER.indexOf(currentTier);
  const targetIdx = TIER_ORDER.indexOf(targetTier);
  return targetIdx > currentIdx && currentIdx !== -1 && targetIdx !== -1;
}

export const CONTINUING_MEMBERSHIP_STATUSES = ["active", "trialing"] as const;
export const RETRYABLE_MEMBERSHIP_STATUSES = ["past_due", "incomplete"] as const;

export type MembershipCheckoutAction = "create" | "upgrade" | "already_active";

export type MembershipCheckoutRecord = {
  id: string;
  plan_tier: string;
  billing_interval: string;
  status: string;
};

function asPaidTier(value: string): TierId | null {
  if (value === "basic" || value === "pro" || value === "advance") return value;
  return null;
}

function asCycle(value: string): BillingCycle | null {
  if (value === "monthly" || value === "annual") return value;
  return null;
}

export function isContinuingMembershipStatus(status: string): boolean {
  return (CONTINUING_MEMBERSHIP_STATUSES as readonly string[]).includes(status);
}

export function isRetryableMembershipStatus(status: string): boolean {
  return (RETRYABLE_MEMBERSHIP_STATUSES as readonly string[]).includes(status);
}

/**
 * Decide whether checkout may create a Razorpay order/subscription.
 * Same-plan repurchase of an active membership is blocked. Higher-tier
 * upgrades and monthly→annual conversions are allowed.
 */
export function evaluateMembershipCheckoutIntent(input: {
  existing: MembershipCheckoutRecord | null;
  targetTier: string;
  targetInterval: string;
}): { action: MembershipCheckoutAction; existing: MembershipCheckoutRecord | null } {
  const existing = input.existing;
  if (!existing) return { action: "create", existing: null };
  if (isRetryableMembershipStatus(existing.status)) {
    return { action: "create", existing };
  }
  if (!isContinuingMembershipStatus(existing.status)) {
    return { action: "create", existing };
  }

  const currentTier = asPaidTier(existing.plan_tier);
  const targetTier = asPaidTier(input.targetTier);
  const currentInterval = asCycle(existing.billing_interval);
  const targetInterval = asCycle(input.targetInterval);
  if (!currentTier || !targetTier || !currentInterval || !targetInterval) {
    return { action: "create", existing };
  }

  if (isUpgradeTo(currentTier, targetTier)) {
    return { action: "upgrade", existing };
  }
  if (currentTier === targetTier && currentInterval === "monthly" && targetInterval === "annual") {
    return { action: "upgrade", existing };
  }
  return { action: "already_active", existing };
}

export type PaymentResultKind =
  | "loading"
  | "signin"
  | "confirmed"
  | "existing"
  | "pending"
  | "failed"
  | "cancelled";

export function resolvePaymentResultKind(input: {
  authReady: boolean;
  signedIn: boolean;
  hinted: "processing" | "success" | "failed" | "cancelled" | "existing";
  checkoutActivated: boolean;
  checkoutPending: boolean;
  existingActive: boolean;
}): PaymentResultKind {
  if (!input.authReady) return "loading";
  if (input.checkoutActivated) {
    if (input.hinted === "existing" && input.existingActive) return "existing";
    return "confirmed";
  }
  if (input.checkoutPending) {
    if (input.hinted === "failed") return "failed";
    if (input.hinted === "cancelled") return "cancelled";
    return "pending";
  }
  if (input.existingActive) return "existing";
  if (input.hinted === "failed") return "failed";
  if (input.hinted === "cancelled") return "cancelled";
  if (!input.signedIn) return "signin";
  return "pending";
}
