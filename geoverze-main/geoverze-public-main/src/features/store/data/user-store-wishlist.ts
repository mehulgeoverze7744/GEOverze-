import { supabase } from "@/lib/supabase/client";

/** Fetch authenticated user's wishlist slugs (newest first). */
export async function fetchServerWishlist(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_store_wishlist")
    .select("product_slug")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load wishlist: ${error.message}`);
  return (data ?? []).map((row) => row.product_slug);
}

export async function insertWishlistItem(userId: string, productSlug: string) {
  const { error } = await supabase
    .from("user_store_wishlist")
    .upsert(
      { user_id: userId, product_slug: productSlug },
      { onConflict: "user_id,product_slug", ignoreDuplicates: true },
    );
  if (error) throw new Error(`Failed to save wishlist item: ${error.message}`);
}

export async function deleteWishlistItem(userId: string, productSlug: string) {
  const { error } = await supabase
    .from("user_store_wishlist")
    .delete()
    .eq("user_id", userId)
    .eq("product_slug", productSlug);
  if (error) throw new Error(`Failed to remove wishlist item: ${error.message}`);
}
