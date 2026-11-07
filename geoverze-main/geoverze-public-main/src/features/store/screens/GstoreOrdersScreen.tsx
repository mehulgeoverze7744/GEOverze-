/**
 * GstoreOrdersScreen — /geostore/orders
 *
 * Shows the authenticated user's real order history from the database.
 * Falls back gracefully when user is not signed in.
 */

import {
  ChevronRight,
  FlaskConical,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import { selectUser, useAuthStore } from "@/stores/authStore";

import { getMyGstoreOrdersFn, type GstoreOrderRow } from "../lib/gstoreServerFns";
import { formatInrPaise } from "../lib/gstoreProductPrices";
import { StorefrontSolidShell } from "../storefront/StorefrontSolidShell";
import { SF_SHELL, SF_UI_FONT } from "../storefront/storefront-ui";
import {
  GstoreOrderEmpty,
  GstoreOrderStatusBadge,
  GstorePaymentBadge,
  gstorePrimaryBtn,
} from "./gstoreOrderUi";

function GstoreOrderCard({ order }: { order: GstoreOrderRow }) {
  return (
    <article className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-[0_10px_28px_-22px_rgb(17_17_17_/_0.28)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className={`text-[15px] font-semibold tracking-tight text-[#111827] ${SF_UI_FONT}`}>
              {order.order_number}
            </p>
            <GstoreOrderStatusBadge status={order.order_status} />
            {order.is_mock && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-100">
                <FlaskConical className="h-2.5 w-2.5" />
                Test
              </span>
            )}
          </div>
          <p className="mt-1 text-[12px] text-[#6b7280]">
            {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>

        <div className="text-right">
          <p className={`text-[18px] font-bold text-[#111827] ${SF_UI_FONT}`}>
            {formatInrPaise(order.total_minor)}
          </p>
          <div className="mt-1.5 flex justify-end">
            <GstorePaymentBadge status={order.payment_status} />
          </div>
        </div>
      </div>

      {order.items.length > 0 && (
        <div className="mt-4 space-y-2.5 border-t border-[#ececec] pt-4">
          {order.items.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3 text-[13px]">
              <div className="min-w-0">
                <p className="truncate font-medium text-[#1f2937]">{item.product_name}</p>
                {Object.entries(item.options ?? {}).length > 0 && (
                  <p className="text-[11px] text-[#6b7280]">
                    {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                  </p>
                )}
              </div>
              <div className="ml-4 shrink-0 text-right text-[#4b5563]">
                <span>×{item.quantity}</span>
                <span className="ml-3 font-medium text-[#111827]">{formatInrPaise(item.line_total_minor)}</span>
              </div>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-[12px] text-[#9ca3af]">
              +{order.items.length - 3} more item{order.items.length - 3 > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {order.tracking_number && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#ececec] bg-[#f7f8fa] px-3 py-2.5 text-[12px] text-[#4b5563]">
          <Truck className="h-3.5 w-3.5 text-[#6b7280]" />
          <span>
            Tracking: <span className="font-medium text-[#111827]">{order.tracking_number}</span>
          </span>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Link
          to="/geostore/order/$orderId"
          params={{ orderId: order.id }}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#4b5563] transition-colors hover:text-[#111827]"
        >
          View details <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

function OrdersHeading({ description }: { description: string }) {
  return (
    <div className="mb-8">
      <nav className={`mb-5 flex flex-wrap items-center gap-1.5 text-[12px] text-[#6b7280] ${SF_UI_FONT}`}>
        <Link to="/geostore" className="hover:text-[#111827]">Gstore</Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#111827]">Orders</span>
      </nav>
      <h1
        className="text-[28px] font-semibold tracking-tight text-[#111827] md:text-[40px]"
        style={{ fontFamily: "var(--sf-font-body)" }}
      >
        Your orders
      </h1>
      <p className="mt-1 text-sm text-[#6b7280]">{description}</p>
    </div>
  );
}

export function GstoreOrdersScreen() {
  const user = useAuthStore(selectUser);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAccessToken(data.session?.access_token ?? null);
    });
  }, []);

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["myGstoreOrders"],
    queryFn: () =>
      getMyGstoreOrdersFn({
        data: { access_token: accessToken!, limit: 20, offset: 0 },
      }),
    enabled: Boolean(user && accessToken),
    staleTime: 30_000,
  });

  if (!user) {
    return (
      <StorefrontSolidShell>
        <div className={`${SF_SHELL} py-10 md:py-14`}>
          <OrdersHeading description="Sign in to view your order history." />
          <GstoreOrderEmpty
            icon={ShoppingBag}
            title="Sign in to view orders"
            description="Your order history is available once you're signed in."
            action={
              <Link to="/auth/login" className={gstorePrimaryBtn}>
                Sign in
              </Link>
            }
          />
        </div>
      </StorefrontSolidShell>
    );
  }

  return (
    <StorefrontSolidShell>
      <div className={`${SF_SHELL} py-10 md:py-14`}>
        <OrdersHeading description="Every purchase you've made from the Gstore." />
        {isLoading ? (
          <div className="flex items-center justify-center rounded-2xl border border-[#e8e8e8] bg-white p-16">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        ) : error ? (
          <GstoreOrderEmpty
            icon={Package}
            title="Couldn't load orders"
            description="There was a problem fetching your orders. Please try again."
          />
        ) : !orders || orders.length === 0 ? (
          <GstoreOrderEmpty
            icon={Package}
            title="No orders yet"
            description="Your Gstore purchases will appear here."
            action={
              <Link to="/geostore" className={gstorePrimaryBtn}>
                Browse the store
              </Link>
            }
          />
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {orders.map((order) => (
              <GstoreOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </StorefrontSolidShell>
  );
}
