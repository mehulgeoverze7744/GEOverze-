import { Trophy } from "lucide-react";

import { GeoButton } from "@/components/shared/GeoButton";
import { cn } from "@/lib/utils";

/** Purely decorative podium — no fake rankings, no interaction. */
function PodiumScene() {
  return (
    <div className="dashboard-lb-scene" aria-hidden="true">
      <div className="dashboard-lb-sparkles">
        <span className="dashboard-lb-sparkle dashboard-lb-sparkle--1">✦</span>
        <span className="dashboard-lb-sparkle dashboard-lb-sparkle--2">✦</span>
        <span className="dashboard-lb-sparkle dashboard-lb-sparkle--3">✦</span>
      </div>
      <div className="dashboard-lb-trophy-wrap">
        <span className="dashboard-lb-trophy">🏆</span>
        <div className="dashboard-lb-trophy-shine" />
      </div>
      <div className="dashboard-lb-podium">
        <div className="dashboard-lb-pod dashboard-lb-pod--2">2</div>
        <div className="dashboard-lb-pod dashboard-lb-pod--1">1</div>
        <div className="dashboard-lb-pod dashboard-lb-pod--3">3</div>
      </div>
    </div>
  );
}

/** Rankings stay empty until live standings replace placeholder boards. */
export function DashboardLeaderboardCard({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "flex h-full min-w-0 flex-col rounded-2xl border border-bronze/16 bg-charcoal/30 p-6 backdrop-blur-sm",
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

      <PodiumScene />

      <GeoButton
        type="button"
        variant="secondary"
        size="sm"
        className="dashboard-leaderboard-action pointer-events-none mt-auto cursor-not-allowed opacity-45"
        disabled
        aria-disabled="true"
        tabIndex={-1}
      >
        Open leaderboard
      </GeoButton>
    </section>
  );
}
