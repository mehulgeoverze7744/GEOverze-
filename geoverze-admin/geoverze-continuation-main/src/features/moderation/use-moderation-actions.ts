import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type { PendingConfirm } from "@/components/shared/confirm-dialog";
import type { CaseStatus, ModerationAction, ModerationCase } from "@/features/moderation/types";
import { catalogDaysAgo } from "@/lib/catalog";
import { notReady } from "@/lib/placeholder";

const actionStatus: Record<ModerationAction, CaseStatus> = {
  Approve: "resolved",
  Reject: "rejected",
  Warn: "resolved",
  Suspend: "resolved",
  Ban: "resolved",
  Restore: "open",
  Escalate: "escalated",
};

const destructiveActions: ModerationAction[] = ["Suspend", "Ban", "Reject"];

const actionCopy: Record<ModerationAction, string> = {
  Approve: "The reported content stays live and the case is closed as approved.",
  Reject: "The report is dismissed and the case is closed without enforcement.",
  Warn: "The reported user receives a formal warning on their record.",
  Suspend: "The reported user loses access for the standard suspension window.",
  Ban: "The reported user is permanently banned from GEOverze.",
  Restore: "Previous enforcement is reverted and the case is reopened.",
  Escalate: "The case moves to the trust & safety escalation queue.",
};

/**
 * Moderation mutations for every queue. Local state only — each handler is a
 * single swap point for a backend call later.
 */
export function useModerationActions(initialCases: ModerationCase[]) {
  const [cases, setCases] = useState(initialCases);
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);

  const applyAction = useCallback((ids: string[], action: ModerationAction, note?: string) => {
    const set = new Set(ids);
    const time = catalogDaysAgo(0, 12);
    setCases((prev) =>
      prev.map((item) =>
        set.has(item.id)
          ? {
              ...item,
              status: actionStatus[action],
              appealOpen: action === "Restore" ? false : item.appealOpen,
              updatedAt: time,
              timeline: [
                ...item.timeline,
                {
                  id: `${item.id}-t${item.timeline.length}`,
                  actor: "You",
                  action: `applied ${action.toLowerCase()}`,
                  target: note?.trim() ? `— ${note.trim()}` : "to the case",
                  time,
                },
              ],
            }
          : item,
      ),
    );
    toast.success(
      ids.length === 1 ? `${action} applied.` : `${action} applied to ${ids.length} cases.`,
    );
  }, []);

  const requestAction = useCallback(
    (ids: string[], action: ModerationAction, note?: string) => {
      if (ids.length === 0) {
        toast.info("Select at least one case first.");
        return;
      }
      if (!destructiveActions.includes(action) && action !== "Escalate") {
        applyAction(ids, action, note);
        return;
      }
      setConfirm({
        title: ids.length === 1 ? `${action} this case?` : `${action} ${ids.length} cases?`,
        description: actionCopy[action],
        confirmLabel: action,
        destructive: destructiveActions.includes(action),
        onConfirm: () => applyAction(ids, action, note),
      });
    },
    [applyAction],
  );

  const assignCase = useCallback((id: string, assignee: string) => {
    setCases((prev) => prev.map((item) => (item.id === id ? { ...item, assignee } : item)));
    toast.success(`Case assigned to ${assignee}.`);
  }, []);

  return useMemo(
    () => ({
      cases,
      confirm,
      setConfirm,
      requestAction,
      applyAction,
      assignCase,
      placeholder: notReady,
    }),
    [cases, confirm, requestAction, applyAction, assignCase],
  );
}
