import { useEffect } from "react";

import { COUNTRIES } from "@/features/auth/data/countries";
import { INTERESTS, SKILL_LEVELS } from "@/features/auth/data/onboarding";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useProfileStore } from "@/stores/profileStore";

/**
 * Resolved profile identity.
 *
 * Composes the session, onboarding selections and editable profile fields into
 * the single shape every dashboard/profile surface reads. When a real backend
 * lands, only this hook changes.
 */
export function useProfile() {
  const user = useAuthStore((s) => s.user);
  const onboardingAvatar = useOnboardingStore((s) => s.avatarId);
  const interestIds = useOnboardingStore((s) => s.interests);
  const skillLevelId = useOnboardingStore((s) => s.skillLevel);
  const profile = useProfileStore((s) => s);
  const ensureJoinDate = useProfileStore((s) => s.ensureJoinDate);

  useEffect(() => {
    ensureJoinDate();
  }, [ensureJoinDate]);

  const email = user?.email ?? "explorer@geoverze.com";
  const displayName = profile.displayName ?? user?.displayName ?? email.split("@")[0] ?? "Explorer";
  const username =
    profile.username ?? user?.username ?? displayName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const countryCode = profile.country ?? user?.country ?? null;
  const country = COUNTRIES.find((item) => item.code === countryCode) ?? null;
  const avatarUrl = user?.avatarUrl ?? null;
  const avatarId = user?.avatarId ?? onboardingAvatar ?? null;
  const interests = INTERESTS.filter((interest) => interestIds.includes(interest.id));
  const skillLevel = SKILL_LEVELS.find((level) => level.id === skillLevelId) ?? null;

  return {
    email,
    displayName,
    username,
    handle: `@${username}`,
    bio:
      profile.bio ??
      "Chasing borders, capitals and coastlines one expedition at a time. Somewhere between an atlas and a passport.",
    country,
    countryCode,
    avatarId,
    avatarUrl,
    interests,
    skillLevel,
    joinedAt: profile.joinedAt ? new Date(profile.joinedAt) : new Date(),
  };
}

export type ResolvedProfile = ReturnType<typeof useProfile>;

/** "March 2026" style member-since label. */
export function formatJoinDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}
