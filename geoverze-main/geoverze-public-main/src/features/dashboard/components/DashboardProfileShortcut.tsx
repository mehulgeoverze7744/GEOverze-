import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { UserAvatar } from "@/features/auth/components/UserAvatar";
import { useProfile } from "@/features/profile/lib/useProfile";
import { cn } from "@/lib/utils";

/** Compact jump to the existing profile and settings surfaces. */
export function DashboardProfileShortcut({ className }: { className?: string }) {
  const profile = useProfile();

  return (
    <section
      className={cn("dashboard-dock-card dashboard-dock-card--profile", className)}
      aria-labelledby="dashboard-profile-shortcut-heading"
    >
      <div className="dashboard-dock-head">
        <h2
          id="dashboard-profile-shortcut-heading"
          className="dashboard-section-label dashboard-dock-title"
        >
          <span className="dashboard-dock-emoji" aria-hidden="true">
            👤
          </span>
          Profile
        </h2>
      </div>

      <div className="dashboard-dock-profile">
        <div className="dashboard-dock-identity">
          <span className="dashboard-dock-avatar-stage">
            <span className="dashboard-dock-avatar-pop">
              <span className="dashboard-dock-avatar-frame">
                <UserAvatar
                  avatarUrl={profile.avatarUrl}
                  avatarId={profile.avatarId}
                  size={66}
                  priority
                  className="dashboard-dock-avatar"
                  alt={profile.displayName}
                />
              </span>
            </span>
          </span>
          <div className="dashboard-dock-identity-copy">
            <p className="dashboard-dock-name">{profile.displayName}</p>
            <p className="dashboard-dock-handle">{profile.handle}</p>
          </div>
        </div>

        <div className="dashboard-dock-ctas">
          <Link to="/profile" className="dashboard-dock-cta">
            Open profile
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
          </Link>
          <Link to="/settings" search={{ section: undefined }} className="dashboard-dock-cta">
            <span className="dashboard-dock-cta-gear" aria-hidden="true">
              ⚙️
            </span>
            Settings
          </Link>
        </div>
      </div>
    </section>
  );
}
