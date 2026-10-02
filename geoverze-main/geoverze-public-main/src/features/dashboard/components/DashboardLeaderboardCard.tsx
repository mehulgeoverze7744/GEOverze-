import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";

import { GeoButton } from "@/components/shared/GeoButton";
import { cn } from "@/lib/utils";

/** Rankings stay empty until live standings replace placeholder boards. */
export function DashboardLeaderboardCard({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-2xl border border-bronze/16 bg-charcoal/30 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="dashboard-leaderboard-heading"
    >
      <h2
        id="dashboard-leaderboard-heading"
        className="dashboard-section-label flex items-center gap-2"
      >
        <Trophy className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.5} aria-hidden="true" />
        Leaderboard
      </h2>
      <p className="mt-5 text-sm leading-relaxed text-foreground/55">
        Global rank will appear here once competitive standings are live. Placeholder boards are not
        shown.
      </p>
      <p className="mt-3 text-xs text-foreground/40">No rank movement available yet.</p>
      <GeoButton asChild variant="secondary" size="sm" className="mt-auto pt-6">
        <Link to="/play/leaderboard">Open leaderboard</Link>
      </GeoButton>
    </section>
  );
}
