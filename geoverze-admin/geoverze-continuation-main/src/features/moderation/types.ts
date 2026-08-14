export const moderationSurfaces = ["User", "Quiz", "Creator", "Community"] as const;
export type ModerationSurface = (typeof moderationSurfaces)[number];

export const casePriorities = ["Critical", "High", "Medium", "Low"] as const;
export type CasePriority = (typeof casePriorities)[number];

export const caseStatuses = ["open", "investigating", "escalated", "resolved", "rejected"] as const;
export type CaseStatus = (typeof caseStatuses)[number];

export const caseReasons = [
  "Harassment",
  "Spam",
  "Hate speech",
  "Misinformation",
  "Copyright",
  "Inappropriate media",
  "Cheating",
  "Impersonation",
] as const;
export type CaseReason = (typeof caseReasons)[number];

export const moderationActions = [
  "Approve",
  "Reject",
  "Warn",
  "Suspend",
  "Ban",
  "Restore",
  "Escalate",
] as const;
export type ModerationAction = (typeof moderationActions)[number];

export interface CaseEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
}

export interface EvidenceItem {
  id: string;
  kind: "screenshot" | "transcript" | "link" | "log";
  label: string;
  note: string;
}

export interface ModerationCase {
  id: string;
  surface: ModerationSurface;
  title: string;
  summary: string;
  reporter: string;
  reportedUser: string;
  reason: CaseReason;
  priority: CasePriority;
  status: CaseStatus;
  assignee: string;
  reportCount: number;
  reportedAt: string;
  updatedAt: string;
  appealOpen: boolean;
  evidence: EvidenceItem[];
  timeline: CaseEvent[];
}

export interface CaseFilterState {
  priority: string;
  status: string;
  reason: string;
  window: string;
}

export const emptyCaseFilters: CaseFilterState = {
  priority: "all",
  status: "all",
  reason: "all",
  window: "all",
};
