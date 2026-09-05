import { Link } from "@tanstack/react-router";
import { MapPin, Pencil, Settings2, Share2 } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedBadge } from "@/components/shared/AnimatedBadge";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { UserAvatar } from "@/features/auth/components/UserAvatar";
import { formatJoinDate, useProfile } from "@/features/profile/lib/useProfile";
import { LevelBadge } from "@/features/progression/components/LevelBadge";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";

import { ExplorerAnalytics } from "./ExplorerAnalytics";
import { ProfileBanner } from "./ProfileBanner";
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
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
        <AnimatedSection className="overflow-visible">
          <GlassCard strong className="profile-card">
            <div className="profile-banner-wrap">
              <ProfileBanner />
            </div>

            <div className="profile-avatar-layer">
              <div className="profile-avatar-frame">
                <UserAvatar
                  avatarUrl={profile.avatarUrl}
                  avatarId={profile.avatarId}
                  size={180}
                  className="profile-avatar-image"
                  alt={`${profile.displayName} avatar`}
                />
              </div>
            </div>

            <div className="profile-content">
              <div className="profile-identity-actions">
                <div className="profile-identity-row min-w-0">
                  <h1 className="profile-display-name truncate">{profile.displayName}</h1>
                  <p className="profile-handle">{profile.handle}</p>
                  <LevelBadge
                    className="profile-level-badge"
                    size="sm"
                    level={player.level}
                    title={player.levelTitle}
                  />
                </div>
                <div className="profile-action-buttons">
                  <GeoButton asChild variant="primary" size="sm">
                    <Link to="/profile/edit">
                      <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                      Edit profile
                    </Link>
                  </GeoButton>
                  <GeoButton asChild variant="secondary" size="sm">
                    <Link to="/settings">
                      <Settings2
                        className="mr-1.5 h-3.5 w-3.5"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      Settings
                    </Link>
                  </GeoButton>
                </div>
              </div>

              <p className="profile-bio">{profile.bio}</p>

              <div className="profile-meta">
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
                <ul className="profile-interests">
                  {profile.interests.map((interest) => (
                    <li key={interest.id}>
                      <AnimatedBadge>{interest.label}</AnimatedBadge>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </GlassCard>
        </AnimatedSection>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)] pb-[var(--space-section-sm)]">
        <ExplorerAnalytics />
      </SectionContainer>
    </PageShell>
  );
}
