import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { GeoInput, GeoSelect, GeoTextarea } from "@/components/shared/GeoField";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import {
  persistableAvatarSelection,
  isBundledAvatarSrc,
  withAvatarCacheBust,
} from "@/features/auth/lib/avatar";
import { COUNTRIES } from "@/features/auth/data/countries";
import { CHARACTER_AVATARS, INTERESTS } from "@/features/auth/data/onboarding";
import { PROFILE_CURRENT_PHOTO_SRC } from "@/features/profile/lib/profileAssets";
import { useProfile } from "@/features/profile/lib/useProfile";
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
  const [errors, setErrors] = useState<{ displayName?: string; username?: string }>({});
  const [saving, setSaving] = useState(false);
  const currentPhotoSrc =
    profile.avatarUrl?.trim() && !isBundledAvatarSrc(profile.avatarUrl)
      ? profile.avatarUrl
      : PROFILE_CURRENT_PHOTO_SRC;
  const photoSelected = !avatarId;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (displayName.trim().length < 2) nextErrors.displayName = "At least 2 characters.";
    if (!/^[a-z0-9_]{3,20}$/i.test(username))
      nextErrors.username = "3–20 letters, numbers or underscores.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);

    // Optimistic local update — stores are a cache layer.
    updateProfile({
      displayName: displayName.trim(),
      username: username.trim().toLowerCase(),
      bio: bio.trim(),
      country: country || null,
    });
    setAvatarId(avatarId);
    const persisted = persistableAvatarSelection({
      avatarId,
      currentAvatarUrl: profile.avatarUrl,
    });
    const revision = Date.now();
    const sessionAvatarUrl = persisted.avatarUrl
      ? withAvatarCacheBust(persisted.avatarUrl, revision)
      : null;
    if (user) {
      const nextUser: typeof user = {
        ...user,
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        ...(country ? { country } : {}),
      };
      if (persisted.avatarId) {
        nextUser.avatarId = persisted.avatarId;
      } else {
        delete nextUser.avatarId;
      }
      if (sessionAvatarUrl) {
        nextUser.avatarUrl = sessionAvatarUrl;
      } else {
        delete nextUser.avatarUrl;
      }
      setSession(nextUser);
    }

    // Persist to database in parallel; errors are surfaced via toast without
    // rolling back the optimistic state (the user's intent is already captured
    // in localStorage and shown on-screen).
    if (user?.id) {
      const userId = user.id;
      void Promise.all([
        supabase
          .from("profiles")
          .update({
            display_name: displayName.trim(),
            username: username.trim().toLowerCase(),
            bio: bio.trim() || null,
            country_code: country ? country.toUpperCase() : null,
            avatar_id: persisted.avatarId,
            avatar_url: persisted.avatarUrl,
          })
          .eq("id", userId)
          .then(({ error }) => {
            if (error) {
              console.error("Failed to update profile", error);
              toast.error(
                "Profile saved locally, but could not reach the server. Changes will sync on next login.",
              );
            }
          }),
        supabase
          .from("profile_preferences")
          .upsert({ user_id: userId, interests }, { onConflict: "user_id" })
          .then(({ error }) => {
            if (error) console.error("Failed to update preferences", error);
          }),
      ]);
    }

    window.setTimeout(() => {
      setSaving(false);
      toast.success("Profile updated");
      void navigate({ to: "/profile" });
    }, 600);
  }

  return (
    <PageShell>
      <div className="profile-edit">
        <PageHeader
          eyebrow="Profile"
          title="Edit your explorer identity"
          description="Everything here shapes how GEOverze greets you and tunes your expeditions."
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
                    onChange={(event) => setDisplayName(event.target.value)}
                    autoComplete="name"
                    {...(errors.displayName ? { error: errors.displayName } : {})}
                  />
                  <GeoInput
                    id="username"
                    label="Username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
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
                    onChange={(event) => setBio(event.target.value)}
                    hint={`${bio.length} / ${BIO_LIMIT} characters`}
                  />
                  <GeoSelect
                    id="country"
                    label="Country"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
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
                      onClick={() => setAvatar(null)}
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
                          onClick={() => setAvatar(option.id)}
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
                  description="Pick the themes GEOverze should lean into when suggesting expeditions."
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
                disabled={saving}
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
