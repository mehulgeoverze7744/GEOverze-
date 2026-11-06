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
import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, EmptyState, PageHeader, SectionContainer } from "@/components/shared";

import { getGstoreOrderDetailFn } from "../lib/gstoreServerFns";
import { formatInrPaise } from "../lib/gstoreProductPrices";

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
    <PageShell>
      <PageHeader
        eyebrow="Gstore"
        title={order ? `Order ${order.order_number}` : "Order Details"}
        breadcrumb={[
          { label: "Gstore", to: "/geostore" },
          { label: "Orders", to: "/geostore/orders" },
          { label: order?.order_number ?? "Details" },
        ]}
      />
      <SectionContainer>
        <div className="mb-5">
          <Link
            to="/geostore/orders"
            className="inline-flex items-center gap-1.5 text-[12px] text-foreground/50 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to orders
          </Link>
        </div>

        {isLoading ? (
          <EmptyState icon={Package} title="Loading order…" />
        ) : error || !order ? (
          <EmptyState icon={Package} title="Order not found" description="This order doesn't exist or you don't have access." />
        ) : (
          <AnimatedSection className="rounded-2xl border border-bronze/15 bg-charcoal/50 p-6 sm:p-8 max-w-2xl">

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-foreground/40">Order number</p>
                <p className="mt-0.5 text-[22px] font-bold text-foreground">{order.order_number}</p>
                <p className="text-[12px] text-foreground/50">
                  Placed {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={order.order_status} />
                <span className={`text-[12px] font-medium ${
                  order.payment_status === "paid" ? "text-green-500" :
                  order.payment_status === "failed" ? "text-red-500" : "text-foreground/50"
                }`}>
                  Payment: {order.payment_status}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-bronze/10 pt-5 mb-5">
              <h3 className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/40">
                Items ordered
              </h3>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-charcoal/50">
                      <Package className="h-5 w-5 text-foreground/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-foreground leading-snug">{item.product_name}</p>
                      {Object.entries(item.options ?? {}).length > 0 && (
                        <p className="text-[11px] text-foreground/50 mt-0.5">
                          {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                        </p>
                      )}
                      <p className="text-[11px] text-foreground/50">Qty: {item.quantity}</p>
                    </div>
                    <p className="shrink-0 text-[13px] font-medium text-foreground">
                      {formatInrPaise(item.line_total_minor)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-bronze/10 pt-5 space-y-2.5 mb-5">
              <div className="flex justify-between text-[12px] text-foreground/60">
                <span>Subtotal</span><span>{formatInrPaise(order.subtotal_minor)}</span>
              </div>
              <div className="flex justify-between text-[12px] text-foreground/60">
                <span>Shipping</span>
                <span>{order.shipping_minor === 0 ? "Free" : formatInrPaise(order.shipping_minor)}</span>
              </div>
              <div className="flex justify-between text-[12px] text-foreground/40">
                <span>GST (included)</span><span>{formatInrPaise(order.tax_minor)}</span>
              </div>
              <div className="flex justify-between border-t border-bronze/10 pt-2.5 text-[16px] font-bold text-foreground">
                <div>
                  <span>Total</span>
                  <p className="text-[10px] font-normal text-foreground/40 mt-0.5">Inclusive of all taxes</p>
                </div>
                <span>{formatInrPaise(order.total_minor)}</span>
              </div>
            </div>

            {/* Shipping address */}
            <div className="border-t border-bronze/10 pt-5">
              <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/40">
                Delivery address
              </h3>
              <div className="flex items-start gap-2 text-[12px] text-foreground/70">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
                <div>
                  <p className="font-medium text-foreground">{order.shipping_name}</p>
                  <p>{order.shipping_line1}</p>
                  {order.shipping_line2 && <p>{order.shipping_line2}</p>}
                  <p>{order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
                  <p>{order.shipping_country}</p>
                </div>
              </div>
            </div>

            {/* Tracking */}
            {order.tracking_number && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-charcoal/30 px-3 py-2.5 text-[12px] text-foreground/70">
                <Truck className="h-3.5 w-3.5 text-bronze" />
                <span>Tracking number: <span className="font-medium text-foreground">{order.tracking_number}</span></span>
              </div>
            )}

            {/* Mock label */}
            {order.is_mock && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-900/20 px-3 py-2 text-[11px] text-amber-400">
                <FlaskConical className="h-3.5 w-3.5" />
                Test order — no real payment was charged
              </div>
            )}
          </AnimatedSection>
        )}
      </SectionContainer>
    </PageShell>
  );
}
