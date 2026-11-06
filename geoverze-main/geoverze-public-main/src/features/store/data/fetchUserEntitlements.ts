import { supabase } from "@/lib/supabase/client";

// "user_entitlements" is not in the generated Supabase types yet.
// Remove the cast once `supabase gen types --local` is re-run.
export type UserEntitlementRow = {
  id: string;
  user_id: string;
  product_id: string;
  product_slug: string;
  entitlement_type: string;
  source_type: string;
  source_order_id: string | null;
  granted_at: string;
  metadata: Record<string, unknown> | null;
};

/** Own-row entitlements for the authenticated user. */
export async function fetchUserEntitlements(): Promise<UserEntitlementRow[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("user_entitlements")
    .select(
      "id, user_id, product_id, product_slug, entitlement_type, source_type, source_order_id, granted_at, metadata",
    )
    .order("granted_at", { ascending: false }) as { data: UserEntitlementRow[] | null; error: { message: string } | null };

  if (error) throw new Error(error.message);
  return data ?? [];
}
