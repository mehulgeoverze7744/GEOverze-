/**
 * CheckoutScreen — /pricing/checkout?plan=<tier>&cycle=<monthly|annual>
 *
 * Payment paths (mutually exclusive):
 *
 *   1. MOCK MODE  (VITE_MOCK_PAYMENTS=true)
 *      → beginMockSubscription() creates pending DB records server-side.
 *      → MockPaymentGateway modal lets the tester choose Success/Fail/Cancel.
 *      → confirmMockSubscription() activates or cancels the subscription.
 *      → Never collects card details. Never contacts Razorpay.
 *
 *      To enable:
 *        Local:          VITE_MOCK_PAYMENTS=true in .env.local
 *        Vercel Preview: Vercel Dashboard → Project → Settings →
 *                        Environment Variables → add VITE_MOCK_PAYMENTS=true
 *                        with scope "Preview" (never Production) → Redeploy.
 *
 *   2. RAZORPAY  (VITE_RAZORPAY_KEY_ID is set)
 *      → createCheckoutSession() calls the Edge Function to create a
 *        Razorpay Subscription. The modal collects real payment.
 *      → Webhook activates the subscription server-side.
 *
 *   3. UNAVAILABLE  (neither mock nor Razorpay is configured)
 *      → Shows a clear "Payment unavailable" notice.
 *
 * Security rules (never violate):
 *   - Subscriptions are activated server-side only (SQL RPC or webhook).
 *   - inflight.current prevents duplicate payment windows.
 *   - VITE_MOCK_PAYMENTS must NOT be set in Vercel Production env vars.
 *   - Mock RPCs (begin/confirm_mock_subscription) require authentication
 *     and are marked is_mock=true — never usable for real payment flow.
 */

import {
  Check,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Info,
  Lock,
  RefreshCw,
  Shield,
  Tag,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";

import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { GeoInput } from "@/components/shared/GeoField";
import { useAuthStore, selectUser } from "@/stores/authStore";

import type { BillingCycle, TierId } from "../data/plans";
import { TIER_ORDER } from "../data/plans";
import { usePricingCatalog } from "../hooks/usePricingCatalog";
import {
  createCheckoutSession,
  CheckoutSessionError,
} from "../lib/createCheckoutSession";
import {
  loadRazorpayScript,
  getRazorpayKeyId,
  type RazorpaySuccessResponse,
  type RazorpayError as RzpError,
} from "../lib/razorpay-client";
import {
  beginMockSubscription,
  generateIdempotencyKey,
  MockPaymentError,
  type MockSession,
} from "../lib/mock-payment";
import { formatInrRupees } from "../lib/formatInr";
import { GST_CONFIG, calcGst } from "../lib/gstConfig";
import { MockPaymentGateway } from "../components/MockPaymentGateway";
import { usePaymentConfig } from "../hooks/usePaymentConfig";
import "../styles/checkout.css";

/* ── URL param parsing ───────────────────────────────────────────────────── */

function useSafeSearch(): { plan: TierId; cycle: BillingCycle } {
  const raw = useSearch({ strict: false }) as Record<string, unknown>;
  const plan =
    typeof raw["plan"] === "string" && (TIER_ORDER as readonly string[]).includes(raw["plan"])
      ? (raw["plan"] as TierId)
      : "pro";
  const cycle =
    raw["cycle"] === "annual" || raw["cycle"] === "monthly"
      ? (raw["cycle"] as BillingCycle)
      : "monthly";
  return { plan, cycle };
}

/* ── Billing address ─────────────────────────────────────────────────────── */

type BillingDetails = {
  displayName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
};

const EMPTY_BILLING: BillingDetails = {
  displayName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  gstin: "",
};

function validateBilling(d: BillingDetails): Partial<Record<keyof BillingDetails, string>> {
  const errors: Partial<Record<keyof BillingDetails, string>> = {};
  if (!d.displayName.trim()) errors.displayName = "Name is required";
  if (!d.line1.trim()) errors.line1 = "Address line 1 is required";
  if (!d.city.trim()) errors.city = "City is required";
  if (!d.state.trim()) errors.state = "State is required";
  if (!d.pincode.trim()) {
    errors.pincode = "PIN code is required";
  } else if (!/^\d{6}$/.test(d.pincode.trim())) {
    errors.pincode = "Enter a valid 6-digit PIN code";
  }
  if (d.gstin.trim()) {
    if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
      d.gstin.trim().toUpperCase(),
    )) {
      errors.gstin = "Enter a valid GSTIN (e.g. 29ABCDE1234F1Z5)";
    }
  }
  return errors;
}

