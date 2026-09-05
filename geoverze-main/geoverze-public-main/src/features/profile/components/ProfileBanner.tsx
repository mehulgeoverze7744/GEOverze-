import { PROFILE_BANNER_EARTH_SRC } from "@/features/profile/lib/profileAssets";
import { cn } from "@/lib/utils";

/** Cinematic Earth + spacecraft cover for the profile card header. */
export function ProfileBanner({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("profile-banner relative overflow-hidden", className)}>
      <img
        src={PROFILE_BANNER_EARTH_SRC}
        alt=""
        className="profile-banner-image absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
        draggable={false}
      />
      {/* Subtle left shade for profile identity readability — keeps spacecraft visible */}
      <div className="profile-banner-overlay absolute inset-0 bg-gradient-to-r from-background/55 via-background/15 to-transparent" />
      {/* Bottom fade for avatar overlap transition */}
      <div className="profile-banner-overlay-bottom absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-charcoal/45 to-transparent" />
    </div>
  );
}
