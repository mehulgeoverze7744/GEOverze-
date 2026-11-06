/**
 * CheckoutScreen — /pricing/checkout?plan=<tier>&cycle=<monthly|annual>
 *
 * Flow:
 *  1. Reads plan + cycle from URL search params.
 *  2. Fetches the catalog to show authoritative prices.
 *  3. Shows GST breakdown (base + GST + total) using centralized GST_CONFIG.
 *  4. Collects billing address + optional GSTIN for B2B invoicing.
 *  5. Accepts an optional promo/coupon code.
 *  6. When the user confirms, calls create-razorpay-subscription (Edge Function)
 *     and opens the Razorpay checkout modal.
 *  7. On payment success, navigates to /pricing/payment-result?status=processing.
 *  8. On dismissal / failure, stays on the page and surfaces an error.
 *
 * NEVER fakes a successful payment. All subscription state is set server-side
 * by the Razorpay webhook handler.
 */

import { Check, ChevronDown, ChevronUp, Info, Lock, Shield } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";

import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { GeoInput } from "@/components/shared/GeoField";
import { useAuthStore, selectUser } from "@/stores/authStore";

import type { BillingCycle, TierId } from "../data/plans";
import { usePricingCatalog } from "../hooks/usePricingCatalog";
import {
  createCheckoutSession,
  CheckoutSessionError,
} from "../lib/createCheckoutSession";
import {
  loadRazorpayScript,
  getRazorpayKeyId,
  isRazorpayConfigured,
  type RazorpaySuccessResponse,
  type RazorpayError as RzpError,
} from "../lib/razorpay-client";
import { formatInrRupees } from "../lib/formatInr";
import { GST_CONFIG, calcGst } from "../lib/gstConfig";
import "../styles/checkout.css";

const TIER_ORDER: TierId[] = ["basic", "pro", "advance"];

function useSafeSearch(): { plan: TierId; cycle: BillingCycle } {
  const raw = useSearch({ strict: false }) as Record<string, unknown>;
  const plan =
    typeof raw["plan"] === "string" && TIER_ORDER.includes(raw["plan"] as TierId)
      ? (raw["plan"] as TierId)
      : "pro";
  const cycle =
    raw["cycle"] === "annual" || raw["cycle"] === "monthly"
      ? (raw["cycle"] as BillingCycle)
      : "monthly";
  return { plan, cycle };
}

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
  if (!d.pincode.trim()) errors.pincode = "PIN code is required";
  else if (!/^\d{6}$/.test(d.pincode.trim())) errors.pincode = "Enter a valid 6-digit PIN code";
  if (d.gstin.trim()) {
    const gstinPattern = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinPattern.test(d.gstin.trim().toUpperCase())) {
      errors.gstin = "Enter a valid GSTIN (e.g. 29ABCDE1234F1Z5)";
    }
  }
  return errors;
}

