import {
  allCountries,
  catalogDaysAgo,
  libraryCategories,
  pickFrom,
  quizCategories,
  regions,
  rng,
  storeCategories,
} from "@/lib/catalog";
import {
  auditCategories,
  notificationAudiences,
  notificationChannels,
  notificationTypes,
  type ActiveSession,
  type AdminNotification,
  type AuditCategory,
  type AuditEvent,
  type AuditResult,
  type NotificationTemplate,
  type NotificationType,
  type PlatformSettings,
  type ReportRow,
  type ServiceHealth,
  type StorageBucket,
} from "@/features/ops/types";

const actors = [
  { name: "Amara Osei", role: "Super Admin" },
  { name: "Lucas Ferreira", role: "Content Admin" },
  { name: "Mika Tanaka", role: "Moderator" },
  { name: "Sofia Marín", role: "Support Lead" },
  { name: "Noah Bergström", role: "Finance Admin" },
  { name: "Priya Raman", role: "Platform Engineer" },
];

const actionsByCategory: Record<AuditCategory, string[]> = {
  User: ["user.updated", "user.suspended", "user.restored", "user.email_changed"],
  Creator: ["creator.verified", "creator.rejected", "creator.tier_changed", "creator.suspended"],
  Quiz: ["quiz.published", "quiz.archived", "quiz.updated", "quiz.duplicated"],
  Question: ["question.created", "question.updated", "question.archived", "question.bulk_import"],
  Store: ["product.updated", "order.refunded", "coupon.created", "inventory.adjusted"],
  Reward: ["reward.created", "reward.paused", "claim.approved", "credits.granted"],
  Admin: ["admin.invited", "admin.removed", "admin.login", "export.requested"],
  Permission: ["role.created", "role.updated", "permission.granted", "permission.revoked"],
  Settings: [
    "settings.updated",
    "feature_flag.toggled",
    "maintenance.enabled",
    "security.policy_changed",
  ],
};

const channels = ["Console", "API", "Automation", "CLI"];

function buildAuditEvents(): AuditEvent[] {
  const rand = rng(90210);
  return Array.from({ length: 260 }, (_, index) => {
    const actor = pickFrom(rand, actors);
    const category = pickFrom(rand, auditCategories);
    const action = pickFrom(rand, actionsByCategory[category]);
    const roll = rand();
    const result: AuditResult = roll > 0.93 ? "denied" : roll > 0.88 ? "failed" : "success";
    return {
      id: `AUD-${(4000 + index).toString()}`,
      at: catalogDaysAgo(Math.floor(rand() * 90), Math.floor(rand() * 23)),
      actor: actor.name,
      actorRole: actor.role,
      category,
      action,
      target: `${category.toLowerCase()}:${Math.floor(rand() * 9000 + 1000)}`,
      result,
      ip: `${Math.floor(rand() * 200 + 20)}.${Math.floor(rand() * 250)}.${Math.floor(
        rand() * 250,
      )}.${Math.floor(rand() * 250)}`,
      channel: pickFrom(rand, channels),
      details:
        result === "success"
          ? `${action.replace(".", " ")} completed by ${actor.name}.`
          : `${action.replace(".", " ")} ${result} — policy check on ${category.toLowerCase()} scope.`,
    } satisfies AuditEvent;
  }).sort((a, b) => (a.at < b.at ? 1 : -1));
}

export const auditEvents = buildAuditEvents();

export const auditActors = [...new Set(auditEvents.map((event) => event.actor))].sort();

export interface AuditSummary {
  total: number;
  denied: number;
  failed: number;
  actors: number;
  last24h: number;
}

export function summarizeAudit(list: AuditEvent[]): AuditSummary {
  const cutoff = catalogDaysAgo(1, 0);
  return {
    total: list.length,
    denied: list.filter((event) => event.result === "denied").length,
    failed: list.filter((event) => event.result === "failed").length,
    actors: new Set(list.map((event) => event.actor)).size,
    last24h: list.filter((event) => event.at >= cutoff).length,
  };
}

const notificationTitles: Record<NotificationType, string[]> = {
  alert: [
    "Payment provider degraded",
    "Spike in reported content",
    "Storage nearing capacity",
    "Failed export job",
  ],
  warning: [
    "Creator verification backlog",
    "Credit issuance above forecast",
    "Elevated refund rate",
    "Slow question bank queries",
  ],
  success: [
    "Nightly backup completed",
    "Season rewards distributed",
    "Quiz index rebuilt",
    "Subscription invoices settled",
  ],
  announcement: [
    "New GEOlibrary collection live",
    "Scheduled maintenance window",
    "Autumn tournament opens",
    "Creator payout policy update",
  ],
};

