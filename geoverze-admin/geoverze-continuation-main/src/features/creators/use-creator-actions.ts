import { useCallback, useState } from "react";
import { toast } from "sonner";

import { setCreatorTier, setCreatorVerification } from "@/features/creators/live";
import type { CreatorRecord, VerificationState } from "@/features/creators/types";
import { formatAdminError } from "@/lib/supabase/query";
import { downloadCsv } from "@/lib/admin/csv";

export interface PendingConfirm {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean | undefined;
  onConfirm: () => void;
}

export function useCreatorActions(creators: CreatorRecord[], refetch: () => void) {
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);

  const applyVerification = useCallback(
    async (targets: CreatorRecord[], state: VerificationState) => {
      try {
        for (const creator of targets) {
          await setCreatorVerification(creator, state);
        }
        toast.success(
          targets.length === 1
            ? `Creator marked as ${state.toLowerCase()}.`
            : `${targets.length} creators marked as ${state.toLowerCase()}.`,
        );
        refetch();
      } catch (error) {
        toast.error(formatAdminError(error));
      }
    },
    [refetch],
  );

  const requestVerify = useCallback(
    (creator: CreatorRecord) =>
      setConfirm({
        title: `Verify ${creator.displayName}?`,
        description: "Grants the creator role and the library verified badge.",
        confirmLabel: "Verify creator",
        onConfirm: () => void applyVerification([creator], "Verified"),
      }),
    [applyVerification],
  );

  const requestReject = useCallback(
    (creator: CreatorRecord) =>
      setConfirm({
        title: `Reject ${creator.displayName}'s application?`,
        description: "Removes the creator role and clears the verified badge.",
        confirmLabel: "Reject application",
        destructive: true,
        onConfirm: () => void applyVerification([creator], "Rejected"),
      }),
    [applyVerification],
  );

  const requestSuspend = useCallback(
    (creator: CreatorRecord) =>
      setConfirm({
        title: `Suspend ${creator.displayName}?`,
        description: "Suspends the linked account when a user id exists.",
        confirmLabel: "Suspend creator",
        destructive: true,
        onConfirm: () => void applyVerification([creator], "Suspended"),
      }),
    [applyVerification],
  );

  const reinstate = useCallback(
    (creator: CreatorRecord) => void applyVerification([creator], "Verified"),
    [applyVerification],
  );

  const changeTier = useCallback(
    async (creator: CreatorRecord, tier: CreatorRecord["tier"]) => {
      try {
        await setCreatorTier(creator, tier);
        toast.success(`${creator.displayName} moved to the ${tier} tier.`);
        refetch();
      } catch (error) {
        toast.error(formatAdminError(error));
      }
    },
    [refetch],
  );

  const bulkVerify = useCallback(
    (ids: string[]) =>
      setConfirm({
        title: `Verify ${ids.length} creators?`,
        description: "Selected creators receive the verified badge and creator role.",
        confirmLabel: "Verify all",
        onConfirm: () =>
          void applyVerification(
            creators.filter((creator) => ids.includes(creator.id)),
            "Verified",
          ),
      }),
    [applyVerification, creators],
  );

  const bulkSuspend = useCallback(
    (ids: string[]) =>
      setConfirm({
        title: `Suspend ${ids.length} creators?`,
        description: "Linked accounts are suspended until reinstated.",
        confirmLabel: "Suspend all",
        destructive: true,
        onConfirm: () =>
          void applyVerification(
            creators.filter((creator) => ids.includes(creator.id)),
            "Suspended",
          ),
      }),
    [applyVerification, creators],
  );

  const exportCreators = useCallback(
    (rows: CreatorRecord[]) => {
      downloadCsv(
        "geoverze-creators.csv",
        ["id", "display_name", "username", "email", "verification", "status", "quizzes"],
        rows.map((row) => [
          row.id,
          row.displayName,
          row.username,
          row.email,
          row.verification,
          row.status,
          row.totalQuizzes,
        ]),
      );
    },
    [],
  );

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
    exportCreators,
  };
}
