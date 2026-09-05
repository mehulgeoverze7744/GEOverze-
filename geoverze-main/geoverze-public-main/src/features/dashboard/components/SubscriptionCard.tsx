import { Link } from "@tanstack/react-router";
import { Check, CreditCard } from "lucide-react";

import { GeoButton } from "@/components/shared/GeoButton";
import { SUBSCRIPTION } from "@/features/dashboard/data/dashboard";
import { cn } from "@/lib/utils";

/** Membership-style subscription card. */
export function SubscriptionCard({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "dashboard-subscription rounded-2xl border border-bronze/18 bg-gradient-to-br from-charcoal/50 to-charcoal/25 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="subscription-heading"
    >
      <h2
        id="subscription-heading"
        className="dashboard-section-label flex items-center gap-2"
      >
        <CreditCard className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.5} aria-hidden="true" />
        Your current expedition pass
      </h2>

      <div className="mt-6 rounded-xl border border-bronze/15 bg-background/20 p-5">
        <p className="text-xl font-light text-foreground">{SUBSCRIPTION.plan}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-bronze/90">
          {SUBSCRIPTION.status}
        </p>
        {SUBSCRIPTION.renewal ? (
          <p className="mt-3 text-xs text-foreground/45">{SUBSCRIPTION.renewal}</p>
        ) : null}
      </div>

      <ul className="mt-5 space-y-2.5">
        {SUBSCRIPTION.perks.map((perk) => (
          <li key={perk} className="flex items-center gap-2.5 text-xs text-foreground/60">
            <Check className="h-3.5 w-3.5 shrink-0 text-bronze/90" strokeWidth={2} aria-hidden="true" />
            {perk}
          </li>
        ))}
      </ul>

      <GeoButton asChild variant="secondary" className="mt-6 w-full">
        <Link to="/pricing">Explore plans</Link>
      </GeoButton>
    </section>
  );
}
