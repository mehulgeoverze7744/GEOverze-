/**
 * GstoreCheckoutScreen — /geostore/checkout
 *
 * Supports both authenticated and guest checkout.
 *
 * Layout (light-theme redesign):
 *   LEFT  — Contact info · Shipping address · Delivery method · Payment
 *   RIGHT — Order summary (sticky on desktop)
 *
 * Payment paths:
 *   1. MOCK MODE  (MOCK_PAYMENTS_ENABLED=true) — simulates success/fail/cancel
 *   2. RAZORPAY   (RAZORPAY_KEY_ID configured) — real one-time payment
 *   3. UNAVAILABLE — neither configured
 *
 * Security (unchanged from original):
 *   - Prices are NEVER trusted from the client.
 *   - Server functions validate all prices against the authoritative catalog.
 *   - verifyGstorePaymentFn / verifyGstoreGuestPaymentFn checks HMAC-SHA256
 *     before marking any order as paid.
 *   - Guest token is stored in localStorage so guests can track their order.
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
  User,
  UserCheck,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";

import "@/features/store/styles/checkout-light.css";

import { cn } from "@/lib/utils";
import { useAuthStore, selectUser } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { usePaymentConfig } from "@/features/pricing/hooks/usePaymentConfig";

import {
  loadGstoreRazorpayScript,
  type GstoreRazorpaySuccessResponse,
} from "../lib/gstoreRazorpayClient";

import {
  createGstoreOrderFn,
  createGstoreGuestOrderFn,
  verifyGstorePaymentFn,
  verifyGstoreGuestPaymentFn,
  confirmMockGstorePaymentFn,
  confirmMockGstoreGuestPaymentFn,
  type GstoreCartItem,
  type GstoreCheckoutDetails,
} from "../lib/gstoreServerFns";
import {
  formatInrPaise,
  computeShippingMinor,
  computeTaxMinor,
  computeOrderTotalMinor,
  FREE_SHIPPING_THRESHOLD_MINOR,
  getProductPrice,
} from "../lib/gstoreProductPrices";
import { productImageForSlug } from "../data/productImages";

// ── India-specific validation helpers ────────────────────────────────────────

/** Indian PIN code: 6 digits, first digit 1–9 */
function validateIndianPincode(pin: string): string | null {
  if (!/^[1-9][0-9]{5}$/.test(pin.trim())) {
    return "Enter a valid 6-digit Indian PIN code (e.g. 400001)";
  }
  return null;
}

/** Indian mobile: 10 digits, starts 6–9 (after stripping +91 / 0) */
function validateIndianPhone(phone: string): string | null {
  const stripped = phone.replace(/^(\+91|0)/, "").replace(/\s/g, "");
  if (!/^[6-9][0-9]{9}$/.test(stripped)) {
    return "Enter a valid 10-digit Indian mobile number (e.g. 9876543210)";
  }
  return null;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type ShippingMethod = "standard" | "tracked" | "express";

type FormState = {
  customerName:    string;
  customerEmail:   string;
  customerPhone:   string;
  shippingName:    string;
  shippingLine1:   string;
  shippingLine2:   string;
  shippingCity:    string;
  shippingState:   string;
  shippingPincode: string;
  deliveryNotes:   string;
};

const SHIPPING_OPTIONS: Array<{ value: ShippingMethod; label: string; note: string }> = [
  { value: "standard", label: "Standard Delivery",         note: "Free on orders ≥ ₹3,999 · 5–7 business days" },
  { value: "tracked",  label: "Tracked Delivery — ₹690",   note: "3–5 business days with tracking" },
  { value: "express",  label: "Express Delivery — ₹1,499", note: "1–2 business days" },
];

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

// ── Light-theme design tokens ─────────────────────────────────────────────────

const CO = {
  /** Page background */
  pageBg:     "bg-[#F3F4F6]",
  /** Card surface */
  cardBg:     "bg-white",
  /** Card border */
  cardBorder: "border border-[#E5E7EB]",
  /** Section heading */
  heading:    "text-[#111827] font-semibold",
  /** Body text */
  body:       "text-[#374151]",
  /** Label */
  label:      "text-[#4B5563] text-sm font-medium",
  /** Secondary / muted */
  muted:      "text-[#6B7280] text-sm",
  /** Divider */
  divider:    "border-[#E5E7EB]",
};

// ── Empty cart state ──────────────────────────────────────────────────────────

function EmptyCartState() {
  return (
    <div className={cn("min-h-[60vh] flex items-center justify-center p-6", CO.pageBg)}>
      <div className="text-center space-y-5 max-w-sm">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center">
          <ShoppingBag className="w-7 h-7 text-[#9CA3AF]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Your cart is empty</h2>
          <p className="text-[#6B7280] mt-1">Add some products to get started.</p>
        </div>
        <Link
          to="/geostore"
          className="inline-flex items-center gap-2 bg-[#111827] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1F2937] transition-colors"
        >
          Browse Gstore
        </Link>
      </div>
    </div>
  );
}

// ── Section card wrapper ──────────────────────────────────────────────────────

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white border border-[#E5E7EB] rounded-2xl shadow-sm", className)}>
      {children}
    </div>
  );
}

