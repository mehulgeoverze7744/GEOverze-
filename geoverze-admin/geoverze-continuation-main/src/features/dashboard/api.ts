import { adminKeys } from "@/lib/admin/keys";
import { supabase } from "@/lib/supabase/client";
import { throwOnError } from "@/lib/supabase/query";
import type { Json } from "@/lib/supabase/database.types";

export type DashboardMetrics = {
  total_users: number;
  active_users: number;
  suspended_users: number;
  dau: number;
  mau: number;
  new_users_7d: number;
  creators: number;
  library_creators: number;
  unverified_library_creators: number;
  published_quizzes: number;
  total_quizzes: number;
  question_bank: number;
  library_resources: number;
  published_library_resources: number;
  store_products: number;
  gstore_orders: number;
  gstore_orders_30d: number;
  credit_orders: number;
  gstore_revenue_minor_30d: number;
  billing_revenue_minor_30d: number;
  credits_issued: number;
  credits_redeemed: number;
  open_reports: number;
  open_tickets: number;
  active_subscriptions: number;
  billing_payments: number;
  gstore_payments: number;
  reward_claims: number;
  quiz_attempts_7d: number;
};

export type GrowthSeries = {
  users_by_week: Array<{ week: string; count: number }>;
  attempts_by_day: Array<{ day: string; count: number }>;
  gstore_revenue_by_week: Array<{ week: string; minor: number }>;
};

function asRecord(value: Json | null): Record<string, Json | undefined> {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  return {};
}

function numField(value: Json | undefined): number {
  return typeof value === "number" ? value : Number(value ?? 0) || 0;
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const data = throwOnError(
    await supabase.rpc("admin_dashboard_metrics"),
    "Failed to load dashboard metrics",
  );
  const row = asRecord(data);
  return {
    total_users: numField(row["total_users"]),
    active_users: numField(row["active_users"]),
    suspended_users: numField(row["suspended_users"]),
    dau: numField(row["dau"]),
    mau: numField(row["mau"]),
    new_users_7d: numField(row["new_users_7d"]),
    creators: numField(row["creators"]),
    library_creators: numField(row["library_creators"]),
    unverified_library_creators: numField(row["unverified_library_creators"]),
    published_quizzes: numField(row["published_quizzes"]),
    total_quizzes: numField(row["total_quizzes"]),
    question_bank: numField(row["question_bank"]),
    library_resources: numField(row["library_resources"]),
    published_library_resources: numField(row["published_library_resources"]),
    store_products: numField(row["store_products"]),
    gstore_orders: numField(row["gstore_orders"]),
    gstore_orders_30d: numField(row["gstore_orders_30d"]),
    credit_orders: numField(row["credit_orders"]),
    gstore_revenue_minor_30d: numField(row["gstore_revenue_minor_30d"]),
    billing_revenue_minor_30d: numField(row["billing_revenue_minor_30d"]),
    credits_issued: numField(row["credits_issued"]),
    credits_redeemed: numField(row["credits_redeemed"]),
    open_reports: numField(row["open_reports"]),
    open_tickets: numField(row["open_tickets"]),
    active_subscriptions: numField(row["active_subscriptions"]),
    billing_payments: numField(row["billing_payments"]),
    gstore_payments: numField(row["gstore_payments"]),
    reward_claims: numField(row["reward_claims"]),
    quiz_attempts_7d: numField(row["quiz_attempts_7d"]),
  };
}

function asSeries<T>(value: Json | undefined): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export async function fetchGrowthSeries(): Promise<GrowthSeries> {
  const data = throwOnError(await supabase.rpc("admin_growth_series"), "Failed to load growth series");
  const row = asRecord(data);
  return {
    users_by_week: asSeries(row["users_by_week"]),
    attempts_by_day: asSeries(row["attempts_by_day"]),
    gstore_revenue_by_week: asSeries(row["gstore_revenue_by_week"]),
  };
}

export { adminKeys };
