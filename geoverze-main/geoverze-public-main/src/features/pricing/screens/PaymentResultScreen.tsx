/**
 * PaymentResultScreen — /pricing/payment-result
 *
 * Query params are hints only. Success is shown after the backend reports
 * an active membership (signature verify or webhook), never from the URL.
 */

import { ArrowLeft, CheckCircle2, Clock, FlaskConical, RefreshCw, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import type { BillingCycle, TierId } from "../data/plans";
import { customerFacingPaymentError } from "../lib/razorpayCheckoutResponse";
import {
  getSubscriptionPaymentStatusFn,
  type SubscriptionPaymentStatusResult,
} from "../lib/subscriptionServerFns";
import "../styles/payment-result.css";

type PaymentStatus = "processing" | "success" | "failed" | "cancelled";

type SearchParams = {
  status?: unknown;
  plan?: unknown;
  cycle?: unknown;
  payment_id?: unknown;
  subscription_id?: unknown;
  reason?: unknown;
};

function safeStatus(raw: unknown): PaymentStatus {
  if (raw === "processing" || raw === "success" || raw === "failed" || raw === "cancelled") {
    return raw;
  }
  return "processing";
}

const PLAN_NAMES: Record<TierId, string> = {
  explorer: "Explorer",
  basic: "Basic",
  pro: "Pro",
  advance: "Advance",
};

function planLabel(raw: string | null): string {
  const id = (raw ?? "").toLowerCase();
  if (id === "basic" || id === "pro" || id === "advance" || id === "explorer") {
    return PLAN_NAMES[id as TierId];
  }
  if (!raw) return "Membership";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function cycleLabel(raw: string | null): string {
  if (raw === "annual") return "Annual";
  if (raw === "monthly") return "Monthly";
  return raw ? raw : "—";
}

function formatAccessUntil(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function looksLikeInternalError(value: string): boolean {
  return (
    /expected string|validation error|invalid_type|rzp_signature|"path"\s*:/i.test(value) ||
    /at\s+\S+\s+\(/.test(value)
  );
}

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 20_000;

export function PaymentResultScreen() {
  const raw = useSearch({ strict: false }) as SearchParams;
  const hintedStatus = safeStatus(raw.status);
  const planHint =
    typeof raw.plan === "string" && raw.plan.length > 0 ? raw.plan : null;
  const cycleHint: BillingCycle | null =
    raw.cycle === "annual" || raw.cycle === "monthly" ? raw.cycle : null;
  const paymentId = typeof raw.payment_id === "string" ? raw.payment_id : null;
  const subscriptionId =
    typeof raw.subscription_id === "string" && raw.subscription_id.length > 0
      ? raw.subscription_id
      : null;
  const reasonHint =
    typeof raw.reason === "string" && raw.reason.length > 0 && !looksLikeInternalError(raw.reason)
      ? raw.reason
      : undefined;
  const isMock = typeof paymentId === "string" && paymentId.startsWith("mock_");
  const queryClient = useQueryClient();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setAccessToken(data.session?.access_token ?? null);
      setAuthReady(true);
    });
  }, []);

  const shouldPoll =
    (hintedStatus === "processing" || hintedStatus === "success") && Boolean(accessToken);

  const statusQuery = useQuery({
    queryKey: ["membership-payment-status", subscriptionId, paymentId, accessToken],
    queryFn: () =>
      getSubscriptionPaymentStatusFn({
        data: {
          access_token: accessToken ?? "",
          ...(subscriptionId ? { subscription_id: subscriptionId } : {}),
          ...(paymentId ? { payment_id: paymentId } : {}),
        },
      }),
    enabled: shouldPoll,
    refetchInterval: (query) => {
      const data = query.state.data as SubscriptionPaymentStatusResult | undefined;
      if (data?.activated) return false;
      if (timedOut) return false;
      return POLL_INTERVAL_MS;
    },
    staleTime: 0,
  });

  useEffect(() => {
    if (!shouldPoll) return;
    const timer = window.setTimeout(() => setTimedOut(true), POLL_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [shouldPoll]);

  useEffect(() => {
    if (statusQuery.data?.activated) {
      void queryClient.invalidateQueries({ queryKey: ["billing"] });
      void queryClient.invalidateQueries({ queryKey: ["librarySubscriptionTier"] });
    }
  }, [statusQuery.data?.activated, queryClient]);

  const backend = statusQuery.data;
  const displayStatus: PaymentStatus = useMemo(() => {
    if (hintedStatus === "failed") return "failed";
    if (hintedStatus === "cancelled") return "cancelled";
    if (backend?.activated || (isMock && hintedStatus === "success")) return "success";
    if (!authReady) return "processing";
    if (timedOut && !backend?.activated) return "processing";
    if ((hintedStatus === "success" || hintedStatus === "processing") && !backend?.activated) {
      return "processing";
    }
    return hintedStatus;
  }, [authReady, backend?.activated, hintedStatus, isMock, timedOut]);

  const planName = planLabel(backend?.plan_tier ?? planHint);
  const cycle = cycleLabel(backend?.billing_interval ?? cycleHint);
  const accessUntil = formatAccessUntil(backend?.current_period_end ?? null);
  const paymentRef = backend?.payment_id ?? paymentId;
  const authStatus = backend?.activated
    ? "Active"
    : backend?.payment_status === "succeeded"
      ? "Paid"
      : displayStatus === "processing"
        ? "Verifying"
        : displayStatus === "success"
          ? "Active"
          : displayStatus === "failed"
            ? "Failed"
            : "Cancelled";

  const retryHref =
    planHint && (planHint === "basic" || planHint === "pro" || planHint === "advance")
      ? `/pricing/checkout?plan=${planHint}&cycle=${cycleHint ?? "monthly"}`
      : "/pricing";

  let heading = "Verifying payment";
  let body =
    "Confirming your membership with Razorpay. This page never treats a redirect as proof of payment.";
  let Icon = Clock;
  let iconRingClass = "pr-icon-ring pr-icon-ring--processing";
  let primaryLabel = "Refresh status";
  let primaryTo = "/pricing/payment-result";
  let secondaryLabel = "Return to pricing";
  let secondaryTo = "/pricing";

  if (displayStatus === "success") {
    heading = "Subscription activated successfully!";
    body = `Your ${planName} membership is active. Welcome to GVRZE.`;
    Icon = CheckCircle2;
    iconRingClass = "pr-icon-ring pr-icon-ring--success";
    primaryLabel = "Manage Membership";
    primaryTo = "/billing";
    secondaryLabel = "Go to Billing Dashboard";
    secondaryTo = "/billing";
  } else if (displayStatus === "failed") {
    heading = "Payment unsuccessful";
    body =
      reasonHint ??
      "No amount was charged. You can retry checkout or use a different payment method.";
    Icon = XCircle;
    iconRingClass = "pr-icon-ring pr-icon-ring--failed";
    primaryLabel = "Retry checkout";
    primaryTo = retryHref;
    secondaryLabel = "Return to Pricing";
    secondaryTo = "/pricing";
  } else if (displayStatus === "cancelled") {
    heading = "Payment cancelled";
    body = "No charge was made. You can return to pricing whenever you are ready.";
    Icon = ArrowLeft;
    iconRingClass = "pr-icon-ring pr-icon-ring--cancelled";
    primaryLabel = "Return to Pricing";
    primaryTo = "/pricing";
    secondaryLabel = "Go home";
    secondaryTo = "/";
  } else if (authReady && !accessToken && !isMock) {
    heading = "Sign in to confirm payment";
    body = "Your Razorpay payment needs a signed-in session before we can show membership status.";
    primaryLabel = "Sign in";
    primaryTo = "/auth/login";
    secondaryLabel = "Return to Pricing";
    secondaryTo = "/pricing";
  } else if (timedOut) {
    heading = "Still confirming payment";
    body =
      "Razorpay has not finished confirming this payment yet. If you were charged, membership will activate shortly — check Manage Membership rather than paying again.";
    primaryLabel = "Manage Membership";
    primaryTo = "/billing";
    secondaryLabel = "Return to Pricing";
    secondaryTo = "/pricing";
  } else if (statusQuery.isError) {
    heading = "Still confirming payment";
    body = customerFacingPaymentError(statusQuery.error);
    primaryLabel = "Manage Membership";
    primaryTo = "/billing";
    secondaryLabel = "Return to Pricing";
    secondaryTo = "/pricing";
  }

  const showDetails = displayStatus === "success" || (displayStatus === "processing" && Boolean(backend?.found));

  return (
    <div id="gvrze-payment-result">
      <div className="pr-shell">
        {isMock ? (
          <div className="pr-mock-badge" role="status">
            <FlaskConical size={13} strokeWidth={2.2} aria-hidden />
            MOCK / TEST MODE — development only
          </div>
        ) : null}

        <article className="pr-card" role="main" aria-label={`Payment ${displayStatus}`}>
          <div className={iconRingClass} aria-hidden="true">
            {displayStatus === "processing" && !timedOut ? (
              <RefreshCw size={28} strokeWidth={1.6} />
            ) : (
              <Icon size={displayStatus === "cancelled" ? 24 : 28} strokeWidth={1.6} />
            )}
          </div>

          <h1 className="pr-heading">{heading}</h1>
          <p className="pr-body">{body}</p>

          {showDetails ? (
            <dl className="pr-details">
              <div>
                <dt>Plan</dt>
                <dd>{planName}</dd>
              </div>
              <div>
                <dt>Billing cycle</dt>
                <dd>{cycle}</dd>
              </div>
              <div>
                <dt>Payment status</dt>
                <dd>{authStatus}</dd>
              </div>
              {accessUntil ? (
                <div>
                  <dt>Next billing</dt>
                  <dd>{accessUntil}</dd>
                </div>
              ) : null}
              {paymentRef ? (
                <div>
                  <dt>{isMock ? "Mock ref" : "Payment ID"}</dt>
                  <dd className="pr-mono">{paymentRef}</dd>
                </div>
              ) : null}
            </dl>
          ) : paymentRef ? (
            <div className="pr-detail-chip" aria-label={`Payment ID: ${paymentRef}`}>
              <span>{isMock ? "Mock Ref" : "Payment ID"}</span>
              <span className="pr-mono">{paymentRef}</span>
            </div>
          ) : (
            <div className="pr-detail-chip" aria-label={`Plan: ${planName}`}>
              <span>Plan</span>
              <strong>{planName}</strong>
            </div>
          )}

          <nav className="pr-actions" aria-label="Next steps">
            {displayStatus === "processing" && !timedOut && accessToken ? (
              <button
                type="button"
                className="pr-btn pr-btn--primary"
                onClick={() => void statusQuery.refetch()}
              >
                {primaryLabel}
              </button>
            ) : (
              <a href={primaryTo} className="pr-btn pr-btn--primary">
                {primaryLabel}
              </a>
            )}
            <a href={secondaryTo} className="pr-btn pr-btn--secondary">
              {secondaryLabel}
            </a>
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
