import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";

export type StoreProductRow = Tables<"store_products">;

/** Active catalogue rows from store_products (server-authoritative). */
export async function fetchStoreProducts(): Promise<StoreProductRow[]> {
  const { data, error } = await supabase
    .from("store_products")
    .select(
      "id, slug, name, description, active, credit_price, fulfillment_type, metadata, created_at, updated_at",
    )
    .eq("active", true)
    .order("slug");

  if (error) throw new Error(error.message);
  return data ?? [];
}
