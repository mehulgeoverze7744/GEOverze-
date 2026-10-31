import { Link } from "@tanstack/react-router";
import { Lock, Swords, User, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useLibrarySubscriptionTier } from "@/features/library/hooks/useLibrarySubscriptionTier";

import { useSubscriptionPlanRows } from "../hooks/useSubscriptionPlanRows";
import { isPlayModeOpen, planRowForTier, type ContinuePlayMode } from "../lib/playAccess";

const MODES: readonly {
  id: ContinuePlayMode;
  title: string;
  description: string;
  badge: string;
  icon: LucideIcon;
  ctaText: string;
  to: "/play/lobby" | "/play/pvp" | "/play/multiplayer";
}[] = [
  {
    id: "solo",
    title: "Solo",
    description: "Your pace, your clock.",
    badge: "Free play",
    icon: User,
    ctaText: "Play solo",
    to: "/play/lobby",
  },
  {
    id: "pvp",
    title: "PvP",
    description: "One-on-one duels.",
    badge: "1 v 1",
    icon: Swords,
    ctaText: "Find new players to win more credits",
    to: "/play/pvp",
  },
  {
    id: "multiplayer",
    title: "Multiplayer",
    description: "Shared rooms, live.",
    badge: "Up to 16 players",
    icon: Users,
    ctaText: "Gets most credits",
    to: "/play/multiplayer",
  },
];

function CardContent({ mode, locked }: { mode: (typeof MODES)[number]; locked: boolean }) {
  const Icon = locked ? Lock : mode.icon;

  return (
    <>
      {locked ? <div className="dashboard-gamecard-lock" aria-hidden="true" /> : null}

      <span className="dashboard-gamecard-badge">{mode.badge}</span>

      <div className="dashboard-gamecard-mid">
        <span className="dashboard-gamecard-icon-ring" aria-hidden="true">
          <Icon className="h-4 w-4" strokeWidth={1.6} />
        </span>
        <p className="dashboard-gamecard-title">{mode.title}</p>
        <p className="dashboard-gamecard-subtitle">
          {locked ? "Requires a higher plan" : mode.description}
        </p>
      </div>

      <span
        className={cn(
          "dashboard-gamecard-cta",
          mode.id === "pvp" && !locked && "dashboard-gamecard-cta--pvp",
        )}
      >
        {locked ? "Upgrade to unlock" : mode.ctaText}
      </span>
    </>
  );
}

/** Three premium circular game-mode jump pads. */
export function ContinuePlayingCard({ className }: { className?: string }) {
  const { tier } = useLibrarySubscriptionTier();
  const { plans } = useSubscriptionPlanRows();
  const plan = planRowForTier(plans, tier);

  return (
    <section
      className={cn(
        "dashboard-continue-playing flex h-full flex-col rounded-2xl border border-bronze/16 bg-charcoal/30 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="continue-playing-heading"
    >
      <h2 id="continue-playing-heading" className="dashboard-section-label">
        Continue playing
      </h2>
      <p className="dashboard-continue-playing__lede mt-2 text-sm">Jump back into a live mode.</p>

      {/* Wrapper centres cards vertically in the remaining section height */}
      <div className="mt-5 flex flex-1 items-center">
        <ul className="grid w-full gap-4 sm:grid-cols-3">
          {MODES.map((mode) => {
            const open = isPlayModeOpen(plan, mode.id);

            return (
              <li key={mode.id} className="relative aspect-square w-full">
                {open && mode.id === "solo" ? (
                  <Link
                    to="/play/lobby"
                    search={{ mode: "solo", quiz: undefined }}
                    className="dashboard-gamecard absolute inset-0"
                    data-mode={mode.id}
                    aria-label={`${mode.title}: ${mode.description}`}
                  >
                    <CardContent mode={mode} locked={false} />
                  </Link>
                ) : open ? (
                  <Link
                    to={mode.to}
                    className="dashboard-gamecard absolute inset-0"
                    data-mode={mode.id}
                    aria-label={`${mode.title}: ${mode.description}`}
                  >
                    <CardContent mode={mode} locked={false} />
                  </Link>
                ) : (
                  <Link
                    to="/pricing"
                    className="dashboard-gamecard dashboard-gamecard--locked absolute inset-0"
                    data-mode={mode.id}
                    aria-label={`${mode.title}: upgrade required`}
                  >
                    <CardContent mode={mode} locked />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