/* ── Component ───────────────────────────────────────────────────────────── */

export function CheckoutScreen() {
  const { plan: initialPlan, cycle: initialCycle } = useSafeSearch();
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);

  /**
   * Runtime payment config — reads from the server (process.env) so that
   * changing VITE_MOCK_PAYMENTS in Vercel takes effect WITHOUT a rebuild.
   * Falls back to build-time constants while loading.
   */
  // razorpayEnabled comes from the server runtime check (process.env).
  // This unifies mock + razorpay config reads so changing a Vercel env var
  // is reflected immediately on the next page load — no rebuild needed.
  const { mockEnabled, razorpayEnabled: razorpayReady, configLoading } = usePaymentConfig();

  /* UI state */
  const [cycle, setCycle] = useState<BillingCycle>(initialCycle);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [billingDetails, setBillingDetails] = useState<BillingDetails>(EMPTY_BILLING);
  const [billingErrors, setBillingErrors] = useState<Partial<Record<keyof BillingDetails, string>>>({});
  const [showBillingAddress, setShowBillingAddress] = useState(true);

  /* Mock gateway state */
  const [mockSession, setMockSession] = useState<MockSession | null>(null);

  /* Plan data */
  const { plans, loading: catalogLoading, error: catalogError } = usePricingCatalog();
  const plan = plans.find((p) => p.id === initialPlan) ?? null;
  const price = plan?.prices[cycle];

  /* Duplicate-payment guard */
  const inflight = useRef(false);

  /* ── GST calculation ──────────────────────────────────────────────────── */
  function getApproxRupees(): number {
    if (!plan) return 0;
    const p = plan.prices[cycle];
    if (p.amount === "Free") return 0;
    const numeric = parseFloat(p.amount.replace(/[^\d.]/g, ""));
    return isNaN(numeric) ? 0 : numeric;
  }

  const approxRupees = getApproxRupees();
  const gst = calcGst(approxRupees);
  const displayTotal = gst.totalRupees > 0 ? gst.totalRupees : approxRupees;

  /* Annual savings label */
  const annualSavingLabel = (() => {
    if (!plan || cycle !== "annual") return null;
    const monthly = plan.prices.monthly;
    const annual = plan.prices.annual;
    if (monthly.amount === "Free" || annual.amount === "Free") return null;
    const mRupees = parseFloat(monthly.amount.replace(/[^\d.]/g, ""));
    const aRupees = parseFloat(annual.amount.replace(/[^\d.]/g, ""));
    if (isNaN(mRupees) || isNaN(aRupees)) return null;
    const savings = mRupees * 12 - aRupees;
    if (savings <= 0) return null;
    return `Save ${formatInrRupees(savings)} vs monthly`;
  })();

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  function handleBillingChange(field: keyof BillingDetails, value: string) {
    setBillingDetails((prev) => ({ ...prev, [field]: value }));
    if (billingErrors[field]) {
      setBillingErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  }

  function handleApplyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    setCouponApplied(`Code "${code}" saved — discount will be applied at payment.`);
    setCouponError(null);
  }

  /* Shared pre-payment validation */
  function validate(): boolean {
    if (!agreed) {
      toast.error("Please agree to the Terms before continuing.");
      return false;
    }
    if (!user) {
      toast.error("Sign in to continue to checkout.");
      return false;
    }
    const errors = validateBilling(billingDetails);
    if (Object.keys(errors).length > 0) {
      setBillingErrors(errors);
      setShowBillingAddress(true);
      toast.error("Please complete your billing details before continuing.");
      return false;
    }
    return true;
  }

  /**
   * Lightweight validation for mock mode.
   *
   * Billing address is intentionally skipped — it is NOT sent to
   * beginMockSubscription (the RPC only takes plan_tier, billing_interval,
   * and amounts). Requiring a real address for a simulated payment is
   * unnecessary friction when testing the subscription lifecycle.
   */
  function validateForMock(): boolean {
    if (!agreed) {
      toast.error("Please agree to the Terms before continuing.");
      return false;
    }
    if (!user) {
      toast.error("Sign in to continue to checkout.");
      return false;
    }
    return true;
  }

  /* ── MOCK payment handler ─────────────────────────────────────────────── */
  async function handleMockPay() {
    if (!plan || !price || !user || inflight.current) return;
    if (!validateForMock()) return;

    inflight.current = true;
    setLoading(true);
    setPaymentError(null);

    try {
      const idempotencyKey = generateIdempotencyKey(user.id, plan.id, cycle);
      const session = await beginMockSubscription({
        plan_tier:            plan.id,
        billing_interval:     cycle,
        base_amount_minor:    Math.round(gst.baseRupees * 100),
        gst_amount_minor:     Math.round(gst.gstRupees * 100),
        charge_amount_minor:  Math.round(gst.totalRupees * 100),
        idempotency_key:      idempotencyKey,
      });
      setMockSession(session);
    } catch (err) {
      inflight.current = false;
      const msg =
        err instanceof MockPaymentError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not start mock payment. Check your Supabase connection.";
      setPaymentError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  /* ── RAZORPAY payment handler ─────────────────────────────────────────── */
  async function handleRazorpayPay() {
    if (!plan || !price || !user || inflight.current) return;
    if (!validate()) return;

    inflight.current = true;
    setLoading(true);
    setPaymentError(null);

    try {
      await loadRazorpayScript();

      const session = await createCheckoutSession({
        plan_tier: plan.id,
        billing_interval: cycle,
        ...(couponApplied && coupon.trim()
          ? { coupon_code: coupon.trim().toUpperCase() }
          : {}),
        billing_details: {
          display_name: billingDetails.displayName.trim(),
          line1: billingDetails.line1.trim(),
          city: billingDetails.city.trim(),
          state: billingDetails.state.trim(),
          pincode: billingDetails.pincode.trim(),
          ...(billingDetails.line2.trim() ? { line2: billingDetails.line2.trim() } : {}),
          ...(billingDetails.gstin.trim() ? { gstin: billingDetails.gstin.trim().toUpperCase() } : {}),
        },
      });

      const keyId = getRazorpayKeyId();
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK did not load. Try refreshing the page.");
      }

      const rzp = new window.Razorpay({
        key: keyId,
        subscription_id: session.razorpay_subscription_id,
        name: "GVRZE",
        description: `${plan.name} membership — ${cycle}`,
        image: "/assets/brand/gvrze-mark-light.png",
        prefill: {
          name: user.displayName ?? user.username ?? billingDetails.displayName,
          email: user.email,
        },
        notes: {
          internal_subscription_id: session.subscription_id,
          plan_tier: plan.id,
          billing_interval: cycle,
          gstin: billingDetails.gstin.trim().toUpperCase() || "",
        },
        theme: { color: "#1e3a5f" },
        handler: (response: RazorpaySuccessResponse) => {
          void navigate({
            to: "/pricing/payment-result",
            search: {
              status: "processing",
              payment_id: response.razorpay_payment_id,
              plan: plan.id,
            },
          });
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            setLoading(false);
            inflight.current = false;
            setPaymentError("Payment window closed. No charge was made — you can try again.");
          },
        },
      });

      rzp.on("payment.failed", (response: RzpError) => {
        setLoading(false);
        inflight.current = false;
        const desc =
          response.error.description ??
          "Payment failed. No amount was charged — please try again.";
        setPaymentError(desc);
        void navigate({
          to: "/pricing/payment-result",
          search: { status: "failed", plan: plan.id, reason: desc },
        });
      });

      rzp.open();
    } catch (err) {
      inflight.current = false;
      setLoading(false);
      const msg =
        err instanceof CheckoutSessionError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
      setPaymentError(msg);
      toast.error(msg);
    }
  }

  /* ── Render ─────────────────────────────────────────────────────────── */

  return (
    <>
      {/* Mock gateway modal — rendered outside the page flow for z-index */}
      {mockSession ? (
        <MockPaymentGateway
          session={mockSession}
          planName={plan?.name ?? initialPlan}
          planTier={initialPlan}
          billingCycle={cycle}
          onCancel={() => {
            setMockSession(null);
            inflight.current = false;
          }}
        />
      ) : null}

      <div id="gvrze-checkout">
        <div className="checkout-shell">
          <Breadcrumb
            items={[
              { label: "Home", to: "/" },
              { label: "Membership", to: "/pricing" },
              { label: "Checkout" },
            ]}
            className="checkout-crumb"
          />

            {/* Mock mode indicator banner — TEST MODE — NO REAL PAYMENTS */}
            {mockEnabled ? (
              <div
                className="checkout-mock-banner"
                role="status"
                aria-label="TEST MODE — No real payments processed"
              >
                <FlaskConical size={14} strokeWidth={2} aria-hidden />
                <span>
                  <strong>TEST MODE — NO REAL PAYMENTS</strong>
                  {import.meta.env.DEV ? (
                    <>
                      {" "}Local mock mode active (<code>VITE_MOCK_PAYMENTS=true</code> in{" "}
                      <code>.env.local</code>). No amount will be charged.
                    </>
                  ) : (
                    <>
                      {" "}Authorized test mode — <code>VITE_MOCK_PAYMENTS=true</code> is set in
                      Vercel env vars. All subscriptions are labeled <strong>is_mock=true</strong>.
                      No real charge is made.
                    </>
                  )}
                </span>
              </div>
            ) : null}

          {catalogError ? (
            <div className="checkout-unavailable" role="alert">
              <Info className="checkout-unavailable__icon" size={16} />
              <span>Unable to load plan details. {catalogError}</span>
            </div>
          ) : null}

          {catalogLoading ? (
            <div className="checkout-grid">
              <div className="checkout-skeleton" style={{ height: "28rem" }} aria-hidden />
              <div className="checkout-skeleton" style={{ height: "36rem" }} aria-hidden />
            </div>
          ) : null}

          {!catalogLoading && !catalogError && !plan ? (
            <div className="checkout-unavailable" style={{ maxWidth: "32rem" }}>
              <Info className="checkout-unavailable__icon" size={16} />
              <div>
                Plan not found.{" "}
                <Link to="/pricing" className="underline underline-offset-2">
                  Return to pricing
                </Link>{" "}
                to choose a membership.
              </div>
            </div>
          ) : null}

          {!catalogLoading && !catalogError && plan ? (
            <div className="checkout-grid">
              {/* ── LEFT: Order Summary ─────────────────────────────────── */}
              <article className="checkout-summary" aria-label="Order summary">
                <p className="checkout-summary__kicker">Order summary</p>
                <h1 className="checkout-summary__plan-name">{plan.name}</h1>
                <p className="checkout-summary__positioning">{plan.positioning}</p>

                <div className="checkout-summary__price-block">
                  {price?.compareAt ? (
                    <span className="checkout-summary__compare-at">{price.compareAt}</span>
                  ) : null}
                  <span className="checkout-summary__price-amount">{price?.amount}</span>
                  <span className="checkout-summary__price-cadence">{price?.cadence}</span>
                </div>

                {approxRupees > 0 ? (
                  <div className="checkout-gst-table" aria-label="Tax breakdown">
                    <div className="checkout-gst-row">
                      <span>Subscription ({cycle === "annual" ? "annual" : "monthly"})</span>
                      <span>{formatInrRupees(gst.baseRupees)}</span>
                    </div>
                    <div className="checkout-gst-row">
                      <span>{GST_CONFIG.taxLabel}</span>
                      <span>{formatInrRupees(gst.gstRupees)}</span>
                    </div>
                    <div className="checkout-gst-row checkout-gst-row--total">
                      <span>Total payable</span>
                      <strong>{formatInrRupees(gst.totalRupees)}</strong>
                    </div>
                  </div>
                ) : null}

                {price?.compareAt ? (
                  <div className="checkout-summary__promo-badge" aria-live="polite">
                    <span>🎁</span>
                    <span>Introductory price applied</span>
                  </div>
                ) : null}
                {annualSavingLabel ? (
                  <div className="checkout-summary__promo-badge" aria-live="polite">
                    <span>✨</span>
                    <span>{annualSavingLabel}</span>
                  </div>
                ) : null}
                {price?.note ? (
                  <p className="checkout-summary__note">{price.note}</p>
                ) : null}

                <hr className="checkout-summary__divider" />

                <ul className="checkout-summary__features" aria-label="Plan features">
                  {plan.features.map((f) => (
                    <li key={f} className="checkout-summary__feature">
                      <Check className="checkout-summary__feature-icon" size={14} strokeWidth={2.4} aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>

                <p className="checkout-renew-note">
                  🔄 Renews automatically {cycle === "annual" ? "annually" : "every month"}.
                  Cancel anytime from your billing dashboard.
                </p>
              </article>

              {/* ── RIGHT: Payment Form ─────────────────────────────────── */}
              <section className="checkout-form-card" aria-label="Payment details">
                <h2 className="checkout-form-card__title">Complete your membership</h2>

                {/* Billing cycle toggle */}
                <div>
                  <div className="checkout-cycle-row">
                    <span className="checkout-cycle-label">Billing</span>
                    <div className="checkout-cycle-tabs" role="group" aria-label="Billing cycle">
                      {(["monthly", "annual"] as BillingCycle[]).map((c) => (
                        <button
                          key={c}
                          type="button"
                          className="checkout-cycle-tab"
                          aria-pressed={cycle === c}
                          onClick={() => { setCycle(c); setPaymentError(null); }}
                        >
                          {c === "monthly" ? "Monthly" : "Annual"}
                        </button>
                      ))}
                    </div>
                    {cycle === "annual" && annualSavingLabel ? (
                      <span className="checkout-cycle-save-pill">{annualSavingLabel}</span>
                    ) : null}
                  </div>
                </div>

                {/* Promo code */}
                <div>
                  <div className="checkout-coupon-row">
                    <GeoInput
                      id="checkout-coupon"
                      label="Promo code (optional)"
                      placeholder="GVRZE2024"
                      value={coupon}
                      maxLength={32}
                      autoComplete="off"
                      onChange={(e) => {
                        setCoupon(e.target.value.toUpperCase());
                        setCouponApplied(null);
                        setCouponError(null);
                      }}
                    />
                    <button
                      type="button"
                      className="checkout-coupon-apply-btn"
                      disabled={!coupon.trim() || loading}
                      onClick={handleApplyCoupon}
                      aria-label="Apply promo code"
                    >
                      <Tag size={12} aria-hidden />
                      Apply
                    </button>
                  </div>
                  {couponApplied ? (
                    <p className="checkout-coupon-feedback checkout-coupon-feedback--ok" role="status">
                      <Check size={12} strokeWidth={2.4} aria-hidden /> {couponApplied}
                    </p>
                  ) : null}
                  {couponError ? (
                    <p className="checkout-coupon-feedback checkout-coupon-feedback--err" role="alert">
                      {couponError}
                    </p>
                  ) : null}
                </div>

                {/* Billing address */}
                <div className="checkout-billing-section">
                  <button
                    type="button"
                    className="checkout-billing-toggle"
                    aria-expanded={showBillingAddress}
                    onClick={() => setShowBillingAddress((v) => !v)}
                  >
                    <span>Billing address &amp; GST details</span>
                    <span className="checkout-billing-toggle__required">Required</span>
                    {showBillingAddress
                      ? <ChevronUp size={15} strokeWidth={1.8} aria-hidden />
                      : <ChevronDown size={15} strokeWidth={1.8} aria-hidden />}
                  </button>

                  {showBillingAddress ? (
                    <div className="checkout-billing-fields">
                      <GeoInput id="billing-name" label="Full name / Business name" placeholder="Rahul Sharma"
                        value={billingDetails.displayName}
                        {...(billingErrors.displayName ? { error: billingErrors.displayName } : {})}
                        onChange={(e) => handleBillingChange("displayName", e.target.value)} />
                      <GeoInput id="billing-line1" label="Address line 1" placeholder="123, MG Road"
                        value={billingDetails.line1}
                        {...(billingErrors.line1 ? { error: billingErrors.line1 } : {})}
                        onChange={(e) => handleBillingChange("line1", e.target.value)} />
                      <GeoInput id="billing-line2" label="Address line 2 (optional)" placeholder="Apartment, floor, landmark"
                        value={billingDetails.line2}
                        onChange={(e) => handleBillingChange("line2", e.target.value)} />
                      <div className="checkout-billing-row2">
                        <GeoInput id="billing-city" label="City" placeholder="Bengaluru"
                          value={billingDetails.city}
                          {...(billingErrors.city ? { error: billingErrors.city } : {})}
                          onChange={(e) => handleBillingChange("city", e.target.value)} />
                        <GeoInput id="billing-state" label="State" placeholder="Karnataka"
                          value={billingDetails.state}
                          {...(billingErrors.state ? { error: billingErrors.state } : {})}
                          onChange={(e) => handleBillingChange("state", e.target.value)} />
                      </div>
                      <GeoInput id="billing-pincode" label="PIN code" placeholder="560001"
                        maxLength={6} inputMode="numeric"
                        value={billingDetails.pincode}
                        {...(billingErrors.pincode ? { error: billingErrors.pincode } : {})}
                        onChange={(e) => handleBillingChange("pincode", e.target.value.replace(/\D/g, ""))} />
                      <div className="checkout-gstin-section">
                        <GeoInput id="billing-gstin" label="GSTIN (optional — for business invoices)"
                          placeholder="29ABCDE1234F1Z5" maxLength={15}
                          value={billingDetails.gstin}
                          {...(billingErrors.gstin ? { error: billingErrors.gstin } : {})}
                          onChange={(e) => handleBillingChange("gstin", e.target.value.toUpperCase())} />
                        <p className="checkout-gstin-note">
                          Provide your GSTIN to receive a B2B GST invoice. Leave blank for a standard consumer receipt.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="checkout-billing-collapsed-hint">
                      {Object.keys(billingErrors).length > 0
                        ? "⚠ Billing details required — please expand and complete."
                        : "Expand to add your billing address and optional GSTIN."}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="checkout-terms-row">
                  <input id="checkout-terms" type="checkbox" className="checkout-terms-checkbox"
                    checked={agreed} aria-required="true"
                    onChange={(e) => setAgreed(e.target.checked)} />
                  <label htmlFor="checkout-terms" className="checkout-terms-label">
                    I agree to GVRZE's{" "}
                    <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</Link>{" "}
                    and{" "}
                    <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>
                    , and I authorise GVRZE to charge {price?.amount} {price?.cadence} (incl.{" "}
                    {GST_CONFIG.ratePercent}% GST). My subscription renews automatically until I cancel.
                  </label>
                </div>

                {/* Not signed in */}
                {!user ? (
                  <div className="checkout-unavailable" role="status">
                    <Info className="checkout-unavailable__icon" size={16} strokeWidth={1.8} />
                    <div>
                      <Link to="/auth/login" className="font-semibold underline underline-offset-2">Sign in</Link>{" "}
                      or{" "}
                      <Link to="/auth/signup" className="font-semibold underline underline-offset-2">create an account</Link>{" "}
                      to complete your purchase.
                    </div>
                  </div>
                ) : null}

                {/* Payment error */}
                {paymentError ? (
                  <div className="checkout-unavailable" role="alert" aria-live="assertive">
                    <Info className="checkout-unavailable__icon" size={16} strokeWidth={1.8} />
                    <div>
                      <span>{paymentError}</span>
                      <button type="button" className="checkout-retry-link"
                        onClick={() => { setPaymentError(null); inflight.current = false; setLoading(false); }}>
                        <RefreshCw size={11} aria-hidden /> Try again
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Config loading shimmer — prevents "unavailable" flash on first render */}
                {configLoading ? (
                  <div
                    className="checkout-unavailable"
                    role="status"
                    aria-label="Checking payment configuration…"
                    style={{ opacity: 0.5 }}
                  >
                    <Info className="checkout-unavailable__icon" size={16} strokeWidth={1.8} />
                    <div>Checking payment configuration…</div>
                  </div>
                ) : null}

                {/* ── CTA: MOCK mode ─────────────────────────────────── */}
                {!configLoading && mockEnabled && user ? (
                  <button
                    type="button"
                    className={`checkout-pay-btn checkout-pay-btn--mock${loading ? " checkout-pay-btn--loading" : ""}`}
                    disabled={loading || !agreed}
                    onClick={() => void handleMockPay()}
                    aria-busy={loading}
                    aria-label={loading ? "Starting mock payment…" : "Pay & Activate (Mock Mode)"}
                  >
                    <FlaskConical size={14} strokeWidth={2} aria-hidden />
                    {loading ? "Starting mock payment…" : `Pay ${formatInrRupees(displayTotal)} · Mock Mode`}
                  </button>
                ) : null}

                {/* ── CTA: RAZORPAY ───────────────────────────────────── */}
                {!configLoading && !mockEnabled && razorpayReady && user ? (
                  <button
                    type="button"
                    className={`checkout-pay-btn${loading ? " checkout-pay-btn--loading" : ""}`}
                    disabled={loading || !agreed}
                    onClick={() => void handleRazorpayPay()}
                    aria-busy={loading}
                    aria-label={loading ? "Opening payment window…" : `Pay ${formatInrRupees(displayTotal)} and activate ${plan.name}`}
                  >
                    <Lock size={14} strokeWidth={2} aria-hidden />
                    {loading ? "Opening payment window…" : `Pay ${formatInrRupees(displayTotal)} · ${plan.name}`}
                  </button>
                ) : null}

                {/* ── UNAVAILABLE notice — only when neither mock nor Razorpay ── */}
                {!configLoading && !mockEnabled && !razorpayReady ? (
                  <div className="checkout-unavailable" role="status">
                    <Info className="checkout-unavailable__icon" size={16} strokeWidth={1.8} />
                    <div>
                      <strong>Payment temporarily unavailable.</strong>{" "}
                      Our payment gateway is being configured.
                      {import.meta.env.DEV ? (
                        // Local dev: direct actionable hint
                        <>
                          {" "}To enable mock payments locally, add{" "}
                          <code style={{ fontSize: "0.75em" }}>VITE_MOCK_PAYMENTS=true</code>{" "}
                          to <code style={{ fontSize: "0.75em" }}>.env.local</code> and restart the dev server.
                        </>
                      ) : (
                        // Deployed build (Vercel Preview / Production)
                        <>
                          {" "}To enable mock checkout on a Vercel Preview deployment, add{" "}
                          <code style={{ fontSize: "0.75em" }}>VITE_MOCK_PAYMENTS=true</code>{" "}
                          as a <strong>Preview-only</strong> environment variable in the Vercel dashboard,
                          then trigger a new deployment. For production, configure{" "}
                          <code style={{ fontSize: "0.75em" }}>VITE_RAZORPAY_KEY_ID</code>.
                          {" "}Or{" "}
                          <a href="/contact" style={{ textDecoration: "underline" }}>contact us</a>.
                        </>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Back link */}
                <Link to="/pricing" className="checkout-back-link" aria-label="Back to pricing">
                  ← Back to pricing
                </Link>

                {/* Security note */}
                <p className="checkout-secure-note">
                  <Shield size={12} strokeWidth={1.8} aria-hidden />
                  {mockEnabled
                    ? "TEST MODE — No real payment processed. Subscription records are labeled is_mock=true."
                    : "Payments processed securely by Razorpay. Card details are never stored by GVRZE."}
                </p>
              </section>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
