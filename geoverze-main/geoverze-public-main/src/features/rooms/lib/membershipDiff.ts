export type RoomMemberLike = {
  user_id: string;
  display_name?: string | null;
  username?: string | null;
};

export type MembershipChange = {
  kind: "joined" | "left";
  userId: string;
  name: string;
};

export function memberDisplayName(member: RoomMemberLike): string {
  const display = member.display_name?.trim();
  if (display) return display;
  const username = member.username?.trim();
  if (username) return username;
  return "A player";
}

/** Diff two membership lists. First snapshot is treated as baseline (no events). */
export function diffRoomMembership(
  previous: readonly RoomMemberLike[] | null,
  next: readonly RoomMemberLike[],
  selfId?: string | null,
): MembershipChange[] {
  if (previous == null) return [];

  const prevById = new Map(previous.map((member) => [member.user_id, member]));
  const nextById = new Map(next.map((member) => [member.user_id, member]));
  const changes: MembershipChange[] = [];

  for (const member of next) {
    if (member.user_id === selfId) continue;
    if (!prevById.has(member.user_id)) {
      changes.push({ kind: "joined", userId: member.user_id, name: memberDisplayName(member) });
    }
  }

  for (const member of previous) {
    if (member.user_id === selfId) continue;
    if (!nextById.has(member.user_id)) {
      changes.push({ kind: "left", userId: member.user_id, name: memberDisplayName(member) });
    }
  }

  return changes;
}