function buildNotifications(): AdminNotification[] {
  const rand = rng(4711);
  return Array.from({ length: 48 }, (_, index) => {
    const type = pickFrom(rand, notificationTypes);
    const roll = rand();
    const status =
      roll > 0.82 ? "scheduled" : roll > 0.74 ? "draft" : roll > 0.7 ? "failed" : "sent";
    const days = Math.floor(rand() * 40);
    const recipients = Math.floor(rand() * 48000) + 400;
    return {
      id: `NTF-${(2200 + index).toString()}`,
      title: pickFrom(rand, notificationTitles[type]),
      body: "Operations broadcast generated from the control center. Mock content until the messaging service is connected.",
      type,
      audience: pickFrom(rand, notificationAudiences),
      channel: pickFrom(rand, notificationChannels),
      status,
      scheduledFor: status === "scheduled" ? catalogDaysAgo(-days, 10) : catalogDaysAgo(days, 10),
      sentAt: status === "sent" ? catalogDaysAgo(days, 11) : null,
      recipients: status === "sent" ? recipients : 0,
      openRate: status === "sent" ? Math.round(rand() * 45 + 25) : 0,
      createdBy: pickFrom(rand, actors).name,
    } satisfies AdminNotification;
  });
}

export const adminNotifications = buildNotifications();

export const scheduledNotifications = adminNotifications
  .filter((item) => item.status === "scheduled")
  .sort((a, b) => (a.scheduledFor < b.scheduledFor ? -1 : 1));

export const notificationHistory = adminNotifications
  .filter((item) => item.status === "sent" || item.status === "failed")
  .sort((a, b) => (a.scheduledFor < b.scheduledFor ? 1 : -1));

export const notificationTemplates: NotificationTemplate[] = [
  {
    id: "TPL-01",
    name: "Maintenance window",
    type: "announcement",
    channel: "In-app",
    subject: "Scheduled maintenance on {{date}}",
    body: "GEOverze will be unavailable from {{start}} to {{end}} while we ship improvements.",
    updatedAt: catalogDaysAgo(12),
    usageCount: 18,
  },
  {
    id: "TPL-02",
    name: "Creator approved",
    type: "success",
    channel: "Email",
    subject: "You are now a verified GEOverze creator",
    body: "Congratulations {{creator}} — your verification is complete and publishing is unlocked.",
    updatedAt: catalogDaysAgo(31),
    usageCount: 246,
  },
  {
    id: "TPL-03",
    name: "Content removed",
    type: "warning",
    channel: "In-app",
    subject: "Your content was removed",
    body: "The item {{target}} was removed after a moderation review for {{reason}}.",
    updatedAt: catalogDaysAgo(7),
    usageCount: 94,
  },
  {
    id: "TPL-04",
    name: "Incident alert",
    type: "alert",
    channel: "Push",
    subject: "Service disruption",
    body: "We are investigating an incident affecting {{service}}. Follow status for updates.",
    updatedAt: catalogDaysAgo(3),
    usageCount: 11,
  },
  {
    id: "TPL-05",
    name: "Credit balance reset",
    type: "announcement",
    channel: "Email",
    subject: "Your monthly GEOcredits have refreshed",
    body: "{{credits}} credits were added to your balance for {{month}}.",
    updatedAt: catalogDaysAgo(21),
    usageCount: 132,
  },
];

export const serviceHealth: ServiceHealth[] = [
  {
    id: "SVC-web",
    name: "Web application",
    status: "operational",
    uptime: 99.98,
    latencyMs: 182,
    errorRate: 0.11,
    region: "Global edge",
  },
  {
    id: "SVC-api",
    name: "Public API",
    status: "operational",
    uptime: 99.94,
    latencyMs: 224,
    errorRate: 0.28,
    region: "eu-west",
  },
  {
    id: "SVC-quiz",
    name: "Quiz engine",
    status: "degraded",
    uptime: 99.42,
    latencyMs: 461,
    errorRate: 1.24,
    region: "us-east",
  },
  {
    id: "SVC-media",
    name: "Media delivery",
    status: "operational",
    uptime: 99.99,
    latencyMs: 96,
    errorRate: 0.04,
    region: "Global edge",
  },
  {
    id: "SVC-billing",
    name: "Billing worker",
    status: "operational",
    uptime: 99.9,
    latencyMs: 310,
    errorRate: 0.19,
    region: "eu-west",
  },
  {
    id: "SVC-search",
    name: "Search index",
    status: "outage",
    uptime: 97.8,
    latencyMs: 0,
    errorRate: 100,
    region: "ap-south",
  },
];

export const storageBuckets: StorageBucket[] = [
  { id: "BKT-media", name: "Quiz media", usedGb: 812, capacityGb: 1024, objects: 184_302 },
  { id: "BKT-library", name: "GEOlibrary assets", usedGb: 465, capacityGb: 1024, objects: 92_140 },
  { id: "BKT-store", name: "Store imagery", usedGb: 128, capacityGb: 512, objects: 21_884 },
  { id: "BKT-exports", name: "Exports & backups", usedGb: 341, capacityGb: 2048, objects: 4_910 },
];

