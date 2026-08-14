export const auditCategories = [
  "User",
  "Creator",
  "Quiz",
  "Question",
  "Store",
  "Reward",
  "Admin",
  "Permission",
  "Settings",
] as const;
export type AuditCategory = (typeof auditCategories)[number];

export const auditResults = ["success", "denied", "failed"] as const;
export type AuditResult = (typeof auditResults)[number];

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  actorRole: string;
  category: AuditCategory;
  action: string;
  target: string;
  result: AuditResult;
  ip: string;
  channel: string;
  details: string;
}

export interface AuditFilterState {
  category: string;
  result: string;
  actor: string;
  window: string;
}

export const emptyAuditFilters: AuditFilterState = {
  category: "all",
  result: "all",
  actor: "all",
  window: "all",
};

export const notificationTypes = ["alert", "warning", "success", "announcement"] as const;
export type NotificationType = (typeof notificationTypes)[number];

export const notificationAudiences = [
  "All users",
  "Creators",
  "Subscribers",
  "Admins",
  "Moderators",
] as const;
export type NotificationAudience = (typeof notificationAudiences)[number];

export const notificationChannels = ["In-app", "Email", "Push"] as const;
export type NotificationChannel = (typeof notificationChannels)[number];

export const notificationStatuses = ["draft", "scheduled", "sent", "failed"] as const;
export type NotificationStatus = (typeof notificationStatuses)[number];

export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  audience: NotificationAudience;
  channel: NotificationChannel;
  status: NotificationStatus;
  scheduledFor: string;
  sentAt: string | null;
  recipients: number;
  openRate: number;
  createdBy: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject: string;
  body: string;
  updatedAt: string;
  usageCount: number;
}

export type ServiceStatus = "operational" | "degraded" | "outage";

export interface ServiceHealth {
  id: string;
  name: string;
  status: ServiceStatus;
  uptime: number;
  latencyMs: number;
  errorRate: number;
  region: string;
}

export interface StorageBucket {
  id: string;
  name: string;
  usedGb: number;
  capacityGb: number;
  objects: number;
}

export interface ActiveSession {
  id: string;
  admin: string;
  role: string;
  ip: string;
  location: string;
  device: string;
  startedAt: string;
  lastSeen: string;
}

/** One row of any business-intelligence breakdown table. */
export interface ReportRow {
  id: string;
  label: string;
  primary: number;
  secondary: number;
  change: number;
  meta: string;
}

export interface BiFilterState {
  window: string;
  region: string;
  creator: string;
  category: string;
  subscription: string;
}

export const emptyBiFilters: BiFilterState = {
  window: "90d",
  region: "all",
  creator: "all",
  category: "all",
  subscription: "all",
};

export const analyticsWindows = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "12m", label: "Last 12 months", days: 365 },
] as const;

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  defaultLocale: string;
  timezone: string;
  tagline: string;
  primaryColor: string;
  logoUrl: string;
  maintenanceMode: boolean;
  maintenanceNote: string;
  signupsOpen: boolean;
  quizMaxQuestions: number;
  quizTimeLimit: number;
  quizAutoPublish: boolean;
  rewardApprovalRequired: boolean;
  rewardMonthlyCap: number;
  creditDailyCap: number;
  creditExpiryDays: number;
  creditResetCadence: string;
  trialDays: number;
  gracePeriodDays: number;
  proratedUpgrades: boolean;
  autoModeration: boolean;
  reportThreshold: number;
  profanityFilter: boolean;
  requireMfa: boolean;
  ipAllowlist: boolean;
  sessionMinutes: number;
}
