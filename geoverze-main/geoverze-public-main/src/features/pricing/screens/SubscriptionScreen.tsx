import { Link } from "@tanstack/react-router";
import { Coins, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

import { paymentMethods } from "../data/billing";
import { useMyBilling } from "../hooks/useMyBilling";
import { usePricingCatalog } from "../hooks/usePricingCatalog";
import { isRazorpayConfigured } from "../lib/checkout";
import "../styles/billing-membership.css";

const PAYMENT_EMOJIS: Record<string, string> = {
  cards: "💳",
  upi: "📱",
  netbanking: "🏦",
  wallet: "👛",
  international: "🌍",
  future: "💰",
};

const UNAVAILABLE_BILLING =
  "Payment management activates once GVRZE's Razorpay integration is live.";

/** Live membership, credits and payment history for the signed-in user. */
export function SubscriptionScreen() {
  const { plans } = usePricingCatalog();
  const { data, loading, error, refetch } = useMyBilling();
  const [cancelLoading, setCancelLoading] = useState(false);
  const razorpayLive = isRazorpayConfigured();
  const catalogPlan = data ? (plans.find((p) => p.id === data.tier) ?? null) : null;

  async function handleCancelMembership() {
    if (!razorpayLive) {
      toast(UNAVAILABLE_BILLING);
      return;
    }
    if (!window.confirm(
      "Cancel membership at end of period?\n\nYou'll keep access until your current billing period ends. This cannot be undone from the app.",
    )) {
      return;
    }
    setCancelLoading(true);
    try {
      const { data: result, error: rpcError } = await supabase.rpc(
        "request_cancel_subscription" as never,
      ) as { data: { ok: boolean; reason?: string } | null; error: unknown };
      if (rpcError || !result?.ok) {
        const reason = result?.reason ?? "unknown";
        if (reason === "no_active_subscription") {
          toast.error("No active subscription found to cancel.");
        } else {
          toast.error("Could not request cancellation. Please contact support.");
        }
      } else {
        toast.success("Membership cancellation scheduled", {
          description:
            "Your plan stays active until the end of your billing period.",
        });
        refetch();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  }
  const planName = catalogPlan?.name ?? data?.planName ?? "";
  const planSummary = catalogPlan?.summary ?? data?.planSummary ?? "";

  return (
    <PageShell>
      <SectionContainer className="bm">
        <Breadcrumb
          items={[{ label: "Home", to: "/" }, { label: "Billing" }]}
          className="bm-crumb"
        />

        <header className="bm-header">
          <p className="bm-kicker">Billing & membership</p>
          <h1 className="bm-title">Your membership</h1>
          <p className="bm-lede">
            Manage your plan, billing cycle, credits, and payment preferences.
          </p>
        </header>

        {error ? (
          <article className="bm-card bm-load-error" role="alert">
            <p className="bm-error-copy">Unable to load your membership details.</p>
            <button type="button" className="bm-btn bm-btn--primary" onClick={refetch}>
              Try again
            </button>
          </article>
        ) : (
          <div className="bm-top">
            <article className="bm-card bm-card--plan">
              {loading ? <div className="bm-skeleton" aria-hidden /> : null}

              {!error && !loading && data ? (
                <>
                  <div className="bm-card-head">
                    <p className="bm-label">Current plan</p>
                    <span className="bm-status">{data.statusLabel}</span>
                  </div>
                  <h2 className="bm-plan-name">{planName}</h2>
                  <p className="bm-plan-copy">{planSummary}</p>
                  <p className="bm-price">
                    {data.priceAmount}
                    <span>{data.priceCadence}</span>
                  </p>
                  <dl className="bm-meta">
                    <div>
                      <dt>Billing cycle</dt>
                      <dd>{data.billingInterval}</dd>
                    </div>
                    <div>
                      <dt>Member since</dt>
                      <dd>{data.memberSinceLabel}</dd>
                    </div>
                    <div>
                      <dt>Renews</dt>
                      <dd>{data.renewsLabel}</dd>
                    </div>
                  </dl>
                  <div className="bm-actions">
                    <Link to="/pricing" className="bm-btn bm-btn--primary">
                      Change Plan
                    </Link>
                    {data.canSwitchToAnnual ? (
                      <Link
                        to="/pricing/checkout"
                        search={{ plan: data.tier, cycle: "annual" }}
                        className="bm-btn bm-btn--secondary"
                        title={!razorpayLive ? UNAVAILABLE_BILLING : "Switch to annual billing and save"}
                        aria-disabled={!razorpayLive}
                        onClick={!razorpayLive ? (e) => { e.preventDefault(); toast(UNAVAILABLE_BILLING); } : undefined}
                      >
                        Switch to Annual
                      </Link>
                    ) : null}
                  </div>
                  {data.isPaidMembership && !data.statusLabel.includes("cancel") ? (
                    <button
                      type="button"
                      className="bm-cancel"
                      disabled={cancelLoading}
                      title={!razorpayLive ? UNAVAILABLE_BILLING : undefined}
                      onClick={() => void handleCancelMembership()}
                      aria-busy={cancelLoading}
                    >
                      {cancelLoading ? "Cancelling…" : "Cancel membership"}
                    </button>
                  ) : null}
                  {data.statusLabel.includes("cancel") ? (
                    <p className="bm-note" style={{ color: "oklch(0.5 0.08 24)", marginTop: "0.5rem" }}>
                      Cancellation scheduled — active until period end.
                    </p>
                  ) : null}
                </>
              ) : null}
            </article>

            <article className="bm-card bm-credits">
              <p className="bm-label">Monthly credits</p>
              {loading ? <div className="bm-skeleton bm-skeleton--credit" aria-hidden /> : null}
              {!error && !loading && data ? (
                <>
                  <span className="bm-credit-icon" aria-hidden="true">
                    <Coins strokeWidth={1.6} />
                  </span>
                  <p className="bm-credit-value">{data.monthlyCreditGrant}</p>
                  <p className="bm-credit-unit">credits / month</p>
                  <p className="bm-credit-copy">
                    Your membership includes {data.monthlyCreditGrant} credits every month.
                    {data.periodGrantAmount != null
                      ? ` This period granted ${data.periodGrantAmount}.`
                      : ""}{" "}
                    You currently have {data.availableCredits} available.
                  </p>
                  <Link to="/geostore/rewards" className="bm-btn bm-btn--secondary">
                    Spend Credits
                  </Link>
                </>
              ) : null}
            </article>
          </div>
        )}

        <section className="bm-section" aria-labelledby="billing-history-heading">
          <div className="bm-section-head">
            <div>
              <p className="bm-label">Billing history</p>
              <h2 id="billing-history-heading" className="bm-section-title">
                Your recent membership payments.
              </h2>
            </div>
            <button
              type="button"
              className="bm-btn bm-btn--secondary"
              disabled
              title="Invoice export is not available yet."
            >
              <Download strokeWidth={1.6} aria-hidden="true" />
              Export
            </button>
          </div>
          {loading ? <div className="bm-skeleton bm-skeleton--ledger" aria-hidden /> : null}
          {!error && !loading && data && data.history.length === 0 ? (
            <p className="bm-empty">No billing history yet.</p>
          ) : null}
          {!error && !loading && data && data.history.length > 0 ? (
            <ul className="bm-ledger">
              {data.history.map((invoice) => (
                <li key={invoice.id}>
                  <div className="bm-invoice">
                    <div>
                      <p className="bm-invoice-name">{invoice.description}</p>
                      <p className="bm-invoice-date">{invoice.date}</p>
                    </div>
                    <div className="bm-invoice-side">
                      <p className="bm-invoice-amount">
                        {invoice.amount}
                        <span className={cn("bm-pill", `bm-pill--${invoice.status}`)}>
                          {invoice.status}
                        </span>
                      </p>
                      <p className="bm-invoice-id">{invoice.id}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="bm-section" aria-labelledby="payment-methods-heading">
          <div className="bm-section-head">
            <div>
              <p className="bm-label">Payment methods</p>
              <h2 id="payment-methods-heading" className="bm-section-title">
                Not connected yet
              </h2>
              <p className="bm-section-copy">
                No saved payment methods are stored on your account. Provider integration arrives
                with the payments phase.
              </p>
            </div>
          </div>
          <div className="bm-methods">
            {paymentMethods.map((method) => (
              <article key={method.id} className="bm-method">
                <span className="bm-method-icon" aria-hidden="true">
                  {PAYMENT_EMOJIS[method.id] ?? "💳"}
                </span>
                <div>
                  <h3 className="bm-method-name">{method.label}</h3>
                  <p className="bm-method-copy">{method.description}</p>
                </div>
                <p
                  className={cn(
                    "bm-method-status",
                    method.availability !== "planned" && "is-later",
                  )}
                >
                  {method.availability === "planned" ? "Coming soon" : "Later"}
                </p>
              </article>
            ))}
          </div>
        </section>
      </SectionContainer>
    </PageShell>
  );
}