export function CheckoutScreen() {
  const { plan: initialPlan, cycle: initialCycle } = useSafeSearch();
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);

  const [cycle, setCycle] = useState<BillingCycle>(initialCycle);
  const [coupon, setCoupon] = useState("");
  const [couponOk, setCouponOk] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [billingDetails, setBillingDetails] = useState<BillingDetails>(EMPTY_BILLING);
  const [billingErrors, setBillingErrors] = useState<Partial<Record<keyof BillingDetails, string>>>({});
  const [showBillingAddress, setShowBillingAddress] = useState(true);

  const { plans, loading: catalogLoading, error: catalogError } = usePricingCatalog();
  const plan = plans.find((p) => p.id === initialPlan) ?? null;
  const price = plan?.prices[cycle];

  const inflight = useRef(false);
  const razorpayReady = isRazorpayConfigured();

  // --- GST calculation ---
  // Catalog prices are in whole INR rupees. calcGst() does the tax math.
  const catalogRupees = (() => {
    if (!plan) return 0;
    if (cycle === "annual" && plan.prices.annual.amount !== "Free") {
      // Extract the numeric value from the formatted amount
      const raw = plan.prices.annual;
      // We need the original catalog value from subscription_plans
      // We re-derive from the note or use the mount raw
      return 0; // Will be populated from Edge Function response
    }
    return 0;
  })();

  // We use the plan's raw prices from catalog data
  // The plan.prices.monthly.amount is already formatted (e.g. "₹499")
  // For GST we need the raw number — we get it from the Edge Function
  // For display preview we use approximate GST from price string
  function getApproxRupees(): number {
    if (!plan) return 0;
    const p = plan.prices[cycle];
    if (p.amount === "Free") return 0;
    // Strip currency symbol and parse
    const numeric = parseFloat(p.amount.replace(/[^\d.]/g, ""));
    return isNaN(numeric) ? 0 : numeric;
  }

  const approxRupees = getApproxRupees();
  const gstBreakdown = calcGst(approxRupees);

  async function handlePay() {
    if (!plan || !price || inflight.current) return;
    if (!agreed) {
      toast.error("Please agree to the Terms before continuing.");
      return;
    }
    if (!user) {
      toast.error("Sign in to continue to checkout.");
      return;
    }

    // Validate billing address
    const errors = validateBilling(billingDetails);
    if (Object.keys(errors).length > 0) {
      setBillingErrors(errors);
      setShowBillingAddress(true);
      toast.error("Please complete your billing details before continuing.");
      return;
    }

    inflight.current = true;
    setLoading(true);
    setPaymentError(null);

    try {
      await loadRazorpayScript();

      const session = await createCheckoutSession({
        plan_tier: plan.id,
        billing_interval: cycle,
        ...(coupon.trim() ? { coupon_code: coupon.trim().toUpperCase() } : {}),
        billing_details: {
          display_name: billingDetails.displayName.trim(),
          line1: billingDetails.line1.trim(),
          line2: billingDetails.line2.trim() || undefined,
          city: billingDetails.city.trim(),
          state: billingDetails.state.trim(),
          pincode: billingDetails.pincode.trim(),
          gstin: billingDetails.gstin.trim().toUpperCase() || undefined,
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
        theme: { color: "#c09a5a" },
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
            setPaymentError(
              "Payment window closed. No charge was made — you can try again.",
            );
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

  function handleBillingChange(field: keyof BillingDetails, value: string) {
    setBillingDetails((prev) => ({ ...prev, [field]: value }));
    if (billingErrors[field]) {
      setBillingErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

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

  return (
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

        {catalogError ? (
          <p className="text-sm text-destructive/80">Unable to load plan details. {catalogError}</p>
        ) : null}

        {catalogLoading ? (
          <div className="checkout-grid">
            <div className="checkout-skeleton" style={{ height: "28rem", borderRadius: "1.35rem" }} aria-hidden />
            <div className="checkout-skeleton" style={{ height: "36rem", borderRadius: "1.35rem" }} aria-hidden />
          </div>
        ) : null}

        {!catalogLoading && !catalogError && plan ? (
          <div className="checkout-grid">
            {/* ── LEFT: Order Summary ────────────────────────────────────── */}
            <article className="checkout-summary" aria-label="Order summary">
              <p className="checkout-summary__kicker">Order summary</p>
              <h1 className="checkout-summary__plan-name">{plan.name}</h1>
              <p className="checkout-summary__positioning">{plan.positioning}</p>

              {/* Price + GST breakdown */}
              <div className="checkout-summary__price-block">
                {price?.compareAt ? (
                  <span className="checkout-summary__compare-at">{price.compareAt}</span>
                ) : null}
                <span className="checkout-summary__price-amount">{price?.amount}</span>
                <span className="checkout-summary__price-cadence">{price?.cadence}</span>
              </div>

              {/* GST breakdown table */}
              {approxRupees > 0 ? (
                <div className="checkout-gst-table" aria-label="Tax breakdown">
                  <div className="checkout-gst-row">
                    <span>Subscription {cycle === "annual" ? "(annual)" : "(monthly)"}</span>
                    <span>{formatInrRupees(gstBreakdown.baseRupees)}</span>
                  </div>
                  <div className="checkout-gst-row">
                    <span>{GST_CONFIG.taxLabel}</span>
                    <span>{formatInrRupees(gstBreakdown.gstRupees)}</span>
                  </div>
                  <div className="checkout-gst-row checkout-gst-row--total">
                    <span>Total payable</span>
                    <span>{formatInrRupees(gstBreakdown.totalRupees)}</span>
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
                    <Check className="checkout-summary__feature-icon" size={14} strokeWidth={2.2} aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Renewal reminder */}
              <p className="checkout-renew-note">
                🔄 Renews automatically {cycle === "annual" ? "annually" : "every month"}.
                Cancel anytime from your billing dashboard.
              </p>
            </article>

            {/* ── RIGHT: Payment Form ────────────────────────────────────── */}
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

              {/* Coupon */}
              <div>
                <div className="checkout-coupon-row">
                  <GeoInput
                    id="checkout-coupon"
                    label="Promo code (optional)"
                    placeholder="GVRZE2024"
                    value={coupon}
                    maxLength={32}
                    autoComplete="off"
                    onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponOk(null); }}
                  />
                  <button
                    type="button"
                    className="checkout-coupon-apply-btn"
                    disabled={!coupon.trim() || loading}
                    onClick={() => setCouponOk("Code saved — it will be applied at payment.")}
                    aria-label="Apply promo code"
                  >
                    Apply
                  </button>
                </div>
                {couponOk ? (
                  <p className="checkout-coupon-feedback checkout-coupon-feedback--ok">
                    <Check size={12} strokeWidth={2.4} aria-hidden /> {couponOk}
                  </p>
                ) : null}
              </div>

              {/* Billing address (collapsible) */}
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
                    <GeoInput
                      id="billing-name"
                      label="Full name / Business name"
                      placeholder="Rahul Sharma"
                      value={billingDetails.displayName}
                      error={billingErrors.displayName}
                      onChange={(e) => handleBillingChange("displayName", e.target.value)}
                    />
                    <GeoInput
                      id="billing-line1"
                      label="Address line 1"
                      placeholder="123, MG Road"
                      value={billingDetails.line1}
                      error={billingErrors.line1}
                      onChange={(e) => handleBillingChange("line1", e.target.value)}
                    />
                    <GeoInput
                      id="billing-line2"
                      label="Address line 2 (optional)"
                      placeholder="Apartment, floor, landmark"
                      value={billingDetails.line2}
                      onChange={(e) => handleBillingChange("line2", e.target.value)}
                    />
                    <div className="checkout-billing-row2">
                      <GeoInput
                        id="billing-city"
                        label="City"
                        placeholder="Bengaluru"
                        value={billingDetails.city}
                        error={billingErrors.city}
                        onChange={(e) => handleBillingChange("city", e.target.value)}
                      />
                      <GeoInput
                        id="billing-state"
                        label="State"
                        placeholder="Karnataka"
                        value={billingDetails.state}
                        error={billingErrors.state}
                        onChange={(e) => handleBillingChange("state", e.target.value)}
                      />
                    </div>
                    <GeoInput
                      id="billing-pincode"
                      label="PIN code"
                      placeholder="560001"
                      maxLength={6}
                      inputMode="numeric"
                      value={billingDetails.pincode}
                      error={billingErrors.pincode}
                      onChange={(e) => handleBillingChange("pincode", e.target.value.replace(/\D/g, ""))}
                    />
                    <div className="checkout-gstin-section">
                      <GeoInput
                        id="billing-gstin"
                        label="GSTIN (optional — for business invoices)"
                        placeholder="29ABCDE1234F1Z5"
                        maxLength={15}
                        value={billingDetails.gstin}
                        error={billingErrors.gstin}
                        onChange={(e) => handleBillingChange("gstin", e.target.value.toUpperCase())}
                      />
                      <p className="checkout-gstin-note">
                        Provide your GSTIN to receive a B2B GST invoice. Leave blank for a standard
                        consumer receipt.
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
                <input
                  id="checkout-terms"
                  type="checkbox"
                  className="checkout-terms-checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  aria-required="true"
                />
                <label htmlFor="checkout-terms" className="checkout-terms-label">
                  I agree to GVRZE's{" "}
                  <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</Link>{" "}
                  and{" "}
                  <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>,
                  and I authorise GVRZE to charge {price?.amount} {price?.cadence} (incl. {GST_CONFIG.ratePercent}%
                  GST). My subscription renews automatically until I cancel.
                </label>
              </div>

              {/* Razorpay not configured notice */}
              {!razorpayReady ? (
                <div className="checkout-unavailable" role="status">
                  <Info className="checkout-unavailable__icon" size={16} strokeWidth={1.8} aria-hidden />
                  <div>
                    <strong>Payment temporarily unavailable.</strong> Our payment gateway is being configured.
                    Your plan selection is saved — check back soon.
                  </div>
                </div>
              ) : null}

              {/* Error feedback */}
              {paymentError ? (
                <div className="checkout-unavailable" role="alert" aria-live="assertive">
                  <Info className="checkout-unavailable__icon" size={16} strokeWidth={1.8} aria-hidden />
                  <span>{paymentError}</span>
                </div>
              ) : null}

              {/* Pay button */}
              {razorpayReady ? (
                <button
                  type="button"
                  className={`checkout-pay-btn${loading ? " checkout-pay-btn--loading" : ""}`}
                  disabled={loading || !agreed || !user}
                  onClick={() => void handlePay()}
                  aria-busy={loading}
                  aria-label={loading ? "Opening payment window…" : `Pay ${price?.amount ?? ""} and activate ${plan.name}`}
                >
                  <Lock size={14} strokeWidth={2} aria-hidden />
                  {loading ? "Opening payment window…" : `Pay ${formatInrRupees(gstBreakdown.totalRupees > 0 ? gstBreakdown.totalRupees : approxRupees)}`}
                </button>
              ) : null}

              {!user ? (
                <p className="text-xs text-center" style={{ color: "#64748b" }}>
                  <Link to="/auth/login" className="underline underline-offset-2">Sign in</Link>{" "}
                  to complete your purchase.
                </p>
              ) : null}

              {/* Back link */}
              <Link
                to="/pricing"
                className="checkout-back-link"
                aria-label="Back to pricing"
              >
                ← Back to pricing
              </Link>

              {/* Security note */}
              <p className="checkout-secure-note">
                <Shield size={12} strokeWidth={1.8} aria-hidden />
                Payments processed securely by Razorpay. Card details are never stored by GVRZE.
              </p>
            </section>
          </div>
        ) : null}

        {!catalogLoading && !catalogError && !plan ? (
          <div className="checkout-unavailable" style={{ maxWidth: "32rem" }}>
            <Info className="checkout-unavailable__icon" size={16} strokeWidth={1.8} />
            <div>
              Plan not found.{" "}
              <Link to="/pricing" className="underline underline-offset-2">Return to pricing</Link>{" "}
              to choose a membership.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
