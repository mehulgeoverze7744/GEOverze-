/**
 * PaymentResultScreen — /pricing/payment-result?status=...
 *
 * Shows the outcome of a Razorpay payment attempt. The actual subscription
 * activation happens asynchronously via the webhook handler — this page never
 * assumes success from the client-side Razorpay callback alone.
 *
 * Supported statuses:
 *   processing  — payment captured, waiting for webhook to activate subscription
 *   success     — webhook has confirmed the subscription (future use)
 *   failed      — payment failed (from Razorpay payment.failed event)
 *   cancelled   — user dismissed the modal
 */

import { ArrowLeft, CheckCircle2, Clock, FlaskConical, XCircle } from "lucide-react";
import { Link, useSearch } from "@tanstack/react-router";

import "../styles/payment-result.css";

type PaymentStatus = "processing" | "success" | "failed" | "cancelled";

type SearchParams = {
  status?: unknown;
  plan?: unknown;
  payment_id?: unknown;
  reason?: unknown;
};

function safeStatus(raw: unknown): PaymentStatus {
  if (
    raw === "processing" ||
    raw === "success" ||
    raw === "failed" ||
    raw === "cancelled"
  ) {
    return raw;
  }
  return "processing";
}

type ResultConfig = {
  iconRingClass: string;
  Icon: typeof CheckCircle2;
  iconSize: number;
  heading: string;
  body: string;
  primaryLabel: string;
  primaryTo: string;
  secondaryLabel?: string;
  secondaryTo?: string;
};

function getConfig(status: PaymentStatus, planName: string, reason?: string): ResultConfig {
  switch (status) {
    case "success":
    case "processing":
      return {
        iconRingClass: "pr-icon-ring pr-icon-ring--processing",
        Icon: Clock,
        iconSize: 28,
        heading: "Payment received",
        body:
          status === "success"
            ? `Your ${planName} membership is now active. Welcome to GVRZE!`
            : `Your payment is being verified. Your ${planName} membership will be activated within a few minutes. You'll be able to access all features once confirmed.`,
        primaryLabel: "Go to billing dashboard",
        primaryTo: "/billing",
        secondaryLabel: "Return to home",
        secondaryTo: "/",
      };
    case "failed":
      return {
        iconRingClass: "pr-icon-ring pr-icon-ring--failed",
        Icon: XCircle,
        iconSize: 28,
        heading: "Payment unsuccessful",
        body:
          reason ??
          "No amount was charged to your account. Please try again or use a different payment method.",
        primaryLabel: "Try again",
        primaryTo: "/pricing",
        secondaryLabel: "Contact support",
        secondaryTo: "/support",
      };
    case "cancelled":
      return {
        iconRingClass: "pr-icon-ring pr-icon-ring--cancelled",
        Icon: ArrowLeft,
        iconSize: 24,
        heading: "Payment cancelled",
        body: "No charge was made. You can return to the pricing page whenever you're ready.",
        primaryLabel: "Return to pricing",
        primaryTo: "/pricing",
        secondaryLabel: "Go home",
        secondaryTo: "/",
      };
  }
}

export function PaymentResultScreen() {
  const raw = useSearch({ strict: false }) as SearchParams;
  const status = safeStatus(raw.status);
  const planRaw =
    typeof raw.plan === "string" && raw.plan.length > 0 ? raw.plan : "membership";
  const planName = planRaw.charAt(0).toUpperCase() + planRaw.slice(1);
  const paymentId = typeof raw.payment_id === "string" ? raw.payment_id : null;
  const reason = typeof raw.reason === "string" && raw.reason.length > 0 ? raw.reason : undefined;
  const isMock = typeof paymentId === "string" && paymentId.startsWith("mock_");

  const config = getConfig(status, planName, reason);
  const { iconRingClass, Icon, iconSize, heading, body, primaryLabel, primaryTo, secondaryLabel, secondaryTo } =
    config;

  return (
    <div id="gvrze-payment-result">
      <div className="pr-shell">
        {/* Mock mode badge */}
        {isMock ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
              padding: "0.55rem 0.9rem",
              borderRadius: "0.6rem",
              background: "#fef3c7",
              border: "1px solid #fcd34d",
              fontSize: "0.72rem",
              color: "#78350f",
              fontWeight: 600,
              letterSpacing: "0.08em",
            }}
            role="status"
          >
            <FlaskConical size={13} strokeWidth={2.2} aria-hidden />
            MOCK / TEST MODE — development only
          </div>
        ) : null}

        <article className="pr-card" role="main" aria-label={`Payment ${status}`}>
          <div className={iconRingClass} aria-hidden="true">
            <Icon size={iconSize} strokeWidth={1.6} />
          </div>

          <h1 className="pr-heading">{heading}</h1>
          <p className="pr-body">{body}</p>

          {paymentId ? (
            <div className="pr-detail-chip" aria-label={`Payment ID: ${paymentId}`}>
              <span>{isMock ? "Mock Ref" : "Payment ID"}</span>
              <span style={{ fontFamily: "monospace", fontSize: "0.7rem" }}>
                {paymentId}
              </span>
            </div>
          ) : (
            <div className="pr-detail-chip" aria-label={`Plan: ${planName}`}>
              <span>Plan</span>
              <strong>{planName}</strong>
            </div>
          )}

          <nav className="pr-actions" aria-label="Next steps">
            <Link to={primaryTo} className="pr-btn pr-btn--primary">
              {primaryLabel}
            </Link>
            {secondaryLabel && secondaryTo ? (
              <Link to={secondaryTo} className="pr-btn pr-btn--secondary">
                {secondaryLabel}
              </Link>
            ) : null}
          </nav>

          <p className="pr-help">
            {isMock ? (
              <>
                Testing?{" "}
                <Link to="/pricing/checkout" className="underline-offset-2">
                  Try another payment scenario
                </Link>
                .
              </>
            ) : (
              <>
                Questions?{" "}
                <Link to="/support" className="underline-offset-2">
                  Contact GVRZE support
                </Link>
                .
              </>
            )}
          </p>
        </article>
      </div>
    </div>
  );
}
