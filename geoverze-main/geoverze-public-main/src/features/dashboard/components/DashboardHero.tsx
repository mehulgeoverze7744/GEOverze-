import { Link } from "@tanstack/react-router";
import { Compass, Pencil } from "lucide-react";
import { useState } from "react";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { GeoButton } from "@/components/shared/GeoButton";
import {
  DASHBOARD_3D_AVATAR_SRC,
  isAlienAvatarSrc,
  resolveDashboardAvatarSrc,
} from "@/features/auth/lib/avatar";
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
  const [failedAvatarSrc, setFailedAvatarSrc] = useState<string | null>(null);
  const resolvedAvatarSrc = profile.identityPending
    ? null
    : resolveDashboardAvatarSrc({
        avatarUrl: profile.avatarUrl,
        avatarId: profile.avatarId,
      });
  const heroAvatarSrc =
    resolvedAvatarSrc && failedAvatarSrc === resolvedAvatarSrc
      ? DASHBOARD_3D_AVATAR_SRC
      : resolvedAvatarSrc;

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
              {heroAvatarSrc ? (
                <img
                  src={heroAvatarSrc}
                  alt={profile.displayName ? `${profile.displayName} profile` : "Profile"}
                  width={148}
                  height={137}
                  decoding="async"
                  draggable={false}
                  className={
                    isAlienAvatarSrc(heroAvatarSrc)
                      ? "dashboard-hero-avatar-photo--alien"
                      : undefined
                  }
                  onError={() => {
                    if (resolvedAvatarSrc && failedAvatarSrc !== resolvedAvatarSrc) {
                      setFailedAvatarSrc(resolvedAvatarSrc);
                    }
                  }}
                />
              ) : (
                <span
                  className="block h-full w-full animate-pulse rounded-full bg-bronze/10 motion-reduce:animate-none"
                  aria-hidden
                />
              )}
            </span>
            <div className="min-w-0 pt-1">
              <p className="dashboard-section-label">{greeting}</p>
              {profile.identityPending ? (
                <span
                  className="mt-2 block h-9 w-48 animate-pulse rounded-md bg-bronze/10 motion-reduce:animate-none"
                  aria-hidden
                />
              ) : (
                <h1 className="mt-2 truncate text-[clamp(1.75rem,3.6vw,2.65rem)] font-light tracking-tight text-foreground">
                  {profile.displayName || "Profile unavailable"}
                </h1>
              )}
              {profile.identityPending ? null : (
                <p className="mt-2 text-sm text-foreground/55">
                  {profile.handle ? <span className="text-bronze/90">{profile.handle}</span> : null}
                  {profile.joinedAt ? (
                    <>
                      {profile.handle ? <span className="mx-2 text-foreground/25">·</span> : null}
                      Explorer since {formatJoinDate(profile.joinedAt)}
                    </>
                  ) : null}
                </p>
              )}
              {profile.identityError ? (
                <p className="mt-2 text-xs text-foreground/70">
                  {profile.identityError}{" "}
                  <button
                    type="button"
                    className="text-bronze underline underline-offset-2"
                    onClick={() => profile.retryProfile()}
                  >
                    Retry
                  </button>
                </p>
              ) : null}
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
                <dt>GVRZE Credits</dt>
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
              <p className="dashboard-hero-cta-quote">
                <span className="dashboard-hero-cta-emoji" aria-hidden="true">
                  🧭
                </span>
                <span>{motivation}</span>
              </p>

              <div className="dashboard-hero-cta-actions">
                <GeoButton asChild variant="primary" className="dashboard-cta-expedition">
                  <Link to="/play">
                    <Compass className="mr-2 h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    Start expedition
                  </Link>
                </GeoButton>
                <GeoButton asChild variant="secondary" className="dashboard-cta-secondary">
                  <Link to="/profile">View progress</Link>
                </GeoButton>
                <GeoButton asChild variant="secondary" className="dashboard-cta-secondary">
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
