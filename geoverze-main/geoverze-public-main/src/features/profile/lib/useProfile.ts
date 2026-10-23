import { COUNTRIES } from "@/features/auth/data/countries";
import { INTERESTS, SKILL_LEVELS } from "@/features/auth/data/onboarding";
import { refreshCurrentProfile } from "@/lib/supabase/auth-sync";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useProfileStore } from "@/stores/profileStore";

import { resolveProfileIdentity } from "./profileIdentity";

/**
 * Resolved profile identity for the signed-in account.
 *
 * The profile row cached for that user id wins. While it is still loading,
 * callers get an empty pending identity instead of an email prefix or the
 * default avatar.
 */
export function useProfile() {
  const authStatus = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const onboardingAvatar = useOnboardingStore((s) => s.avatarId);
  const interestIds = useOnboardingStore((s) => s.interests);
  const skillLevelId = useOnboardingStore((s) => s.skillLevel);
  const ownerId = useProfileStore((s) => s.ownerId);
  const displayName = useProfileStore((s) => s.displayName);
  const username = useProfileStore((s) => s.username);
  const bio = useProfileStore((s) => s.bio);
  const country = useProfileStore((s) => s.country);
  const joinedAt = useProfileStore((s) => s.joinedAt);
  const avatarId = useProfileStore((s) => s.avatarId);
  const avatarUrl = useProfileStore((s) => s.avatarUrl);
  const loaded = useProfileStore((s) => s.loaded);
  const profileStatus = useProfileStore((s) => s.status);
  const loadError = useProfileStore((s) => s.loadError);

  const identity = resolveProfileIdentity({
    authStatus,
    user,
    cache: {
      ownerId,
      displayName,
      username,
      bio,
      country,
      joinedAt,
      avatarId,
      avatarUrl,
      loaded,
      status: profileStatus,
      loadError,
    },
  });

  const signedOutAvatar = !user && !identity.pending ? (onboardingAvatar ?? null) : null;
  const countryMatch = COUNTRIES.find((item) => item.code === identity.countryCode) ?? null;
  const interests = INTERESTS.filter((interest) => interestIds.includes(interest.id));
  const skillLevel = SKILL_LEVELS.find((level) => level.id === skillLevelId) ?? null;

  return {
    email: user?.email ?? "",
    displayName: identity.displayName,
    username: identity.username,
    handle: identity.handle,
    bio: identity.bio,
    country: countryMatch,
    countryCode: identity.countryCode,
    avatarId: identity.avatarId ?? signedOutAvatar,
    avatarUrl: identity.avatarUrl,
    showDefaultAvatar: identity.showDefaultAvatar,
    identityPending: identity.pending,
    identityError: identity.error,
    retryProfile: refreshCurrentProfile,
    interests,
    skillLevel,
    joinedAt: identity.joinedAt ? new Date(identity.joinedAt) : null,
  };
}

export type ResolvedProfile = ReturnType<typeof useProfile>;

/** "March 2026" style member-since label. */
export function formatJoinDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}
