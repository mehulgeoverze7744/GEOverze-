import { fetchContentReports } from "@/features/ops/api";
import type { CasePriority, CaseStatus, ModerationCase, ModerationSurface } from "@/features/moderation/types";

function surfaceFrom(target: string): ModerationSurface {
  if (target === "quiz" || target === "question") return "Quiz";
  if (target === "library_creator") return "Creator";
  if (target === "library_resource") return "Community";
  return "User";
}

function priorityFrom(severity: string): CasePriority {
  if (severity === "critical") return "Critical";
  if (severity === "high") return "High";
  if (severity === "low") return "Low";
  return "Medium";
}

function statusFrom(status: string): CaseStatus {
  if (status === "resolved") return "resolved";
  if (status === "dismissed") return "rejected";
  if (status === "pending") return "investigating";
  return "open";
}

export async function fetchModerationCases(): Promise<ModerationCase[]> {
  const rows = await fetchContentReports();
  return rows.map((row) => ({
    id: row.id,
    surface: surfaceFrom(row.target_type),
    title: row.reason,
    summary: row.details || row.reason,
    reporter: row.reporter_id ?? "unknown",
    reportedUser: row.target_id,
    reason: "Harassment",
    priority: priorityFrom(row.severity),
    status: statusFrom(row.status),
    assignee: row.assigned_to ?? "Unassigned",
    reportCount: 1,
    reportedAt: row.created_at,
    updatedAt: row.updated_at,
    appealOpen: false,
    evidence: [],
    timeline: [
      {
        id: `${row.id}-opened`,
        actor: row.reporter_id ?? "system",
        action: "Report filed",
        target: row.target_id,
        time: row.created_at,
      },
    ],
  }));
}
