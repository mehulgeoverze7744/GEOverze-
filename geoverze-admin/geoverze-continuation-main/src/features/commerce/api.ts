import { supabase } from "@/lib/supabase/client";
import { throwOnError } from "@/lib/supabase/query";
import type { Json, Tables } from "@/lib/supabase/database.types";

export type StoreProductRow = Tables<"store_products">;
export type StoreOrderRow = Tables<"store_orders">;
export type GstoreOrderRow = Tables<"gstore_orders">;
export type GstorePaymentRow = Tables<"gstore_payments">;
export type GstorePriceRow = Tables<"gstore_price_entries">;
export type CreditLedgerRow = Tables<"credit_ledger_entries">;
export type SubscriptionPlanRow = Tables<"subscription_plans">;
export type UserSubscriptionRow = Tables<"user_subscriptions">;
export type BillingPaymentRow = Tables<"billing_payments">;
export type EntitlementRow = Tables<"user_entitlements">;
export type RolloverRow = Tables<"credit_plan_rollover_config">;

export async function fetchStoreProducts() {
  return throwOnError(
    await supabase.from("store_products").select("*").order("updated_at", { ascending: false }),
    "Failed to load store products",
  );
}

export async function upsertStoreProduct(input: {
  id?: string;
  slug: string;
  name: string;
  description: string;
  credit_price: number;
  active: boolean;
  fulfillment_type: "digital" | "physical";
  metadata?: Json;
}) {
  const payload = {
    slug: input.slug,
    name: input.name,
    description: input.description,
    credit_price: input.credit_price,
    active: input.active,
    fulfillment_type: input.fulfillment_type,
    metadata: input.metadata ?? {},
  };
  const query = input.id
    ? supabase.from("store_products").update(payload).eq("id", input.id).select("*").single()
    : supabase.from("store_products").insert(payload).select("*").single();
  const data = throwOnError(await query, "Failed to save product");
  await supabase.rpc("admin_write_audit_log", {
    _action: input.id ? "store.product_updated" : "store.product_created",
    _entity_type: "store_product",
    _entity_id: data.id,
  });
  return data;
}

export async function fetchCreditOrders() {
  return throwOnError(
    await supabase
      .from("store_orders")
      .select("*, store_order_lines(*)")
      .order("created_at", { ascending: false }),
    "Failed to load credit orders",
  );
}

export async function fetchGstoreOrders() {
  return throwOnError(
    await supabase.from("gstore_orders").select("*").order("created_at", { ascending: false }),
    "Failed to load Gstore orders",
  );
}

export async function fetchGstoreOrderItems(orderId: string) {
  return throwOnError(
    await supabase.from("gstore_order_items").select("*").eq("order_id", orderId),
    "Failed to load order items",
  );
}

export async function updateGstoreOrder(orderId: string, status?: string, tracking?: string) {
  return throwOnError(
    await supabase.rpc("admin_update_gstore_order", {
      p_order_id: orderId,
      ...(status ? { p_order_status: status } : {}),
      ...(tracking ? { p_tracking_number: tracking } : {}),
    }),
    "Failed to update order",
  );
}

export async function fetchGstorePrices() {
  return throwOnError(
    await supabase.from("gstore_price_entries").select("*").order("created_at", { ascending: false }),
    "Failed to load Gstore prices",
  );
}

export async function fetchCreditLedger() {
  return throwOnError(
    await supabase.from("credit_ledger_entries").select("*").order("created_at", { ascending: false }).limit(500),
    "Failed to load credit ledger",
  );
}

export async function fetchCreditRollover() {
  return throwOnError(
    await supabase.from("credit_plan_rollover_config").select("*"),
    "Failed to load credit rollover config",
  );
}

export async function updateCreditRollover(planTier: string, rolloverMonths: number) {
  const data = throwOnError(
    await supabase
      .from("credit_plan_rollover_config")
      .update({ rollover_months: rolloverMonths })
      .eq("plan_tier", planTier)
      .select("*")
      .single(),
    "Failed to update rollover config",
  );
  await supabase.rpc("admin_write_audit_log", {
    _action: "credits.rollover_updated",
    _entity_type: "credit_plan_rollover_config",
    _entity_id: planTier,
    _metadata: { rollover_months: rolloverMonths },
  });
  return data;
}

export async function fetchSubscriptionPlans() {
  return throwOnError(
    await supabase.from("subscription_plans").select("*").order("monthly_price_cents"),
    "Failed to load subscription plans",
  );
}

export async function fetchUserSubscriptions() {
  return throwOnError(
    await supabase.from("user_subscriptions").select("*").order("updated_at", { ascending: false }),
    "Failed to load subscriptions",
  );
}

export async function fetchBillingPayments() {
  return throwOnError(
    await supabase.from("billing_payments").select("*").order("created_at", { ascending: false }),
    "Failed to load billing payments",
  );
}

export async function fetchGstorePayments() {
  return throwOnError(
    await supabase.from("gstore_payments").select("*").order("created_at", { ascending: false }),
    "Failed to load Gstore payments",
  );
}

export async function fetchEntitlements() {
  return throwOnError(
    await supabase.from("user_entitlements").select("*").order("granted_at", { ascending: false }),
    "Failed to load entitlements",
  );
}
