import type { Status } from "@/types";

export type CreatorTier = "Bronze" | "Silver" | "Gold" | "Partner";
export type VerificationState = "Pending" | "Verified" | "Rejected" | "Suspended";
export type CreatorActivityState = "Active" | "Inactive";
export type CreatorQuizStatus = "published" | "draft" | "archived";

export interface CreatorQuiz {
  id: string;
  title: string;
  category: string;
  status: CreatorQuizStatus;
  plays: number;
  averageScore: number;
  completionRate: number;
  rating: number;
  updatedAt: string;
}

export interface CreatorActivity {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
}

export interface CreatorAchievement {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
}

export interface CreatorWarning {
  id: string;
  reason: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  issuedBy: string;
  issuedAt: string;
}

export interface CreatorNote {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface VerificationEvent {
  id: string;
  state: VerificationState | "Applied";
  actor: string;
  note: string;
  at: string;
}

export interface RevenuePoint {
  month: string;
  amount: number;
}

export interface CreatorRecord {
  id: string;
  displayName: string;
  username: string;
  email: string;
  country: string;
  tier: CreatorTier;
  verification: VerificationState;
  status: Status;
  activityState: CreatorActivityState;
  totalQuizzes: number;
  publishedQuizzes: number;
  draftQuizzes: number;
  followers: number;
  totalPlays: number;
  revenue: number;
  rating: number;
  joinDate: string;
  lastActiveAt: string;
  bio: string;
  website: string;
  quizzes: CreatorQuiz[];
  activity: CreatorActivity[];
  achievements: CreatorAchievement[];
  warnings: CreatorWarning[];
  notes: CreatorNote[];
  verificationTimeline: VerificationEvent[];
  revenueSeries: RevenuePoint[];
  playsSeries: number[];
}

export interface CreatorFilterState {
  tier: string;
  verification: string;
  status: string;
  country: string;
  activityState: string;
  joinedWithin: string;
}

export const emptyCreatorFilters: CreatorFilterState = {
  tier: "all",
  verification: "all",
  status: "all",
  country: "all",
  activityState: "all",
  joinedWithin: "all",
};
