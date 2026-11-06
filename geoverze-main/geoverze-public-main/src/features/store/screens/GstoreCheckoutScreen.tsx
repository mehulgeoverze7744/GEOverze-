/**
 * GstoreCheckoutScreen — /geostore/checkout
 *
 * Complete, production-ready one-time product checkout for Gstore.
 *
 * Layout:
 *   LEFT  — Contact info + Shipping address form
 *   RIGHT — Order summary (product images, prices, totals)
 *   BOTTOM — Payment section (Razorpay / Mock / Unavailable)
 *
 * Payment paths:
 *   1. MOCK MODE  (MOCK_PAYMENTS_ENABLED=true) — simulates success/fail
 *   2. RAZORPAY   (RAZORPAY_KEY_ID configured) — real one-time payment
 *   3. UNAVAILABLE — neither configured
 *
 * Security:
 *   - Prices are NEVER trusted from the client.
 *   - createGstoreOrderFn validates all prices server-side.
 *   - verifyGstorePaymentFn checks HMAC-SHA256 signature before marking paid.
 */

import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  Lock,
  Package,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";

import { useAuthStore, selectUser } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { usePaymentConfig } from "@/features/pricing/hooks/usePaymentConfig";

import {
  loadGstoreRazorpayScript,
  getGstoreRazorpayKeyId,
  type GstoreRazorpaySuccessResponse,
} from "../lib/gstoreRazorpayClient";

import {
  createGstoreOrderFn,
  verifyGstorePaymentFn,
  confirmMockGstorePaymentFn,
  type GstoreCartItem,
  type GstoreCheckoutDetails,
} from "../lib/gstoreServerFns";
import {
  formatInrPaise,
  computeShippingMinor,
  computeTaxMinor,
  FREE_SHIPPING_THRESHOLD_MINOR,
  getProductPrice,
} from "../lib/gstoreProductPrices";
import { StorefrontNav } from "../storefront/StorefrontNav";
import "../storefront/storefront.css";

// ── Types ─────────────────────────────────────────────────────────────────────

type OrderResult = {
  order_id:     string;
  order_number: string;
  payment_id:   string;
  total_minor:  number;
  rzp_order_id?: string;
  mock_mode?:    boolean;
};

type ShippingMethod = "standard" | "tracked" | "express";

// ── Form helpers ──────────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#555]">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function FormInput({
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  disabled,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      autoComplete={autoComplete}
      className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3.5 py-3 text-[13px] text-black placeholder:text-[#aaa] focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
    />
  );
}

// ── Shipping method selector ──────────────────────────────────────────────────

const SHIPPING_OPTIONS: {
  id: ShippingMethod;
  label: string;
  note: string;
  priceMinor: number;
}[] = [
  { id: "standard", label: "Standard Delivery",  note: "7–12 business days", priceMinor: 0 },
  { id: "tracked",  label: "Tracked Shipping",   note: "4–7 business days",  priceMinor: 69_000 },
  { id: "express",  label: "Express Delivery",   note: "2–3 business days",  priceMinor: 149_900 },
];

// ── Main component ────────────────────────────────────────────────────────────

type CheckoutStep = "form" | "payment" | "confirming" | "done";

