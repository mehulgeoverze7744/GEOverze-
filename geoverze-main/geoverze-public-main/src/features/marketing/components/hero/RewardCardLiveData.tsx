import { memo, useEffect, useState } from "react";
import { CalendarDays, Coins } from "lucide-react";

import {
  formatCountdownSegment,
  isRewardCountdownExpired,
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
  const expired = isRewardCountdownExpired(parts);

  return (
    <div className="rewards-card__countdown" aria-live="polite" aria-atomic="true">
      <div className="rewards-card__section-head">
        <CalendarDays className="rewards-card__section-icon" strokeWidth={1.75} aria-hidden />
        <span className="rewards-card__stat-label">Next Reward Drop</span>
      </div>
      {expired ? (
        <p className="rewards-card__drop-live">New rewards are live</p>
      ) : (
        <div className="rewards-card__timer">
          <div className="rewards-card__unit">
            <span className="rewards-card__unit-value">{formatCountdownSegment(parts.days)}</span>
            <span className="rewards-card__unit-label">Days</span>
          </div>
          <div className="rewards-card__unit">
            <span className="rewards-card__unit-value">{formatCountdownSegment(parts.hours)}</span>
            <span className="rewards-card__unit-label">Hours</span>
          </div>
          <div className="rewards-card__unit">
            <span className="rewards-card__unit-value">
              {formatCountdownSegment(parts.minutes)}
            </span>
            <span className="rewards-card__unit-label">Mins</span>
          </div>
        </div>
      )}
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
      <div className="rewards-card__section-head">
        <Coins className="rewards-card__section-icon" strokeWidth={1.75} aria-hidden />
        <span className="rewards-card__stat-label">Your Credits</span>
      </div>
      <div className="rewards-card__balance">
        <span className="rewards-card__balance-value">{credits.toLocaleString()}</span>
        <span className="rewards-card__balance-unit">{credits === 1 ? "Credit" : "Credits"}</span>
      </div>
      <span className="rewards-card__credits-hint">
        Play quizzes and challenges to earn more credits.
      </span>
    </div>
  );
});
