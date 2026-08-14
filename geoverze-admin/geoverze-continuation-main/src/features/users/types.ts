import type { AdminUser, Status } from "@/types";

export type Membership = "Free" | "Plus" | "Premium" | "Elite";
export type CreatorStatus = "None" | "Applied" | "Approved" | "Rejected";

export interface UserAchievement {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
}

export interface UserQuizAttempt {
  id: string;
  quiz: string;
  score: number;
  accuracy: number;
  playedAt: string;
}

export interface UserPurchase {
  id: string;
  item: string;
  amount: number;
  currency: string;
  status: Status;
  purchasedAt: string;
}

export interface UserReportRecord {
  id: string;
  reason: string;
  direction: "Filed" | "Received";
  status: Status;
  createdAt: string;
}

export interface UserBookmark {
  id: string;
  title: string;
  type: "Quiz" | "Article" | "Question";
  savedAt: string;
}

export interface UserLoginEvent {
  id: string;
  device: string;
  location: string;
  ip: string;
  result: "Success" | "Failed";
  at: string;
}

export interface UserCreatorProfile {
  handle: string;
  tier: string;
  publishedQuizzes: number;
  followers: number;
  lifetimeRevenue: number;
  appliedAt: string;
}

/** Full platform user record used across the User Management module. */
export interface PlatformUser extends AdminUser {
  username: string;
  displayName: string;
  avatarSeed: string;
  membership: Membership;
  level: number;
  xp: number;
  currentStreak: number;
  creatorStatus: CreatorStatus;
  ageVerified: boolean;
  registeredAt: string;
  lastActiveAt: string;
  achievements: UserAchievement[];
  quizActivity: UserQuizAttempt[];
  purchases: UserPurchase[];
  reports: UserReportRecord[];
  bookmarks: UserBookmark[];
  loginHistory: UserLoginEvent[];
  creator?: UserCreatorProfile | undefined;
}

export interface UserFilterState {
  membership: string;
  role: string;
  country: string;
  status: string;
  creatorStatus: string;
  ageVerification: string;
  registeredWithin: string;
  lastActiveWithin: string;
  creditsMin: string;
  creditsMax: string;
  xpMin: string;
  xpMax: string;
}

export const emptyUserFilters: UserFilterState = {
  membership: "all",
  role: "all",
  country: "all",
  status: "all",
  creatorStatus: "all",
  ageVerification: "all",
  registeredWithin: "all",
  lastActiveWithin: "all",
  creditsMin: "",
  creditsMax: "",
  xpMin: "",
  xpMax: "",
};

/** Placeholder handler signature every action uses until a backend exists. */
export type UserActionHandler = (ids: string[]) => void;
