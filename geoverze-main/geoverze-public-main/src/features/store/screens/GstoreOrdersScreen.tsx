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
import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, EmptyState, GeoButton, PageHeader, SectionContainer } from "@/components/shared";

import { getMyGstoreOrdersFn, type GstoreOrderRow } from "../lib/gstoreServerFns";
import { formatInrPaise } from "../lib/gstoreProductPrices";

// ── Status helpers ────────────────────────────────────────────────────────────

const ORDER_STATUS_COLOR: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-800",
  confirmed:  "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  shipped:    "bg-indigo-100 text-indigo-800",
  delivered:  "bg-emerald-100 text-emerald-800",
  cancelled:  "bg-red-100 text-red-800",
  refunded:   "bg-gray-100 text-gray-800",
};

const PAYMENT_STATUS_COLOR: Record<string, string> = {
  unpaid:    "text-yellow-700",
  pending:   "text-yellow-700",
  paid:      "text-green-700",
  failed:    "text-red-700",
  cancelled: "text-gray-500",
  refunded:  "text-gray-500",
};

function StatusBadge({ status }: { status: string }) {
  const cls = ORDER_STATUS_COLOR[status] ?? "bg-gray-100 text-gray-800";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── Order card ────────────────────────────────────────────────────────────────

function GstoreOrderCard({ order }: { order: GstoreOrderRow }) {
  const payColor = PAYMENT_STATUS_COLOR[order.payment_status] ?? "text-gray-500";

  return (
    <AnimatedSection
      className="rounded-2xl border border-bronze/15 bg-charcoal/50 p-5 sm:p-6"
    >
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-semibold text-foreground">
              {order.order_number}
            </p>
            <StatusBadge status={order.order_status} />
            {order.is_mock && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-900/30 px-2 py-0.5 text-[10px] text-amber-400">
                <FlaskConical className="h-2.5 w-2.5" />
                Test
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-foreground/50">
            {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[16px] font-bold text-foreground">
            {formatInrPaise(order.total_minor)}
          </p>
          <p className={`text-[11px] font-medium ${payColor}`}>
            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
          </p>
        </div>
      </div>

      {/* Items preview */}
      {order.items.length > 0 && (
        <div className="mt-4 space-y-2.5 border-t border-bronze/10 pt-4">
          {order.items.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-center justify-between text-[12px]">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground/80">{item.product_name}</p>
                {Object.entries(item.options ?? {}).length > 0 && (
                  <p className="text-[10px] text-foreground/40">
                    {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                  </p>
                )}
              </div>
              <div className="ml-4 shrink-0 text-right text-foreground/60">
                <span>×{item.quantity}</span>
                <span className="ml-3">{formatInrPaise(item.line_total_minor)}</span>
              </div>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-[11px] text-foreground/40">
              +{order.items.length - 3} more item{order.items.length - 3 > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* Tracking */}
      {order.tracking_number && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-charcoal/30 px-3 py-2.5 text-[12px] text-foreground/70">
          <Truck className="h-3.5 w-3.5 text-bronze" />
          <span>Tracking: <span className="font-medium text-foreground">{order.tracking_number}</span></span>
        </div>
      )}

      {/* View detail link */}
      <div className="mt-4 flex justify-end">
        <Link
          to="/geostore/order/$orderId"
          params={{ orderId: order.id }}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground/60 hover:text-foreground transition-colors"
        >
          View details <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </AnimatedSection>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

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
      <PageShell>
        <PageHeader
          eyebrow="Gstore"
          title="Your orders"
          description="Sign in to view your order history."
          breadcrumb={[{ label: "Gstore", to: "/geostore" }, { label: "Orders" }]}
        />
        <SectionContainer>
          <EmptyState
            icon={ShoppingBag}
            title="Sign in to view orders"
            description="Your order history is available once you're signed in."
            action={
              <GeoButton asChild variant="solid">
                <Link to="/auth/login">Sign in</Link>
              </GeoButton>
            }
          />
        </SectionContainer>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Gstore"
        title="Your orders"
        description="Every purchase you've made from the Gstore."
        breadcrumb={[{ label: "Gstore", to: "/geostore" }, { label: "Orders" }]}
      />
      <SectionContainer size="wide">
        {isLoading ? (
          <EmptyState icon={Package} title="Loading orders…" />
        ) : error ? (
          <EmptyState
            icon={Package}
            title="Couldn't load orders"
            description="There was a problem fetching your orders. Please try again."
          />
        ) : !orders || orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="Your Gstore purchases will appear here."
            action={
              <GeoButton asChild variant="solid">
                <Link to="/geostore">Browse the store</Link>
              </GeoButton>
            }
          />
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <GstoreOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </SectionContainer>
    </PageShell>
  );
}
