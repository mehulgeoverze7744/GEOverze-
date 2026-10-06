import { Link } from "@tanstack/react-router";
import { Lock, Swords, User, Users } from "lucide-react";

import { GeoButton } from "@/components/shared/GeoButton";
import { useLibrarySubscriptionTier } from "@/features/library/hooks/useLibrarySubscriptionTier";
import { cn } from "@/lib/utils";

import { useSubscriptionPlanRows } from "../hooks/useSubscriptionPlanRows";
import { isPlayModeOpen, planRowForTier, type ContinuePlayMode } from "../lib/playAccess";

const MODES: readonly {
  id: ContinuePlayMode;
  title: string;
  description: string;
  icon: typeof User;
  to: "/play/lobby" | "/play/pvp" | "/play/multiplayer";
}[] = [
  {
    id: "solo",
    title: "Solo",
    description: "Your pace, your clock.",
    icon: User,
    to: "/play/lobby",
  },
  {
    id: "pvp",
    title: "PvP",
    description: "One-on-one duels.",
    icon: Swords,
    to: "/play/pvp",
  },
  {
    id: "multiplayer",
    title: "Multiplayer",
    description: "Shared rooms, live.",
    icon: Users,
    to: "/play/multiplayer",
  },
];

const MODE_CARD_CLASS = "dashboard-continue-mode h-full w-full justify-start px-4 py-4";

function ModeInner({ mode, locked = false }: { mode: (typeof MODES)[number]; locked?: boolean }) {
  const Icon = locked ? Lock : mode.icon;

  return (
    <>
      <span className="dashboard-continue-mode-row">
        <Icon className="mr-3 h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span className="min-w-0 text-left">
          <span className="block text-sm">{mode.title}</span>
          <span className="mt-0.5 block text-[0.68rem] font-normal normal-case tracking-normal text-foreground/70">
            {locked ? "Requires a higher plan" : mode.description}
          </span>
        </span>
      </span>
      {mode.id === "multiplayer" ? (
        <span className="dashboard-continue-credits">
          <span className="dashboard-continue-credits-icon" aria-hidden="true">
            🪙
          </span>
          Gets more credits
        </span>
      ) : null}
    </>
  );
}

/** One-click return to existing play flows, gated by the live plan catalog. */
export function ContinuePlayingCard({ className }: { className?: string }) {
  const { tier } = useLibrarySubscriptionTier();
  const { plans } = useSubscriptionPlanRows();
  const plan = planRowForTier(plans, tier);

  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-2xl border border-bronze/16 bg-charcoal/30 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="continue-playing-heading"
    >
      <h2 id="continue-playing-heading" className="dashboard-section-label">
        Continue playing
      </h2>
      <p className="mt-2 text-sm text-foreground/50">Jump back into a live mode.</p>

      <ul className="mt-5 grid flex-1 gap-3 sm:grid-cols-3">
        {MODES.map((mode) => {
          const open = isPlayModeOpen(plan, mode.id);

          return (
            <li key={mode.id} className="min-w-0">
              {open && mode.id === "solo" ? (
                <GeoButton asChild variant="solid" className={MODE_CARD_CLASS}>
                  <Link to="/play/lobby" search={{ mode: "solo", quiz: undefined }}>
                    <ModeInner mode={mode} />
                  </Link>
                </GeoButton>
              ) : open ? (
                <GeoButton
                  asChild
                  variant="solid"
                  className={cn(
                    MODE_CARD_CLASS,
                    mode.id === "multiplayer" && "dashboard-continue-mode--credits",
                  )}
                >
                  <Link to={mode.to}>
                    <ModeInner mode={mode} />
                  </Link>
                </GeoButton>
              ) : (
                <GeoButton
                  asChild
                  variant="solid"
                  className={cn(
                    MODE_CARD_CLASS,
                    mode.id === "multiplayer" && "dashboard-continue-mode--credits",
                  )}
                >
                  <Link to="/pricing">
                    <ModeInner mode={mode} locked />
                  </Link>
                </GeoButton>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
