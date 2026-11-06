/**
 * GstoreAdminScreen — /geostore/admin
 *
 * Order management dashboard for Gstore admins.
 * Access is controlled server-side by GSTORE_ADMIN_EMAILS env var.
 *
 * Features:
 *   - View all orders (paginated, filterable by status)
 *   - Update order status (confirmed → processing → shipped → delivered)
 *   - Add tracking number
 *   - See order counts by status
 */

import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Package,
  RefreshCw,
  Search,
  ShieldAlert,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase/client";
import { selectUser, useAuthStore } from "@/stores/authStore";

import {
  getAdminOrdersFn,
  adminUpdateOrderFn,
  type AdminOrderRow,
} from "../lib/gstoreServerFns";
import { formatInrPaise } from "../lib/gstoreProductPrices";
import { StorefrontNav } from "../storefront/StorefrontNav";
import "../storefront/storefront.css";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

const STATUS_BADGE: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-800",
  confirmed:  "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  shipped:    "bg-indigo-100 text-indigo-800",
  delivered:  "bg-emerald-100 text-emerald-800",
  cancelled:  "bg-red-100 text-red-800",
  refunded:   "bg-gray-100 text-gray-800",
};

const PAYMENT_BADGE: Record<string, string> = {
  unpaid:    "bg-zinc-100 text-zinc-700",
  pending:   "bg-yellow-100 text-yellow-700",
  paid:      "bg-green-100 text-green-700",
  failed:    "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
  refunded:  "bg-purple-100 text-purple-700",
};

const NEXT_STATUS: Record<string, string> = {
  confirmed:  "processing",
  processing: "shipped",
  shipped:    "delivered",
};

function StatusBadge({ status, map }: { status: string; map: Record<string, string> }) {
  const cls = map[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {status}
    </span>
  );
}

// ── Order row ─────────────────────────────────────────────────────────────────

