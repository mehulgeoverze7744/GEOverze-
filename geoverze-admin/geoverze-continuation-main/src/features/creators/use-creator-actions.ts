import { useCallback, useState } from "react";
import { toast } from "sonner";
import { notReady } from "@/lib/placeholder";

import type { CreatorRecord, VerificationState } from "@/features/creators/types";

export interface PendingConfirm {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean | undefined;
  onConfirm: () => void;
}

/**
 * Verification + moderation workflow. Mutations are optimistic-local only until
 * the backend is connected; every handler is a single swap point.
 */
export function useCreatorActions(initial: CreatorRecord[]) {
  const [creators, setCreators] = useState(initial);
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);

  const patch = useCallback((ids: string[], changes: Partial<CreatorRecord>) => {
    const set = new Set(ids);
    setCreators((prev) =>
      prev.map((creator) => (set.has(creator.id) ? { ...creator, ...changes } : creator)),
    );
  }, []);

  const setVerification = useCallback(
    (ids: string[], state: VerificationState) => {
      patch(ids, {
        verification: state,
        status: state === "Suspended" ? "suspended" : state === "Pending" ? "pending" : "active",
      });
      toast.success(
        ids.length === 1
          ? `Creator marked as ${state.toLowerCase()}.`
          : `${ids.length} creators marked as ${state.toLowerCase()}.`,
      );
    },
    [patch],
  );

  const requestVerify = useCallback(
    (creator: CreatorRecord) =>
      setConfirm({
        title: `Verify ${creator.displayName}?`,
        description: "Verified creators get the badge, higher payout tiers and priority placement.",
        confirmLabel: "Verify creator",
        onConfirm: () => setVerification([creator.id], "Verified"),
      }),
    [setVerification],
  );

  const requestReject = useCallback(
    (creator: CreatorRecord) =>
      setConfirm({
        title: `Reject ${creator.displayName}'s application?`,
        description: "The creator can reapply after 30 days. They are notified by email.",
        confirmLabel: "Reject application",
        destructive: true,
        onConfirm: () => setVerification([creator.id], "Rejected"),
      }),
    [setVerification],
  );

  const requestSuspend = useCallback(
    (creator: CreatorRecord) =>
      setConfirm({
        title: `Suspend ${creator.displayName}?`,
        description: "Suspension hides all published quizzes and pauses payouts until reinstated.",
        confirmLabel: "Suspend creator",
        destructive: true,
        onConfirm: () => setVerification([creator.id], "Suspended"),
      }),
    [setVerification],
  );

  const reinstate = useCallback(
    (creator: CreatorRecord) => setVerification([creator.id], "Verified"),
    [setVerification],
  );

  const changeTier = useCallback(
    (creator: CreatorRecord, tier: CreatorRecord["tier"]) => {
      patch([creator.id], { tier });
      toast.success(`${creator.displayName} moved to the ${tier} tier.`);
    },
    [patch],
  );

  const bulkVerify = useCallback(
    (ids: string[]) =>
      setConfirm({
        title: `Verify ${ids.length} creators?`,
        description: "All selected applications are approved and badges granted immediately.",
        confirmLabel: "Verify all",
        onConfirm: () => setVerification(ids, "Verified"),
      }),
    [setVerification],
  );

  const bulkSuspend = useCallback(
    (ids: string[]) =>
      setConfirm({
        title: `Suspend ${ids.length} creators?`,
        description: "Their quizzes are hidden and payouts paused until reinstated.",
        confirmLabel: "Suspend all",
        destructive: true,
        onConfirm: () => setVerification(ids, "Suspended"),
      }),
    [setVerification],
  );

  const placeholder = notReady;

  return {
    creators,
    confirm,
    setConfirm,
    requestVerify,
    requestReject,
    requestSuspend,
    reinstate,
    changeTier,
    bulkVerify,
    bulkSuspend,
    placeholder,
  };
}
