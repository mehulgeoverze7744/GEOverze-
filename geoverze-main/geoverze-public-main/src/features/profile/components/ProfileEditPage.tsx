import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { GeoInput, GeoSelect, GeoTextarea } from "@/components/shared/GeoField";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { persistableAvatarSelection, isBundledAvatarSrc } from "@/features/auth/lib/avatar";
import { COUNTRIES } from "@/features/auth/data/countries";
import { CHARACTER_AVATARS, INTERESTS } from "@/features/auth/data/onboarding";
import { PROFILE_CURRENT_PHOTO_SRC } from "@/features/profile/lib/profileAssets";
import {
  bumpProfileEpoch,
  canonicalProfileFromEdit,
  sessionIdentityFromProfile,
} from "@/features/profile/lib/profileIdentity";
import { useProfile } from "@/features/profile/lib/useProfile";
import { refreshCurrentProfile } from "@/lib/supabase/auth-sync";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useProfileStore } from "@/stores/profileStore";

import "../styles/profile-edit.css";

const BIO_LIMIT = 240;

/**
 * Profile editor.
 *
 * Writes straight to the local profile/onboarding stores — the same seam a real
 * `PATCH /profile` call will replace.
 */
export function ProfileEditPage() {
  const navigate = useNavigate();
  const profile = useProfile();
  const updateProfile = useProfileStore((s) => s.update);
  const setSession = useAuthStore((s) => s.setSession);
  const user = useAuthStore((s) => s.user);
  const interests = useOnboardingStore((s) => s.interests);
  const toggleInterest = useOnboardingStore((s) => s.toggleInterest);
  const setAvatarId = useOnboardingStore((s) => s.setAvatarId);

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [country, setCountry] = useState(profile.countryCode ?? "");
  const [avatarId, setAvatar] = useState<string | null>(profile.avatarId);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<{ displayName?: string; username?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (dirty || profile.identityPending) return;
    setDisplayName(profile.displayName);
    setUsername(profile.username);
    setBio(profile.bio);
    setCountry(profile.countryCode ?? "");
    setAvatar(profile.avatarId);
  }, [
    dirty,
    profile.identityPending,
    profile.displayName,
    profile.username,
    profile.bio,
    profile.countryCode,
    profile.avatarId,
  ]);
  const currentPhotoSrc =
    profile.avatarUrl?.trim() && !isBundledAvatarSrc(profile.avatarUrl)
      ? profile.avatarUrl
      : PROFILE_CURRENT_PHOTO_SRC;
  const photoSelected = !avatarId;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (displayName.trim().length < 2) nextErrors.displayName = "At least 2 characters.";
    if (!/^[a-z0-9_]{3,20}$/i.test(username))
      nextErrors.username = "3–20 letters, numbers or underscores.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !user || profile.identityPending) return;

    const previousCache = useProfileStore.getState();
    const previousSession = user;
    const previousAvatar = useOnboardingStore.getState().avatarId;
    const persisted = persistableAvatarSelection({
      avatarId,
      currentAvatarUrl: profile.avatarUrl,
    });
    const canonical = canonicalProfileFromEdit({
      userId: user.id,
      displayName: displayName.trim(),
      username: username.trim().toLowerCase(),
      bio: bio.trim(),
      country: country ? country.toUpperCase() : null,
      avatarId: persisted.avatarId,
      avatarUrl: persisted.avatarUrl,
      joinedAt: previousCache.ownerId === user.id ? previousCache.joinedAt : null,
    });

    setSaving(true);
    bumpProfileEpoch();
    updateProfile(canonical);
    setAvatarId(canonical.avatarId);
    setSession(sessionIdentityFromProfile({ id: user.id, email: user.email }, canonical));

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: canonical.displayName,
        username: canonical.username,
        bio: canonical.bio,
        country_code: canonical.country,
        avatar_id: canonical.avatarId,
        avatar_url: canonical.avatarUrl,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Failed to update profile", error);
      bumpProfileEpoch();
      updateProfile({
        ownerId: previousCache.ownerId,
        displayName: previousCache.displayName,
        username: previousCache.username,
        bio: previousCache.bio,
        country: previousCache.country,
        joinedAt: previousCache.joinedAt,
        avatarId: previousCache.avatarId,
        avatarUrl: previousCache.avatarUrl,
        loaded: previousCache.loaded,
        status: previousCache.status,
        loadError: previousCache.loadError,
      });
      setSession(previousSession);
      setAvatarId(previousAvatar);
      toast.error("Could not save your profile. Nothing was changed.");
      setSaving(false);
      return;
    }

    const { error: preferencesError } = await supabase
      .from("profile_preferences")
      .upsert({ user_id: user.id, interests }, { onConflict: "user_id" });
    if (preferencesError) console.error("Failed to update preferences", preferencesError);

    bumpProfileEpoch();
    refreshCurrentProfile();
    toast.success("Profile updated");
    setSaving(false);
    void navigate({ to: "/profile" });
  }

  return (
    <PageShell>
      <div className="profile-edit">
        <PageHeader
          eyebrow="Profile"
          title="Edit your explorer identity"
          description="Everything here shapes how GVRZE greets you and tunes your expeditions."
        />
        <SectionContainer>
          <form onSubmit={handleSubmit} className="profile-edit-form">
            <div className="profile-edit-split">
              <AnimatedSection className="profile-edit-split-basics">
                <GlassCard strong className="profile-edit-card space-y-8 p-7 sm:p-9">
                  <SectionHeading as="h3" title="Basics" />
                  <GeoInput
                    id="displayName"
                    label="Display name"
                    value={displayName}
                    onChange={(event) => {
                      setDirty(true);
                      setDisplayName(event.target.value);
                    }}
                    autoComplete="name"
                    {...(errors.displayName ? { error: errors.displayName } : {})}
                  />
                  <GeoInput
                    id="username"
                    label="Username"
                    value={username}
                    onChange={(event) => {
                      setDirty(true);
                      setUsername(event.target.value);
                    }}
                    autoComplete="username"
                    hint="Your public handle across leaderboards and community."
                    {...(errors.username ? { error: errors.username } : {})}
                  />
                  <GeoTextarea
                    id="bio"
                    label="Bio"
                    rows={4}
                    maxLength={BIO_LIMIT}
                    value={bio}
                    onChange={(event) => {
                      setDirty(true);
                      setBio(event.target.value);
                    }}
                    hint={`${bio.length} / ${BIO_LIMIT} characters`}
                  />
                  <GeoSelect
                    id="country"
                    label="Country"
                    value={country}
                    onChange={(event) => {
                      setDirty(true);
                      setCountry(event.target.value);
                    }}
                  >
                    <option value="">Prefer not to say</option>
                    {COUNTRIES.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name}
                      </option>
                    ))}
                  </GeoSelect>
                </GlassCard>
              </AnimatedSection>

              <AnimatedSection delay={80} className="profile-edit-split-avatar">
                <GlassCard className="profile-edit-card profile-edit-avatar-card space-y-7 p-7 sm:p-9">
                  <SectionHeading as="h3" title="Avatar" />
                  <div className="profile-edit-avatars">
                    <button
                      type="button"
                      onClick={() => {
                        setDirty(true);
                        setAvatar(null);
                      }}
                      aria-pressed={photoSelected}
                      className={cn(
                        "profile-edit-avatar",
                        photoSelected && "profile-edit-avatar--selected",
                      )}
                    >
                      <img
                        src={currentPhotoSrc}
                        alt=""
                        width={80}
                        height={80}
                        decoding="async"
                        draggable={false}
                        className="profile-edit-avatar-photo"
                      />
                      <span className="sr-only">Current profile photo</span>
                    </button>
                    {CHARACTER_AVATARS.map((option) => {
                      const selected = option.id === avatarId;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setDirty(true);
                            setAvatar(option.id);
                          }}
                          aria-pressed={selected}
                          className={cn(
                            "profile-edit-avatar",
                            selected && "profile-edit-avatar--selected",
                          )}
                        >
                          <img
                            src={option.src}
                            alt=""
                            width={80}
                            height={80}
                            decoding="async"
                            draggable={false}
                            className="profile-edit-avatar-photo profile-edit-avatar-character"
                          />
                          <span className="sr-only">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </GlassCard>
              </AnimatedSection>
            </div>

            <AnimatedSection delay={140}>
              <GlassCard className="profile-edit-card p-7 sm:p-9">
                <SectionHeading
                  as="h3"
                  title="Interests"
                  description="Pick the themes GVRZE should lean into when suggesting expeditions."
                />
                <ul className="profile-edit-interests">
                  {INTERESTS.map((interest) => {
                    const selected = interests.includes(interest.id);
                    return (
                      <li key={interest.id}>
                        <button
                          type="button"
                          onClick={() => toggleInterest(interest.id)}
                          aria-pressed={selected}
                          data-interest={interest.id}
                          className={cn(
                            "profile-edit-chip",
                            `profile-edit-chip--${interest.id}`,
                            selected && "profile-edit-chip--selected",
                          )}
                        >
                          <interest.icon
                            className="h-3.5 w-3.5"
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                          {interest.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </GlassCard>
            </AnimatedSection>

            <div className="profile-edit-actions">
              <GeoButton
                type="submit"
                variant="primary"
                disabled={saving || profile.identityPending}
                className="profile-edit-save"
              >
                {saving ? "Saving…" : "Save changes"}
              </GeoButton>
              <GeoButton
                type="button"
                variant="ghost"
                className="profile-edit-cancel"
                onClick={() => void navigate({ to: "/profile" })}
              >
                Cancel
              </GeoButton>
            </div>
          </form>
        </SectionContainer>
      </div>
    </PageShell>
  );
}
