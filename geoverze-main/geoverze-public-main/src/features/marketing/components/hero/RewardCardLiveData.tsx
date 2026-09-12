import { memo, useEffect, useState } from "react";

import {
  formatRewardCountdown,
  nextRewardDropTarget,
  rewardCountdownParts,
} from "@/features/marketing/lib/rewardCountdown";
import { useStoreCreditsState } from "@/features/store/lib/useStoreCredits";
import { refreshProgression } from "@/lib/supabase/auth-sync";
import { useAuthStore } from "@/stores/authStore";

/** Isolated 1 Hz tick — only this subtree re-renders. */
function useRewardCountdownTick() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}

export const RewardCardCountdown = memo(function RewardCardCountdown() {
  const now = useRewardCountdownTick();
  const target = nextRewardDropTarget(now);
  const parts = rewardCountdownParts(target, now);

  return (
    <div className="rewards-card__countdown" aria-live="polite" aria-atomic="true">
      <p className="rewards-card__stat-label">NEXT REWARD DROP</p>
      <p className="rewards-card__stat-value">{formatRewardCountdown(parts)}</p>
    </div>
  );
});

export const RewardCardCredits = memo(function RewardCardCredits() {
  const userId = useAuthStore((s) => s.user?.id);
  const { balance, signedIn, authReady } = useStoreCreditsState();
  const credits = !authReady || !signedIn ? 0 : (balance ?? 0);

  useEffect(() => {
    if (!signedIn || !userId) return;

    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshProgression(userId);
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [signedIn, userId]);

  return (
    <div className="rewards-card__credits" aria-live="polite" aria-atomic="true">
      <p className="rewards-card__stat-label">YOUR CREDITS</p>
      <p className="rewards-card__stat-value">
        {credits.toLocaleString()} {credits === 1 ? "CREDIT" : "CREDITS"}
      </p>
    </div>
  );
});
