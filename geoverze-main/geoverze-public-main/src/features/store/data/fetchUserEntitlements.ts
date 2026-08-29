import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";

export type UserEntitlementRow = Tables<"user_entitlements">;

/** Own-row entitlements for the authenticated user. */
export async function fetchUserEntitlements(): Promise<UserEntitlementRow[]> {
  const { data, error } = await supabase
    .from("user_entitlements")
    .select(
      "id, user_id, product_id, product_slug, entitlement_type, source_type, source_order_id, granted_at, metadata",
    )
    .order("granted_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
