import { Link } from "@tanstack/react-router";
import { ChevronRight, Settings } from "lucide-react";

import { UserAvatar } from "@/features/auth/components/UserAvatar";
import { useProfile } from "@/features/profile/lib/useProfile";
import { cn } from "@/lib/utils";

/** Compact jump to the existing profile and settings surfaces. */
export function DashboardProfileShortcut({ className }: { className?: string }) {
  const profile = useProfile();

  return (
    <section
      className={cn("dashboard-dock-card", className)}
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
          <UserAvatar
            avatarUrl={profile.avatarUrl}
            avatarId={profile.avatarId}
            size={66}
            className="dashboard-dock-avatar"
            alt={profile.displayName}
          />
          <div className="min-w-0">
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
            <Settings className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
            Settings
          </Link>
        </div>
      </div>
    </section>
  );
}
