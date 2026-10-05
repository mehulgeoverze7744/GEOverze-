import { Link } from "@tanstack/react-router";
import { ChevronRight, Gift, Globe, Trophy, Users, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

const ACTIONS = [
  { id: "play", label: "Play", hint: "Start a quiz", to: "/play" as const, icon: Globe },
  {
    id: "leaderboard",
    label: "Leaderboard",
    hint: "View rankings",
    to: "/play/leaderboard" as const,
    icon: Trophy,
  },
  { id: "rewards", label: "Rewards", hint: "Claim & redeem", to: "/play/rewards" as const, icon: Gift },
  { id: "community", label: "Community", hint: "Meet players", to: "/community" as const, icon: Users },
] as const;

/** Compact command shortcuts — existing routes only. */
export function DashboardCommandActions({ className }: { className?: string }) {
  return (
    <section
      className={cn("dashboard-dock-card", className)}
      aria-labelledby="dashboard-quick-actions-heading"
    >
      <div className="dashboard-dock-head">
        <h2
          id="dashboard-quick-actions-heading"
          className="dashboard-section-label dashboard-dock-title"
        >
          <Zap className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
          Quick actions
        </h2>
      </div>
      <ul className="dashboard-dock-actions">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.id}>
              <Link to={action.to} className="dashboard-dock-action">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
                <span className="dashboard-dock-action-copy">
                  <span className="dashboard-dock-action-label">{action.label}</span>
                  <span className="dashboard-dock-action-hint">{action.hint}</span>
                </span>
                <ChevronRight
                  className="dashboard-dock-action-chevron h-3.5 w-3.5"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
