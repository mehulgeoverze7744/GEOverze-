import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const ACTIONS = [
  { id: "play", label: "Play", hint: "Start a quiz", to: "/play" as const, emoji: "🌐" },
  {
    id: "leaderboard",
    label: "Leaderboard",
    hint: "View rankings",
    to: "/play/leaderboard" as const,
    emoji: "🏆",
    locked: true,
  },
  {
    id: "rewards",
    label: "Rewards",
    hint: "Claim & redeem",
    to: "/quiz-history-and-rewards" as const,
    search: { tab: "rewards" as const },
    emoji: "🎁",
  },
  { id: "community", label: "Community", hint: "Meet players", to: "/community" as const, emoji: "🫂" },
] as const;

function DockEmoji({ symbol }: { symbol: string }) {
  return (
    <span className="dashboard-dock-emoji" aria-hidden="true">
      {symbol}
    </span>
  );
}

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
          <DockEmoji symbol="⚡" />
          Quick actions
        </h2>
      </div>
      <ul className="dashboard-dock-actions">
        {ACTIONS.map((action) => {
          const body = (
            <>
              <DockEmoji symbol={action.emoji} />
              <span className="dashboard-dock-action-copy">
                <span className="dashboard-dock-action-label">{action.label}</span>
                <span className="dashboard-dock-action-hint">{action.hint}</span>
              </span>
              <ChevronRight
                className="dashboard-dock-action-chevron h-4 w-4"
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </>
          );

          return (
            <li key={action.id}>
              {"locked" in action && action.locked ? (
                <span
                  className="dashboard-dock-action dashboard-dock-action--locked"
                  aria-disabled="true"
                  aria-label={`${action.label}, locked`}
                >
                  {body}
                </span>
              ) : (
                "search" in action ? (
                  <Link to={action.to} search={action.search} className="dashboard-dock-action">
                    {body}
                  </Link>
                ) : (
                  <Link to={action.to} className="dashboard-dock-action">
                    {body}
                  </Link>
                )
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
