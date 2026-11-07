/**
 * MockPaymentGateway — test/preview modal payment simulator.
 *
 * Renders a GVRZE-light-themed overlay that lets testers simulate the
 * full subscription lifecycle without Razorpay credentials or real charges.
 *
 * Security model:
 *   - Rendered ONLY when isMockPaymentEnabled() === true.
 *   - isMockPaymentEnabled() checks VITE_MOCK_PAYMENTS === "true" at build
 *     time — this variable must NOT be set in Vercel Production env vars.
 *   - Subscription activation happens exclusively via confirmMockSubscription()
 *     → PostgreSQL RPC → server-side validation, is_mock=true marking,
 *     and idempotency guards. No client-side tier grants are possible.
 *   - All mock DB records are explicitly labelled is_mock=true and can be
 *     filtered out of production billing reports.
 *
 * NEVER collect real card numbers, CVVs, or banking credentials here.
 */

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Receipt,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import {
  confirmMockSubscription,
  confirmMockUpgrade,
  MockPaymentError,
  type MockSession,
} from "../lib/mock-payment";
import { formatInrRupees } from "../lib/formatInr";
import { GST_CONFIG } from "../lib/gstConfig";
import { refreshProgression } from "@/lib/supabase/auth-sync";
import { useAuthStore } from "@/stores/authStore";
import "../styles/mock-payment.css";

type GatewayState = "ready" | "processing" | "success" | "failed" | "cancelled";

type MockPaymentGatewayProps = {
  session: MockSession;
  planName: string;
  planTier: string;
  billingCycle: "monthly" | "annual";
  onCancel: () => void;
};

/**
 * Modal payment simulator. Mount it once beginMockSubscription() succeeds.
 */