export function GstoreCheckoutScreen() {
  const navigate   = useNavigate();
  const user       = useAuthStore(selectUser);
  const lines      = useCartStore((s) => s.lines);
  const clearCart  = useCartStore((s) => s.clear);
  const { mockEnabled, configLoading } = usePaymentConfig();

  // Buy Now mode: ?buyNow=1&slug=...&qty=...&Size=M etc.
  const search = useSearch({ strict: false }) as Record<string, string>;
  const buyNowSlug = search["buyNow"] === "1" ? search["slug"] : null;
  const buyNowQty  = buyNowSlug ? Math.max(1, parseInt(search["qty"] ?? "1", 10)) : 1;
  const buyNowOptions: Record<string, string> = {};
  if (buyNowSlug) {
    for (const [k, v] of Object.entries(search)) {
      if (!["buyNow", "slug", "qty"].includes(k)) buyNowOptions[k] = v as string;
    }
  }

  // Build checkout items: Buy Now overrides cart
  const checkoutItems: GstoreCartItem[] = buyNowSlug
    ? [{ slug: buyNowSlug, quantity: buyNowQty, options: buyNowOptions }]
    : lines
        .filter((l) => l.unitAmount !== null)   // cash lines only
        .map((l) => ({ slug: l.slug, quantity: l.quantity, options: l.options }));

  // Client-side price preview (server always recalculates)
  const previewItems = checkoutItems.map((item) => {
    const p = getProductPrice(item.slug);
    return {
      ...item,
      name:            p?.name ?? item.slug,
      unitPriceMinor:  p?.priceMinor ?? 0,
      lineTotalMinor:  (p?.priceMinor ?? 0) * item.quantity,
    };
  });

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const previewSubtotal  = previewItems.reduce((s, i) => s + i.lineTotalMinor, 0);
  const hasPhysical      = previewItems.some((i) => {
    const p = getProductPrice(i.slug);
    return p?.physical ?? true;
  });
  const previewShipping  = computeShippingMinor(shippingMethod, previewSubtotal, hasPhysical);
  const previewTax       = computeTaxMinor(previewSubtotal, previewShipping);
  const previewTotal     = previewSubtotal + previewShipping + previewTax;

  // Form state
  const [step, setStep] = useState<CheckoutStep>("form");
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  // Customer details
  const [customerName,    setCustomerName]    = useState(user?.user_metadata?.["full_name"] ?? "");
  const [customerEmail,   setCustomerEmail]   = useState(user?.email ?? "");
  const [customerPhone,   setCustomerPhone]   = useState("");
  const [shippingName,    setShippingName]    = useState(user?.user_metadata?.["full_name"] ?? "");
  const [shippingLine1,   setShippingLine1]   = useState("");
  const [shippingLine2,   setShippingLine2]   = useState("");
  const [shippingCity,    setShippingCity]    = useState("");
  const [shippingState,   setShippingState]   = useState("");
  const [shippingPincode, setShippingPincode] = useState("");
  const [shippingCountry] = useState("India");
  const [deliveryNotes,   setDeliveryNotes]   = useState("");

  // Idempotency key — generated once per checkout session
  const idempotencyKey = useRef<string>(
    `gstore-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  // Guard: prevent double payment window
  const inflight = useRef(false);

  // ── Redirect if not signed in ────────────────────────────────────────────
  if (!user && !configLoading) {
    return (
      <div id="gvrze-storefront">
        <StorefrontNav variant="solid" />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <ShoppingBag className="h-10 w-10 text-[#999]" />
          <h1 className="text-[22px] font-semibold text-black">Sign in to checkout</h1>
          <p className="max-w-sm text-sm text-[#666]">
            Please sign in to your GVRZE account to place an order.
          </p>
          <Link
            to="/auth/login"
            className="mt-2 rounded-lg bg-black px-6 py-3 text-[13px] font-semibold text-white hover:bg-[#222]"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  // ── Redirect if cart is empty ────────────────────────────────────────────
  if (checkoutItems.length === 0) {
    return (
      <div id="gvrze-storefront">
        <StorefrontNav variant="solid" />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <ShoppingBag className="h-10 w-10 text-[#999]" />
          <h1 className="text-[22px] font-semibold text-black">Nothing to checkout</h1>
          <Link
            to="/geostore"
            className="mt-2 rounded-lg bg-black px-6 py-3 text-[13px] font-semibold text-white hover:bg-[#222]"
          >
            Back to store
          </Link>
        </div>
      </div>
    );
  }

  // ── Build order and open payment ─────────────────────────────────────────

  async function handlePlaceOrder() {
    if (inflight.current || submitting) return;
    if (!user) { toast.error("Please sign in first."); return; }

    // Validate required fields
    const required: [string, string][] = [
      [customerName,    "Full name"],
      [customerEmail,   "Email address"],
      [customerPhone,   "Phone number"],
      [shippingLine1,   "Address line 1"],
      [shippingCity,    "City"],
      [shippingState,   "State"],
      [shippingPincode, "Postal code"],
    ];
    for (const [val, label] of required) {
      if (!val.trim()) {
        toast.error(`Please enter your ${label}.`);
        return;
      }
    }

    inflight.current = true;
    setSubmitting(true);

    try {
      const session = await import("@/lib/supabase/client").then((m) =>
        m.supabase.auth.getSession(),
      );
      const accessToken = session.data.session?.access_token;
      if (!accessToken) throw new Error("Session expired. Please sign in again.");

      const details: GstoreCheckoutDetails = {
        customerName,
        customerEmail,
        customerPhone,
        shippingName:    shippingName || customerName,
        shippingLine1,
        shippingLine2,
        shippingCity,
        shippingState,
        shippingPincode,
        shippingCountry: "India",
        deliveryNotes,
        shippingMethod,
      };

      // Create order server-side (validates prices, creates Razorpay order)
      const result = await createGstoreOrderFn({
        data: {
          access_token:    accessToken,
          items:           checkoutItems,
          details,
          idempotency_key: idempotencyKey.current,
        },
      });

      setOrderResult(result);

      // ── Mock payment mode ─────────────────────────────────────────────
      if (result.mock_mode) {
        setStep("payment");
        return;
      }

      // ── Razorpay one-time payment ─────────────────────────────────────
      if (result.rzp_order_id) {
        await loadGstoreRazorpayScript();
        const RazorpayClass = (window as unknown as { Razorpay?: new (o: unknown) => { open(): void; on(e: string, h: unknown): void } }).Razorpay;
        if (!RazorpayClass) throw new Error("Razorpay failed to load.");

        const rzpKeyId = getGstoreRazorpayKeyId();
        setStep("payment");

        const capturedResult = result;
        const capturedToken  = accessToken;

        const rzp = new RazorpayClass({
          key:         rzpKeyId,
          order_id:    capturedResult.rzp_order_id,
          name:        "GVRZE Gstore",
          description: `Order ${capturedResult.order_number}`,
          image:       "/favicon.ico",
          prefill: {
            name:    customerName,
            email:   customerEmail,
            contact: customerPhone,
          },
          notes: {
            order_number:    capturedResult.order_number,
            gvrze_order_id:  capturedResult.order_id,
          },
          theme: { color: "#000000" },
          handler: async (response: GstoreRazorpaySuccessResponse) => {
            setStep("confirming");
            try {
              await verifyGstorePaymentFn({
                data: {
                  access_token:   capturedToken,
                  order_id:       capturedResult.order_id,
                  payment_id:     capturedResult.payment_id,
                  rzp_order_id:   response.razorpay_order_id,
                  rzp_payment_id: response.razorpay_payment_id,
                  rzp_signature:  response.razorpay_signature,
                },
              });

              if (!buyNowSlug) clearCart();
              navigate({
                to: "/geostore/order-confirmation",
                search: {
                  order_id:     capturedResult.order_id,
                  order_number: capturedResult.order_number,
                },
              });
            } catch (err) {
              toast.error((err as Error).message ?? "Payment verification failed.");
              setStep("form");
            } finally {
              inflight.current = false;
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => {
              inflight.current = false;
              setSubmitting(false);
              setStep("form");
              toast.message("Payment cancelled", {
                description: "Your order is saved. You can retry payment.",
              });
            },
          },
        });

        rzp.on("payment.failed", () => {
          inflight.current = false;
          setSubmitting(false);
          setStep("form");
          toast.error("Payment failed. Please try again.");
        });

        rzp.open();
        return;
      }

      // ── Payment unavailable ───────────────────────────────────────────
      toast.error("Payment is not configured. Contact support.");
      setStep("form");

    } catch (err) {
      toast.error((err as Error).message ?? "Something went wrong. Please try again.");
      setStep("form");
    } finally {
      if (step !== "payment") {
        inflight.current = false;
        setSubmitting(false);
      }
    }
  }

  // ── Mock payment handlers ────────────────────────────────────────────────

  async function handleMockOutcome(outcome: "success" | "failed" | "cancel") {
    if (!orderResult || !user) return;
    setStep("confirming");
    try {
      const session = await import("@/lib/supabase/client").then((m) =>
        m.supabase.auth.getSession(),
      );
      const accessToken = session.data.session?.access_token;
      if (!accessToken) throw new Error("Session expired.");

      await confirmMockGstorePaymentFn({
        data: {
          access_token: accessToken,
          order_id:     orderResult.order_id,
          payment_id:   orderResult.payment_id,
          outcome,
        },
      });

      if (outcome === "success") {
        if (!buyNowSlug) clearCart();
        navigate({
          to: "/geostore/order-confirmation",
          search: {
            order_id:     orderResult.order_id,
            order_number: orderResult.order_number,
          },
        });
      } else {
        toast.message(
          outcome === "cancel" ? "Payment cancelled" : "Payment failed",
          { description: "Your order is saved. You can retry payment." },
        );
        setStep("form");
        setOrderResult(null);
      }
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to process payment.");
      setStep("form");
    } finally {
      inflight.current = false;
      setSubmitting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const isLoading = configLoading || submitting || step === "confirming";

  return (
    <div id="gvrze-storefront" className="gvrze-storefront-product">
      <StorefrontNav variant="solid" />

      {/* TEST MODE banner */}
      {mockEnabled && (
        <div className="flex items-center justify-center gap-2 bg-amber-50 py-2.5 text-[12px] font-medium text-amber-800">
          <FlaskConical className="h-3.5 w-3.5" />
          TEST MODE — No real payments will be charged
        </div>
      )}

      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-[11px] text-[#888]">
              <li><Link to="/geostore" className="hover:text-black">Store</Link></li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li><Link to="/geostore/cart" className="hover:text-black">Cart</Link></li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li className="text-black font-medium">Checkout</li>
            </ol>
          </nav>

          <h1 className="mb-8 text-[26px] font-bold text-black sm:text-[30px]">Checkout</h1>

          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">

            {/* ── LEFT: Form ──────────────────────────────────────────────── */}
            <div className="space-y-8">

              {/* Contact info */}
              <section className="rounded-2xl border border-[#e8e8e8] bg-white p-6">
                <h2 className="mb-5 text-[14px] font-semibold uppercase tracking-[0.12em] text-black">
                  Contact Information
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FieldLabel required>Full name</FieldLabel>
                    <FormInput
                      value={customerName}
                      onChange={setCustomerName}
                      placeholder="Arjun Sharma"
                      autoComplete="name"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Email address</FieldLabel>
                    <FormInput
                      type="email"
                      value={customerEmail}
                      onChange={setCustomerEmail}
                      placeholder="arjun@example.com"
                      autoComplete="email"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Phone number</FieldLabel>
                    <FormInput
                      type="tel"
                      value={customerPhone}
                      onChange={setCustomerPhone}
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </section>

              {/* Shipping address */}
              <section className="rounded-2xl border border-[#e8e8e8] bg-white p-6">
                <h2 className="mb-5 text-[14px] font-semibold uppercase tracking-[0.12em] text-black">
                  Delivery Address
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FieldLabel>Recipient name</FieldLabel>
                    <FormInput
                      value={shippingName}
                      onChange={setShippingName}
                      placeholder="Same as above"
                      autoComplete="shipping name"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel required>Address line 1</FieldLabel>
                    <FormInput
                      value={shippingLine1}
                      onChange={setShippingLine1}
                      placeholder="House / flat number, street name"
                      autoComplete="shipping address-line1"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Address line 2 (optional)</FieldLabel>
                    <FormInput
                      value={shippingLine2}
                      onChange={setShippingLine2}
                      placeholder="Apartment, landmark, area"
                      autoComplete="shipping address-line2"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <FieldLabel required>City</FieldLabel>
                    <FormInput
                      value={shippingCity}
                      onChange={setShippingCity}
                      placeholder="Mumbai"
                      autoComplete="shipping address-level2"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <FieldLabel required>State</FieldLabel>
                    <FormInput
                      value={shippingState}
                      onChange={setShippingState}
                      placeholder="Maharashtra"
                      autoComplete="shipping address-level1"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Postal / PIN code</FieldLabel>
                    <FormInput
                      value={shippingPincode}
                      onChange={setShippingPincode}
                      placeholder="400001"
                      autoComplete="shipping postal-code"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <FieldLabel>Country</FieldLabel>
                    <div className="flex h-[46px] items-center rounded-lg border border-[#e0e0e0] bg-[#f5f5f5] px-3.5 text-[13px] text-[#555]">
                      India
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Delivery instructions (optional)</FieldLabel>
                    <textarea
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="e.g. Leave with security desk, ring bell twice"
                      rows={2}
                      disabled={isLoading}
                      className="w-full resize-none rounded-lg border border-[#e0e0e0] bg-white px-3.5 py-3 text-[13px] text-black placeholder:text-[#aaa] focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:bg-[#f5f5f5]"
                    />
                  </div>
                </div>
              </section>

              {/* Shipping method */}
              {hasPhysical && (
                <section className="rounded-2xl border border-[#e8e8e8] bg-white p-6">
                  <h2 className="mb-5 text-[14px] font-semibold uppercase tracking-[0.12em] text-black">
                    Shipping Method
                  </h2>
                  <div className="space-y-3">
                    {SHIPPING_OPTIONS.map((opt) => {
                      const isChecked = shippingMethod === opt.id;
                      const freeThisMet =
                        opt.id === "standard" &&
                        previewSubtotal >= FREE_SHIPPING_THRESHOLD_MINOR;
                      return (
                        <label
                          key={opt.id}
                          className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
                            isChecked
                              ? "border-black bg-[#f8f8f8]"
                              : "border-[#e0e0e0] hover:border-[#999]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                isChecked ? "border-black" : "border-[#ccc]"
                              }`}
                            >
                              {isChecked && (
                                <div className="h-2 w-2 rounded-full bg-black" />
                              )}
                            </div>
                            <input
                              type="radio"
                              className="sr-only"
                              checked={isChecked}
                              onChange={() => setShippingMethod(opt.id)}
                            />
                            <div>
                              <p className="text-[13px] font-medium text-black">{opt.label}</p>
                              <p className="text-[11px] text-[#777]">{opt.note}</p>
                            </div>
                          </div>
                          <p className="text-[13px] font-medium text-black">
                            {opt.priceMinor === 0 || freeThisMet
                              ? "Free"
                              : formatInrPaise(opt.priceMinor)}
                          </p>
                        </label>
                      );
                    })}
                  </div>
                  {previewSubtotal >= FREE_SHIPPING_THRESHOLD_MINOR && (
                    <p className="mt-3 flex items-center gap-1.5 text-[12px] text-green-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      You qualify for free standard shipping!
                    </p>
                  )}
                </section>
              )}

              {/* Mock payment panel */}
              {step === "payment" && orderResult?.mock_mode && (
                <section className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6">
                  <div className="mb-4 flex items-center gap-2 text-amber-800">
                    <FlaskConical className="h-5 w-5" />
                    <h2 className="text-[14px] font-semibold">Test Payment Gateway</h2>
                  </div>
                  <p className="mb-5 text-[12px] text-amber-700">
                    Mock mode is active. No real payment will be processed.
                    Choose an outcome to simulate:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleMockOutcome("success")}
                      disabled={step === "confirming"}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Simulate Success
                    </button>
                    <button
                      onClick={() => handleMockOutcome("failed")}
                      disabled={step === "confirming"}
                      className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Simulate Failure
                    </button>
                    <button
                      onClick={() => handleMockOutcome("cancel")}
                      disabled={step === "confirming"}
                      className="flex items-center gap-2 rounded-lg border border-[#ccc] bg-white px-5 py-2.5 text-[13px] font-semibold text-black hover:bg-[#f0f0f0] disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </section>
              )}

              {/* Confirming state */}
              {step === "confirming" && (
                <section className="flex items-center gap-3 rounded-2xl border border-[#e8e8e8] bg-[#f9f9f9] p-6 text-[14px] text-[#444]">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Verifying payment…
                </section>
              )}
            </div>

            {/* ── RIGHT: Order summary ─────────────────────────────────────── */}
            <div>
              <div className="sticky top-6 rounded-2xl border border-[#e8e8e8] bg-[#f9f9f9] p-6">
                <h2 className="mb-5 text-[14px] font-semibold uppercase tracking-[0.12em] text-black">
                  Order Summary ({checkoutItems.reduce((n, i) => n + i.quantity, 0)} item
                  {checkoutItems.reduce((n, i) => n + i.quantity, 0) > 1 ? "s" : ""})
                </h2>

                {/* Items */}
                <div className="space-y-4">
                  {previewItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#efefef]">
                        <Package className="h-5 w-5 text-[#aaa]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium leading-snug text-black line-clamp-2">
                          {item.name}
                        </p>
                        {Object.entries(item.options).length > 0 && (
                          <p className="mt-0.5 text-[11px] text-[#777]">
                            {Object.entries(item.options)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" · ")}
                          </p>
                        )}
                        <p className="mt-0.5 text-[11px] text-[#777]">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 text-[13px] font-medium text-black">
                        {formatInrPaise(item.lineTotalMinor)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-5 space-y-2.5 border-t border-[#e0e0e0] pt-5">
                  <div className="flex justify-between text-[13px] text-[#555]">
                    <span>Subtotal</span>
                    <span>{formatInrPaise(previewSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] text-[#555]">
                    <span>Shipping</span>
                    <span>
                      {previewShipping === 0 ? "Free" : formatInrPaise(previewShipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px] text-[#555]">
                    <span>GST (18%)</span>
                    <span>{formatInrPaise(previewTax)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#e0e0e0] pt-3 text-[16px] font-bold text-black">
                    <span>Total</span>
                    <span>{formatInrPaise(previewTotal)}</span>
                  </div>
                </div>

                {/* CTA */}
                {step !== "payment" && (
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isLoading || !user}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-black py-4 text-[14px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#222] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Pay Now · {formatInrPaise(previewTotal)}
                      </>
                    )}
                  </button>
                )}

                {/* Trust badges */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-[#777]">
                    <Lock className="h-3 w-3 shrink-0" />
                    Secure checkout — 256-bit SSL encryption
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#777]">
                    <Truck className="h-3 w-3 shrink-0" />
                    Free returns within 7 days of delivery
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#777]">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    GST included · Billed in INR
                  </div>
                </div>

                {/* Razorpay unavailable notice */}
                {!configLoading && !mockEnabled && !getGstoreRazorpayKeyId() && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800">
                    Payment gateway is not yet configured. Contact the team.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
