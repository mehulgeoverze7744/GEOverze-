import { Link } from "@tanstack/react-router";
import { ArrowRight, Crown, Lock, Trophy, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const LOCKED_FEATURES: {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}[] = [
  { id: "tournaments", title: "Tournaments", subtitle: "Compete globally", icon: Trophy },
  { id: "multiplayer", title: "Multiplayer", subtitle: "Play with friends", icon: Users },
  { id: "creator-studio", title: "Creator Studio", subtitle: "Create & publish", icon: Crown },
];

/** Three straight, subtly stacked locked upgrade cards — links to pricing. */
export function ProfileLockedUpgradeCards() {
  return (
    <div className="profile-upgrade-stack" role="list" aria-label="Premium features">
      {LOCKED_FEATURES.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Link
            key={feature.id}
            to="/pricing"
            role="listitem"
            className="profile-upgrade-card group"
            style={{ ["--upgrade-index" as string]: index }}
            aria-label={`${feature.title} — upgrade to unlock`}
          >
            <span className="profile-upgrade-card-sheen" aria-hidden="true" />
            <span className="profile-upgrade-card-head">
              <span className="profile-upgrade-card-icon-wrap" aria-hidden="true">
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <Lock
                className="profile-upgrade-card-lock h-3.5 w-3.5"
                strokeWidth={1.5}
                aria-hidden
              />
            </span>
            <span className="profile-upgrade-card-title">{feature.title}</span>
            <span className="profile-upgrade-card-sub">{feature.subtitle}</span>
            <span className="profile-upgrade-card-cta">
              Upgrade
              <ArrowRight className="h-3 w-3" strokeWidth={1.6} aria-hidden />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