export function MockPaymentGateway({
  session,
  planName,
  planTier,
  billingCycle,
  onCancel,
}: MockPaymentGatewayProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const [state, setState] = useState<GatewayState>("ready");
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const baseRupees    = session.base_amount_minor / 100;
  const gstRupees     = session.gst_amount_minor / 100;
  const chargeRupees  = session.charge_amount_minor / 100;

  async function handleOutcome(outcome: "success" | "failed" | "cancel") {
    if (state === "processing") return;
    setState("processing");
    setError(null);

    try {
      /* ── Upgrade path ──────────────────────────────────────────────────── */
      const result = session.is_upgrade && session.upgrade_payment_id
        ? await confirmMockUpgrade({
            upgrade_payment_id: session.upgrade_payment_id,
            outcome,
          })
        : await confirmMockSubscription({
            subscription_id: session.subscription_id,
            outcome,
          });

      if (outcome === "success" && result.success) {
        setInvoiceNumber(result.invoice_number ?? null);
        setState("success");

        // Re-hydrate progressionStore from DB so the homepage Rewards Card
        // (and any other surface reading useProgressionStore.player.credits)
        // immediately reflects the newly granted membership credits.
        if (userId) void refreshProgression(userId);

        // Invalidate cached queries so Settings, Billing, Dashboard, and
        // credit balance all show the updated plan and credits immediately.
        void queryClient.invalidateQueries({ queryKey: ["billing"] });
        void queryClient.invalidateQueries({ queryKey: ["librarySubscriptionTier"] });
        void queryClient.invalidateQueries({ queryKey: ["creditHistory"] });

        // After 2 s, navigate to the payment-result page
        setTimeout(() => {
          void navigate({
            to: "/pricing/payment-result",
            search: {
              status: "processing",
              payment_id: `mock_${session.subscription_id.slice(0, 8)}`,
              plan: planTier,
            },
          });
        }, 2200);

      } else if (outcome === "failed") {
        setState("failed");

        setTimeout(() => {
          void navigate({
            to: "/pricing/payment-result",
            search: {
              status: "failed",
              plan: planTier,
              reason: "Simulated payment failure (mock mode)",
            },
          });
        }, 2200);

      } else {
        setState("cancelled");
        // Let the user see the cancelled state briefly then close
        setTimeout(() => onCancel(), 1500);
      }
    } catch (err) {
      const msg =
        err instanceof MockPaymentError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
      setError(msg);
      setState("ready");
    }
  }

  const isLoading = state === "processing";

  return (
    <div
      className="mock-gateway-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Mock payment gateway"
      onClick={(e) => {
        // Close on backdrop click only when in ready state
        if (e.target === e.currentTarget && state === "ready") onCancel();
      }}
    >
      <div className="mock-gateway-modal">
        {/* TEST MODE banner */}
        <div className="mock-gateway-banner" role="alert">
          <AlertTriangle size={13} strokeWidth={2.2} aria-hidden />
          <span>⚙ MOCK / TEST MODE — No real payment is processed</span>
        </div>

        {/* Result states */}
        {state === "success" ? (
          <div className="mock-gateway-result">
            <div className="mock-gateway-result-icon mock-gateway-result-icon--success" aria-hidden>
              <CheckCircle2 size={24} strokeWidth={1.8} />
            </div>
            <h2 className="mock-gateway-result-heading">Payment simulated ✓</h2>
            <p className="mock-gateway-result-body">
              {session.is_upgrade
                ? <>Your membership has been upgraded to <strong>{planName}</strong> in test mode.</>
                : <>Your <strong>{planName}</strong> membership has been activated in test mode.</>
              }{" "}
              Redirecting to confirmation…
            </p>
            {invoiceNumber ? (
              <div className="mock-gateway-invoice-chip">
                <Receipt size={12} aria-hidden />
                Invoice: <strong>{invoiceNumber}</strong>
              </div>
            ) : null}
          </div>
        ) : state === "failed" ? (
          <div className="mock-gateway-result">
            <div className="mock-gateway-result-icon mock-gateway-result-icon--fail" aria-hidden>
              <XCircle size={24} strokeWidth={1.8} />
            </div>
            <h2 className="mock-gateway-result-heading">Payment failed (simulated)</h2>
            <p className="mock-gateway-result-body">
              No amount was charged. Redirecting to failure page…
            </p>
          </div>
        ) : state === "cancelled" ? (
          <div className="mock-gateway-result">
            <div className="mock-gateway-result-icon mock-gateway-result-icon--cancel" aria-hidden>
              <X size={22} strokeWidth={2} />
            </div>
            <h2 className="mock-gateway-result-heading">Payment cancelled</h2>
            <p className="mock-gateway-result-body">Closing…</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mock-gateway-header">
              <h2 className="mock-gateway-title">Test your payment flow</h2>
              <button
                type="button"
                className="mock-gateway-close"
                onClick={onCancel}
                disabled={isLoading}
                aria-label="Close mock gateway"
              >
                <X size={16} strokeWidth={2} aria-hidden />
              </button>
            </div>

            {/* Order summary */}
            <div className="mock-gateway-summary" aria-label="Order summary">
              <div className="mock-gateway-plan-row">
                <div>
                  <p className="mock-gateway-plan-name">{planName}</p>
                  <p className="mock-gateway-plan-cycle">
                    {billingCycle === "annual" ? "Annual billing" : "Monthly billing"}
                  </p>
                </div>
                <span className="mock-gateway-price-total">
                  {formatInrRupees(chargeRupees)}
                </span>
              </div>

              <div className="mock-gateway-gst" aria-label="Tax breakdown">
                <div className="mock-gateway-gst-row">
                  <span>Subscription ({billingCycle === "annual" ? "annual" : "monthly"})</span>
                  <span>{formatInrRupees(baseRupees)}</span>
                </div>
                <div className="mock-gateway-gst-row">
                  <span>{GST_CONFIG.taxLabel}</span>
                  <span>{formatInrRupees(gstRupees)}</span>
                </div>
                <div className="mock-gateway-gst-row mock-gateway-gst-row--total">
                  <span>Total payable</span>
                  <strong>{formatInrRupees(chargeRupees)}</strong>
                </div>
              </div>
            </div>

            {/* Warning notice */}
            <p className="mock-gateway-notice" role="note">
              ⚙ TEST MODE — No real payment details are collected or processed.
              Activated subscriptions are marked <strong>is_mock=true</strong> in billing records
              and can be identified in billing reports. Choose an outcome to test the
              full subscription lifecycle.
            </p>

            {/* Error message */}
            {error ? (
              <p
                className="mock-gateway-notice"
                style={{ background: "#fff1f2", borderColor: "#fecaca", color: "#991b1b", margin: "0.5rem 1.5rem 0" }}
                role="alert"
              >
                ⚠ {error}
                <button
                  type="button"
                  onClick={() => setError(null)}
                  style={{ marginLeft: "0.5rem", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "inherit" }}
                >
                  Dismiss
                </button>
              </p>
            ) : null}

            {/* Action buttons */}
            <div className="mock-gateway-actions">
              <button
                type="button"
                className="mock-gateway-btn mock-gateway-btn--succeed"
                disabled={isLoading}
                onClick={() => void handleOutcome("success")}
                aria-label="Simulate successful payment"
              >
                {isLoading ? (
                  <Loader2 size={15} className="mock-gateway-spinner" aria-hidden />
                ) : (
                  <CheckCircle2 size={15} strokeWidth={2} aria-hidden />
                )}
                {isLoading ? "Processing…" : "Simulate Successful Payment"}
              </button>

              <button
                type="button"
                className="mock-gateway-btn mock-gateway-btn--fail"
                disabled={isLoading}
                onClick={() => void handleOutcome("failed")}
                aria-label="Simulate payment failure"
              >
                <XCircle size={15} strokeWidth={2} aria-hidden />
                Simulate Failed Payment
              </button>

              <button
                type="button"
                className="mock-gateway-btn mock-gateway-btn--cancel"
                disabled={isLoading}
                onClick={() => void handleOutcome("cancel")}
                aria-label="Cancel and close"
              >
                <RefreshCw size={14} strokeWidth={2} aria-hidden />
                Cancel Payment
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
