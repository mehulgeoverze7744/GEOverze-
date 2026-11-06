/**
 * CheckoutScreen — /pricing/checkout?plan=<tier>&cycle=<monthly|annual>
 *
 * Flow:
 *  1. Reads plan + cycle from URL search params.
 *  2. Fetches the catalog to show authoritative prices.
 *  3. Optionally lets the user switch the billing cycle.
 *  4. Accepts an optional promo/coupon code.
 *  5. When the user confirms, calls create-razorpay-subscription (Edge Function)
 *     and opens the Razorpay checkout modal.
 *  6. On payment success, navigates to /pricing/payment-result?status=processing.
 *  7. On dismissal / failure, stays on the page and surfaces an error.
 *
 * NEVER fakes a successful payment. All subscription state is set server-side
 * by the Razorpay webhook handler.
 */

import { Check, Info, Lock, Shield } from "lucide-react";
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
import "../styles/checkout.css";

const TIER_ORDER: TierId[] = ["basic", "pro", "advance"];

function useSafeSearch(): { plan: TierId; cycle: BillingCycle } {
  // useSearch typed by TanStack Router — cast to unknown first to avoid strict
  // route-shape mismatch while keeping runtime safety below.
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

export function CheckoutScreen() {
  const { plan: initialPlan, cycle: initialCycle } = useSafeSearch();
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);

  const [cycle, setCycle] = useState<BillingCycle>(initialCycle);
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponOk, setCouponOk] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { plans, loading: catalogLoading, error: catalogError } = usePricingCatalog();
  const plan = plans.find((p) => p.id === initialPlan) ?? null;
  const price = plan?.prices[cycle];

  // Ref to prevent double-click
  const inflight = useRef(false);

  const razorpayReady = isRazorpayConfigured();

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

    inflight.current = true;
    setLoading(true);
    setPaymentError(null);

    try {
      // 1. Load Razorpay SDK
      await loadRazorpayScript();

      // 2. Create subscription server-side
      const session = await createCheckoutSession({
        plan_tier: plan.id,
        billing_interval: cycle,
        ...(coupon.trim() ? { coupon_code: coupon.trim().toUpperCase() } : {}),
      });

      // 3. Open Razorpay checkout modal
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
          name: user.displayName ?? user.username ?? "",
          email: user.email,
        },
        notes: {
          internal_subscription_id: session.subscription_id,
          plan_tier: plan.id,
          billing_interval: cycle,
        },
        theme: { color: "#c09a5a" },
        handler: (response: RazorpaySuccessResponse) => {
          // Payment captured — webhook will activate subscription.
          // Navigate to result page. We do NOT activate the subscription here.
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
          search: {
            status: "failed",
            plan: plan.id,
            reason: desc,
          },
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

  const annualSavings = (() => {
    if (!plan) return null;
    const m = plan.prices.monthly;
    const a = plan.prices.annual;
    // Show savings pill only when both are numeric amounts
    if (m.amount.startsWith("Free") || a.amount.startsWith("Free")) return null;
    return "Save ~17%";
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
          <p className="text-sm text-destructive/80">
            Unable to load plan details. {catalogError}
          </p>
        ) : null}

        {catalogLoading ? (
          <div className="checkout-grid">
            <div
              className="checkout-skeleton"
              style={{ height: "26rem", borderRadius: "1.35rem" }}
              aria-hidden
            />
            <div
              className="checkout-skeleton"
              style={{ height: "32rem", borderRadius: "1.35rem" }}
              aria-hidden
            />
          </div>
        ) : null}

        {!catalogLoading && !catalogError && plan ? (
          <div className="checkout-grid">
            {/* ── LEFT: Plan Summary ─────────────────────────────────────── */}
            <article className="checkout-summary" aria-label="Order summary">
              <p className="checkout-summary__kicker">Your order</p>
              <h1 className="checkout-summary__plan-name">{plan.name}</h1>
              <p className="checkout-summary__positioning">{plan.positioning}</p>

              <div className="checkout-summary__price-block">
                {price?.compareAt ? (
                  <span className="checkout-summary__compare-at">
                    {price.compareAt}
                  </span>
                ) : null}
                <span className="checkout-summary__price-amount">{price?.amount}</span>
                <span className="checkout-summary__price-cadence">{price?.cadence}</span>
              </div>
              {price?.note ? (
                <p className="checkout-summary__note">{price.note}</p>
              ) : null}

              {price?.compareAt ? (
                <div className="checkout-summary__promo-badge" aria-live="polite">
                  <span>🎁</span>
                  <span>Introductory price applied</span>
                </div>
              ) : null}

              <hr className="checkout-summary__divider" />

              <ul className="checkout-summary__features" aria-label="Plan features">
                {plan.features.map((f) => (
                  <li key={f} className="checkout-summary__feature">
                    <Check
                      className="checkout-summary__feature-icon"
                      size={14}
                      strokeWidth={2.2}
                      aria-hidden
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </article>

            {/* ── RIGHT: Payment Form ────────────────────────────────────── */}
            <section className="checkout-form-card" aria-label="Payment details">
              <h2 className="checkout-form-card__title">Complete your membership</h2>

              {/* Billing cycle toggle */}
              <div>
                <div className="checkout-cycle-row">
                  <span className="checkout-cycle-label">Billing</span>
                  <div
                    className="checkout-cycle-tabs"
                    role="group"
                    aria-label="Billing cycle"
                  >
                    {(["monthly", "annual"] as BillingCycle[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        className="checkout-cycle-tab"
                        aria-pressed={cycle === c}
                        onClick={() => {
                          setCycle(c);
                          setPaymentError(null);
                        }}
                      >
                        {c === "monthly" ? "Monthly" : "Annual"}
                      </button>
                    ))}
                  </div>
                  {cycle === "annual" && annualSavings ? (
                    <span className="checkout-cycle-save-pill">{annualSavings}</span>
                  ) : null}
                </div>
              </div>

              {/* Coupon code */}
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
                      setCouponError(null);
                      setCouponOk(null);
                    }}
                  />
                  <button
                    type="button"
                    className="checkout-coupon-apply-btn"
                    disabled={!coupon.trim() || loading}
                    onClick={() => {
                      // Coupon validation happens server-side when creating
                      // the subscription. Here we just give visual feedback.
                      setCouponError(null);
                      setCouponOk(
                        "Code saved — it will be applied when you continue to payment.",
                      );
                    }}
                    aria-label="Apply promo code"
                  >
                    Apply
                  </button>
                </div>
                {couponOk ? (
                  <p className="checkout-coupon-feedback checkout-coupon-feedback--ok">
                    <Check size={12} strokeWidth={2.4} aria-hidden />
                    {couponOk}
                  </p>
                ) : null}
                {couponError ? (
                  <p className="checkout-coupon-feedback checkout-coupon-feedback--err">
                    <Info size={12} strokeWidth={2} aria-hidden />
                    {couponError}
                  </p>
                ) : null}
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
                  <Link to="/terms" target="_blank" rel="noopener noreferrer">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </Link>
                  , and I understand that my subscription will auto-renew until I cancel.
                </label>
              </div>

              {/* Payment availability notice or CTA */}
              {!razorpayReady ? (
                <div className="checkout-unavailable" role="status">
                  <Info
                    className="checkout-unavailable__icon"
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden
                  />
                  <div>
                    <strong>Payment temporarily unavailable.</strong> We're setting up
                    our payment gateway. Check back soon — your plan selection is saved.
                  </div>
                </div>
              ) : null}

              {/* Error feedback */}
              {paymentError ? (
                <div className="checkout-unavailable" role="alert" aria-live="assertive">
                  <Info
                    className="checkout-unavailable__icon"
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden
                  />
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
                  aria-label={
                    loading
                      ? "Opening payment window…"
                      : `Pay ${price?.amount ?? ""} and activate ${plan.name}`
                  }
                >
                  <Lock size={14} strokeWidth={2} aria-hidden />
                  {loading ? "Opening payment window…" : `Pay ${price?.amount ?? ""}`}
                </button>
              ) : null}

              {!user ? (
                <p className="text-xs text-center" style={{ color: "oklch(0.5 0.08 24)" }}>
                  <Link to="/auth/sign-in" className="underline underline-offset-2">
                    Sign in
                  </Link>{" "}
                  to complete your purchase.
                </p>
              ) : null}

              {/* Security note */}
              <p className="checkout-secure-note">
                <Shield size={12} strokeWidth={1.8} aria-hidden />
                Payments processed securely by Razorpay. GVRZE never stores your card
                details.
              </p>
            </section>
          </div>
        ) : null}

        {!catalogLoading && !catalogError && !plan ? (
          <div className="checkout-unavailable" style={{ maxWidth: "32rem" }}>
            <Info className="checkout-unavailable__icon" size={16} strokeWidth={1.8} />
            <div>
              Plan not found.{" "}
              <Link to="/pricing" className="underline underline-offset-2">
                Return to pricing
              </Link>{" "}
              to choose a membership.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
