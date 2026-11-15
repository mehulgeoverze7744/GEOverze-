import type { PlatformUser, Membership, CreatorStatus } from "@/features/users/types";
import type { Status } from "@/types";
import { adminKeys } from "@/lib/admin/keys";
import { supabase, highestRole, type AppRole } from "@/lib/supabase/client";
import { throwOnError } from "@/lib/supabase/query";

export { adminKeys };

const MEMBERSHIP_LABEL: Record<string, Membership> = {
  explorer: "Explorer",
  basic: "Basic",
  pro: "Pro",
  advance: "Advance",
};

function membershipFromTier(tier: string | null): Membership {
  if (!tier) return "Explorer";
  return MEMBERSHIP_LABEL[tier.toLowerCase()] ?? "Explorer";
}

function roleLabel(roles: AppRole[]): string {
  const top = highestRole(roles);
  if (top === "super_admin") return "Super Admin";
  if (top === "admin") return "Admin";
  if (top === "creator") return "Creator";
  return "User";
}

function creatorStatusFromRoles(roles: AppRole[]): CreatorStatus {
  return roles.includes("creator") ? "Approved" : "None";
}

function asStatus(value: string | null): Status {
  return value === "suspended" ? "suspended" : "active";
}

export type DirectoryRow = {
  id: string;
  email: string | null;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  country_code: string | null;
  status: string | null;
  age_bracket: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  xp: number;
  level: number;
  credits: number;
  total_quizzes: number;
  current_streak: number;
  last_played_date: string | null;
  roles: AppRole[];
  plan_tier: string | null;
  subscription_status: string | null;
};

export function mapDirectoryRow(row: DirectoryRow): PlatformUser {
  const roles = row.roles ?? [];
  const name = row.display_name || row.username || row.email || "Unknown";
  const lastActive = row.last_sign_in_at ?? row.last_played_date ?? row.created_at;
  return {
    id: row.id,
    name,
    email: row.email ?? "",
    role: roleLabel(roles),
    status: asStatus(row.status),
    country: (row.country_code ?? "").toUpperCase() || "—",
    credits: row.credits ?? 0,
    joinedAt: row.created_at,
    lastActive,
    username: row.username || row.email?.split("@")[0] || row.id.slice(0, 8),
    displayName: name,
    avatarSeed: row.id,
    membership: membershipFromTier(row.plan_tier),
    level: row.level ?? 1,
    xp: row.xp ?? 0,
    currentStreak: row.current_streak ?? 0,
    creatorStatus: creatorStatusFromRoles(roles),
    ageVerified: row.age_bracket != null && row.age_bracket !== "unset",
    registeredAt: row.created_at,
    lastActiveAt: lastActive,
    achievements: [],
    quizActivity: [],
    purchases: [],
    reports: [],
    bookmarks: [],
    loginHistory: [],
    creator:
      creatorStatusFromRoles(roles) === "Approved"
        ? {
            handle: `@${row.username || "creator"}`,
            tier: row.plan_tier ?? "creator",
            publishedQuizzes: 0,
            followers: 0,
            lifetimeRevenue: 0,
            appliedAt: row.created_at,
          }
        : undefined,
    appRoles: roles,
    planTier: row.plan_tier,
    bio: row.bio,
  };
}

export async function fetchUsers(): Promise<PlatformUser[]> {
  const data = throwOnError(await supabase.rpc("admin_list_directory"), "Failed to load users");
  return (data ?? []).map((row) => mapDirectoryRow(row as DirectoryRow));
}

export async function fetchUserDetail(userId: string): Promise<PlatformUser> {
  const users = await fetchUsers();
  const user = users.find((row) => row.id === userId);
  if (!user) throw new Error("User not found");

  const [attempts, orders, creditOrders, bookmarks, reports] = await Promise.all([
    supabase
      .from("quiz_attempts")
      .select("id, quiz_id, score, correct, total, completed_at")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(20),
    supabase
      .from("gstore_orders")
      .select("id, order_number, total_minor, currency, order_status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("store_orders")
      .select("id, credits_total, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("user_library_bookmarks").select("resource_id, created_at").eq("user_id", userId),
    supabase
      .from("content_reports")
      .select("id, reason, status, created_at, reporter_id")
      .or(`reporter_id.eq.${userId},target_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const quizTitles = new Map<string, string>();
  const quizIds = [...new Set((attempts.data ?? []).map((row) => row.quiz_id))];
  if (quizIds.length > 0) {
    const { data: quizzes } = await supabase.from("quizzes").select("id, title").in("id", quizIds);
    for (const quiz of quizzes ?? []) quizTitles.set(quiz.id, quiz.title);
  }

  user.quizActivity = (attempts.data ?? []).map((row) => ({
    id: row.id,
    quiz: quizTitles.get(row.quiz_id) ?? row.quiz_id,
    score: row.score,
    accuracy: row.total > 0 ? Math.round((row.correct / row.total) * 100) : 0,
    playedAt: row.completed_at,
  }));

  user.purchases = [
    ...(orders.data ?? []).map((row) => ({
      id: row.id,
      item: row.order_number,
      amount: row.total_minor / 100,
      currency: row.currency,
      status: (row.order_status === "cancelled" ? "cancelled" : "paid") as Status,
      purchasedAt: row.created_at,
    })),
    ...(creditOrders.data ?? []).map((row) => ({
      id: row.id,
      item: "Credit catalogue order",
      amount: row.credits_total,
      currency: "CREDITS",
      status: row.status as Status,
      purchasedAt: row.created_at,
    })),
  ];

  user.bookmarks = (bookmarks.data ?? []).map((row) => ({
    id: row.resource_id,
    title: row.resource_id,
    type: "Article" as const,
    savedAt: row.created_at,
  }));

  user.reports = (reports.data ?? []).map((row) => ({
    id: row.id,
    reason: row.reason,
    direction: row.reporter_id === userId ? ("Filed" as const) : ("Received" as const),
    status: row.status as Status,
    createdAt: row.created_at,
  }));

  user.loginHistory = user.lastActiveAt
    ? [
        {
          id: `last-${user.id}`,
          device: "Last known session",
          location: user.country,
          ip: "—",
          result: "Success",
          at: user.lastActiveAt,
        },
      ]
    : [];

  return user;
}

export async function setProfileStatus(userId: string, status: "active" | "suspended") {
  const result = await supabase.rpc("admin_set_profile_status", {
    _user_id: userId,
    _status: status,
  });
  throwOnError(result, "Failed to update account status");
}

export async function updateProfileFields(
  userId: string,
  fields: { displayName?: string; bio?: string; countryCode?: string },
) {
  const result = await supabase.rpc("admin_update_profile_fields", {
    _user_id: userId,
    ...(fields.displayName ? { _display_name: fields.displayName } : {}),
    ...(fields.bio ? { _bio: fields.bio } : {}),
    ...(fields.countryCode ? { _country_code: fields.countryCode } : {}),
  });
  throwOnError(result, "Failed to update profile");
}

export async function setUserRole(userId: string, role: AppRole, grant: boolean) {
  const result = await supabase.rpc("admin_set_user_role", {
    _user_id: userId,
    _role: role,
    _grant: grant,
  });
  throwOnError(result, "Failed to update role");
}

export async function adjustCredits(userId: string, amount: number, reason: string, note = "") {
  const result = await supabase.rpc("admin_adjust_credits", {
    _user_id: userId,
    _amount: amount,
    _reason: reason,
    _note: note,
  });
  throwOnError(result, "Failed to adjust credits");
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw new Error(error.message);
}
