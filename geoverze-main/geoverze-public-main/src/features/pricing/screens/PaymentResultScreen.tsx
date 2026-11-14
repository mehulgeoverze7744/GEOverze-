/**
 * PaymentResultScreen — /pricing/payment-result
 *
 * Query params are hints only. The visible state comes from the signed-in
 * user's actual user_subscriptions / billing_payments rows.
 */

import { ArrowLeft, CheckCircle2, Clock, FlaskConical, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import type { BillingCycle, TierId } from "../data/plans";
import { customerFacingPaymentError } from "../lib/razorpayCheckoutResponse";
import { resolvePaymentResultKind } from "../lib/membershipCheckoutGuard";
import {
  getSubscriptionPaymentStatusFn,
  type SubscriptionPaymentStatusResult,
} from "../lib/subscriptionServerFns";
import "../styles/payment-result.css";

type HintedStatus = "processing" | "success" | "failed" | "cancelled" | "existing";

type SearchParams = {
  status?: unknown;
  plan?: unknown;
  cycle?: unknown;
  payment_id?: unknown;
  subscription_id?: unknown;
  reason?: unknown;
};

function safeHint(raw: unknown): HintedStatus {
  if (
    raw === "processing" ||
    raw === "success" ||
    raw === "failed" ||
    raw === "cancelled" ||
    raw === "existing"
  ) {
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
const POLL_TIMEOUT_MS = 30_000;
const EXISTING_REDIRECT_MS = 4000;
const BILLING_PATH = "/billing";
const EXPLORE_PATH = "/play";

export function PaymentResultScreen() {
  const raw = useSearch({ strict: false }) as SearchParams;
  const navigate = useNavigate();
  const hintedStatus = safeHint(raw.status);
  const planHint = typeof raw.plan === "string" && raw.plan.length > 0 ? raw.plan : null;
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
  const [pollCycle, setPollCycle] = useState(0);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setAccessToken(data.session?.access_token ?? null);
      setAuthReady(true);
    });
  }, []);

  const shouldPoll = Boolean(accessToken);

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
      if (data?.existing_active && !data.checkout_pending) return false;
      if (timedOut) return false;
      return POLL_INTERVAL_MS;
    },
    staleTime: 0,
  });

  useEffect(() => {
    if (!shouldPoll) return;
    const timer = window.setTimeout(() => setTimedOut(true), POLL_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [pollCycle, shouldPoll]);

  const backend = statusQuery.data;
  const waitingOnServer =
    shouldPoll && !backend && !statusQuery.isError && !timedOut;
  const kind = useMemo(
    () =>
      resolvePaymentResultKind({
        authReady: authReady && !waitingOnServer,
        signedIn: Boolean(accessToken),
        hinted: hintedStatus,
        checkoutActivated: Boolean(backend?.activated) || (isMock && hintedStatus === "success"),
        checkoutPending: Boolean(backend?.checkout_pending),
        existingActive: Boolean(backend?.existing_active),
      }),
    [
      accessToken,
      authReady,
      backend?.activated,
      backend?.checkout_pending,
      backend?.existing_active,
      hintedStatus,
      isMock,
      waitingOnServer,
    ],
  );

  useEffect(() => {
    if (kind === "confirmed" || kind === "existing") {
      void queryClient.invalidateQueries({ queryKey: ["billing"] });
      void queryClient.invalidateQueries({ queryKey: ["librarySubscriptionTier"] });
    }
  }, [kind, queryClient]);

  useEffect(() => {
    if (kind !== "existing") return;
    const timer = window.setTimeout(() => {
      void navigate({ to: BILLING_PATH });
    }, EXISTING_REDIRECT_MS);
    return () => window.clearTimeout(timer);
  }, [kind, navigate]);

  const planName = planLabel(backend?.plan_tier ?? planHint);
  const cycle = cycleLabel(backend?.billing_interval ?? cycleHint);
  const accessUntil = formatAccessUntil(backend?.current_period_end ?? null);
  const paymentRef = backend?.payment_id ?? paymentId;
  const membershipStatus =
    kind === "confirmed" || kind === "existing"
      ? "Active"
      : kind === "pending"
        ? "Pending authorization"
        : kind === "failed"
          ? "Failed"
          : kind === "cancelled"
            ? "Cancelled"
            : "Checking";
  const paymentStatusLabel =
    kind === "existing"
      ? "Already active"
      : backend?.payment_status === "succeeded"
        ? "Confirmed"
        : kind === "confirmed"
          ? "Confirmed"
          : kind === "pending"
            ? "Awaiting Razorpay"
            : kind === "failed"
              ? "Unsuccessful"
              : "—";

  const retryHref =
    planHint && (planHint === "basic" || planHint === "pro" || planHint === "advance")
      ? `/pricing/checkout?plan=${planHint}&cycle=${cycleHint ?? "monthly"}`
      : "/pricing";

  let heading = "Confirming your membership";
  let body = "Checking your GVRZE subscription with the billing server. This page never treats a redirect as proof of payment.";
  let Icon = Clock;
  let iconRingClass = "pr-icon-ring pr-icon-ring--processing";
  let primaryLabel = "Check status";
  let primaryTo = "";
  let secondaryLabel = "Return to pricing";
  let secondaryTo = "/pricing";
  let showCheckButton = false;

  if (kind === "loading") {
    heading = "Checking membership status";
    body = "Confirming your GVRZE session with the billing server.";
    Icon = RefreshCw;
    iconRingClass = "pr-icon-ring pr-icon-ring--processing";
    primaryLabel = "Return to pricing";
    primaryTo = "/pricing";
    secondaryLabel = "Go home";
    secondaryTo = "/";
  } else if (kind === "confirmed") {
    heading = "Subscription Confirmed!";
    body = "Welcome to GVRZE Membership.";
    Icon = CheckCircle2;
    iconRingClass = "pr-icon-ring pr-icon-ring--success";
    primaryLabel = "Go to Billing Dashboard";
    primaryTo = BILLING_PATH;
    secondaryLabel = "Explore GVRZE";
    secondaryTo = EXPLORE_PATH;
  } else if (kind === "existing") {
    heading = "Existing Membership Active";
    body = "You already have an active GVRZE membership.";
    Icon = ShieldCheck;
    iconRingClass = "pr-icon-ring pr-icon-ring--existing";
    primaryLabel = "Go to Billing Dashboard";
    primaryTo = BILLING_PATH;
    secondaryLabel = "Explore GVRZE";
    secondaryTo = EXPLORE_PATH;
  } else if (kind === "failed") {
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
  } else if (kind === "cancelled") {
    heading = "Payment cancelled";
    body = "No charge was made. You can return to pricing whenever you are ready.";
    Icon = ArrowLeft;
    iconRingClass = "pr-icon-ring pr-icon-ring--cancelled";
    primaryLabel = "Return to Pricing";
    primaryTo = "/pricing";
    secondaryLabel = "Go home";
    secondaryTo = "/";
  } else if (kind === "signin") {
    heading = "Sign in to confirm payment";
    body = "Your Razorpay payment needs a signed-in session before we can show membership status.";
    Icon = ShieldCheck;
    iconRingClass = "pr-icon-ring pr-icon-ring--existing";
    primaryLabel = "Sign in";
    primaryTo = "/auth/login";
    secondaryLabel = "Return to Pricing";
    secondaryTo = "/pricing";
  } else if (kind === "pending") {
    heading = timedOut || statusQuery.isError ? "Payment pending" : "Confirming your membership";
    body = statusQuery.isError
      ? customerFacingPaymentError(statusQuery.error)
      : timedOut
        ? "Razorpay has not confirmed this authorization yet. Use Check status rather than paying again — membership will appear here once the billing server updates."
        : "Waiting for Razorpay and the GVRZE billing server to confirm this authorization.";
    Icon = Clock;
    iconRingClass =
      timedOut || statusQuery.isError
        ? "pr-icon-ring pr-icon-ring--pending"
        : "pr-icon-ring pr-icon-ring--processing";
    showCheckButton = Boolean(accessToken);
    primaryLabel = "Check status";
    primaryTo = BILLING_PATH;
    secondaryLabel = "Go to Billing Dashboard";
    secondaryTo = BILLING_PATH;
  }

  const showDetails = kind === "confirmed" || kind === "existing" || (kind === "pending" && Boolean(backend?.found));

  return (
    <div id="gvrze-payment-result">
      <div className="pr-shell">
        {isMock ? (
          <div className="pr-mock-badge" role="status">
            <FlaskConical size={13} strokeWidth={2.2} aria-hidden />
            MOCK / TEST MODE — development only
          </div>
        ) : null}

        <article className="pr-card" role="main" aria-label={`Payment ${kind}`}>
          <div className={iconRingClass} aria-hidden="true">
            {kind === "pending" && !timedOut ? (
              <RefreshCw size={28} strokeWidth={1.6} />
            ) : (
              <Icon size={kind === "cancelled" ? 24 : 28} strokeWidth={1.6} />
            )}
          </div>

          <h1 className="pr-heading">{heading}</h1>
          <p className="pr-body">{body}</p>
          {kind === "existing" ? (
            <>
              <p className="pr-body pr-body--follow">
                Your existing membership is active. Manage your subscription from your billing dashboard.
              </p>
              <p className="pr-redirect-note">Redirecting to your billing dashboard…</p>
            </>
          ) : null}

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
                <dt>Subscription status</dt>
                <dd>{membershipStatus}</dd>
              </div>
              <div>
                <dt>Payment</dt>
                <dd>{paymentStatusLabel}</dd>
              </div>
              {accessUntil ? (
                <div>
                  <dt>Next billing</dt>
                  <dd>{accessUntil}</dd>
                </div>
              ) : null}
              {paymentRef && !String(paymentRef).startsWith("rzp_pending_") ? (
                <div>
                  <dt>{isMock ? "Mock ref" : "Payment ID"}</dt>
                  <dd className="pr-mono">{paymentRef}</dd>
                </div>
              ) : null}
            </dl>
          ) : paymentRef && !String(paymentRef).startsWith("rzp_pending_") ? (
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
            {showCheckButton ? (
              <button
                type="button"
                className="pr-btn pr-btn--primary"
                onClick={() => {
                  setTimedOut(false);
                  setPollCycle((cycle) => cycle + 1);
                  void statusQuery.refetch();
                }}
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
