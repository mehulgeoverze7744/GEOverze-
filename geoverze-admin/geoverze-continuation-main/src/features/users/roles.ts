export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  assignedUsers: number;
  permissions: string[];
}

export const permissionAreas = [
  "View dashboard",
  "Manage users",
  "Approve creators",
  "Publish content",
  "Moderate community",
  "Issue refunds",
  "Manage rewards",
  "Resolve tickets",
  "View analytics",
  "Read audit logs",
  "Change system settings",
] as const;

export type PermissionArea = (typeof permissionAreas)[number];

export const roles: RoleDefinition[] = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Unrestricted access to every module, including system settings and billing.",
    assignedUsers: 3,
    permissions: [...permissionAreas],
  },
  {
    id: "administrator",
    name: "Administrator",
    description: "Day-to-day platform ownership without destructive system configuration.",
    assignedUsers: 8,
    permissions: permissionAreas.filter((p) => p !== "Change system settings"),
  },
  {
    id: "moderator",
    name: "Moderator",
    description: "Reviews reports, moderates community content and enforces policy.",
    assignedUsers: 21,
    permissions: ["View dashboard", "Publish content", "Moderate community", "Resolve tickets"],
  },
  {
    id: "content_manager",
    name: "Content Manager",
    description: "Owns quizzes, questions and the GEOlibrary editorial pipeline.",
    assignedUsers: 14,
    permissions: ["View dashboard", "Publish content", "Approve creators", "View analytics"],
  },
  {
    id: "support_agent",
    name: "Support Agent",
    description: "Handles inbound tickets and account assistance for players.",
    assignedUsers: 27,
    permissions: ["View dashboard", "Resolve tickets", "Manage users"],
  },
  {
    id: "finance_manager",
    name: "Finance Manager",
    description: "Oversees payments, subscriptions, refunds and creator payouts.",
    assignedUsers: 6,
    permissions: ["View dashboard", "Issue refunds", "View analytics", "Read audit logs"],
  },
  {
    id: "analytics_viewer",
    name: "Analytics Viewer",
    description: "Read access to product and growth analytics dashboards.",
    assignedUsers: 12,
    permissions: ["View dashboard", "View analytics"],
  },
  {
    id: "read_only_auditor",
    name: "Read-only Auditor",
    description: "Compliance access to audit logs with no write capability anywhere.",
    assignedUsers: 4,
    permissions: ["View dashboard", "Read audit logs"],
  },
];
