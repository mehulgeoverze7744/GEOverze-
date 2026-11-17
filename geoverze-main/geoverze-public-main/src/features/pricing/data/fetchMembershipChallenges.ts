import { supabase } from "@/lib/supabase/client";

export type MembershipChallengeRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
  status: string;
  min_access_tier: string;
  reward_credits: number;
  reward_config: Record<string, unknown>;
};

export type ChallengeParticipation = {
  challenge_id: string;
  status: string;
  joined_at: string;
  completed_at: string | null;
};

export type MembershipChallengeView = MembershipChallengeRow & {
  participation: ChallengeParticipation | null;
};

export function membershipChallengesQueryKey(userId: string | null | undefined) {
  return ["membership-challenges", userId ?? "anon"] as const;
}

/** Published challenges visible to the signed-in member via RLS. */
export async function fetchMembershipChallenges(): Promise<MembershipChallengeView[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: challenges, error } = await supabase
    .from("membership_challenges")
    .select(
      "id, slug, title, description, starts_at, ends_at, status, min_access_tier, reward_credits, reward_config",
    )
    .eq("status", "published")
    .order("starts_at", { ascending: false });

  if (error) throw new Error(error.message);

  const { data: participation, error: partError } = await supabase
    .from("challenge_participants")
    .select("challenge_id, status, joined_at, completed_at")
    .eq("user_id", user.id);

  if (partError) throw new Error(partError.message);

  const byId = new Map(
    (participation ?? []).map((row) => [row.challenge_id, row as ChallengeParticipation]),
  );

  return ((challenges ?? []) as MembershipChallengeRow[]).map((challenge) => ({
    ...challenge,
    participation: byId.get(challenge.id) ?? null,
  }));
}

export async function joinMembershipChallenge(challengeId: string) {
  const { data, error } = await supabase.rpc("join_membership_challenge", {
    _challenge_id: challengeId,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function completeMembershipChallenge(challengeId: string) {
  const { data, error } = await supabase.rpc("complete_membership_challenge", {
    _challenge_id: challengeId,
  });
  if (error) throw new Error(error.message);
  return data;
}
