import type { MatchPlayer } from "@/features/matchmaking/data/players";
import type { PvpParticipant } from "../types";

/** Map a live PvP participant into the shared lobby PlayerSlot shape. */
export function toMatchPlayer(participant: PvpParticipant, you: boolean): MatchPlayer {
  return {
    id: participant.user_id,
    username: participant.username,
    art: participant.avatar_id ?? "solo",
    level: participant.level,
    rankTitle: participant.is_host ? "Host" : "Duelist",
    country: participant.display_name,
    flag: "🌍",
    membership: "pro",
    winRate: 0,
    you,
  };
}
