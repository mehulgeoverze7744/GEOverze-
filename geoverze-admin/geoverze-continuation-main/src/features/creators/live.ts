import { fetchLibraryCreators } from "@/features/ops/api";
import { fetchQuizzes } from "@/features/quizzes/data/fetchQuizzes";
import type { QuizRecord } from "@/features/quizzes/types";
import { fetchUsers, setProfileStatus, setUserRole } from "@/features/users/api";
import type { PlatformUser } from "@/features/users/types";
import { daysSince } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";

import type {
  CreatorQuiz,
  CreatorRecord,
  CreatorTier,
  VerificationState,
} from "@/features/creators/types";

function mapTier(role: string | null | undefined): CreatorTier {
  const value = (role ?? "").toLowerCase();
  if (value.includes("partner")) return "Partner";
  if (value.includes("gold")) return "Gold";
  if (value.includes("silver")) return "Silver";
  return "Bronze";
}

function quizStatus(status: QuizRecord["status"]): CreatorQuiz["status"] {
  if (status === "archived") return "archived";
  if (status === "published") return "published";
  return "draft";
}

function quizzesFor(name: string, quizzes: QuizRecord[]): CreatorQuiz[] {
  const key = name.trim().toLowerCase();
  return quizzes
    .filter((quiz) => quiz.creator.trim().toLowerCase() === key)
    .map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      category: quiz.category,
      status: quizStatus(quiz.status),
      plays: quiz.plays,
      averageScore: quiz.averageScore,
      completionRate: quiz.completionRate,
      rating: quiz.rating,
      updatedAt: quiz.updatedAt,
    }));
}

function activityState(lastActiveAt: string | null | undefined): CreatorRecord["activityState"] {
  return daysSince(lastActiveAt) <= 14 ? "Active" : "Inactive";
}

function mapFromLibrary(
  row: {
    handle: string;
    display_name: string;
    bio: string;
    location: string | null;
    role: string;
    verified: boolean;
    joined_at: string;
    updated_at: string;
    user_id: string | null;
  },
  user: PlatformUser | undefined,
  quizzes: QuizRecord[],
): CreatorRecord {
  const related = quizzesFor(row.display_name, quizzes);
  const verification: VerificationState = user?.status === "suspended"
    ? "Suspended"
    : row.verified
      ? "Verified"
      : "Pending";
  return {
    id: row.user_id ?? `library:${row.handle}`,
    displayName: row.display_name,
    username: row.handle,
    email: user?.email ?? "",
    country: user?.country && user.country !== "—" ? user.country : row.location ?? "—",
    tier: mapTier(row.role),
    verification,
    status: user?.status === "suspended" ? "suspended" : verification === "Pending" ? "pending" : "active",
    activityState: activityState(user?.lastActiveAt ?? row.updated_at),
    totalQuizzes: related.length,
    publishedQuizzes: related.filter((quiz) => quiz.status === "published").length,
    draftQuizzes: related.filter((quiz) => quiz.status === "draft").length,
    followers: 0,
    totalPlays: related.reduce((sum, quiz) => sum + quiz.plays, 0),
    revenue: 0,
    rating:
      related.length > 0
        ? Math.round((related.reduce((sum, quiz) => sum + quiz.rating, 0) / related.length) * 10) / 10
        : 0,
    joinDate: row.joined_at,
    lastActiveAt: user?.lastActiveAt ?? row.updated_at,
    bio: row.bio,
    website: "",
    quizzes: related,
    activity: [],
    achievements: [],
    warnings: [],
    notes: [],
    verificationTimeline: [
      {
        id: `${row.handle}-joined`,
        state: "Applied",
        actor: "system",
        note: "Library creator record",
        at: row.joined_at,
      },
    ],
    revenueSeries: [],
    playsSeries: [],
  };
}

function mapFromUser(user: PlatformUser, quizzes: QuizRecord[]): CreatorRecord {
  const related = quizzesFor(user.displayName, quizzes);
  return {
    id: user.id,
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    country: user.country,
    tier: "Bronze",
    verification: user.status === "suspended" ? "Suspended" : "Verified",
    status: user.status === "suspended" ? "suspended" : "active",
    activityState: activityState(user.lastActiveAt),
    totalQuizzes: related.length,
    publishedQuizzes: related.filter((quiz) => quiz.status === "published").length,
    draftQuizzes: related.filter((quiz) => quiz.status === "draft").length,
    followers: 0,
    totalPlays: related.reduce((sum, quiz) => sum + quiz.plays, 0),
    revenue: 0,
    rating:
      related.length > 0
        ? Math.round((related.reduce((sum, quiz) => sum + quiz.rating, 0) / related.length) * 10) / 10
        : 0,
    joinDate: user.registeredAt,
    lastActiveAt: user.lastActiveAt,
    bio: user.bio ?? "",
    website: "",
    quizzes: related,
    activity: [],
    achievements: [],
    warnings: [],
    notes: [],
    verificationTimeline: [],
    revenueSeries: [],
    playsSeries: [],
  };
}

export async function fetchMappedCreators(): Promise<CreatorRecord[]> {
  const [users, libraryCreators, quizzes] = await Promise.all([
    fetchUsers(),
    fetchLibraryCreators(),
    fetchQuizzes(),
  ]);

  const seen = new Set<string>();
  const records: CreatorRecord[] = [];

  for (const row of libraryCreators) {
    const user = row.user_id ? users.find((item) => item.id === row.user_id) : undefined;
    if (row.user_id) seen.add(row.user_id);
    records.push(mapFromLibrary(row, user, quizzes));
  }

  for (const user of users) {
    if (user.creatorStatus !== "Approved" || seen.has(user.id)) continue;
    records.push(mapFromUser(user, quizzes));
  }

  return records;
}

export async function setCreatorVerification(creator: CreatorRecord, state: VerificationState) {
  const handle = creator.username.replace(/^@/, "");
  await supabase
    .from("library_creators")
    .update({
      verified: state === "Verified",
      updated_at: new Date().toISOString(),
    })
    .eq("handle", handle);

  if (!creator.id.startsWith("library:")) {
    if (state === "Verified") await setUserRole(creator.id, "creator", true);
    if (state === "Rejected") await setUserRole(creator.id, "creator", false);
    if (state === "Suspended") await setProfileStatus(creator.id, "suspended");
    if (state === "Verified" || state === "Pending") await setProfileStatus(creator.id, "active");
  }

  await supabase.rpc("admin_write_audit_log", {
    _action: `creator.${state.toLowerCase()}`,
    _entity_type: "creator",
    _entity_id: creator.id,
    _metadata: { handle },
  });
}

export async function setCreatorTier(creator: CreatorRecord, tier: CreatorTier) {
  const handle = creator.username.replace(/^@/, "");
  await supabase
    .from("library_creators")
    .update({ role: tier.toLowerCase(), updated_at: new Date().toISOString() })
    .eq("handle", handle);
  await supabase.rpc("admin_write_audit_log", {
    _action: "creator.tier_changed",
    _entity_type: "creator",
    _entity_id: creator.id,
    _metadata: { handle, tier },
  });
}
