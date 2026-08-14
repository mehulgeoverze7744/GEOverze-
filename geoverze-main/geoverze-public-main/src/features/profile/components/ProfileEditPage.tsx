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
import { AvatarMark } from "@/features/auth/components/AvatarMark";
import { COUNTRIES } from "@/features/auth/data/countries";
import { AVATARS, INTERESTS } from "@/features/auth/data/onboarding";
import { useProfile } from "@/features/profile/lib/useProfile";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useProfileStore } from "@/stores/profileStore";

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
  const [avatarId, setAvatar] = useState(profile.avatarId);
  const [errors, setErrors] = useState<{ displayName?: string; username?: string }>({});
  const [saving, setSaving] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (displayName.trim().length < 2) nextErrors.displayName = "At least 2 characters.";
    if (!/^[a-z0-9_]{3,20}$/i.test(username))
      nextErrors.username = "3–20 letters, numbers or underscores.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    updateProfile({
      displayName: displayName.trim(),
      username: username.trim().toLowerCase(),
      bio: bio.trim(),
      country: country || null,
    });
    setAvatarId(avatarId);
    if (user) {
      setSession({
        ...user,
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        avatarId,
        ...(country ? { country } : {}),
      });
    }
    window.setTimeout(() => {
      setSaving(false);
      toast.success("Profile updated");
      void navigate({ to: "/profile" });
    }, 600);
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Profile"
        title="Edit your explorer identity"
        description="Everything here shapes how GEOverze greets you and tunes your expeditions."
      />
      <SectionContainer>
        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-3">
          <AnimatedSection className="lg:col-span-2">
            <GlassCard strong className="space-y-7 p-6 sm:p-8">
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

          <AnimatedSection delay={80}>
            <GlassCard className="space-y-7 p-6 sm:p-8">
              <SectionHeading as="h3" title="Avatar" />
              <div className="flex flex-wrap gap-3">
                {AVATARS.map((option) => {
                  const selected = option.id === avatarId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setAvatar(option.id)}
                      aria-pressed={selected}
                      className={cn(
                        "rounded-full p-1 transition-colors motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45",
                        selected
                          ? "ring-2 ring-bronze"
                          : "ring-1 ring-bronze/15 hover:ring-bronze/40",
                      )}
                    >
                      <AvatarMark id={option.id} size={48} />
                      <span className="sr-only">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </AnimatedSection>

          <AnimatedSection delay={140} className="lg:col-span-3">
            <GlassCard className="p-6 sm:p-8">
              <SectionHeading
                as="h3"
                title="Interests"
                description="Pick the themes GEOverze should lean into when suggesting expeditions."
              />
              <ul className="mt-7 flex flex-wrap gap-2.5">
                {INTERESTS.map((interest) => {
                  const selected = interests.includes(interest.id);
                  return (
                    <li key={interest.id}>
                      <button
                        type="button"
                        onClick={() => toggleInterest(interest.id)}
                        aria-pressed={selected}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition-colors motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45",
                          selected
                            ? "border-bronze/55 bg-bronze/12 text-foreground"
                            : "border-bronze/15 text-foreground/50 hover:border-bronze/35 hover:text-foreground/80",
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

          <div className="flex flex-wrap gap-3 lg:col-span-3">
            <GeoButton type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </GeoButton>
            <GeoButton
              type="button"
              variant="ghost"
              onClick={() => void navigate({ to: "/profile" })}
            >
              Cancel
            </GeoButton>
          </div>
        </form>
      </SectionContainer>
    </PageShell>
  );
}
