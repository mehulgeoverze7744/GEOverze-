import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Download } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { cn } from "@/lib/utils";

import { currentSubscription, invoiceHistory, paymentMethods } from "../data/billing";
import { pricingPlans } from "../data/plans";
import { notBillableYet } from "../lib/checkout";

const statusTone: Record<string, string> = {
  paid: "text-bronze",
  refunded: "text-foreground/50",
  pending: "text-foreground/60",
};

/** Subscription & billing management. Read-only placeholders until payments land. */
export function SubscriptionScreen() {
  const plan = pricingPlans.find((p) => p.id === currentSubscription.tier) ?? pricingPlans[0]!;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Billing"
        title="Your membership"
        description="Plan, renewal, invoices and payment methods. Everything here is placeholder data until billing is live."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Billing" }]}
      />

      <section className="pb-[var(--space-section-sm)]">
        <SectionContainer size="wide">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <AnimatedSection>
              <GlassCard strong className="h-full p-8 md:p-10">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="min-w-0">
                    <p className="eyebrow">Current plan</p>
                    <h2 className="mt-4 font-light tracking-tight text-foreground text-[clamp(1.5rem,2.6vw,2rem)]">
                      {plan.name}
                    </h2>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/55">
                      {plan.summary}
                    </p>
                  </div>
                  <span className="rounded-full border border-bronze/30 bg-bronze/10 px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.24em] text-bronze">
                    {currentSubscription.status}
                  </span>
                </div>

                <dl className="mt-9 grid gap-6 border-t border-bronze/12 pt-8 sm:grid-cols-3">
                  {[
                    { label: "Billing cycle", value: currentSubscription.cycle },
                    { label: "Member since", value: currentSubscription.since },
                    { label: "Renews on", value: currentSubscription.renewsOn },
                  ].map((row) => (
                    <div key={row.label}>
                      <dt className="text-[0.58rem] uppercase tracking-[0.26em] text-foreground/50">
                        {row.label}
                      </dt>
                      <dd className="mt-2 text-sm capitalize text-foreground/80">{row.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-10 flex flex-wrap gap-3">
                  <GeoButton asChild variant="primary">
                    <Link to="/pricing">
                      Change plan
                      <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
                    </Link>
                  </GeoButton>
                  <GeoButton variant="secondary" onClick={() => notBillableYet("Cycle switching")}>
                    Switch to annual
                  </GeoButton>
                  <GeoButton variant="ghost" onClick={() => notBillableYet("Cancellation")}>
                    Cancel membership
                  </GeoButton>
                </div>
              </GlassCard>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <GlassCard className="h-full p-8">
                <p className="eyebrow">Monthly grant</p>
                <p className="mt-5 font-light leading-none text-bronze-glow text-[clamp(2rem,4vw,2.8rem)]">
                  {currentSubscription.creditsGrant}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-foreground/50">
                  credits per month
                </p>
                <p className="mt-6 text-sm leading-relaxed text-foreground/55">
                  Paid membership credit grants are planned for a future billing release. Gameplay
                  credits follow the rollover rules on your credit history page.
                </p>
                <GeoButton asChild variant="secondary" size="sm" className="mt-8">
                  <Link to="/geostore/rewards">Spend credits</Link>
                </GeoButton>
              </GlassCard>
            </AnimatedSection>
          </div>
        </SectionContainer>
      </section>

      <section className="pb-[var(--space-section-sm)]">
        <SectionContainer size="wide">
          <SectionHeading
            eyebrow="Invoices"
            title="Billing history"
            description="A sample ledger showing how receipts will appear."
            className="mb-10"
            action={
              <GeoButton variant="ghost" size="sm" onClick={() => notBillableYet("Invoice export")}>
                <Download className="h-4 w-4" strokeWidth={1.6} />
                Export
              </GeoButton>
            }
          />
          <GlassCard strong className="overflow-x-auto p-0">
            <table className="w-full min-w-[38rem] border-collapse text-left">
              <caption className="sr-only">Placeholder invoice history</caption>
              <thead>
                <tr className="border-b border-bronze/15 text-[0.58rem] uppercase tracking-[0.26em] text-foreground/50">
                  <th scope="col" className="px-7 py-5">
                    Invoice
                  </th>
                  <th scope="col" className="px-7 py-5">
                    Date
                  </th>
                  <th scope="col" className="px-7 py-5">
                    Description
                  </th>
                  <th scope="col" className="px-7 py-5 text-right">
                    Amount
                  </th>
                  <th scope="col" className="px-7 py-5 text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceHistory.map((invoice) => (
                  <tr key={invoice.id} className="border-t border-bronze/10 text-sm">
                    <th scope="row" className="px-7 py-5 font-normal text-foreground/80">
                      {invoice.id}
                    </th>
                    <td className="px-7 py-5 text-foreground/50">{invoice.date}</td>
                    <td className="px-7 py-5 text-foreground/50">{invoice.description}</td>
                    <td className="px-7 py-5 text-right text-foreground/80">{invoice.amount}</td>
                    <td
                      className={cn(
                        "px-7 py-5 text-right text-[0.62rem] uppercase tracking-[0.2em]",
                        statusTone[invoice.status],
                      )}
                    >
                      {invoice.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </SectionContainer>
      </section>

      <section className="pb-[var(--space-section)]">
        <SectionContainer size="wide">
          <SectionHeading
            eyebrow="Payment methods"
            title="What we plan to accept"
            description="Provider integration arrives with the payments phase — none of these are connected yet."
            className="mb-10"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paymentMethods.map((method, i) => (
              <AnimatedSection key={method.id} delay={i * 60} className="h-full">
                <GlassCard className="flex h-full items-start gap-5 p-7">
                  <span
                    aria-hidden
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-bronze/25 bg-bronze/10 text-bronze"
                  >
                    <method.icon className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">
                      {method.label}
                    </span>
                    <span className="mt-2 block text-xs leading-relaxed text-foreground/50">
                      {method.description}
                    </span>
                    <span className="mt-3 block text-[0.55rem] uppercase tracking-[0.26em] text-bronze/90">
                      {method.availability === "planned" ? "At launch" : "Later"}
                    </span>
                  </span>
                </GlassCard>
              </AnimatedSection>
            ))}
          </div>
        </SectionContainer>
      </section>
    </PageShell>
  );
}
