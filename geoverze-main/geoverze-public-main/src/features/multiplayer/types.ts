/** Server-controlled room lifecycle (shared with PvP). */
export type MultiplayerRoomStatus = "waiting" | "ready" | "playing" | "completed" | "cancelled";

export type MultiplayerRoom = {
  id: string;
  room_code: string;
  host_user_id: string;
  quiz_id: string;
  status: MultiplayerRoomStatus;
  room_mode: "multiplayer";
  min_players: number;
  max_players: number;
  active_player_count: number | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  rankings_finalized_at: string | null;
  rewards_settled_at: string | null;
};

export type MultiplayerParticipant = {
  id: string;
  user_id: string;
  is_ready: boolean;
  joined_at: string;
  ready_at: string | null;
  is_host: boolean;
  username: string;
  display_name: string;
  avatar_id: string | null;
  level: number;
  submitted_at: string | null;
  correct: number | null;
  total: number | null;
  score: number | null;
  best_streak: number | null;
  finish_rank: number | null;
  xp_earned: number | null;
  credits_earned: number | null;
};

export type MultiplayerRoomState = {
  room: MultiplayerRoom;
  participants: MultiplayerParticipant[];
};

export type MultiplayerLeaveResult = {
  room_id: string;
  left: boolean;
  cancelled: boolean;
};

export type MultiplayerSubmitResult = {
  correct: number;
  total: number;
  score: number;
  best_streak: number;
  duplicate: boolean;
  room_state: MultiplayerRoomState;
};

/** Host-selectable capacity for private multiplayer rooms. */
export const MULTIPLAYER_CAPACITY_OPTIONS = [
  4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
] as const;
export type MultiplayerCapacity = (typeof MULTIPLAYER_CAPACITY_OPTIONS)[number];
export const DEFAULT_MULTIPLAYER_CAPACITY: MultiplayerCapacity = 6;
