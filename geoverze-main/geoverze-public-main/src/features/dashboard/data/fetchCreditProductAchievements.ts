import { supabase } from "@/lib/supabase/client";
import {
  productImageForSlug,
  rewardShelfImageForSlug,
} from "@/features/store/data/productImages";

export type CreditProductAchievement = {
  id: string;
  productName: string;
  productSlug: string;
  fulfillmentType: "digital" | "physical" | string;
  creditsSpent: number;
  quantity: number;
  acquiredAt: string;
  imageSrc: string | null;
  imageAlt: string | null;
};

type CompletedStoreOrder = {
  id: string;
  status: string;
  credits_total: number;
  placed_at: string | null;
  created_at: string;
};

type StoreOrderLine = {
  id: string;
  order_id: string;
  product_slug: string;
  product_name: string;
  quantity: number;
  unit_credits: number;
  line_credits: number;
  fulfillment_type: string;
};

type StoreOrdersQuery = {
  from: (relation: "store_orders") => {
    select: (columns: string) => {
      eq: (
        column: "status",
        value: "completed",
      ) => {
        order: (
          column: "created_at",
          options: { ascending: boolean },
        ) => Promise<{
          data: CompletedStoreOrder[] | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
};

type StoreOrderLinesQuery = {
  from: (relation: "store_order_lines") => {
    select: (columns: string) => {
      in: (
        column: "order_id",
        values: string[],
      ) => Promise<{
        data: StoreOrderLine[] | null;
        error: { message: string } | null;
      }>;
    };
  };
};

function imageForSlug(slug: string) {
  return productImageForSlug(slug) ?? rewardShelfImageForSlug(slug);
}

/** Completed GeoCredit product acquisitions for the signed-in user (RLS-scoped). */
export async function fetchCreditProductAchievements(): Promise<CreditProductAchievement[]> {
  const { data: orders, error: ordersError } = await (supabase as unknown as StoreOrdersQuery)
    .from("store_orders")
    .select("id, status, credits_total, placed_at, created_at")
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (ordersError) throw new Error(ordersError.message);

  const completed = (orders ?? []).filter((order) => order.status === "completed");
  if (completed.length === 0) return [];

  const orderIds = completed.map((order) => order.id);
  const orderById = new Map(completed.map((order) => [order.id, order]));

  const { data: lines, error: linesError } = await (supabase as unknown as StoreOrderLinesQuery)
    .from("store_order_lines")
    .select(
      "id, order_id, product_slug, product_name, quantity, unit_credits, line_credits, fulfillment_type",
    )
    .in("order_id", orderIds);

  if (linesError) throw new Error(linesError.message);

  return (lines ?? [])
    .map((line) => {
      const order = orderById.get(line.order_id);
      if (!order) return null;

      const image = imageForSlug(line.product_slug);
      const acquiredAt = order.placed_at ?? order.created_at;

      return {
        id: line.id,
        productName: line.product_name,
        productSlug: line.product_slug,
        fulfillmentType: line.fulfillment_type,
        creditsSpent: line.line_credits,
        quantity: line.quantity,
        acquiredAt,
        imageSrc: image?.src ?? null,
        imageAlt: image?.alt ?? null,
      } satisfies CreditProductAchievement;
    })
    .filter((item): item is CreditProductAchievement => item != null)
    .sort((a, b) => new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime());
}
