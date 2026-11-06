/**
 * GstoreOrderConfirmation — /geostore/order-confirmation
 *
 * Shown after successful payment. Displays order confirmation details,
 * order number, and navigation options.
 *
 * URL params: ?order_id=UUID&order_number=GV-XXXXX
 */

import {
  CheckCircle2,
  ChevronRight,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import { selectUser, useAuthStore } from "@/stores/authStore";

import {
  getGstoreOrderDetailFn,
  getGuestOrderDetailFn,
  type GstoreOrderDetail,
  type GuestOrderRow,
} from "../lib/gstoreServerFns";
import { formatInrPaise } from "../lib/gstoreProductPrices";
import { StorefrontNav } from "../storefront/StorefrontNav";
import "../storefront/storefront.css";

// ── Status badge ──────────────────────────────────────────────────────────────

const ORDER_STATUS_COLOR: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-800",
  confirmed:  "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  shipped:    "bg-indigo-100 text-indigo-800",
  delivered:  "bg-emerald-100 text-emerald-800",
  cancelled:  "bg-red-100 text-red-800",
  refunded:   "bg-gray-100 text-gray-800",
};

function StatusBadge({ status }: { status: string }) {
  const cls = ORDER_STATUS_COLOR[status] ?? "bg-gray-100 text-gray-800";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function GstoreOrderConfirmation() {
  const user   = useAuthStore(selectUser);
  const search = useSearch({ strict: false }) as Record<string, string>;
  const orderId     = search["order_id"] ?? "";
  const orderNumber = search["order_number"] ?? "";
  const guestToken  = search["guest_token"] ?? "";
  const isGuest     = !!guestToken && !user;

  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (!isGuest) {
      supabase.auth.getSession().then(({ data }) => {
        setAccessToken(data.session?.access_token ?? null);
      });
    }
  }, [isGuest]);

  // Authenticated order fetch
  const { data: authOrder, isLoading: authLoading } = useQuery({
    queryKey: ["gstoreOrder", orderId],
    queryFn: () => getGstoreOrderDetailFn({ data: { access_token: accessToken!, order_id: orderId } }),
    enabled: Boolean(orderId && accessToken && !isGuest),
    staleTime: 60_000,
  });

  // Guest order fetch
  const { data: guestOrder, isLoading: guestLoading } = useQuery({
    queryKey: ["gstoreGuestOrder", orderNumber, guestToken],
    queryFn: () => getGuestOrderDetailFn({ data: { order_number: orderNumber, guest_token: guestToken } }),
    enabled: Boolean(isGuest && orderNumber && guestToken),
    staleTime: 60_000,
  });

  const order = isGuest
    ? (guestOrder as GuestOrderRow | null | undefined)
    : (authOrder as GstoreOrderDetail | null | undefined);
  const isLoading = isGuest ? guestLoading : authLoading;

  if (!orderId) {
    return (
      <div id="gvrze-storefront">
        <StorefrontNav variant="solid" />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <ShoppingBag className="h-10 w-10 text-[#999]" />
          <p className="text-[16px] text-[#666]">Order not found.</p>
          <Link to="/geostore" className="text-sm font-medium underline">
            Back to store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div id="gvrze-storefront" className="gvrze-storefront-product">
      <StorefrontNav variant="solid" />

      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">

          {/* Success header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-[28px] font-bold text-black">Order Confirmed!</h1>
            <p className="mt-2 text-[14px] text-[#555]">
              Thank you for your purchase. We'll send you a shipping confirmation
              once your order is on its way.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#e0e0e0] bg-[#f9f9f9] px-4 py-2 text-[13px] font-medium text-black">
              <Package className="h-4 w-4 text-[#777]" />
              {orderNumber || order?.order_number || "Processing…"}
            </div>
          </div>

          {/* Guest note */}
          {isGuest && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[13px] text-blue-800">
              <strong>Tip:</strong> Save your order number <strong>{orderNumber}</strong> and
              the confirmation email to track your order later at{" "}
              <Link to="/geostore/order-lookup" className="underline font-medium">geostore order lookup</Link>.
            </div>
          )}

          {/* Order details card */}
          {isLoading ? (
            <div className="flex items-center justify-center rounded-2xl border border-[#e8e8e8] p-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
            </div>
          ) : order ? (
            <OrderDetailCard order={order as GstoreOrderDetail} />
          ) : null}

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {!isGuest ? (
              <Link
                to="/geostore/orders"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-black bg-black px-6 py-3.5 text-[13px] font-semibold text-white hover:bg-[#222]"
              >
                <Package className="h-4 w-4" />
                View my orders
              </Link>
            ) : (
              <Link
                to="/geostore/order-lookup"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-black bg-black px-6 py-3.5 text-[13px] font-semibold text-white hover:bg-[#222]"
              >
                <Package className="h-4 w-4" />
                Track my order
              </Link>
            )}
            <Link
              to="/geostore"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#e0e0e0] bg-white px-6 py-3.5 text-[13px] font-semibold text-black hover:bg-[#f0f0f0]"
            >
              <ShoppingBag className="h-4 w-4" />
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Order detail card ─────────────────────────────────────────────────────────

function OrderDetailCard({ order }: { order: GstoreOrderDetail }) {
  return (
    <div className="rounded-2xl border border-[#e8e8e8] bg-[#f9f9f9] p-6">

      {/* Status row */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#777]">Order number</p>
          <p className="mt-0.5 text-[18px] font-bold text-black">{order.order_number}</p>
        </div>
        <StatusBadge status={order.order_status} />
      </div>

      {/* Items */}
      <div className="space-y-3 border-t border-[#e0e0e0] pt-5">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-black">{item.product_name}</p>
              {Object.entries(item.options ?? {}).length > 0 && (
                <p className="text-[11px] text-[#777]">
                  {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                </p>
              )}
              <p className="text-[11px] text-[#777]">Qty: {item.quantity}</p>
            </div>
            <p className="shrink-0 text-[13px] font-medium text-black">
              {formatInrPaise(item.line_total_minor)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mt-5 space-y-2 border-t border-[#e0e0e0] pt-5">
        <div className="flex justify-between text-[12px] text-[#777]">
          <span>Subtotal</span>
          <span>{formatInrPaise(order.subtotal_minor)}</span>
        </div>
        <div className="flex justify-between text-[12px] text-[#777]">
          <span>Shipping</span>
          <span>{order.shipping_minor === 0 ? "Free" : formatInrPaise(order.shipping_minor)}</span>
        </div>
        <div className="flex justify-between text-[12px] text-[#777]">
          <span>GST (18%)</span>
          <span>{formatInrPaise(order.tax_minor)}</span>
        </div>
        <div className="flex justify-between border-t border-[#e0e0e0] pt-2.5 text-[16px] font-bold text-black">
          <span>Total paid</span>
          <span>{formatInrPaise(order.total_minor)}</span>
        </div>
      </div>

      {/* Shipping info */}
      {order.shipping_name && (
        <div className="mt-5 border-t border-[#e0e0e0] pt-5">
          <div className="flex items-start gap-2">
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#777]" />
            <div className="text-[12px] text-[#555]">
              <p className="font-medium text-black">Shipping to</p>
              <p>{order.shipping_name}</p>
              <p>{order.shipping_line1}{order.shipping_line2 ? `, ${order.shipping_line2}` : ""}</p>
              <p>{order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
              <p>{order.shipping_country}</p>
              {order.tracking_number && (
                <p className="mt-1 font-medium text-black">
                  Tracking: {order.tracking_number}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mock badge */}
      {order.is_mock && (
        <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
          ⚗️ This was a test order — no real payment was charged.
        </div>
      )}
    </div>
  );
}
