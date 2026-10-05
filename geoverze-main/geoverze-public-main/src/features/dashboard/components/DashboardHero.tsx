import { Link } from "@tanstack/react-router";
import { Compass, Pencil, Sparkles } from "lucide-react";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { GeoButton } from "@/components/shared/GeoButton";
import { greetingFor, motivationFor } from "@/features/dashboard/data/dashboard";
import { useLibrarySubscriptionTier } from "@/features/library/hooks/useLibrarySubscriptionTier";
import { libraryTierLabel } from "@/features/library/lib/access-tier";
import { formatJoinDate, useProfile } from "@/features/profile/lib/useProfile";
import { useCreditHistory } from "@/features/progression/hooks/useCreditHistory";
import { REDEMPTION } from "@/features/progression/data/player";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";
import { cn } from "@/lib/utils";

import { QUICK_STATUS_CARD_IMAGE } from "../lib/dashboardAssets";
import { DashboardEarthBackground } from "./DashboardEarthBackground";

/**
 * Cinematic explorer command-centre hero — identity, progression and CTAs.
 *
 * Layer stack (back → front):
 * atmosphere → Earth → surface gradient → content shade → interactive content
 */
export function DashboardHero({ className }: { className?: string }) {
  const profile = useProfile();
  const player = useProgressionStore(selectPlayer);
  const { monthlyEarned, loading: creditsLoading } = useCreditHistory();
  const { tier, displayName, loading: planLoading, signedIn } = useLibrarySubscriptionTier();
  const planName =
    displayName.trim() && displayName.toLowerCase() !== tier ? displayName : libraryTierLabel(tier);
  const totalXp = Number.isFinite(player.xp) ? Math.max(0, player.xp) : 0;
  const geoCredits = Number.isFinite(player.credits) ? Math.max(0, player.credits) : 0;
  const monthlyProgress = Number.isFinite(monthlyEarned) ? Math.max(0, monthlyEarned) : 0;
  const monthlyGoal = REDEMPTION.goal;
  const planPending = signedIn && planLoading;
  const greeting = greetingFor();
  const motivation = motivationFor();

  return (
    <section className={cn("dashboard-hero relative overflow-hidden", className)}>
      <div
        className="dashboard-hero-atmosphere pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <DashboardEarthBackground />
        <div className="dashboard-hero-surface" />
        <div className="dashboard-hero-content-shade" />
        <div className="dashboard-hero-glow" />
      </div>

      <div className="relative z-[1] p-6 sm:p-8 lg:p-10 xl:p-12">
        <div className="dashboard-hero-content space-y-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <span className="dashboard-hero-avatar">
              <img
                src="/assets/dashboard-explorer-avatar.png"
                alt={`${profile.displayName} profile`}
                width={148}
                height={137}
                decoding="async"
                draggable={false}
              />
            </span>
            <div className="min-w-0 pt-1">
              <p className="dashboard-section-label">{greeting}</p>
              <h1 className="mt-2 truncate text-[clamp(1.75rem,3.6vw,2.65rem)] font-light tracking-tight text-foreground">
                {profile.displayName}
              </h1>
              <p className="mt-2 text-sm text-foreground/55">
                <span className="text-bronze/90">{profile.handle}</span>
                <span className="mx-2 text-foreground/25">·</span>
                Explorer since {formatJoinDate(profile.joinedAt)}
              </p>
              <p className="dashboard-current-plan mt-3">
                <span className="dashboard-current-plan__label">Current plan</span>
                <span className="dashboard-current-plan__name">{planName}</span>
              </p>
            </div>
          </div>

          <aside className="dashboard-quick-status" aria-label="Quick status">
            <img
              src={QUICK_STATUS_CARD_IMAGE}
              alt=""
              className="dashboard-quick-status__bg"
              decoding="async"
              aria-hidden="true"
            />
            <p className="dashboard-section-label">Quick status</p>
            <dl className="dashboard-quick-status__grid">
              <div className="dashboard-quick-status__item">
                <dt>Current plan</dt>
                <dd>
                  {planPending ? (
                    <span className="dashboard-quick-status__pending">—</span>
                  ) : (
                    planName
                  )}
                </dd>
              </div>
              <div className="dashboard-quick-status__item">
                <dt>Total XP</dt>
                <dd>
                  <AnimatedCounter value={totalXp} />
                  <span className="dashboard-quick-status__meta">XP</span>
                </dd>
              </div>
              <div className="dashboard-quick-status__item">
                <dt>Geo credits</dt>
                <dd>
                  <AnimatedCounter value={geoCredits} />
                </dd>
              </div>
              <div className="dashboard-quick-status__item">
                <dt>Monthly progress</dt>
                <dd>
                  {creditsLoading ? (
                    <span className="dashboard-quick-status__pending">—</span>
                  ) : (
                    <AnimatedCounter value={monthlyProgress} />
                  )}
                  <span className="dashboard-quick-status__meta">/ {monthlyGoal}</span>
                </dd>
              </div>
            </dl>
          </aside>

          <div className="dashboard-hero-progress-row">
            <div className="dashboard-hero-cta-cluster">
              <p className="flex items-start gap-3 text-sm italic text-foreground/50">
                <Sparkles
                  className="mt-0.5 h-4 w-4 shrink-0 text-bronze/90"
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
                {motivation}
              </p>

              <div className="dashboard-hero-cta-actions">
                <GeoButton asChild variant="primary" className="dashboard-cta-expedition group">
                  <Link to="/play">
                    <Compass
                      className="mr-2 h-4 w-4 transition-transform motion-base group-hover:rotate-12 motion-reduce:transform-none"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    Start expedition
                  </Link>
                </GeoButton>
                <GeoButton asChild variant="secondary">
                  <Link to="/profile">View progress</Link>
                </GeoButton>
                <GeoButton asChild variant="secondary">
                  <Link to="/profile/edit">
                    <Pencil className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    Edit profile
                  </Link>
                </GeoButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
