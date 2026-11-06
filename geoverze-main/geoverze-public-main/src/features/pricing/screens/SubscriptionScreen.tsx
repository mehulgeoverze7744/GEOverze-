import { Link } from "@tanstack/react-router";
import { Coins, Download, FlaskConical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { PageShell } from "@/components/layout/PageShell";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

import { paymentMethods } from "../data/billing";
import { useMyBilling } from "../hooks/useMyBilling";
import { usePricingCatalog } from "../hooks/usePricingCatalog";
import { isRazorpayConfigured } from "../lib/checkout";
import { cancelMockSubscription } from "../lib/mock-payment";
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
  const queryClient = useQueryClient();
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
                  {/* TEST MODE badge — only visible for mock subscriptions */}
                  {data.isMockSubscription ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.35rem 0.75rem",
                        marginBottom: "0.75rem",
                        borderRadius: "0.5rem",
                        background: "oklch(0.97 0.05 85)",
                        border: "1.5px solid oklch(0.82 0.12 85)",
                        color: "oklch(0.45 0.12 60)",
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        letterSpacing: "0.04em",
                      }}
                      role="status"
                      aria-label="Test mode subscription"
                    >
                      <FlaskConical size={14} aria-hidden="true" />
                      TEST MODE — NO REAL PAYMENT WAS PROCESSED
                    </div>
                  ) : null}

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
                  {data.isPaidMembership && !data.isMockSubscription && !data.statusLabel.includes("cancel") ? (
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

                  {/* Cancel mock subscription (test mode only) */}
                  {data.isMockSubscription && data.mockSubscriptionId && !data.statusLabel.includes("cancel") ? (
                    <button
                      type="button"
                      className="bm-cancel"
                      disabled={cancelLoading}
                      style={{ borderColor: "oklch(0.75 0.1 60)", color: "oklch(0.45 0.12 60)" }}
                      onClick={() => {
                        if (!data.mockSubscriptionId) return;
                        void (async () => {
                          setCancelLoading(true);
                          try {
                            await cancelMockSubscription({ subscription_id: data.mockSubscriptionId! });
                            toast.success("Mock subscription cancelled. Your plan has been reset.");
                            void refetch();
                            void queryClient.invalidateQueries({ queryKey: ["billing"] });
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Failed to cancel mock subscription.");
                          } finally {
                            setCancelLoading(false);
                          }
                        })();
                      }}
                      aria-busy={cancelLoading}
                    >
                      {cancelLoading ? "Cancelling…" : "Cancel mock subscription (TEST MODE)"}
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
              <p className="bm-label">Credits</p>
              {loading ? <div className="bm-skeleton bm-skeleton--credit" aria-hidden /> : null}
              {!error && !loading && data ? (
                <>
                  <span className="bm-credit-icon" aria-hidden="true">
                    <Coins strokeWidth={1.6} />
                  </span>

                  {/* ── Two distinct credit values ─────────────────────── */}
                  <dl className="bm-credit-dl">
                    <div className="bm-credit-row">
                      <dt className="bm-credit-row__label">Available balance</dt>
                      <dd className="bm-credit-row__value">
                        <strong>{data.availableCredits.toLocaleString()}</strong>
                        <span className="bm-credit-row__unit">credits</span>
                      </dd>
                    </div>
                    <div className="bm-credit-row bm-credit-row--secondary">
                      <dt className="bm-credit-row__label">Monthly allocation</dt>
                      <dd className="bm-credit-row__value">
                        {data.monthlyCreditGrant > 0 ? (
                          <>
                            <strong>{data.monthlyCreditGrant}</strong>
                            <span className="bm-credit-row__unit">/ month</span>
                          </>
                        ) : (
                          <span className="bm-credit-row__unit">None on free tier</span>
                        )}
                      </dd>
                    </div>
                    {data.periodGrantAmount != null && data.periodGrantAmount > 0 ? (
                      <div className="bm-credit-row bm-credit-row--secondary">
                        <dt className="bm-credit-row__label">This period granted</dt>
                        <dd className="bm-credit-row__value">
                          <strong>{data.periodGrantAmount}</strong>
                          <span className="bm-credit-row__unit">credits</span>
                        </dd>
                      </div>
                    ) : null}
                  </dl>

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
