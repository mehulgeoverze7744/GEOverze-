import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ExplorerAvatarPicker } from "@/features/auth/components/ExplorerAvatarPicker";
import { persistableAvatarSelection } from "@/features/auth/lib/avatar";
import { bumpProfileEpoch, sessionIdentityFromProfile } from "@/features/profile/lib/profileIdentity";
import { useProfile } from "@/features/profile/lib/useProfile";
import { refreshCurrentProfile } from "@/lib/supabase/auth-sync";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useProfileStore } from "@/stores/profileStore";

import { GeoButton } from "@/components/shared/GeoButton";

/** iOS-style explorer avatar editor for Settings → Profile. */
export function ExplorerAvatarSettings() {
  const profile = useProfile();
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const updateProfile = useProfileStore((s) => s.update);
  const setAvatarId = useOnboardingStore((s) => s.setAvatarId);
  const [selectedId, setSelectedId] = useState<string | null>(profile.avatarId);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const dirty = touched && selectedId !== profile.avatarId;

  useEffect(() => {
    if (!touched) setSelectedId(profile.avatarId);
  }, [profile.avatarId, touched]);

  const onSave = async () => {
    if (!user?.id || !selectedId || profile.identityPending) return;
    const persisted = persistableAvatarSelection({
      avatarId: selectedId,
      currentAvatarUrl: profile.avatarUrl,
    });
    setSaving(true);
    const previous = useProfileStore.getState();
    const previousSession = user;
    const previousAvatar = useOnboardingStore.getState().avatarId;

    bumpProfileEpoch();
    updateProfile({
      avatarId: persisted.avatarId,
      avatarUrl: persisted.avatarUrl,
    });
    setAvatarId(persisted.avatarId);
    setSession(
      sessionIdentityFromProfile(
        { id: user.id, email: user.email },
        {
          displayName: profile.displayName,
          username: profile.username,
          country: profile.countryCode,
          avatarId: persisted.avatarId,
          avatarUrl: persisted.avatarUrl,
        },
      ),
    );

    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_id: persisted.avatarId,
        avatar_url: persisted.avatarUrl,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Failed to update explorer avatar", error);
      bumpProfileEpoch();
      updateProfile({
        ownerId: previous.ownerId,
        displayName: previous.displayName,
        username: previous.username,
        bio: previous.bio,
        country: previous.country,
        joinedAt: previous.joinedAt,
        avatarId: previous.avatarId,
        avatarUrl: previous.avatarUrl,
        loaded: previous.loaded,
        status: previous.status,
        loadError: previous.loadError,
      });
      setSession(previousSession);
      setAvatarId(previousAvatar);
      toast.error("Could not save your avatar. Nothing was changed.");
      setSaving(false);
      return;
    }

    bumpProfileEpoch();
    refreshCurrentProfile();
    setTouched(false);
    toast.success("Avatar updated");
    setSaving(false);
  };

  return (
    <section className="space-y-5 rounded-[22px] border border-[#E5E5EA] bg-white p-5 sm:p-6">
      <div className="space-y-1">
        <h3 className="text-[17px] font-semibold tracking-tight text-[#1D1D1F]">
          Your GVRZE Avatar
        </h3>
        <p className="text-[13px] text-[#86868B]">
          Explorers, superheroes, aliens and classic characters — same avatar everywhere.
        </p>
      </div>
      <ExplorerAvatarPicker
        selectedId={selectedId}
        onSelect={(id) => {
          setTouched(true);
          setSelectedId(id);
        }}
        preview
      />
      <GeoButton
        type="button"
        variant="primary"
        disabled={!dirty || saving || profile.identityPending || !selectedId}
        onClick={() => void onSave()}
        className="w-full"
      >
        {saving ? "Saving…" : "Save Changes"}
      </GeoButton>
    </section>
  );
}
