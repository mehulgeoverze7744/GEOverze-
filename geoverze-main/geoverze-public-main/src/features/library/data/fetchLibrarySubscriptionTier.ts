import { supabase } from "@/lib/supabase/client";

import { parseLibraryAccessTier, type LibraryAccessTier } from "../lib/access-tier";

export type LibrarySubscriptionSnapshot = {
  tier: LibraryAccessTier;
  displayName: string;
};

type PlanTierPayload = {
  tier?: string;
  display_name?: string;
};

/** Authenticated plan snapshot via get_my_plan_tier (server-authoritative). */
export async function fetchLibrarySubscriptionTier(): Promise<LibrarySubscriptionSnapshot> {
  const { data, error } = await supabase.rpc("get_my_plan_tier");
  if (error) throw new Error(`Failed to load membership tier: ${error.message}`);

  const payload = (data ?? {}) as PlanTierPayload;
  const tier = parseLibraryAccessTier(payload.tier) ?? "explorer";

  return {
    tier,
    displayName: payload.display_name ?? tier,
  };
}
