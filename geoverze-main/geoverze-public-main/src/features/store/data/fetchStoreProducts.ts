import { supabase } from "@/lib/supabase/client";

/** Catalogue row from store_products (typed locally until generated Database includes this table). */
export type StoreProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  active: boolean;
  credit_price: number;
  fulfillment_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type StoreProductsQuery = {
  from: (relation: "store_products") => {
    select: (columns: string) => {
      eq: (
        column: "active",
        value: boolean,
      ) => {
        order: (column: "slug") => Promise<{
          data: StoreProductRow[] | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
};

/** Active catalogue rows from store_products (server-authoritative). */
export async function fetchStoreProducts(): Promise<StoreProductRow[]> {
  const { data, error } = await (supabase as unknown as StoreProductsQuery)
    .from("store_products")
    .select(
      "id, slug, name, description, active, credit_price, fulfillment_type, metadata, created_at, updated_at",
    )
    .eq("active", true)
    .order("slug");

  if (error) throw new Error(error.message);
  return data ?? [];
}
