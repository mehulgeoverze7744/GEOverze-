/** Server-controlled PvP room lifecycle. */
export type PvpRoomStatus = "waiting" | "ready" | "playing" | "completed" | "cancelled";

export type PvpRoom = {
  id: string;
  room_code: string;
  host_user_id: string;
  quiz_id: string;
  status: PvpRoomStatus;
  max_players: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  winner_user_id: string | null;
  is_draw: boolean;
  rewards_settled_at: string | null;
};

export type PvpParticipant = {
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
  xp_earned: number | null;
  credits_earned: number | null;
};

export type PvpRoomState = {
  room: PvpRoom;
  participants: PvpParticipant[];
};

export type PvpLeaveResult = {
  room_id: string;
  left: boolean;
  cancelled: boolean;
};

export type PvpSubmitResult = {
  correct: number;
  total: number;
  score: number;
  best_streak: number;
  duplicate: boolean;
  room_state: PvpRoomState;
};
