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
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { useProgressionStore } from "@/stores/progressionStore";

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

  // Signed-in but balance not yet resolved → show loading shimmer
  const isLoading = !authReady || (signedIn && balance === null);
  const credits = isLoading || !signedIn ? 0 : (balance ?? 0);

  // 1. Refresh on mount so the balance is fresh when the user arrives on
  //    the homepage — covers logins in other tabs, session restores, etc.
  useEffect(() => {
    if (!signedIn || !userId) return;
    void refreshProgression(userId);
  }, [signedIn, userId]);

  // 2. Refresh when the user returns to the tab.
  useEffect(() => {
    if (!signedIn || !userId) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshProgression(userId);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [signedIn, userId]);

  // 3. Supabase Realtime — subscribe to UPDATE events on the authenticated
  //    user's user_progression row. When credits change (quiz reward, spend,
  //    membership grant), patch progressionStore directly — no extra round
  //    trip needed. Falls back gracefully if Realtime is not enabled.
  useEffect(() => {
    if (!userId || !signedIn) return;

    const channel = supabase
      .channel(`wallet-credits-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_progression",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const incoming = payload.new as { credits?: unknown };
          if (typeof incoming.credits === "number") {
            const current = useProgressionStore.getState().player;
            useProgressionStore.getState().setPlayer({
              ...current,
              credits: incoming.credits,
            });
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, signedIn]);

  const unitLabel = credits === 1 ? "Credit" : "Credits";

  return (
    <div className="rewards-card__credits" aria-live="polite" aria-atomic="true">
      <div className="rewards-card__section-head">
        <Coins className="rewards-card__section-icon" strokeWidth={1.75} aria-hidden />
        <span className="rewards-card__stat-label">Your Credits</span>
      </div>
      <div className={`rewards-card__balance${isLoading ? " rewards-card__balance--loading" : ""}`}>
        <span className="rewards-card__balance-unit">{isLoading ? "\u00a0" : unitLabel}</span>
        {isLoading ? (
          <span
            className="rewards-card__balance-value rewards-card__balance-value--loading"
            aria-label="Loading credits"
          />
        ) : (
          <span className="rewards-card__balance-value">{credits.toLocaleString()}</span>
        )}
      </div>
      <span className="rewards-card__credits-hint">
        {signedIn
          ? "Play quizzes and challenges to earn more credits."
          : "Sign in to see your credits balance."}
      </span>
    </div>
  );
});
