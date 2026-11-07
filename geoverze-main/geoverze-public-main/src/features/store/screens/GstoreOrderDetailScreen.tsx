/**
 * GstoreOrderDetailScreen — /geostore/order/$orderId
 *
 * Shows the full detail of a single Gstore order.
 */

import {
  ArrowLeft,
  FlaskConical,
  Package,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import { selectUser, useAuthStore } from "@/stores/authStore";

import { getGstoreOrderDetailFn } from "../lib/gstoreServerFns";
import { formatInrPaise } from "../lib/gstoreProductPrices";
import { StorefrontSolidShell } from "../storefront/StorefrontSolidShell";
import { SF_SHELL, SF_UI_FONT } from "../storefront/storefront-ui";
import {
  GstoreOrderEmpty,
  GstoreOrderStatusBadge,
  GstorePaymentBadge,
  gstoreGhostBtn,
} from "./gstoreOrderUi";

export function GstoreOrderDetailScreen() {
  const user     = useAuthStore(selectUser);
  const { orderId } = useParams({ strict: false }) as { orderId?: string };
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAccessToken(data.session?.access_token ?? null);
    });
  }, []);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["gstoreOrderDetail", orderId],
    queryFn: () =>
      getGstoreOrderDetailFn({
        data: { access_token: accessToken!, order_id: orderId! },
      }),
    enabled: Boolean(orderId && user && accessToken),
    staleTime: 60_000,
  });

  return (
    <StorefrontSolidShell>
      <div className={`${SF_SHELL} py-10 md:py-14`}>
        <nav className={`mb-5 flex flex-wrap items-center gap-1.5 text-[12px] text-[#6b7280] ${SF_UI_FONT}`}>
          <Link to="/geostore" className="hover:text-[#111827]">Gstore</Link>
          <span aria-hidden="true">/</span>
          <Link to="/geostore/orders" className="hover:text-[#111827]">Orders</Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#111827]">{order?.order_number ?? "Details"}</span>
        </nav>

        <div className="mb-6">
          <Link
            to="/geostore/orders"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#4b5563] transition-colors hover:text-[#111827]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to orders
          </Link>
        </div>

        <h1
          className="mb-8 text-[28px] font-semibold tracking-tight text-[#111827] md:text-[40px]"
          style={{ fontFamily: "var(--sf-font-body)" }}
        >
          {order ? `Order ${order.order_number}` : "Order details"}
        </h1>

        {isLoading ? (
          <div className="flex max-w-2xl items-center justify-center rounded-2xl border border-[#e8e8e8] bg-white p-16">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        ) : error || !order ? (
          <div className="max-w-2xl">
            <GstoreOrderEmpty
              icon={Package}
              title="Order not found"
              description="This order doesn't exist or you don't have access."
              action={
                <Link to="/geostore/orders" className={gstoreGhostBtn}>
                  Back to orders
                </Link>
              }
            />
          </div>
        ) : (
          <article className="max-w-2xl rounded-2xl border border-[#e8e8e8] bg-white p-6 shadow-[0_10px_28px_-22px_rgb(17_17_17_/_0.28)] sm:p-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className={`text-[11px] font-medium uppercase tracking-[0.12em] text-[#6b7280] ${SF_UI_FONT}`}>
                  Order number
                </p>
                <p className={`mt-0.5 text-[22px] font-bold text-[#111827] ${SF_UI_FONT}`}>
                  {order.order_number}
                </p>
                <p className="text-[13px] text-[#6b7280]">
                  Placed {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <GstoreOrderStatusBadge status={order.order_status} />
                <div className="flex items-center gap-2 text-[12px] text-[#6b7280]">
                  <span>Payment</span>
                  <GstorePaymentBadge status={order.payment_status} />
                </div>
              </div>
            </div>

            <div className="mb-5 border-t border-[#ececec] pt-5">
              <h3 className={`mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-[#6b7280] ${SF_UI_FONT}`}>
                Items ordered
              </h3>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#ececec] bg-[#f7f8fa]">
                      <Package className="h-5 w-5 text-[#9ca3af]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium leading-snug text-[#111827]">{item.product_name}</p>
                      {Object.entries(item.options ?? {}).length > 0 && (
                        <p className="mt-0.5 text-[11px] text-[#6b7280]">
                          {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                        </p>
                      )}
                      <p className="text-[11px] text-[#6b7280]">Qty: {item.quantity}</p>
                    </div>
                    <p className="shrink-0 text-[13px] font-medium text-[#111827]">
                      {formatInrPaise(item.line_total_minor)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5 space-y-2.5 border-t border-[#ececec] pt-5">
              <div className="flex justify-between text-[13px] text-[#4b5563]">
                <span>Subtotal</span><span>{formatInrPaise(order.subtotal_minor)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-[#4b5563]">
                <span>Shipping</span>
                <span>{order.shipping_minor === 0 ? "Free" : formatInrPaise(order.shipping_minor)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-[#9ca3af]">
                <span>GST (included)</span><span>{formatInrPaise(order.tax_minor)}</span>
              </div>
              <div className={`flex justify-between border-t border-[#ececec] pt-2.5 text-[16px] font-bold text-[#111827] ${SF_UI_FONT}`}>
                <div>
                  <span>Total</span>
                  <p className="mt-0.5 text-[10px] font-normal text-[#9ca3af]">Inclusive of all taxes</p>
                </div>
                <span>{formatInrPaise(order.total_minor)}</span>
              </div>
            </div>

            <div className="border-t border-[#ececec] pt-5">
              <h3 className={`mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[#6b7280] ${SF_UI_FONT}`}>
                Delivery address
              </h3>
              <div className="flex items-start gap-2 text-[13px] text-[#4b5563]">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#6b7280]" />
                <div>
                  <p className="font-medium text-[#111827]">{order.shipping_name}</p>
                  <p>{order.shipping_line1}</p>
                  {order.shipping_line2 && <p>{order.shipping_line2}</p>}
                  <p>{order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
                  <p>{order.shipping_country}</p>
                </div>
              </div>
            </div>

            {order.tracking_number && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#ececec] bg-[#f7f8fa] px-3 py-2.5 text-[12px] text-[#4b5563]">
                <Truck className="h-3.5 w-3.5 text-[#6b7280]" />
                <span>
                  Tracking number: <span className="font-medium text-[#111827]">{order.tracking_number}</span>
                </span>
              </div>
            )}

            {order.is_mock && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                <FlaskConical className="h-3.5 w-3.5" />
                Test order — no real payment was charged
              </div>
            )}
          </article>
        )}
      </div>
    </StorefrontSolidShell>
  );
}
