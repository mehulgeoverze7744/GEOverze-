import { Link } from "@tanstack/react-router";
import { ArrowRight, Crown, Lock, Trophy, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import creatorStudioArt from "@/assets/profile/upgrade-creator-studio.jpg";
import multiplayerArt from "@/assets/profile/upgrade-multiplayer.jpg";
import tournamentsArt from "@/assets/profile/upgrade-tournaments.jpg";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const LOCKED_FEATURES: {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  art: string;
}[] = [
  {
    id: "tournaments",
    title: "Tournaments",
    subtitle: "Compete globally",
    icon: Trophy,
    art: tournamentsArt,
  },
  {
    id: "multiplayer",
    title: "Multiplayer",
    subtitle: "Play with friends",
    icon: Users,
    art: multiplayerArt,
  },
  {
    id: "creator-studio",
    title: "Creator Studio",
    subtitle: "Create & publish",
    icon: Crown,
    art: creatorStudioArt,
  },
];

function UpgradeCard({
  feature,
  index,
  inert,
}: {
  feature: (typeof LOCKED_FEATURES)[number];
  index: number;
  inert?: boolean;
}) {
  const Icon = feature.icon;

  return (
    <Link
      to="/pricing"
      role="listitem"
      className="profile-upgrade-card group"
      style={{ ["--upgrade-index" as string]: index }}
      aria-label={`${feature.title} — upgrade to unlock`}
      tabIndex={inert ? -1 : undefined}
      aria-hidden={inert ? true : undefined}
    >
      <img
        src={feature.art}
        alt=""
        aria-hidden="true"
        className="profile-upgrade-card-art"
        draggable={false}
      />
      <span className="profile-upgrade-card-overlay" aria-hidden="true" />
      <span className="profile-upgrade-card-head">
        <span className="profile-upgrade-card-icon-wrap" aria-hidden="true">
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </span>
        <Lock className="profile-upgrade-card-lock h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
      </span>
      <span className="profile-upgrade-card-title">{feature.title}</span>
      <span className="profile-upgrade-card-sub">{feature.subtitle}</span>
      <span className="profile-upgrade-card-cta">
        Upgrade
        <ArrowRight className="h-3 w-3" strokeWidth={1.6} aria-hidden />
      </span>
    </Link>
  );
}

/** Locked upgrade cards as a contained, continuously looping strip. */
export function ProfileLockedUpgradeCards() {
  const reducedMotion = useReducedMotion();
  const loop = reducedMotion ? LOCKED_FEATURES : [...LOCKED_FEATURES, ...LOCKED_FEATURES];

  return (
    <div className="profile-upgrade-viewport" aria-label="Premium features">
      <div className="profile-upgrade-track" role="list">
        {loop.map((feature, index) => (
          <UpgradeCard
            key={`${feature.id}-${index}`}
            feature={feature}
            index={index % LOCKED_FEATURES.length}
            inert={!reducedMotion && index >= LOCKED_FEATURES.length}
          />
        ))}
      </div>
    </div>
  );
}
