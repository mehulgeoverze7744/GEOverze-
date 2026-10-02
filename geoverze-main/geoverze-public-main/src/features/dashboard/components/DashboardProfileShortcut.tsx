import { Link } from "@tanstack/react-router";
import { Settings, UserRound } from "lucide-react";

import { GeoButton } from "@/components/shared/GeoButton";
import { useProfile } from "@/features/profile/lib/useProfile";
import { cn } from "@/lib/utils";

/** Compact jump to the existing profile and settings surfaces. */
export function DashboardProfileShortcut({ className }: { className?: string }) {
  const profile = useProfile();

  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-2xl border border-bronze/16 bg-charcoal/30 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="dashboard-profile-shortcut-heading"
    >
      <h2
        id="dashboard-profile-shortcut-heading"
        className="dashboard-section-label flex items-center gap-2"
      >
        <UserRound className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.5} aria-hidden="true" />
        Profile
      </h2>
      <p className="mt-4 truncate text-sm text-foreground/80">{profile.displayName}</p>
      <p className="mt-1 text-xs text-bronze/80">{profile.handle}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        <GeoButton asChild variant="secondary" size="sm">
          <Link to="/profile">Open profile</Link>
        </GeoButton>
        <GeoButton asChild variant="ghost" size="sm">
          <Link to="/settings" search={{ section: undefined }}>
            <Settings className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            Settings
          </Link>
        </GeoButton>
      </div>
    </section>
  );
}
