import type { SupabaseClient } from "@supabase/supabase-js";

import {
  pickMembershipForCheckout,
  type MembershipCheckoutRecord,
} from "./membershipCheckoutGuard";

const MEMBERSHIP_CHECKOUT_STATUSES = [
  "active",
  "trialing",
  "past_due",
  "pending",
  "incomplete",
] as const;

export async function loadMembershipForCheckout(
  sb: SupabaseClient,
): Promise<MembershipCheckoutRecord | null> {
  const { data, error } = await sb
    .from("user_subscriptions")
    .select(
      "id, plan_tier, billing_interval, status, current_period_start, current_period_end, provider_name",
    )
    .in("status", [...MEMBERSHIP_CHECKOUT_STATUSES])
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) throw new Error(error.message);
  return pickMembershipForCheckout((data ?? []) as MembershipCheckoutRecord[]);
}