function OrderRow({
  order,
  accessToken,
  onUpdated,
}: {
  order: AdminOrderRow;
  accessToken: string;
  onUpdated: () => void;
}) {
  const [expanded, setExpanded]       = useState(false);
  const [tracking, setTracking]       = useState(order.tracking_number ?? "");
  const [updating, setUpdating]       = useState(false);

  const nextStatus = NEXT_STATUS[order.order_status];

  async function updateStatus(status: string) {
    setUpdating(true);
    try {
      await adminUpdateOrderFn({
        data: { access_token: accessToken, order_id: order.id, order_status: status },
      });
      toast.success(`Order updated to ${status}`);
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  }

  async function saveTracking() {
    if (!tracking.trim()) return;
    setUpdating(true);
    try {
      await adminUpdateOrderFn({
        data: { access_token: accessToken, order_id: order.id, tracking_number: tracking.trim() },
      });
      toast.success("Tracking number saved");
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setUpdating(false);
    }
  }

  async function cancelOrder() {
    if (!confirm(`Cancel order ${order.order_number}?`)) return;
    await updateStatus("cancelled");
  }

  return (
    <div className="border border-[#e8e8e8] rounded-xl overflow-hidden">
      {/* Row header */}
      <div
        className="flex items-center gap-4 px-5 py-4 bg-white hover:bg-[#fafafa] cursor-pointer transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[13px] font-bold text-black">{order.order_number}</span>
            {order.is_mock && (
              <span className="text-[9px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">TEST</span>
            )}
            <StatusBadge status={order.order_status} map={STATUS_BADGE} />
            <StatusBadge status={order.payment_status} map={PAYMENT_BADGE} />
          </div>
          <p className="text-[12px] text-[#666] mt-0.5">
            {order.customer_name} · {order.customer_email} · {order.shipping_city}, {order.shipping_state}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-[14px] text-black">{formatInrPaise(order.total_minor)}</p>
          <p className="text-[11px] text-[#999]">
            {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
            {" · "}{order.item_count} item{order.item_count !== 1 ? "s" : ""}
          </p>
        </div>
        <ChevronRight className={`h-4 w-4 text-[#999] flex-shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </div>

      {/* Expanded actions */}
      {expanded && (
        <div className="border-t border-[#f0f0f0] bg-[#fafafa] px-5 py-4 space-y-4">
          {/* Tracking */}
          <div>
            <label className="text-[11px] font-semibold text-[#555] uppercase tracking-wide mb-1 block">
              Tracking Number
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tracking}
                onChange={e => setTracking(e.target.value)}
                placeholder="e.g. DTDC1234567890"
                className="flex-1 rounded-lg border border-[#ddd] bg-white px-3 py-2 text-[13px] focus:border-black focus:outline-none"
              />
              <button
                onClick={saveTracking}
                disabled={updating || !tracking.trim()}
                className="bg-black text-white px-4 py-2 rounded-lg text-[12px] font-semibold hover:bg-[#222] disabled:opacity-50 transition-colors"
              >
                Save
              </button>
            </div>
          </div>

          {/* Status actions */}
          <div>
            <label className="text-[11px] font-semibold text-[#555] uppercase tracking-wide mb-1.5 block">
              Update Status
            </label>
            <div className="flex gap-2 flex-wrap">
              {nextStatus && (
                <button
                  onClick={() => updateStatus(nextStatus)}
                  disabled={updating}
                  className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-[12px] font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark as {nextStatus}
                </button>
              )}
              {order.order_status === "shipped" && (
                <button
                  onClick={() => updateStatus("delivered")}
                  disabled={updating}
                  className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-lg text-[12px] font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  <Truck className="h-3.5 w-3.5" />
                  Mark delivered
                </button>
              )}
              {!["cancelled", "refunded", "delivered"].includes(order.order_status) && (
                <button
                  onClick={cancelOrder}
                  disabled={updating}
                  className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg text-[12px] font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  Cancel order
                </button>
              )}
              {order.order_status === "cancelled" && (
                <button
                  onClick={() => updateStatus("refunded")}
                  disabled={updating}
                  className="flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-4 py-2 rounded-lg text-[12px] font-semibold hover:bg-purple-100 disabled:opacity-50 transition-colors"
                >
                  Mark refunded
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Admin Screen ─────────────────────────────────────────────────────────

export function GstoreAdminScreen() {
  const user = useAuthStore(selectUser);

  const [accessToken, setAccessToken]   = useState<string | null>(null);
  const [orders, setOrders]             = useState<AdminOrderRow[]>([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState("");

  const PAGE_SIZE = 50;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.access_token) setAccessToken(data.session.access_token);
    });
  }, []);

  async function loadOrders(tok = accessToken, pg = page, sf = statusFilter) {
    if (!tok) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminOrdersFn({
        data: { access_token: tok, page: pg, limit: PAGE_SIZE, status_filter: sf },
      });
      setOrders(result.orders);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessToken) void loadOrders(accessToken, 1, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, statusFilter]);

  if (!user) {
    return (
      <div id="gvrze-storefront">
        <StorefrontNav variant="solid" />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <ShieldAlert className="h-10 w-10 text-[#999]" />
          <p className="text-[16px] text-[#555]">Sign in to access the admin panel.</p>
          <Link to="/auth/login" className="text-sm font-medium underline">Sign in</Link>
        </div>
      </div>
    );
  }

  const filteredOrders = search.trim()
    ? orders.filter(o =>
        o.order_number.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_email.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div id="gvrze-storefront" className="gvrze-storefront-product">
      <StorefrontNav variant="solid" />

      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

          {/* Header */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[24px] font-bold text-black">Order Management</h1>
              <p className="text-[13px] text-[#777] mt-0.5">
                {total} total order{total !== 1 ? "s" : ""}
                {statusFilter !== "all" ? ` · filtered by "${statusFilter}"` : ""}
              </p>
            </div>
            <button
              onClick={() => loadOrders()}
              disabled={loading}
              className="flex items-center gap-1.5 border border-[#ddd] bg-white px-4 py-2 rounded-lg text-[12px] font-semibold hover:bg-[#f5f5f5] disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-[13px] text-red-700">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Access denied or error</p>
                <p className="text-[12px] mt-0.5">{error}</p>
                <p className="text-[11px] mt-1 text-red-500">
                  Your email must be listed in the GSTORE_ADMIN_EMAILS environment variable.
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-5 flex flex-wrap gap-3 items-center">
            {/* Status filter chips */}
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                    statusFilter === s
                      ? "bg-black text-white border-black"
                      : "bg-white text-[#666] border-[#ddd] hover:border-[#999]"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="ml-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#aaa]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search orders…"
                className="pl-8 pr-4 py-2 rounded-lg border border-[#ddd] bg-[#fafafa] text-[12px] focus:border-black focus:outline-none w-56"
              />
            </div>
          </div>

          {/* Orders list */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-[#aaa]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#ddd] border-t-black" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Package className="h-10 w-10 text-[#ddd]" />
              <p className="text-[14px] text-[#aaa]">No orders found</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredOrders.map(order => (
                <OrderRow
                  key={order.id}
                  order={order}
                  accessToken={accessToken!}
                  onUpdated={() => loadOrders()}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => { const p = page - 1; setPage(p); void loadOrders(accessToken, p, statusFilter); }}
                disabled={page === 1 || loading}
                className="px-4 py-2 border border-[#ddd] rounded-lg text-[12px] font-semibold disabled:opacity-40 hover:bg-[#f5f5f5] transition-colors"
              >
                Previous
              </button>
              <span className="text-[12px] text-[#777]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => { const p = page + 1; setPage(p); void loadOrders(accessToken, p, statusFilter); }}
                disabled={page >= totalPages || loading}
                className="px-4 py-2 border border-[#ddd] rounded-lg text-[12px] font-semibold disabled:opacity-40 hover:bg-[#f5f5f5] transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {/* Payment infrastructure link */}
          <div className="mt-6 flex justify-center">
            <Link
              to="/geostore/admin/payments"
              className="flex items-center gap-1.5 text-[12px] text-[#777] hover:text-black border border-[#ddd] px-4 py-2 rounded-lg hover:bg-[#f5f5f5] transition-colors"
            >
              Payment Infrastructure & Audit Log →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
