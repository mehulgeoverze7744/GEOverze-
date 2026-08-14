import type {
  AdminUser,
  Article,
  AuditLog,
  Creator,
  ModerationItem,
  NotificationItem,
  Order,
  Payment,
  Question,
  Quiz,
  Report,
  Status,
  Subscription,
  Ticket,
} from "@/types";

/** Deterministic pseudo-random so SSR and client render identically. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const pick = <T>(rand: () => number, arr: T[]): T => arr[Math.floor(rand() * arr.length)] as T;

const firstNames = [
  "Amara",
  "Liam",
  "Sofia",
  "Noah",
  "Yuki",
  "Ines",
  "Mateo",
  "Priya",
  "Omar",
  "Elena",
  "Kai",
  "Nadia",
  "Tomas",
  "Aisha",
  "Lars",
  "Mira",
  "Diego",
  "Hana",
  "Ravi",
  "Clara",
];
const lastNames = [
  "Okafor",
  "Bennett",
  "Rossi",
  "Andersen",
  "Tanaka",
  "Silva",
  "Novak",
  "Sharma",
  "Haddad",
  "Petrov",
  "Lindqvist",
  "Karim",
  "Moreau",
  "Costa",
  "Dvorak",
  "Ibrahim",
  "Nguyen",
  "Weiss",
];
const countries = [
  "India",
  "United States",
  "Germany",
  "Brazil",
  "Japan",
  "Nigeria",
  "Spain",
  "Canada",
];

function date(rand: () => number, daysBack = 400) {
  const d = new Date(Date.UTC(2026, 7, 6) - Math.floor(rand() * daysBack) * 86400000);
  return d.toISOString().slice(0, 10);
}

export const users: AdminUser[] = Array.from({ length: 84 }, (_, i) => {
  const rand = rng(i + 11);
  const first = pick(rand, firstNames);
  const last = pick(rand, lastNames);
  return {
    id: `usr_${(1000 + i).toString(36)}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@geoverze.io`,
    role: pick(rand, ["Player", "Player", "Player", "Creator", "Moderator", "Admin"]),
    status: pick(rand, ["active", "active", "active", "pending", "suspended"]) as Status,
    country: pick(rand, countries),
    credits: Math.floor(rand() * 12000),
    joinedAt: date(rand),
    lastActive: date(rand, 40),
  };
});

export const creators: Creator[] = Array.from({ length: 46 }, (_, i) => {
  const rand = rng(i + 205);
  const first = pick(rand, firstNames);
  const last = pick(rand, lastNames);
  return {
    id: `crt_${(2000 + i).toString(36)}`,
    name: `${first} ${last}`,
    handle: `@${first.toLowerCase()}${Math.floor(rand() * 90 + 10)}`,
    tier: pick(rand, ["Bronze", "Silver", "Gold", "Partner"]),
    status: pick(rand, ["active", "active", "pending", "suspended"]) as Status,
    quizzes: Math.floor(rand() * 120),
    followers: Math.floor(rand() * 90000),
    revenue: Math.floor(rand() * 42000),
    appliedAt: date(rand),
  };
});

const quizTopics = [
  "World Capitals",
  "Tectonic Plates",
  "River Systems",
  "Climate Zones",
  "Cartography Basics",
  "Ocean Currents",
  "Urban Geography",
  "Population Density",
  "Volcanic Belts",
  "Desert Biomes",
  "Border Disputes",
  "Time Zones",
  "Mountain Ranges",
  "Satellite Imagery",
  "Trade Routes",
];

export const quizzes: Quiz[] = Array.from({ length: 62 }, (_, i) => {
  const rand = rng(i + 307);
  return {
    id: `qz_${(3000 + i).toString(36)}`,
    title: `${pick(rand, quizTopics)} — Level ${Math.floor(rand() * 5) + 1}`,
    category: pick(rand, ["Physical", "Human", "Political", "Economic", "Cartography"]),
    author: `${pick(rand, firstNames)} ${pick(rand, lastNames)}`,
    status: pick(rand, ["published", "published", "draft", "pending", "archived"]) as Status,
    questions: Math.floor(rand() * 40) + 5,
    plays: Math.floor(rand() * 250000),
    rating: Math.round((3 + rand() * 2) * 10) / 10,
    updatedAt: date(rand, 120),
  };
});

export const questions: Question[] = Array.from({ length: 96 }, (_, i) => {
  const rand = rng(i + 409);
  return {
    id: `qs_${(4000 + i).toString(36)}`,
    prompt: `Which ${pick(rand, ["country", "river", "range", "city", "strait"])} is associated with ${pick(rand, quizTopics)}?`,
    type: pick(rand, ["Multiple Choice", "Map Pin", "True / False", "Ordering"]),
    difficulty: pick(rand, ["Easy", "Medium", "Hard", "Expert"]),
    topic: pick(rand, quizTopics),
    status: pick(rand, ["published", "draft", "pending", "archived"]) as Status,
    usage: Math.floor(rand() * 900),
    updatedAt: date(rand, 90),
  };
});

export const articles: Article[] = Array.from({ length: 38 }, (_, i) => {
  const rand = rng(i + 511);
  return {
    id: `art_${(5000 + i).toString(36)}`,
    title: `Field notes on ${pick(rand, quizTopics)}`,
    section: pick(rand, ["Atlas", "Explainers", "Data Stories", "Field Notes"]),
    author: `${pick(rand, firstNames)} ${pick(rand, lastNames)}`,
    status: pick(rand, ["published", "draft", "pending", "archived"]) as Status,
    views: Math.floor(rand() * 140000),
    readTime: Math.floor(rand() * 14) + 3,
    updatedAt: date(rand, 200),
  };
});

const products = [
  "Atlas Poster Set",
  "GEO Credits 500",
  "Explorer Hoodie",
  "Globe Desk Lamp",
  "Field Notebook",
  "Premium Pass",
];

export const orders: Order[] = Array.from({ length: 58 }, (_, i) => {
  const rand = rng(i + 613);
  const quantity = Math.floor(rand() * 4) + 1;
  return {
    id: `ord_${(6000 + i).toString(36)}`,
    customer: `${pick(rand, firstNames)} ${pick(rand, lastNames)}`,
    product: pick(rand, products),
    status: pick(rand, ["paid", "shipped", "pending", "refunded", "cancelled"]) as Status,
    quantity,
    total: quantity * (Math.floor(rand() * 80) + 12),
    placedAt: date(rand, 120),
  };
});

export const subscriptions: Subscription[] = Array.from({ length: 44 }, (_, i) => {
  const rand = rng(i + 715);
  const seats = Math.floor(rand() * 40) + 1;
  return {
    id: `sub_${(7000 + i).toString(36)}`,
    customer: `${pick(rand, lastNames)} ${pick(rand, ["Academy", "Schools", "Institute", "Labs"])}`,
    plan: pick(rand, ["Explorer", "Pro", "Campus", "Enterprise"]),
    status: pick(rand, ["active", "active", "pending", "cancelled"]) as Status,
    seats,
    mrr: seats * (Math.floor(rand() * 20) + 6),
    renewsAt: date(rand, 60),
  };
});

export const payments: Payment[] = Array.from({ length: 66 }, (_, i) => {
  const rand = rng(i + 817);
  return {
    id: `pay_${(8000 + i).toString(36)}`,
    customer: `${pick(rand, firstNames)} ${pick(rand, lastNames)}`,
    method: pick(rand, ["Card", "UPI", "PayPal", "Bank Transfer", "Apple Pay"]),
    status: pick(rand, ["paid", "paid", "pending", "failed", "refunded"]) as Status,
    amount: Math.floor(rand() * 1400) + 9,
    currency: pick(rand, ["USD", "EUR", "INR"]),
    processedAt: date(rand, 90),
  };
});

export const moderationQueue: ModerationItem[] = Array.from({ length: 40 }, (_, i) => {
  const rand = rng(i + 919);
  return {
    id: `mod_${(9000 + i).toString(36)}`,
    content: pick(rand, [
      "Comment flagged for harassment",
      "Quiz description contains spam links",
      "Profile bio violates naming policy",
      "Forum post with off-topic promotion",
      "Uploaded map image copyright claim",
    ]),
    surface: pick(rand, ["Comments", "Quizzes", "Profiles", "Forum", "Uploads"]),
    reporter: `${pick(rand, firstNames)} ${pick(rand, lastNames)}`,
    severity: pick(rand, ["Low", "Medium", "High", "Critical"]),
    status: pick(rand, ["open", "pending", "resolved"]) as Status,
    createdAt: date(rand, 30),
  };
});

export const reports: Report[] = Array.from({ length: 52 }, (_, i) => {
  const rand = rng(i + 1021);
  return {
    id: `rep_${(10000 + i).toString(36)}`,
    subject: pick(rand, [
      "Incorrect answer key",
      "Abusive user behaviour",
      "Broken map layer",
      "Duplicate quiz content",
      "Payment not credited",
    ]),
    type: pick(rand, ["Content", "User", "Technical", "Billing"]),
    reporter: `${pick(rand, firstNames)} ${pick(rand, lastNames)}`,
    severity: pick(rand, ["Low", "Medium", "High", "Critical"]),
    status: pick(rand, ["open", "pending", "resolved"]) as Status,
    createdAt: date(rand, 45),
  };
});

export const tickets: Ticket[] = Array.from({ length: 48 }, (_, i) => {
  const rand = rng(i + 1123);
  return {
    id: `tkt_${(11000 + i).toString(36)}`,
    subject: pick(rand, [
      "Cannot redeem credits",
      "Creator payout delayed",
      "Account recovery request",
      "Store order missing",
      "Quiz progress reset",
    ]),
    requester: `${pick(rand, firstNames)} ${pick(rand, lastNames)}`,
    channel: pick(rand, ["Email", "In-app", "Discord", "Web form"]),
    priority: pick(rand, ["Low", "Medium", "High", "Critical"]),
    status: pick(rand, ["open", "pending", "resolved"]) as Status,
    updatedAt: date(rand, 20),
  };
});

export const auditLogs: AuditLog[] = Array.from({ length: 70 }, (_, i) => {
  const rand = rng(i + 1225);
  return {
    id: `log_${(12000 + i).toString(36)}`,
    actor: `${pick(rand, firstNames)} ${pick(rand, lastNames)}`,
    action: pick(rand, [
      "user.suspend",
      "quiz.publish",
      "role.update",
      "payment.refund",
      "settings.update",
      "creator.approve",
    ]),
    target: `${pick(rand, ["usr", "qz", "pay", "crt"])}_${Math.floor(rand() * 9000 + 1000).toString(36)}`,
    ip: `${Math.floor(rand() * 200) + 10}.${Math.floor(rand() * 250)}.${Math.floor(rand() * 250)}.${Math.floor(rand() * 250)}`,
    result: pick(rand, ["success", "success", "success", "denied"]),
    createdAt: date(rand, 30),
  };
});

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Elevated API error rate",
    description: "Quiz service returned 4.2% 5xx over the last 15 minutes.",
    category: "Platform Alerts",
    time: "2m ago",
    unread: true,
  },
  {
    id: "n2",
    title: "12 new content reports",
    description: "Community moderation queue crossed the review threshold.",
    category: "Reports",
    time: "18m ago",
    unread: true,
  },
  {
    id: "n3",
    title: "5 creator applications pending",
    description: "Applications waiting more than 48 hours for review.",
    category: "Creator Requests",
    time: "1h ago",
    unread: true,
  },
  {
    id: "n4",
    title: "Support backlog rising",
    description: "Open tickets up 22% week over week.",
    category: "Support Tickets",
    time: "3h ago",
    unread: false,
  },
  {
    id: "n5",
    title: "Scheduled maintenance window",
    description: "Database failover drill on Sunday 02:00 UTC.",
    category: "System Alerts",
    time: "Yesterday",
    unread: false,
  },
];

export const recentActivity = auditLogs.slice(0, 8).map((log) => ({
  id: log.id,
  actor: log.actor,
  action: log.action.replace(".", " "),
  target: log.target,
  time: log.createdAt,
}));

export const dashboardMetrics = [
  { label: "Total Users", value: "2,481,930", delta: 4.2, hint: "vs last month" },
  { label: "Daily Active Users", value: "184,204", delta: 2.1, hint: "vs yesterday" },
  { label: "Monthly Active Users", value: "912,776", delta: 6.8, hint: "vs last month" },
  { label: "Creators", value: "12,408", delta: 1.4, hint: "vs last month" },
  { label: "Published Quizzes", value: "48,219", delta: 3.6, hint: "vs last month" },
  { label: "Questions", value: "612,884", delta: 5.1, hint: "in question bank" },
  { label: "Articles", value: "3,942", delta: 0.9, hint: "GEOlibrary" },
  { label: "Store Orders", value: "18,663", delta: -1.8, hint: "last 30 days" },
  { label: "Revenue", value: "$1,284,510", delta: 7.3, hint: "last 30 days" },
  { label: "Credits Issued", value: "94,120,000", delta: 3.2, hint: "lifetime" },
  { label: "Credits Redeemed", value: "71,449,320", delta: 4.7, hint: "lifetime" },
  { label: "Pending Reports", value: "428", delta: 12.4, hint: "needs triage" },
  { label: "Open Support Tickets", value: "196", delta: -6.2, hint: "SLA 24h" },
  { label: "Creator Applications", value: "87", delta: 9.1, hint: "awaiting review" },
];
