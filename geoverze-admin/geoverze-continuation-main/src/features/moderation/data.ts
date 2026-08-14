import { catalogDaysAgo, pickFrom, rng } from "@/lib/catalog";
import {
  caseReasons,
  casePriorities,
  caseStatuses,
  moderationSurfaces,
  type CaseEvent,
  type EvidenceItem,
  type ModerationCase,
  type ModerationSurface,
} from "@/features/moderation/types";

const people = [
  "Ada Whitfield",
  "Milo Grant",
  "Sofia Reyes",
  "Kenji Watanabe",
  "Nora Bergström",
  "Idris Bello",
  "Camille Fontaine",
  "Tomás Oliveira",
  "Hana Kaur",
  "Lucas Meyer",
  "Priya Raman",
  "Erik Lindqvist",
];

const moderators = ["A. Okafor", "R. Delgado", "S. Novak", "J. Haddad", "Unassigned"];

const titlesBySurface: Record<ModerationSurface, string[]> = {
  User: [
    "Abusive replies in quiz lobby",
    "Repeated spam invites",
    "Profile impersonating a creator",
    "Offensive display name",
  ],
  Quiz: [
    "Quiz contains misleading borders",
    "Copyrighted map imagery",
    "Answer key manipulated",
    "Explicit question text",
  ],
  Creator: [
    "Creator reposting third-party content",
    "Payout fraud suspicion",
    "Verification documents mismatch",
    "Bulk low-quality uploads",
  ],
  Community: [
    "Hate speech in discussion thread",
    "Coordinated review brigading",
    "Phishing link in comment",
    "Doxxing attempt in chat",
  ],
};

function buildEvidence(rand: () => number, id: string): EvidenceItem[] {
  const kinds = ["screenshot", "transcript", "link", "log"] as const;
  const count = 1 + Math.floor(rand() * 3);
  return Array.from({ length: count }, (_, index) => {
    const kind = pickFrom(rand, kinds);
    return {
      id: `${id}-ev-${index}`,
      kind,
      label: `${kind === "screenshot" ? "Screenshot" : kind === "transcript" ? "Chat transcript" : kind === "link" ? "Reported URL" : "System log"} ${index + 1}`,
      note: "Evidence storage is wired after backend integration.",
    };
  });
}

function buildTimeline(rand: () => number, id: string, reportedAt: string): CaseEvent[] {
  const events: CaseEvent[] = [
    {
      id: `${id}-t0`,
      actor: "System",
      action: "created the case from",
      target: `${1 + Math.floor(rand() * 6)} user reports`,
      time: reportedAt,
    },
  ];
  if (rand() > 0.4) {
    events.push({
      id: `${id}-t1`,
      actor: pickFrom(rand, moderators),
      action: "picked up",
      target: "the case for review",
      time: catalogDaysAgo(Math.floor(rand() * 4), 11),
    });
  }
  return events;
}

function buildCases(): ModerationCase[] {
  const rand = rng(90210);
  return Array.from({ length: 184 }, (_, index) => {
    const surface = moderationSurfaces[index % moderationSurfaces.length] as ModerationSurface;
    const id = `MOD-${2000 + index}`;
    const reportedAt = catalogDaysAgo(Math.floor(rand() * 45), 9);
    const reportedUser = pickFrom(rand, people);
    let reporter = pickFrom(rand, people);
    if (reporter === reportedUser) reporter = people[0] as string;
    return {
      id,
      surface,
      title: pickFrom(rand, titlesBySurface[surface]),
      summary:
        "Flagged by community members. Review the evidence bundle and apply the appropriate enforcement action.",
      reporter,
      reportedUser,
      reason: pickFrom(rand, caseReasons),
      priority: pickFrom(rand, casePriorities),
      status: pickFrom(rand, caseStatuses),
      assignee: pickFrom(rand, moderators),
      reportCount: 1 + Math.floor(rand() * 24),
      reportedAt,
      updatedAt: catalogDaysAgo(Math.floor(rand() * 6), 14),
      appealOpen: rand() > 0.82,
      evidence: buildEvidence(rand, id),
      timeline: buildTimeline(rand, id, reportedAt),
    } satisfies ModerationCase;
  });
}

export const moderationCases = buildCases();

export interface ModerationSummary {
  total: number;
  open: number;
  escalated: number;
  critical: number;
  appeals: number;
  resolved: number;
}

export function summarizeCases(cases: ModerationCase[]): ModerationSummary {
  return {
    total: cases.length,
    open: cases.filter((c) => c.status === "open" || c.status === "investigating").length,
    escalated: cases.filter((c) => c.status === "escalated").length,
    critical: cases.filter((c) => c.priority === "Critical").length,
    appeals: cases.filter((c) => c.appealOpen).length,
    resolved: cases.filter((c) => c.status === "resolved").length,
  };
}

/** Most reported targets — consumed by the dashboard widget. */
export const mostReportedContent = [...moderationCases]
  .sort((a, b) => b.reportCount - a.reportCount)
  .slice(0, 5)
  .map((item) => ({
    id: item.id,
    title: item.title,
    surface: item.surface,
    reports: item.reportCount,
  }));
