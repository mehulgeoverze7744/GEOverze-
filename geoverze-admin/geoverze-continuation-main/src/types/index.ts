export type Status =
  | "active"
  | "suspended"
  | "pending"
  | "draft"
  | "published"
  | "archived"
  | "resolved"
  | "open"
  | "failed"
  | "refunded"
  | "paid"
  | "shipped"
  | "cancelled";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: Status;
  country: string;
  credits: number;
  joinedAt: string;
  lastActive: string;
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  tier: string;
  status: Status;
  quizzes: number;
  followers: number;
  revenue: number;
  appliedAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  category: string;
  author: string;
  status: Status;
  questions: number;
  plays: number;
  rating: number;
  updatedAt: string;
}

export interface Question {
  id: string;
  prompt: string;
  type: string;
  difficulty: string;
  topic: string;
  status: Status;
  usage: number;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  section: string;
  author: string;
  status: Status;
  views: number;
  readTime: number;
  updatedAt: string;
}

export interface Order {
  id: string;
  customer: string;
  product: string;
  status: Status;
  quantity: number;
  total: number;
  placedAt: string;
}

export interface Subscription {
  id: string;
  customer: string;
  plan: string;
  status: Status;
  seats: number;
  mrr: number;
  renewsAt: string;
}

export interface Payment {
  id: string;
  customer: string;
  method: string;
  status: Status;
  amount: number;
  currency: string;
  processedAt: string;
}

export interface ModerationItem {
  id: string;
  content: string;
  surface: string;
  reporter: string;
  severity: string;
  status: Status;
  createdAt: string;
}

export interface Report {
  id: string;
  subject: string;
  type: string;
  reporter: string;
  severity: string;
  status: Status;
  createdAt: string;
}

export interface Ticket {
  id: string;
  subject: string;
  requester: string;
  channel: string;
  priority: string;
  status: Status;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  result: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category:
    "System Alerts" | "Reports" | "Creator Requests" | "Support Tickets" | "Platform Alerts";
  time: string;
  unread: boolean;
}