function buildSessions(): ActiveSession[] {
  const rand = rng(31337);
  const devices = ["Chrome · macOS", "Safari · iPadOS", "Edge · Windows", "Firefox · Linux"];
  return Array.from({ length: 14 }, (_, index) => {
    const actor = pickFrom(rand, actors);
    return {
      id: `SES-${(700 + index).toString()}`,
      admin: actor.name,
      role: actor.role,
      ip: `${Math.floor(rand() * 200 + 20)}.${Math.floor(rand() * 250)}.12.${Math.floor(rand() * 250)}`,
      location: pickFrom(rand, allCountries),
      device: pickFrom(rand, devices),
      startedAt: catalogDaysAgo(0, Math.floor(rand() * 8)),
      lastSeen: catalogDaysAgo(0, 9 + Math.floor(rand() * 6)),
    } satisfies ActiveSession;
  });
}

export const activeSessions = buildSessions();

export const performanceTrend = [62, 58, 65, 61, 70, 66, 72, 68, 74, 71, 77, 73];
export const errorRateTrend = [12, 9, 14, 8, 11, 7, 10, 6, 9, 5, 8, 6];
export const requestVolumeTrend = [44, 51, 47, 58, 55, 64, 61, 72, 69, 78, 75, 84];

/** Deterministic report rows shared by every BI breakdown table. */
function buildRows(seed: number, labels: string[], scale: number, unit: string): ReportRow[] {
  const rand = rng(seed);
  return labels
    .map((label, index) => ({
      id: `${seed}-${index}`,
      label,
      primary: Math.round(rand() * scale + scale * 0.2),
      secondary: Math.round(rand() * scale * 0.4 + scale * 0.05),
      change: Math.round((rand() * 40 - 12) * 10) / 10,
      meta: unit,
    }))
    .sort((a, b) => b.primary - a.primary);
}

export const biReports = {
  countries: buildRows(101, allCountries, 42_000, "sessions"),
  categories: buildRows(202, quizCategories, 26_000, "plays"),
  regions: buildRows(303, regions, 68_000, "sessions"),
  libraryCategories: buildRows(404, [...libraryCategories], 18_000, "views"),
  storeCategories: buildRows(505, [...storeCategories], 14_000, "revenue"),
};

export const growthSeries = {
  users: [42, 48, 51, 57, 62, 66, 71, 76, 80, 86, 91, 97],
  creators: [18, 21, 24, 27, 29, 34, 38, 41, 46, 52, 57, 63],
  quizzes: [30, 34, 39, 43, 48, 53, 59, 62, 68, 74, 79, 85],
  revenue: [36, 41, 45, 52, 49, 58, 64, 69, 73, 81, 86, 94],
  retention: [100, 74, 61, 53, 48, 44, 41, 38, 36, 34, 33, 31],
  activity: [55, 61, 58, 67, 64, 73, 70, 79, 76, 84, 82, 90],
};

export const defaultSettings: PlatformSettings = {
  platformName: "GEOverze",
  supportEmail: "support@geoverze.io",
  defaultLocale: "en-US",
  timezone: "UTC",
  tagline: "Explore the world, one question at a time.",
  primaryColor: "#B07A3C",
  logoUrl: "https://cdn.geoverze.io/brand/logo.svg",
  maintenanceMode: false,
  maintenanceNote: "",
  signupsOpen: true,
  quizMaxQuestions: 40,
  quizTimeLimit: 20,
  quizAutoPublish: false,
  rewardApprovalRequired: true,
  rewardMonthlyCap: 5,
  creditDailyCap: 500,
  creditExpiryDays: 365,
  creditResetCadence: "Monthly",
  trialDays: 14,
  gracePeriodDays: 7,
  proratedUpgrades: true,
  autoModeration: true,
  reportThreshold: 5,
  profanityFilter: true,
  requireMfa: true,
  ipAllowlist: false,
  sessionMinutes: 60,
};

export const featureFlags = [
  {
    id: "f1",
    name: "Creator marketplace",
    description: "Public creator storefronts",
    on: true,
    rollout: "100%",
  },
  {
    id: "f2",
    name: "Map-pin questions",
    description: "Interactive map answer type",
    on: true,
    rollout: "100%",
  },
  {
    id: "f3",
    name: "Live tournaments",
    description: "Scheduled realtime events",
    on: false,
    rollout: "0%",
  },
  {
    id: "f4",
    name: "AI question drafting",
    description: "Assisted question authoring",
    on: false,
    rollout: "10% internal",
  },
  {
    id: "f5",
    name: "Credit auto top-up",
    description: "Recurring credit purchases",
    on: true,
    rollout: "25%",
  },
  {
    id: "f6",
    name: "GEOlibrary comments",
    description: "Reader discussion threads",
    on: false,
    rollout: "Beta cohort",
  },
];
