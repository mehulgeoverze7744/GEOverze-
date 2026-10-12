import { resolveParticipantAvatarFields } from "@/features/auth/lib/avatar";
import type { MatchPlayer } from "@/features/matchmaking/data/players";

export type RoomCardParticipant = {
  user_id: string;
  username: string;
  display_name: string;
  avatar_id: string | null;
  avatar_url?: string | null | undefined;
  level?: number;
  is_host: boolean;
};

/** Map a live room participant into the shared lobby PlayerSlot shape. */
export function toMatchPlayer(
  participant: RoomCardParticipant,
  you: boolean,
  selfAvatar?: { avatarId?: string | null | undefined; avatarUrl?: string | null | undefined } | undefined,
): MatchPlayer {
  const avatar = resolveParticipantAvatarFields(participant, { you, selfAvatar });

  return {
    id: participant.user_id,
    username: participant.username,
    art: avatar.avatarId ?? avatar.avatarUrl ?? "solo",
    avatarId: avatar.avatarId,
    avatarUrl: avatar.avatarUrl,
    level: participant.level ?? 1,
    rankTitle: participant.is_host ? "Host" : "Duelist",
    country: participant.display_name,
    flag: "🌍",
    membership: "pro",
    winRate: 0,
    you,
  };
}