// ── Main checkout screen ──────────────────────────────────────────────────────

export function GstoreCheckoutScreen() {
  const user    = useAuthStore(selectUser);
  const session = useAuthStore(s => s.session);
  const navigate = useNavigate();

  const search = useSearch({ from: "/geostore/checkout" }) as {
    buyNow?: string;
    slug?: string;
    qty?: string;
    Size?: string;
    Colour?: string;
  };

  const cartLines = useCartStore(s => s.lines);
  const clearCart = useCartStore(s => s.clear);

  const { data: paymentConfig } = usePaymentConfig();
  const mockEnabled    = paymentConfig?.mockEnabled ?? false;
  const rzpConfigured  = !!(paymentConfig?.razorpayKeyId);

  // Guest mode toggle
  const [guestMode, setGuestMode] = useState(!user);

  // Form state
  const [form, setForm] = useState<FormState>({
    customerName:    user?.user_metadata?.["full_name"] ?? "",
    customerEmail:   user?.email ?? "",
    customerPhone:   "",
    shippingName:    user?.user_metadata?.["full_name"] ?? "",
    shippingLine1:   "",
    shippingLine2:   "",
    shippingCity:    "",
    shippingState:   INDIAN_STATES[18]!,
    shippingPincode: "",
    deliveryNotes:   "",
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");

  // Build cart items from URL params (Buy Now) or cart store
  const isBuyNow = search.buyNow === "1" && !!search.slug;
  const checkoutItems: GstoreCartItem[] = isBuyNow
    ? [{
        slug:     search.slug!,
        quantity: parseInt(search.qty ?? "1", 10),
        options:  {
          ...(search.Size   ? { Size:   search.Size   } : {}),
          ...(search.Colour ? { Colour: search.Colour } : {}),
        },
      }]
    : cartLines.map(l => ({
        slug:     l.slug,
        quantity: l.quantity,
        options:  l.options,
      }));

  // Price computation (client-side preview only — server recomputes for real)
  const hasPhysical = checkoutItems.some(item => {
    const p = getProductPrice(item.slug);
    return p?.physical ?? true;
  });

  const subtotalMinor = checkoutItems.reduce((acc, item) => {
    const p = getProductPrice(item.slug);
    return acc + (p ? p.priceMinor * item.quantity : 0);
  }, 0);

  // Product prices are GST-inclusive MRPs.
  // taxMinor = GST extracted from the inclusive subtotal (display/reporting only).
  // totalMinor = inclusive subtotal + shipping — GST is NOT added again.
  const shippingMinor = computeShippingMinor(shippingMethod, subtotalMinor, hasPhysical);
  const taxMinor      = computeTaxMinor(subtotalMinor, shippingMinor); // extracted, not added
  const totalMinor    = computeOrderTotalMinor(subtotalMinor, shippingMinor, 0);

  // Status state
  const [status, setStatus]     = useState<"idle" | "creating" | "paying" | "verifying" | "done" | "failed" | "cancelled">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inflight        = useRef(false);
  const idempotencyKey  = useRef(crypto.randomUUID());

  if (checkoutItems.length === 0) return <EmptyCartState />;

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};

    if (!form.customerName.trim())    errs.customerName  = "Full name is required";
    if (!form.customerEmail.trim())   errs.customerEmail = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail))
      errs.customerEmail = "Enter a valid email address";

    const phoneErr = validateIndianPhone(form.customerPhone);
    if (phoneErr) errs.customerPhone = phoneErr;

    if (!form.shippingName.trim())   errs.shippingName  = "Recipient name is required";
    if (!form.shippingLine1.trim())  errs.shippingLine1 = "Address line 1 is required";
    if (!form.shippingCity.trim())   errs.shippingCity  = "City is required";
    if (!form.shippingState.trim())  errs.shippingState = "State is required";

    const pinErr = validateIndianPincode(form.shippingPincode);
    if (pinErr) errs.shippingPincode = pinErr;

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Build cart details ──────────────────────────────────────────────────────

  function buildDetails(): GstoreCheckoutDetails {
    return {
      customerName:    form.customerName.trim(),
      customerEmail:   form.customerEmail.trim(),
      customerPhone:   form.customerPhone.trim(),
      shippingName:    form.shippingName.trim(),
      shippingLine1:   form.shippingLine1.trim(),
      shippingLine2:   form.shippingLine2.trim(),
      shippingCity:    form.shippingCity.trim(),
      shippingState:   form.shippingState.trim(),
      shippingPincode: form.shippingPincode.trim(),
      shippingCountry: "India",
      deliveryNotes:   form.deliveryNotes.trim(),
      shippingMethod,
    };
  }

  // ── Navigate to result ──────────────────────────────────────────────────────

  function navToConfirmation(orderId: string, orderNumber: string, guestToken?: string) {
    if (!isBuyNow) clearCart();
    const search: Record<string, string> = { order_id: orderId, order_number: orderNumber };
    if (guestToken) {
      localStorage.setItem(`gstore_guest_${orderNumber}`, guestToken);
      search.guest_token = guestToken;
    }
    void navigate({ to: "/geostore/order-confirmation", search });
  }

  // ── Handle Razorpay one-time payment ───────────────────────────────────────

  async function handleRazorpayPayment(
    rzpOrderId: string,
    rzpKeyId: string,
    orderId: string,
    paymentId: string,
    orderNumber: string,
    guestToken?: string,
  ) {
    await loadGstoreRazorpayScript();
    setStatus("paying");

    return new Promise<void>((resolve) => {
      const rzp = new (window as unknown as { Razorpay: new (opts: unknown) => { open(): void } }).Razorpay({
        key:        rzpKeyId,
        order_id:   rzpOrderId,
        amount:     totalMinor,
        currency:   "INR",
        name:       "GeoVerze Gstore",
        description: `Order ${orderNumber}`,
        prefill: {
          name:    form.customerName,
          email:   form.customerEmail,
          contact: form.customerPhone,
        },
        theme: { color: "#111827" },

        handler: async (response: GstoreRazorpaySuccessResponse) => {
          setStatus("verifying");
          try {
            if (guestToken) {
              await verifyGstoreGuestPaymentFn({
                data: {
                  order_id:       orderId,
                  payment_id:     paymentId,
                  guest_token:    guestToken,
                  rzp_order_id:   response.razorpay_order_id,
                  rzp_payment_id: response.razorpay_payment_id,
                  rzp_signature:  response.razorpay_signature,
                },
              });
            } else {
              await verifyGstorePaymentFn({
                data: {
                  order_id:       orderId,
                  payment_id:     paymentId,
                  access_token:   session!.access_token,
                  rzp_order_id:   response.razorpay_order_id,
                  rzp_payment_id: response.razorpay_payment_id,
                  rzp_signature:  response.razorpay_signature,
                },
              });
            }
            setStatus("done");
            navToConfirmation(orderId, orderNumber, guestToken);
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Payment verification failed";
            setStatus("failed");
            setErrorMsg(msg);
            toast.error(msg);
          }
          resolve();
        },

        modal: {
          ondismiss: async () => {
            try {
              if (guestToken) {
                await confirmMockGstoreGuestPaymentFn({
                  data: { order_id: orderId, payment_id: paymentId, guest_token: guestToken, outcome: "cancel" },
                });
              } else if (session) {
                await confirmMockGstorePaymentFn({
                  data: { order_id: orderId, payment_id: paymentId, access_token: session.access_token, outcome: "cancel" },
                });
              }
            } catch { /* best effort */ }
            setStatus("cancelled");
            inflight.current = false;
            resolve();
          },
        },
      });
      rzp.open();
    });
  }

  // ── Handle checkout submit ──────────────────────────────────────────────────

  async function handleCheckout() {
    if (inflight.current) return;
    if (!validate()) { toast.error("Please fix the form errors above."); return; }
    inflight.current = true;

    const isGuest = !user || guestMode;
    const details = buildDetails();

    setStatus("creating");
    setErrorMsg(null);

    try {
      let orderId: string;
      let orderNumber: string;
      let paymentId: string;
      let guestToken: string | undefined;
      let rzpOrderId: string | null;
      let rzpKeyId: string;
      let mockEnabledResult: boolean;

      if (isGuest) {
        const result = await createGstoreGuestOrderFn({
          data: {
            items:           checkoutItems,
            details,
            idempotency_key: idempotencyKey.current,
          },
        });
        orderId          = result.order_id;
        orderNumber      = result.order_number;
        paymentId        = result.payment_id;
        guestToken       = result.guest_token;
        rzpOrderId       = result.rzp_order_id;
        rzpKeyId         = result.rzp_key_id;
        mockEnabledResult = result.mock_enabled;
      } else {
        const result = await createGstoreOrderFn({
          data: {
            items:           checkoutItems,
            details,
            access_token:    session!.access_token,
            idempotency_key: idempotencyKey.current,
          },
        });
        orderId          = result.order_id;
        orderNumber      = result.order_number;
        paymentId        = result.payment_id;
        rzpOrderId       = result.rzp_order_id;
        rzpKeyId         = result.rzp_key_id;
        mockEnabledResult = result.mock_enabled;
      }

      if (mockEnabledResult) {
        setStatus("paying");
        return;
      }

      if (!rzpOrderId || !rzpKeyId) {
        throw new Error("Payment gateway not configured. Please contact support.");
      }

      await handleRazorpayPayment(rzpOrderId, rzpKeyId, orderId, paymentId, orderNumber, guestToken);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setStatus("failed");
      setErrorMsg(msg);
      toast.error(msg);
      inflight.current = false;
    }
  }

  // Track order state for mock payment UI
  const [pendingOrder, setPendingOrder] = useState<{
    orderId: string;
    paymentId: string;
    orderNumber: string;
    guestToken?: string;
  } | null>(null);

  async function handleCheckoutWithMockCapture() {
    if (inflight.current) return;
    if (!validate()) { toast.error("Please fix the form errors above."); return; }
    inflight.current = true;

    const isGuest = !user || guestMode;
    const details = buildDetails();

    setStatus("creating");
    setErrorMsg(null);

    try {
      let orderId: string;
      let orderNumber: string;
      let paymentId: string;
      let guestToken: string | undefined;
      let rzpOrderId: string | null;
      let rzpKeyId: string;
      let mockEnabledResult: boolean;

      if (isGuest) {
        const result = await createGstoreGuestOrderFn({
          data: {
            items:           checkoutItems,
            details,
            idempotency_key: idempotencyKey.current,
          },
        });
        orderId          = result.order_id;
        orderNumber      = result.order_number;
        paymentId        = result.payment_id;
        guestToken       = result.guest_token;
        rzpOrderId       = result.rzp_order_id;
        rzpKeyId         = result.rzp_key_id;
        mockEnabledResult = result.mock_enabled;
      } else {
        const result = await createGstoreOrderFn({
          data: {
            items:           checkoutItems,
            details,
            access_token:    session!.access_token,
            idempotency_key: idempotencyKey.current,
          },
        });
        orderId          = result.order_id;
        orderNumber      = result.order_number;
        paymentId        = result.payment_id;
        rzpOrderId       = result.rzp_order_id;
        rzpKeyId         = result.rzp_key_id;
        mockEnabledResult = result.mock_enabled;
      }

      if (mockEnabledResult) {
        setPendingOrder({ orderId, paymentId, orderNumber, guestToken });
        setStatus("paying");
        inflight.current = false;
        return;
      }

      if (!rzpOrderId || !rzpKeyId) {
        throw new Error("Payment gateway not configured.");
      }

      await handleRazorpayPayment(rzpOrderId, rzpKeyId, orderId, paymentId, orderNumber, guestToken);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setStatus("failed");
      setErrorMsg(msg);
      toast.error(msg);
      inflight.current = false;
    }
  }

  async function handleMockOutcome(outcome: "success" | "failed" | "cancel") {
    if (!pendingOrder) return;
    setStatus("verifying");
    const { orderId, paymentId, orderNumber, guestToken } = pendingOrder;
    try {
      if (guestToken) {
        await confirmMockGstoreGuestPaymentFn({
          data: { order_id: orderId, payment_id: paymentId, guest_token: guestToken, outcome },
        });
      } else {
        await confirmMockGstorePaymentFn({
          data: { order_id: orderId, payment_id: paymentId, access_token: session!.access_token, outcome },
        });
      }
      if (outcome === "success") {
        setStatus("done");
        navToConfirmation(orderId, orderNumber, guestToken);
      } else if (outcome === "failed") {
        setStatus("failed");
        setErrorMsg("Mock payment failed — payment declined.");
      } else {
        setStatus("cancelled");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to process mock outcome";
      setStatus("failed");
      setErrorMsg(msg);
      toast.error(msg);
    }
  }

  // ── Field helpers (light-theme) ─────────────────────────────────────────────

  const inputBase =
    "w-full bg-white rounded-xl px-4 py-3 text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 transition-colors text-sm";

  function inputClass(key: keyof FormState) {
    return cn(
      inputBase,
      fieldErrors[key]
        ? "border border-red-400 focus:ring-red-100 focus:border-red-400"
        : "border border-[#E5E7EB] focus:ring-[#111827]/8 focus:border-[#374151]",
    );
  }

  function field(key: keyof FormState) {
    return {
      value:    form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value })),
      className: inputClass(key),
    };
  }

  const isLoading = status === "creating" || status === "verifying";
  const freeShippingGap = FREE_SHIPPING_THRESHOLD_MINOR - subtotalMinor;
  const freeShippingPct = Math.min(100, (subtotalMinor / FREE_SHIPPING_THRESHOLD_MINOR) * 100);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    /*
     * gvrze-checkout wrapper:
     *   - Forces light background on the checkout content area, overriding
     *     the dark site theme for this route only.
     *   - Does NOT affect the global site nav, footer, or any other route.
     */
    <div className="gvrze-checkout min-h-screen bg-[#F3F4F6]">

      {/* ── Page header (replaces the old dark header bar) ─────────────────── */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          {/* Back link */}
          <Link
            to={isBuyNow ? "/geostore" : "/geostore/cart"}
            className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#111827] transition-colors text-sm mr-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180 flex-shrink-0" />
            <span className="hidden sm:inline">{isBuyNow ? "Back to store" : "Back to cart"}</span>
          </Link>

          {/* Secure checkout label */}
          <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
            <div className="w-7 h-7 rounded-full bg-[#111827] flex items-center justify-center flex-shrink-0">
              <Lock className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[#111827] text-base">Secure Checkout</span>
          </div>

          {/* TEST MODE badge */}
          {mockEnabled && (
            <span className="hidden sm:flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium px-3 py-1.5 rounded-full flex-shrink-0">
              <FlaskConical className="w-3.5 h-3.5" />
              TEST MODE
            </span>
          )}
        </div>
      </div>

      {/* Mobile TEST MODE banner */}
      {mockEnabled && (
        <div className="sm:hidden bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
          <FlaskConical className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span className="text-xs text-amber-700 font-medium">Test mode — no real payments</span>
        </div>
      )}

      {/* ── Main two-column layout ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">

        {/* ══ LEFT COLUMN: Forms ══════════════════════════════════════════════ */}
        <div className="space-y-5 min-w-0">

          {/* ── Guest / Auth toggle ── */}
          {!user && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-[#6B7280]" />
                <span className="text-[#374151] text-sm">
                  Already have an account?{" "}
                  <span className="text-[#6B7280]">Sign in to track your orders easily.</span>
                </span>
              </div>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setGuestMode(true)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all",
                    guestMode
                      ? "bg-[#111827] text-white border-[#111827] shadow-sm"
                      : "border-[#E5E7EB] text-[#374151] hover:border-[#9CA3AF] bg-white",
                  )}
                >
                  <User className="w-4 h-4" />
                  Continue as Guest
                </button>
                <Link
                  to="/auth"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-[#E5E7EB] text-[#374151] hover:border-[#9CA3AF] bg-white transition-all text-center"
                >
                  <UserCheck className="w-4 h-4" />
                  Sign In
                </Link>
              </div>
            </Card>
          )}

          {/* ── Contact Information ── */}
          <Card className="p-6">
            <h2 className="text-[#111827] font-semibold text-base mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#111827] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">1</span>
              Contact Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[#4B5563] text-sm font-medium mb-1.5">Full Name *</label>
                <input placeholder="Aryan Sharma" {...field("customerName")} />
                {fieldErrors.customerName && (
                  <p className="text-red-600 text-xs mt-1">{fieldErrors.customerName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#4B5563] text-sm font-medium mb-1.5">Email Address *</label>
                  <input type="email" placeholder="aryan@example.com" {...field("customerEmail")} />
                  {fieldErrors.customerEmail && (
                    <p className="text-red-600 text-xs mt-1">{fieldErrors.customerEmail}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[#4B5563] text-sm font-medium mb-1.5">Mobile Number *</label>
                  <div className="flex">
                    <span className="bg-[#F3F4F6] border border-r-0 border-[#E5E7EB] rounded-l-xl px-3 flex items-center text-[#6B7280] text-sm flex-shrink-0 font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      {...field("customerPhone")}
                      className={cn(
                        inputBase,
                        "rounded-l-none border-l-0",
                        fieldErrors.customerPhone
                          ? "border border-red-400 focus:ring-red-100 focus:border-red-400"
                          : "border border-[#E5E7EB] focus:ring-[#111827]/8 focus:border-[#374151]",
                      )}
                    />
                  </div>
                  {fieldErrors.customerPhone && (
                    <p className="text-red-600 text-xs mt-1">{fieldErrors.customerPhone}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* ── Shipping Address ── */}
          <Card className="p-6">
            <h2 className="text-[#111827] font-semibold text-base mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#111827] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">2</span>
              Shipping Address
            </h2>
            <p className="text-[#6B7280] text-xs mb-5 ml-8">🇮🇳 India only — we currently ship within India</p>

            <div className="space-y-4">
              <div>
                <label className="block text-[#4B5563] text-sm font-medium mb-1.5">Recipient Name *</label>
                <input placeholder="Name on delivery label" {...field("shippingName")} />
                {fieldErrors.shippingName && (
                  <p className="text-red-600 text-xs mt-1">{fieldErrors.shippingName}</p>
                )}
              </div>

              <div>
                <label className="block text-[#4B5563] text-sm font-medium mb-1.5">Address Line 1 *</label>
                <input placeholder="Flat / House No., Building, Street" {...field("shippingLine1")} />
                {fieldErrors.shippingLine1 && (
                  <p className="text-red-600 text-xs mt-1">{fieldErrors.shippingLine1}</p>
                )}
              </div>

              <div>
                <label className="block text-[#4B5563] text-sm font-medium mb-1.5">
                  Address Line 2{" "}
                  <span className="text-[#9CA3AF] font-normal">(optional)</span>
                </label>
                <input placeholder="Area, Landmark" {...field("shippingLine2")} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#4B5563] text-sm font-medium mb-1.5">City *</label>
                  <input placeholder="Mumbai" {...field("shippingCity")} />
                  {fieldErrors.shippingCity && (
                    <p className="text-red-600 text-xs mt-1">{fieldErrors.shippingCity}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[#4B5563] text-sm font-medium mb-1.5">State *</label>
                  <select {...field("shippingState")}>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {fieldErrors.shippingState && (
                    <p className="text-red-600 text-xs mt-1">{fieldErrors.shippingState}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[#4B5563] text-sm font-medium mb-1.5">PIN Code *</label>
                  <input placeholder="400001" maxLength={6} {...field("shippingPincode")} />
                  {fieldErrors.shippingPincode && (
                    <p className="text-red-600 text-xs mt-1">{fieldErrors.shippingPincode}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[#4B5563] text-sm font-medium mb-1.5">Country</label>
                <input
                  value="India"
                  readOnly
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#9CA3AF] cursor-not-allowed text-sm"
                />
              </div>

              <div>
                <label className="block text-[#4B5563] text-sm font-medium mb-1.5">
                  Delivery Notes{" "}
                  <span className="text-[#9CA3AF] font-normal">(optional)</span>
                </label>
                <textarea
                  placeholder="Leave at door, ring the bell, etc."
                  rows={2}
                  {...field("deliveryNotes")}
                  className={cn(
                    inputBase,
                    "resize-none",
                    "border border-[#E5E7EB] focus:ring-[#111827]/8 focus:border-[#374151]",
                  )}
                />
              </div>
            </div>
          </Card>

          {/* ── Shipping Method ── */}
          <Card className="p-6">
            <h2 className="text-[#111827] font-semibold text-base mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#111827] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">3</span>
              <Truck className="w-4 h-4 text-[#6B7280]" />
              Delivery Method
            </h2>

            <div className="space-y-3">
              {SHIPPING_OPTIONS.map(opt => {
                const previewShipping = computeShippingMinor(opt.value, subtotalMinor, hasPhysical);
                const isFree = previewShipping === 0;
                const isSelected = shippingMethod === opt.value;

                return (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                      isSelected
                        ? "border-[#111827] bg-[#F9FAFB] shadow-sm"
                        : "border-[#E5E7EB] hover:border-[#9CA3AF] bg-white",
                    )}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.value}
                      checked={isSelected}
                      onChange={() => setShippingMethod(opt.value)}
                      className="mt-0.5 accent-[#111827] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("font-medium text-sm", isSelected ? "text-[#111827]" : "text-[#374151]")}>
                          {opt.label}
                        </span>
                        {isFree && (
                          <span className="text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            FREE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B7280] mt-0.5">{opt.note}</p>
                      {opt.value === "standard" && subtotalMinor < FREE_SHIPPING_THRESHOLD_MINOR && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">
                          Add {formatInrPaise(FREE_SHIPPING_THRESHOLD_MINOR - subtotalMinor)} more for free shipping
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </Card>

          {/* ── Payment ── */}
          <Card className="p-6">
            <h2 className="text-[#111827] font-semibold text-base mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#111827] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">4</span>
              <Lock className="w-4 h-4 text-[#6B7280]" />
              Payment
            </h2>

            {/* ── Error state ── */}
            {status === "failed" && (
              <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-700 text-sm">Payment failed</p>
                  {errorMsg && <p className="text-xs mt-1 text-red-600">{errorMsg}</p>}
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setErrorMsg(null);
                      inflight.current = false;
                      idempotencyKey.current = crypto.randomUUID();
                    }}
                    className="mt-2 text-xs underline text-red-600 hover:text-red-800 font-medium"
                  >
                    Try again →
                  </button>
                </div>
              </div>
            )}

            {/* ── Cancelled state ── */}
            {status === "cancelled" && (
              <div className="mb-4 flex items-center gap-3 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl p-4">
                <X className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                <span className="text-sm text-[#374151]">Payment cancelled.</span>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    inflight.current = false;
                    idempotencyKey.current = crypto.randomUUID();
                  }}
                  className="ml-auto text-xs underline text-[#374151] hover:text-[#111827] font-medium"
                >
                  Try again
                </button>
              </div>
            )}

            {/* ── Mock gateway outcome picker ── */}
            {status === "paying" && mockEnabled && pendingOrder && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                  <FlaskConical className="w-4 h-4" />
                  Test Gateway — Choose an outcome
                </div>
                <p className="text-sm text-[#374151]">
                  Order <strong className="text-[#111827]">{pendingOrder.orderNumber}</strong>
                  {" · "}{formatInrPaise(totalMinor)}
                </p>
                <div className="flex gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleMockOutcome("success")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                  >
                    ✓ Payment Successful
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMockOutcome("failed")}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                  >
                    ✗ Payment Failed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMockOutcome("cancel")}
                    className="bg-white border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#374151] px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    ← Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ── Payment method info ── */}
            {(status === "idle" || status === "failed" || status === "cancelled") && (
              <div className="mb-5">
                {mockEnabled ? (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <FlaskConical className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-amber-700 font-medium">Test mode — no real money charged</p>
                  </div>
                ) : rzpConfigured ? (
                  <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 space-y-1">
                    <p className="text-sm text-[#374151] font-medium">Accepted payment methods</p>
                    <p className="text-sm text-[#6B7280]">UPI · Credit / Debit Cards · Net Banking · Wallets</p>
                    <p className="text-xs text-[#9CA3AF] mt-1">Secured by Razorpay · 256-bit SSL encryption</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">Payment gateway not configured. Contact support.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Pay button ── */}
            {(status === "idle" || status === "failed" || status === "cancelled") &&
              (mockEnabled || rzpConfigured) && (
                <button
                  type="button"
                  onClick={handleCheckoutWithMockCapture}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#111827] text-white py-4 rounded-xl font-bold text-base hover:bg-[#1F2937] active:bg-[#111827] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isLoading ? (
                    <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Pay {formatInrPaise(totalMinor)}
                    </>
                  )}
                </button>
              )}

            {/* ── Status overlays ── */}
            {status === "creating" && (
              <div className="text-center py-5">
                <div className="animate-spin w-7 h-7 border-2 border-[#E5E7EB] border-t-[#111827] rounded-full mx-auto mb-3" />
                <p className="text-sm text-[#6B7280]">Creating your order…</p>
              </div>
            )}

            {status === "verifying" && (
              <div className="text-center py-5">
                <div className="animate-spin w-7 h-7 border-2 border-[#E5E7EB] border-t-[#111827] rounded-full mx-auto mb-3" />
                <p className="text-sm text-[#6B7280]">Verifying payment…</p>
              </div>
            )}

            <p className="text-xs text-[#9CA3AF] text-center mt-4">
              By placing this order, you agree to our{" "}
              <Link to="/legal/terms" className="underline hover:text-[#6B7280] transition-colors">Terms of Service</Link>
              {" "}and{" "}
              <Link to="/legal/privacy" className="underline hover:text-[#6B7280] transition-colors">Privacy Policy</Link>.
            </p>
          </Card>
        </div>

        {/* ══ RIGHT COLUMN: Order Summary ════════════════════════════════════ */}
        <aside className="lg:sticky lg:top-6 space-y-4">
          <Card className="p-5">

            {/* Summary heading */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[#111827] font-semibold text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-[#6B7280]" />
                Order Summary
              </h2>
              <span className="text-xs text-[#6B7280] bg-[#F3F4F6] px-2.5 py-1 rounded-full border border-[#E5E7EB]">
                {checkoutItems.length} {checkoutItems.length === 1 ? "item" : "items"}
              </span>
            </div>

            {/* ── Line items ── */}
            <div className="space-y-4 mb-5">
              {checkoutItems.map((item, i) => {
                const p   = getProductPrice(item.slug);
                const img = productImageForSlug(item.slug);
                const lineTotal = p ? p.priceMinor * item.quantity : 0;

                return (
                  <div key={i} className="flex items-start gap-3">
                    {/* Product thumbnail */}
                    {img ? (
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F3F4F6] flex-shrink-0 border border-[#E5E7EB]">
                        <img
                          src={img.src}
                          alt={img.alt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-[#F3F4F6] flex-shrink-0 border border-[#E5E7EB] flex items-center justify-center">
                        <Package className="w-5 h-5 text-[#9CA3AF]" />
                      </div>
                    )}

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#111827] leading-snug truncate">
                        {p?.name ?? item.slug}
                      </p>
                      {Object.entries(item.options).length > 0 && (
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                        </p>
                      )}
                      <p className="text-xs text-[#9CA3AF] mt-0.5">Qty {item.quantity}</p>
                    </div>

                    {/* Line price */}
                    <span className="text-sm font-semibold text-[#111827] flex-shrink-0">
                      {formatInrPaise(lineTotal)}
                    </span>
                  </div>
                );
              })}
            </div>

            <hr className="border-[#E5E7EB] mb-4" />

            {/* ── Totals ── */}
            <div className="space-y-2.5 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Subtotal</span>
                <span className="text-[#374151] font-medium">{formatInrPaise(subtotalMinor)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">
                  Shipping ({SHIPPING_OPTIONS.find(o => o.value === shippingMethod)?.label ?? shippingMethod})
                </span>
                <span className={shippingMinor === 0 ? "text-emerald-600 font-semibold" : "text-[#374151] font-medium"}>
                  {shippingMinor === 0 ? "FREE" : formatInrPaise(shippingMinor)}
                </span>
              </div>
              {/* GST extracted from inclusive price — displayed for transparency, not added */}
              <div className="flex justify-between">
                <span className="text-[#6B7280]">GST (included)</span>
                <span className="text-[#9CA3AF]">{formatInrPaise(taxMinor)}</span>
              </div>

              <hr className="border-[#E5E7EB]" />

              <div className="flex justify-between items-baseline pt-0.5">
                <div>
                  <span className="font-bold text-base text-[#111827]">Total</span>
                  <p className="text-[10px] text-[#9CA3AF] font-normal mt-0.5">Inclusive of all taxes</p>
                </div>
                <span className="font-bold text-lg text-[#111827]">{formatInrPaise(totalMinor)}</span>
              </div>
            </div>

            {/* ── Free shipping progress bar ── */}
            {subtotalMinor < FREE_SHIPPING_THRESHOLD_MINOR && shippingMethod === "standard" && (
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3.5 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-[#374151] font-medium">Free shipping progress</span>
                  <span className="text-xs text-[#6B7280]">
                    {formatInrPaise(subtotalMinor)} / {formatInrPaise(FREE_SHIPPING_THRESHOLD_MINOR)}
                  </span>
                </div>
                <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${freeShippingPct}%` }}
                  />
                </div>
                <p className="text-xs text-[#6B7280] mt-1.5">
                  Add <span className="font-medium text-amber-600">{formatInrPaise(freeShippingGap)}</span> more for free standard shipping
                </p>
              </div>
            )}

            {/* ── Back link ── */}
            <Link
              to={isBuyNow ? "/geostore" : "/geostore/cart"}
              className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              {isBuyNow ? "Back to store" : "Edit cart"}
            </Link>
          </Card>

          {/* ── Trust signals ── */}
          <Card className="p-4">
            <div className="space-y-2.5">
              {[
                { icon: Lock, text: "256-bit SSL secured checkout" },
                { icon: CheckCircle2, text: "Verified by Razorpay payment gateway" },
                { icon: Truck, text: "Ships from India — delivery in 5–7 days" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-xs text-[#6B7280]">{text}</span>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
