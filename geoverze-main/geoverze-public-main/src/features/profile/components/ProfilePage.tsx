import { Link } from "@tanstack/react-router";
import { MapPin, Pencil, Settings2, Share2 } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedBadge } from "@/components/shared/AnimatedBadge";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { UserAvatar } from "@/features/auth/components/UserAvatar";
import { formatJoinDate, useProfile } from "@/features/profile/lib/useProfile";
import { LevelBadge } from "@/features/progression/components/LevelBadge";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";

import { ExplorerAnalytics } from "./ExplorerAnalytics";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileLockedUpgradeCards } from "./ProfileLockedUpgradeCards";
import "../styles/profile.css";

/**
 * Public-facing explorer profile.
 *
 * Identity is real (session + onboarding + profile store); statistics and
 * badges are placeholder data until the quiz engine exists.
 */
export function ProfilePage() {
  const profile = useProfile();
  const player = useProgressionStore(selectPlayer);

  return (
    <PageShell>
      <SectionContainer className="min-w-0 pt-[calc(var(--nav-height)+var(--space-section-sm))]">
        <AnimatedSection className="overflow-x-clip">
          <section className="profile-hero" aria-label="Profile">
            <div className="profile-hero-bg" aria-hidden="true">
              <ProfileBanner />
            </div>
            <div className="profile-hero-scrim" aria-hidden="true" />

            <div className="profile-hero-toolbar">
              <GeoButton asChild variant="primary" size="sm" className="profile-hero-btn-primary">
                <Link to="/profile/edit">
                  <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                  Edit profile
                </Link>
              </GeoButton>
              <GeoButton
                asChild
                variant="secondary"
                size="sm"
                className="profile-hero-btn-secondary"
              >
                <Link to="/settings">
                  <Settings2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                  Settings
                </Link>
              </GeoButton>
            </div>

            <div className="profile-hero-layout">
              <div className="profile-hero-identity">
                <div className="profile-hero-avatar-frame">
                  <UserAvatar
                    avatarUrl={profile.avatarUrl}
                    avatarId={profile.avatarId}
                    size={112}
                    className="profile-hero-avatar-image"
                    alt={`${profile.displayName} avatar`}
                  />
                </div>

                <div className="profile-hero-info min-w-0">
                  <h1 className="profile-display-name truncate">{profile.displayName}</h1>
                  <p className="profile-handle">{profile.handle}</p>
                  <LevelBadge
                    className="profile-level-badge profile-hero-level"
                    size="sm"
                    level={player.level}
                    title={player.levelTitle}
                  />
                  {profile.bio ? (
                    <p className="profile-bio profile-hero-bio">{profile.bio}</p>
                  ) : null}
                  <div className="profile-meta profile-hero-meta">
                    {profile.country ? (
                      <span className="inline-flex items-center gap-2">
                        <MapPin
                          className="h-3.5 w-3.5 text-bronze/90"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        {profile.country.name}
                      </span>
                    ) : null}
                    <span>Explorer since {formatJoinDate(profile.joinedAt)}</span>
                    {profile.skillLevel ? <span>{profile.skillLevel.label} tier</span> : null}
                    <span className="inline-flex items-center gap-2">
                      <Share2
                        className="h-3.5 w-3.5 text-bronze/90"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      Public profile sharing arrives with the community phase
                    </span>
                  </div>
                  {profile.interests.length > 0 ? (
                    <ul className="profile-interests profile-hero-interests">
                      {profile.interests.map((interest) => (
                        <li key={interest.id}>
                          <AnimatedBadge>{interest.label}</AnimatedBadge>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>

              <ProfileLockedUpgradeCards />
            </div>
          </section>
        </AnimatedSection>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)] min-w-0 pb-[var(--space-section-sm)]">
        <ExplorerAnalytics />
      </SectionContainer>
    </PageShell>
  );
}
