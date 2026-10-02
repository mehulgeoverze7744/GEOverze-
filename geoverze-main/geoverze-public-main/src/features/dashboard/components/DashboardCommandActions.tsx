import { Link } from "@tanstack/react-router";
import { Gift, Trophy, Users, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

const ACTIONS = [
  { id: "play", label: "Play", to: "/play" as const, icon: Zap },
  { id: "leaderboard", label: "Leaderboard", to: "/play/leaderboard" as const, icon: Trophy },
  { id: "rewards", label: "Rewards", to: "/play/rewards" as const, icon: Gift },
  { id: "community", label: "Community", to: "/community" as const, icon: Users },
] as const;

/** Compact command shortcuts — existing routes only. */
export function DashboardCommandActions({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-2xl border border-bronze/16 bg-charcoal/30 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="dashboard-quick-actions-heading"
    >
      <h2 id="dashboard-quick-actions-heading" className="dashboard-section-label">
        Quick actions
      </h2>
      <ul className="mt-5 grid grid-cols-2 gap-2.5">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.id}>
              <Link
                to={action.to}
                className="flex items-center gap-2.5 rounded-xl border border-bronze/14 bg-charcoal/35 px-3 py-3 text-sm text-foreground/85 transition-colors hover:border-bronze/30 hover:bg-charcoal/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45"
              >
                <Icon className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.5} aria-hidden="true" />
                {action.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
