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
          const Icon = mode.icon;

          return (
            <li key={mode.id} className="min-w-0">
              {open && mode.id === "solo" ? (
                <GeoButton
                  asChild
                  variant="secondary"
                  className="h-full w-full justify-start px-4 py-4"
                >
                  <Link to="/play/lobby" search={{ mode: "solo", quiz: undefined }}>
                    <Icon className="mr-3 h-4 w-4 shrink-0 text-bronze/90" strokeWidth={1.5} />
                    <span className="min-w-0 text-left">
                      <span className="block text-sm text-foreground">{mode.title}</span>
                      <span className="mt-0.5 block text-[0.68rem] font-normal normal-case tracking-normal text-foreground/50">
                        {mode.description}
                      </span>
                    </span>
                  </Link>
                </GeoButton>
              ) : open ? (
                <GeoButton
                  asChild
                  variant="secondary"
                  className="h-full w-full justify-start px-4 py-4"
                >
                  <Link to={mode.to}>
                    <Icon className="mr-3 h-4 w-4 shrink-0 text-bronze/90" strokeWidth={1.5} />
                    <span className="min-w-0 text-left">
                      <span className="block text-sm text-foreground">{mode.title}</span>
                      <span className="mt-0.5 block text-[0.68rem] font-normal normal-case tracking-normal text-foreground/50">
                        {mode.description}
                      </span>
                    </span>
                  </Link>
                </GeoButton>
              ) : (
                <GeoButton
                  asChild
                  variant="ghost"
                  className="h-full w-full justify-start px-4 py-4"
                >
                  <Link to="/pricing">
                    <Lock className="mr-3 h-4 w-4 shrink-0 text-bronze/70" strokeWidth={1.5} />
                    <span className="min-w-0 text-left">
                      <span className="block text-sm text-foreground/80">{mode.title}</span>
                      <span className="mt-0.5 block text-[0.68rem] font-normal normal-case tracking-normal text-foreground/45">
                        Requires a higher plan
                      </span>
                    </span>
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
