import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

import { GeoButton } from "@/components/shared/GeoButton";
import { useCreditHistory } from "@/features/progression/hooks/useCreditHistory";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";
import { cn } from "@/lib/utils";

import { GEOSTORE_CARD_IMAGE } from "../lib/dashboardAssets";

/** Compact store snapshot from the credit ledger — no invented orders. */
export function DashboardGeostoreCard({ className }: { className?: string }) {
  const credits = useProgressionStore(selectPlayer).credits;
  const { entries, loading } = useCreditHistory();
  const purchases = entries.filter((entry) => entry.category === "geostore").slice(0, 2);

  return (
    <section
      className={cn(
        "dashboard-geostore flex h-full flex-col rounded-2xl border border-bronze/16 bg-charcoal/30 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="dashboard-geostore-heading"
    >
      <img
        src={GEOSTORE_CARD_IMAGE}
        alt=""
        className="dashboard-geostore-bg"
        decoding="async"
      />
      <div className="dashboard-geostore-overlay" aria-hidden="true" />
      <div className="dashboard-geostore-body">
        <h2
          id="dashboard-geostore-heading"
          className="dashboard-section-label flex items-center gap-2"
        >
          <ShoppingBag className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.5} aria-hidden="true" />
          GEOstore
        </h2>
        <p className="mt-4 text-sm text-foreground/70">
          <span className="text-bronze-glow">{credits.toLocaleString()}</span> credits ready to spend
        </p>

        <div className="mt-4 flex-1">
          {loading ? (
            <p className="text-xs text-foreground/45">Loading purchases…</p>
          ) : purchases.length === 0 ? (
            <p className="text-sm leading-relaxed text-foreground/50">
              No credit redemptions yet. Claim digital rewards when you have enough credits.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {purchases.map((entry) => (
                <li key={entry.id} className="min-w-0">
                  <p className="truncate text-sm text-foreground/85">{entry.headline}</p>
                  <p className="mt-0.5 text-[0.68rem] text-foreground/45">
                    {entry.dateLabel} · {entry.amount} credits
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <GeoButton asChild variant="secondary" size="sm">
            <Link to="/geostore">Visit GEOstore</Link>
          </GeoButton>
          <GeoButton asChild variant="ghost" size="sm">
            <Link to="/geostore/rewards">View rewards</Link>
          </GeoButton>
        </div>
      </div>
    </section>
  );
}
