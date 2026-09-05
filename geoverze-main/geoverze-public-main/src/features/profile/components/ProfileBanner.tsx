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
      {/* Seamless fade into the profile card — no hard banner edge */}
      <div className="profile-banner-overlay-bottom absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-[oklch(0.11_0.006_58/0.98)] via-[oklch(0.10_0.006_58/0.72)] via-45% to-transparent" />
      <div className="profile-banner-overlay-left absolute inset-0 bg-gradient-to-r from-background/60 via-background/20 to-transparent" />
    </div>
  );
}
