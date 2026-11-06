/**
 * GstoreOrderLookupScreen — /geostore/order-lookup
 *
 * Secure guest order lookup by order number + guest token.
 * The guest token is stored in localStorage during checkout.
 * If the token is not in localStorage, the user can enter it manually.
 *
 * Security: Both order_number AND guest_token must match — a UUID
 * token that is virtually impossible to guess by brute force.
 */

import {
  CheckCircle2,
  Package,
  Search,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";

import { getGuestOrderDetailFn, type GuestOrderRow } from "../lib/gstoreServerFns";
import { formatInrPaise } from "../lib/gstoreProductPrices";
import { StorefrontNav } from "../storefront/StorefrontNav";
import "../storefront/storefront.css";

const ORDER_STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  pending:    { bg: "bg-yellow-50",  text: "text-yellow-800" },
  confirmed:  { bg: "bg-green-50",   text: "text-green-800"  },
  processing: { bg: "bg-blue-50",    text: "text-blue-800"   },
  shipped:    { bg: "bg-indigo-50",  text: "text-indigo-800" },
  delivered:  { bg: "bg-emerald-50", text: "text-emerald-800"},
  cancelled:  { bg: "bg-red-50",     text: "text-red-800"    },
  refunded:   { bg: "bg-gray-50",    text: "text-gray-800"   },
};

function StatusBadge({ status }: { status: string }) {
  const cls = ORDER_STATUS_COLOR[status] ?? { bg: "bg-gray-50", text: "text-gray-800" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cls.bg} ${cls.text}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function GstoreOrderLookupScreen() {
  const [orderNumber, setOrderNumber] = useState("");
  const [guestToken, setGuestToken]   = useState("");
  const [showToken, setShowToken]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [order, setOrder]             = useState<GuestOrderRow | null>(null);

  // Try to pre-fill from localStorage if the user has a saved token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const num = params.get("order_number");
    if (num) {
      setOrderNumber(num);
      const token = localStorage.getItem(`gstore_guest_${num}`);
      if (token) setGuestToken(token);
    }
  }, []);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim()) { setError("Please enter your order number."); return; }
    if (!guestToken.trim())  { setError("Please enter your order token."); return; }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const result = await getGuestOrderDetailFn({
        data: { order_number: orderNumber.trim(), guest_token: guestToken.trim() },
      });
      if (!result) {
        setError("Order not found. Please check your order number and token.");
      } else {
        setOrder(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to look up order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="gvrze-storefront" className="gvrze-storefront-product">
      <StorefrontNav variant="solid" />

      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-black">
              <Search className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-[26px] font-bold text-black">Track Your Order</h1>
            <p className="mt-2 text-[14px] text-[#666]">
              Enter your order number and the unique order token from your confirmation email.
            </p>
          </div>

          <form onSubmit={handleLookup} className="space-y-5 rounded-2xl border border-[#e8e8e8] bg-[#f9f9f9] p-6">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#333]">Order Number</label>
              <input
                type="text"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                placeholder="GV-10001"
                className="w-full rounded-xl border border-[#ddd] bg-white px-4 py-3 text-[14px] text-black placeholder-[#aaa] focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[13px] font-medium text-[#333]">Order Token</label>
                <button
                  type="button"
                  onClick={() => setShowToken(v => !v)}
                  className="text-[11px] text-[#777] underline"
                >
                  {showToken ? "Hide" : "What's this?"}
                </button>
              </div>
              {showToken && (
                <p className="mb-2 rounded-lg bg-blue-50 px-3 py-2 text-[12px] text-blue-700">
                  Your order token is a unique code sent in your confirmation email.
                  It was also saved in your browser during checkout — if you're on the same device,
                  enter your order number above and it may fill automatically.
                </p>
              )}
              <input
                type="text"
                value={guestToken}
                onChange={e => setGuestToken(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full rounded-xl border border-[#ddd] bg-white px-4 py-3 text-[13px] font-mono text-black placeholder-[#aaa] focus:border-black focus:outline-none"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 text-[14px] font-semibold text-white hover:bg-[#222] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <><Search className="h-4 w-4" /> Look up order</>
              )}
            </button>
          </form>

          {/* Result */}
          {order && (
            <div className="mt-8 rounded-2xl border border-[#e8e8e8] p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#777]">Order</p>
                  <p className="mt-0.5 text-[20px] font-bold text-black">{order.order_number}</p>
                </div>
                <StatusBadge status={order.order_status} />
              </div>

              {/* Items */}
              <div className="space-y-3 border-t border-[#eee] pt-4">
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
                    <p className="text-[13px] font-medium text-black shrink-0">
                      {formatInrPaise(item.line_total_minor)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1.5 border-t border-[#eee] pt-4 text-[12px]">
                <div className="flex justify-between text-[#777]">
                  <span>Subtotal</span><span>{formatInrPaise(order.subtotal_minor)}</span>
                </div>
                <div className="flex justify-between text-[#777]">
                  <span>Shipping</span>
                  <span>{order.shipping_minor === 0 ? "Free" : formatInrPaise(order.shipping_minor)}</span>
                </div>
                <div className="flex justify-between text-[#777]">
                  <span>GST</span><span>{formatInrPaise(order.tax_minor)}</span>
                </div>
                <div className="flex justify-between border-t border-[#eee] pt-2 text-[15px] font-bold text-black">
                  <span>Total</span><span>{formatInrPaise(order.total_minor)}</span>
                </div>
              </div>

              {/* Shipping info */}
              <div className="border-t border-[#eee] pt-4">
                <div className="flex items-start gap-2 text-[12px] text-[#555]">
                  <Truck className="mt-0.5 h-4 w-4 text-[#777] shrink-0" />
                  <div>
                    <p className="font-medium text-black">Shipping to</p>
                    <p>{order.shipping_name}</p>
                    <p>{order.shipping_line1}{order.shipping_line2 ? `, ${order.shipping_line2}` : ""}</p>
                    <p>{order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
                    <p>{order.shipping_country}</p>
                    {order.tracking_number && (
                      <p className="mt-1.5 font-semibold text-black">
                        Tracking: {order.tracking_number}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order placed */}
              <p className="text-center text-[11px] text-[#aaa]">
                Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}
              </p>

              {order.is_mock && (
                <div className="rounded-lg bg-amber-50 px-3 py-2 text-center text-[11px] text-amber-700">
                  ⚗️ Test order — no real payment was charged.
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center space-y-3">
            <Link to="/geostore" className="flex items-center justify-center gap-1.5 text-[13px] text-[#666] hover:text-black">
              <ShoppingBag className="h-4 w-4" /> Back to store
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
