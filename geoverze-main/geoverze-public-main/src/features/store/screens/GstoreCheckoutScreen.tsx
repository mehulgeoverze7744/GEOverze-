/**
 * GstoreCheckoutScreen — /geostore/checkout
 *
 * Supports both authenticated and guest checkout.
 *
 * Layout:
 *   LEFT  — Contact info + Shipping address form
 *   RIGHT — Order summary (product images, prices, totals)
 *   BOTTOM — Payment section (Razorpay / Mock)
 *
 * Payment paths:
 *   1. MOCK MODE  (MOCK_PAYMENTS_ENABLED=true) — simulates success/fail/cancel
 *   2. RAZORPAY   (RAZORPAY_KEY_ID configured) — real one-time payment
 *   3. UNAVAILABLE — neither configured
 *
 * Security:
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
  FREE_SHIPPING_THRESHOLD_MINOR,
  getProductPrice,
} from "../lib/gstoreProductPrices";

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
  { value: "standard", label: "Standard Delivery",        note: "Free on orders ≥ ₹3,999 · 5–7 business days" },
  { value: "tracked",  label: "Tracked Delivery — ₹690",  note: "3–5 business days with tracking" },
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

// ── Empty cart state ──────────────────────────────────────────────────────────

function EmptyCartState() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <ShoppingBag className="w-16 h-16 text-zinc-600 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Your cart is empty</h2>
        <p className="text-zinc-400">Add some products to get started.</p>
        <Link
          to="/geostore"
          className="inline-block bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-zinc-200 transition-colors"
        >
          Browse Gstore
        </Link>
      </div>
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
  const mockEnabled = paymentConfig?.mockEnabled ?? false;
  const rzpConfigured = !!(paymentConfig?.razorpayKeyId);

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

  const shippingMinor = computeShippingMinor(shippingMethod, subtotalMinor, hasPhysical);
  const taxMinor      = computeTaxMinor(subtotalMinor, shippingMinor);
  const totalMinor    = subtotalMinor + shippingMinor + taxMinor;

  // State
  const [status, setStatus]         = useState<"idle" | "creating" | "paying" | "verifying" | "done" | "failed" | "cancelled">("idle");
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const inflight = useRef(false);
  const idempotencyKey = useRef(crypto.randomUUID());

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
      // Store securely in localStorage for guest order lookup
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
        theme: { color: "#ffffff" },

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
            // User closed modal — cancel the order
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
        // Mock mode: simulate gateway modal
        setStatus("paying");
        // The UI will show mock buttons
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

  // We need to track order state for the mock payment UI
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

  // ── Field helpers ───────────────────────────────────────────────────────────

  function field(key: keyof FormState) {
    return {
      value:    form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value })),
      className: `w-full bg-zinc-800 border ${fieldErrors[key] ? "border-red-500" : "border-zinc-700"} rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors`,
    };
  }

  const isLoading = status === "creating" || status === "verifying";

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center gap-3">
        <Lock className="w-5 h-5 text-zinc-400" />
        <span className="font-semibold text-lg">Secure Checkout</span>
        {mockEnabled && (
          <span className="ml-auto flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-medium px-3 py-1 rounded-full">
            <FlaskConical className="w-3.5 h-3.5" />
            TEST MODE — No real payments
          </span>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

        {/* ── LEFT: Form ── */}
        <div className="space-y-8">

          {/* Auth toggle (only shown if not fully in mock/guest mode) */}
          {!user && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <p className="text-sm text-zinc-400">Already have an account? Sign in to track orders easily.</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setGuestMode(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-colors ${guestMode ? "bg-white text-black border-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
                >
                  <User className="w-4 h-4" /> Continue as Guest
                </button>
                <Link
                  to="/auth"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-zinc-700 text-zinc-400 hover:border-zinc-500 transition-colors text-center"
                >
                  <UserCheck className="w-4 h-4" /> Sign In
                </Link>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-lg">Contact Information</h2>

            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">Full Name *</label>
              <input placeholder="Aryan Sharma" {...field("customerName")} />
              {fieldErrors.customerName && <p className="text-red-400 text-xs mt-1">{fieldErrors.customerName}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1.5 block">Email Address *</label>
                <input type="email" placeholder="aryan@example.com" {...field("customerEmail")} />
                {fieldErrors.customerEmail && <p className="text-red-400 text-xs mt-1">{fieldErrors.customerEmail}</p>}
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1.5 block">Mobile Number *</label>
                <div className="flex">
                  <span className="bg-zinc-700 border border-zinc-700 border-r-0 rounded-l-xl px-3 flex items-center text-zinc-400 text-sm">+91</span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    {...field("customerPhone")}
                    className={`flex-1 bg-zinc-800 border ${fieldErrors.customerPhone ? "border-red-500" : "border-zinc-700"} rounded-r-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors`}
                  />
                </div>
                {fieldErrors.customerPhone && <p className="text-red-400 text-xs mt-1">{fieldErrors.customerPhone}</p>}
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-lg">Shipping Address</h2>
            <p className="text-xs text-zinc-500">India only — we currently ship within India.</p>

            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">Recipient Name *</label>
              <input placeholder="Name on delivery label" {...field("shippingName")} />
              {fieldErrors.shippingName && <p className="text-red-400 text-xs mt-1">{fieldErrors.shippingName}</p>}
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">Address Line 1 *</label>
              <input placeholder="Flat / House No., Building, Street" {...field("shippingLine1")} />
              {fieldErrors.shippingLine1 && <p className="text-red-400 text-xs mt-1">{fieldErrors.shippingLine1}</p>}
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">Address Line 2 (optional)</label>
              <input placeholder="Area, Landmark" {...field("shippingLine2")} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1.5 block">City *</label>
                <input placeholder="Mumbai" {...field("shippingCity")} />
                {fieldErrors.shippingCity && <p className="text-red-400 text-xs mt-1">{fieldErrors.shippingCity}</p>}
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1.5 block">State *</label>
                <select {...field("shippingState")}>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {fieldErrors.shippingState && <p className="text-red-400 text-xs mt-1">{fieldErrors.shippingState}</p>}
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1.5 block">PIN Code *</label>
                <input placeholder="400001" maxLength={6} {...field("shippingPincode")} />
                {fieldErrors.shippingPincode && <p className="text-red-400 text-xs mt-1">{fieldErrors.shippingPincode}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">Country</label>
              <input value="India" readOnly className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-400 cursor-not-allowed" />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">Delivery Notes (optional)</label>
              <textarea
                placeholder="Leave at door, ring the bell, etc."
                rows={2}
                {...field("deliveryNotes")}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
              />
            </div>
          </section>

          {/* Shipping Method */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Truck className="w-5 h-5" /> Shipping Method
            </h2>
            <div className="space-y-3">
              {SHIPPING_OPTIONS.map(opt => {
                const previewShipping = computeShippingMinor(opt.value, subtotalMinor, hasPhysical);
                const isFree = previewShipping === 0;
                return (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                      shippingMethod === opt.value
                        ? "border-white bg-white/5"
                        : "border-zinc-700 hover:border-zinc-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.value}
                      checked={shippingMethod === opt.value}
                      onChange={() => setShippingMethod(opt.value)}
                      className="mt-0.5 accent-white"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{opt.label}</span>
                        {isFree && <span className="text-emerald-400 text-xs font-semibold">FREE</span>}
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{opt.note}</p>
                      {opt.value === "standard" && subtotalMinor < FREE_SHIPPING_THRESHOLD_MINOR && (
                        <p className="text-xs text-amber-400 mt-1">
                          Add {formatInrPaise(FREE_SHIPPING_THRESHOLD_MINOR - subtotalMinor)} more for free shipping
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Payment section */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Lock className="w-5 h-5" /> Payment
            </h2>

            {/* Error / result states */}
            {status === "failed" && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-300">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Payment failed</p>
                  {errorMsg && <p className="text-xs mt-1 text-red-400">{errorMsg}</p>}
                  <button
                    type="button"
                    onClick={() => { setStatus("idle"); setErrorMsg(null); inflight.current = false; idempotencyKey.current = crypto.randomUUID(); }}
                    className="mt-2 text-xs underline text-red-300 hover:text-white"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {status === "cancelled" && (
              <div className="flex items-center gap-3 bg-zinc-800 rounded-xl p-4 text-sm text-zinc-300">
                <X className="w-5 h-5" />
                <div>
                  Payment cancelled.
                  <button
                    type="button"
                    onClick={() => { setStatus("idle"); inflight.current = false; idempotencyKey.current = crypto.randomUUID(); }}
                    className="ml-2 text-xs underline hover:text-white"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Mock payment modal simulation */}
            {status === "paying" && mockEnabled && pendingOrder && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-amber-400 font-medium">
                  <FlaskConical className="w-5 h-5" />
                  Test Gateway — Choose an outcome
                </div>
                <p className="text-sm text-zinc-400">
                  Order <strong className="text-white">{pendingOrder.orderNumber}</strong> · {formatInrPaise(totalMinor)}
                </p>
                <div className="flex gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleMockOutcome("success")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    ✓ Payment Successful
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMockOutcome("failed")}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    ✗ Payment Failed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMockOutcome("cancel")}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    ← Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Payment methods info */}
            {(status === "idle" || status === "failed" || status === "cancelled") && (
              <div>
                {mockEnabled ? (
                  <p className="text-sm text-amber-400 flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4" /> Test mode — no real money charged
                  </p>
                ) : rzpConfigured ? (
                  <div className="space-y-2">
                    <p className="text-sm text-zinc-400">Accepts: UPI · Credit / Debit Cards · Net Banking · Wallets</p>
                    <p className="text-xs text-zinc-600">Secured by Razorpay · 256-bit SSL encryption</p>
                  </div>
                ) : (
                  <p className="text-sm text-red-400">Payment gateway not configured. Contact support.</p>
                )}
              </div>
            )}

            {/* Pay button */}
            {(status === "idle" || status === "failed" || status === "cancelled") && (mockEnabled || rzpConfigured) && (
              <button
                type="button"
                onClick={handleCheckoutWithMockCapture}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-white text-black py-4 rounded-xl font-bold text-base hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="animate-spin w-5 h-5 border-2 border-black/30 border-t-black rounded-full" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay {formatInrPaise(totalMinor)}
                  </>
                )}
              </button>
            )}

            {/* Status overlays */}
            {status === "creating" && (
              <div className="text-center py-4 text-zinc-400 text-sm">
                <div className="animate-spin w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full mx-auto mb-2" />
                Creating your order…
              </div>
            )}

            {status === "verifying" && (
              <div className="text-center py-4 text-zinc-400 text-sm">
                <div className="animate-spin w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full mx-auto mb-2" />
                Verifying payment…
              </div>
            )}

            <p className="text-xs text-zinc-600 text-center">
              By placing this order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </section>
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <aside className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sticky top-6 space-y-5">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Package className="w-5 h-5" /> Order Summary
              <span className="ml-auto text-sm text-zinc-500">{checkoutItems.length} item{checkoutItems.length !== 1 ? "s" : ""}</span>
            </h2>

            {/* Line items */}
            <div className="space-y-3">
              {checkoutItems.map((item, i) => {
                const p = getProductPrice(item.slug);
                const lineTotal = p ? p.priceMinor * item.quantity : 0;
                return (
                  <div key={i} className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p?.name ?? item.slug}</p>
                      {Object.entries(item.options).length > 0 && (
                        <p className="text-xs text-zinc-500">
                          {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                        </p>
                      )}
                      <p className="text-xs text-zinc-500">Qty {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold flex-shrink-0">{formatInrPaise(lineTotal)}</span>
                  </div>
                );
              })}
            </div>

            <hr className="border-zinc-800" />

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>{formatInrPaise(subtotalMinor)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Shipping ({SHIPPING_OPTIONS.find(o => o.value === shippingMethod)?.label})</span>
                <span>{shippingMinor === 0 ? <span className="text-emerald-400">FREE</span> : formatInrPaise(shippingMinor)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>GST (18%)</span>
                <span>{formatInrPaise(taxMinor)}</span>
              </div>
              <hr className="border-zinc-800" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatInrPaise(totalMinor)}</span>
              </div>
            </div>

            {/* Free shipping progress */}
            {subtotalMinor < FREE_SHIPPING_THRESHOLD_MINOR && shippingMethod === "standard" && (
              <div className="bg-zinc-800 rounded-xl p-3 text-xs text-zinc-400">
                <div className="flex justify-between mb-1.5">
                  <span>Free shipping progress</span>
                  <span>{formatInrPaise(subtotalMinor)} / {formatInrPaise(FREE_SHIPPING_THRESHOLD_MINOR)}</span>
                </div>
                <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (subtotalMinor / FREE_SHIPPING_THRESHOLD_MINOR) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <Link
              to={isBuyNow ? "/geostore" : "/geostore/cart"}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              {isBuyNow ? "Back to store" : "Edit cart"}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
