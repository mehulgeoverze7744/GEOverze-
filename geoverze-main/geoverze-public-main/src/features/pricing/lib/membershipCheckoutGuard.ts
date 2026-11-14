/**
 * Pure membership checkout decisions. Used by the Razorpay create path,
 * mock checkout, and the checkout page so duplicate charges are not created
 * for an already continuing GVRZE membership. Legitimate upgrades stay allowed.
 */

import { TIER_ORDER, type BillingCycle, type TierId } from "../data/plans.ts";

function isUpgradeTo(currentTier: TierId, targetTier: TierId): boolean {
  const currentIdx = TIER_ORDER.indexOf(currentTier);
  const targetIdx = TIER_ORDER.indexOf(targetTier);
  return targetIdx > currentIdx && currentIdx !== -1 && targetIdx !== -1;
}

export const CONTINUING_MEMBERSHIP_STATUSES = ["active", "trialing"] as const;
export const PENDING_AUTHORIZATION_STATUSES = ["pending", "incomplete"] as const;
export const RETRYABLE_MEMBERSHIP_STATUSES = ["past_due"] as const;

export type MembershipCheckoutAction =
  | "create"
  | "upgrade"
  | "already_active"
  | "pending_authorization";

export type MembershipCheckoutRecord = {
  id: string;
  plan_tier: string;
  billing_interval: string;
  status: string;
  current_period_start?: string | null;
  current_period_end?: string | null;
  provider_name?: string | null;
};

function asPaidTier(value: string): TierId | null {
  if (value === "basic" || value === "pro" || value === "advance") return value;
  return null;
}

function asCycle(value: string): BillingCycle | null {
  if (value === "monthly" || value === "annual") return value;
  return null;
}

export function planDisplayName(tier: string): string {
  if (tier === "basic") return "Basic";
  if (tier === "pro") return "Pro";
  if (tier === "advance") return "Advance";
  return "GVRZE";
}

export function isContinuingMembershipStatus(status: string): boolean {
  return (CONTINUING_MEMBERSHIP_STATUSES as readonly string[]).includes(status);
}

export function isPendingAuthorizationStatus(status: string): boolean {
  return (PENDING_AUTHORIZATION_STATUSES as readonly string[]).includes(status);
}

export function isRetryableMembershipStatus(status: string): boolean {
  return (RETRYABLE_MEMBERSHIP_STATUSES as readonly string[]).includes(status);
}

/** Prefer an active membership, then a pending authorization, then a retryable one. */
export function pickMembershipForCheckout(
  rows: MembershipCheckoutRecord[],
): MembershipCheckoutRecord | null {
  const continuing = rows.find((row) => isContinuingMembershipStatus(row.status));
  if (continuing) return continuing;
  const pending = rows.find((row) => isPendingAuthorizationStatus(row.status));
  if (pending) return pending;
  const retryable = rows.find((row) => isRetryableMembershipStatus(row.status));
  return retryable ?? null;
}

/**
 * Decide whether checkout may create a Razorpay order/subscription.
 * Same-plan repurchase of an active membership is blocked. Higher-tier
 * upgrades are allowed. Pending authorizations cannot start a second payment.
 * Downgrades and same-tier cycle switches are not supported here — those go
 * through the billing dashboard.
 */
export function evaluateMembershipCheckoutIntent(input: {
  existing: MembershipCheckoutRecord | null;
  targetTier: string;
  targetInterval: string;
}): { action: MembershipCheckoutAction; existing: MembershipCheckoutRecord | null } {
  const existing = input.existing;
  if (!existing) return { action: "create", existing: null };
  if (isPendingAuthorizationStatus(existing.status)) {
    return { action: "pending_authorization", existing };
  }
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
    return { action: "already_active", existing };
  }

  if (isUpgradeTo(currentTier, targetTier) && currentInterval === targetInterval) {
    return { action: "upgrade", existing };
  }
  return { action: "already_active", existing };
}

export type MembershipCheckoutCta = "upgrade_pro" | "manage" | null;

export type MembershipCheckoutNotice = {
  action: MembershipCheckoutAction;
  paymentAllowed: boolean;
  title: string;
  body: string;
  cta: MembershipCheckoutCta;
  existingPlan: string | null;
};

export function describeMembershipCheckout(input: {
  action: MembershipCheckoutAction;
  existingPlan: string | null;
  targetPlan: string;
}): MembershipCheckoutNotice {
  const existingName = planDisplayName(input.existingPlan ?? "");
  const targetName = planDisplayName(input.targetPlan);

  if (input.action === "create") {
    return {
      action: "create",
      paymentAllowed: true,
      title: "",
      body: "",
      cta: null,
      existingPlan: input.existingPlan,
    };
  }

  if (input.action === "pending_authorization") {
    return {
      action: "pending_authorization",
      paymentAllowed: false,
      title: "Your membership payment is still processing.",
      body: "A previous checkout is waiting for confirmation. You will not be charged again until it is resolved.",
      cta: "manage",
      existingPlan: input.existingPlan,
    };
  }

  if (input.action === "upgrade") {
    return {
      action: "upgrade",
      paymentAllowed: true,
      title: `You're currently on ${existingName}.`,
      body: `Upgrade to ${targetName} to unlock more benefits.`,
      cta: null,
      existingPlan: input.existingPlan,
    };
  }

  const existing = asPaidTier(input.existingPlan ?? "");
  if (existing === "basic") {
    return {
      action: "already_active",
      paymentAllowed: false,
      title: "You already have an active Basic membership.",
      body: "You're currently subscribed to Basic. Upgrade to Pro to unlock more benefits.",
      cta: "upgrade_pro",
      existingPlan: input.existingPlan,
    };
  }
  if (existing === "pro") {
    return {
      action: "already_active",
      paymentAllowed: false,
      title: "You already have an active Pro membership.",
      body: "Your Pro membership is active. Manage your subscription from your billing dashboard.",
      cta: "manage",
      existingPlan: input.existingPlan,
    };
  }
  return {
    action: "already_active",
    paymentAllowed: false,
    title: `You already have an active ${existingName} membership.`,
    body: `Your ${existingName} membership is active. Manage your subscription from your billing dashboard.`,
    cta: "manage",
    existingPlan: input.existingPlan,
  };
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
