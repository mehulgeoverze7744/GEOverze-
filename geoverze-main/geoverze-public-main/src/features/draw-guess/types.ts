/** Server-controlled Draw & Guess room lifecycle. */
export type DrawRoomStatus = "waiting" | "ready" | "playing" | "completed" | "cancelled";

export type DrawCategory =
  | "geography_countries"
  | "capitals_flags"
  | "landmarks_monuments"
  | "maps_physical"
  | "space_astronomy"
  | "planets_universe";

export type DrawDifficulty = "easy" | "medium" | "hard";

export type DrawRoom = {
  id: string;
  room_code: string;
  host_user_id: string;
  status: DrawRoomStatus;
  rounds: 1 | 3 | 5;
  max_players: number;
  categories: DrawCategory[];
  difficulty: DrawDifficulty;
  turn_seconds: number;
  current_round: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

export type DrawParticipant = {
  user_id: string;
  username: string;
  display_name: string;
  avatar_id: string | null;
  avatar_url?: string | null;
  is_host: boolean;
  is_ready: boolean;
  joined_at: string;
  total_score: number;
  correct_count: number;
  turns_drawn: number;
  left_game: boolean;
  connected: boolean;
};

export type DrawWordOption = { id: string; word: string };

export type DrawTurnStatus = "choosing" | "drawing" | "ended";

export type DrawCurrentTurn = {
  id: string;
  round_number: number;
  turn_number: number;
  drawer_user_id: string;
  status: DrawTurnStatus;
  choose_deadline: string | null;
  turn_started_at: string | null;
  turn_ends_at: string | null;
  word_length: number | null;
  hint: string | null;
  correct_user_ids: string[];
  /** Only populated for the active drawer while status is "choosing". */
  word_options: DrawWordOption[] | null;
  /** Only populated for the active drawer. Never sent to guessers. */
  secret_word: string | null;
};

export type DrawEventType =
  | "chat"
  | "system"
  | "guess_correct"
  | "turn_result"
  | "round_result"
  | "game_result";

export type DrawEvent = {
  id: number;
  type: DrawEventType;
  user_id: string | null;
  body: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
};

export type DrawRoomState = {
  server_time: string;
  room: DrawRoom;
  participants: DrawParticipant[];
  current_turn: DrawCurrentTurn | null;
  total_turns: number;
  events: DrawEvent[];
};

export type DrawStrokePoint = { x: number; y: number };

/** For kind="stroke": an array of normalized (0..1) points. For kind="undo":
 * `{ remove_ids: number[] }`, the exact chunk ids drawn during the gesture
 * being undone. For kind="clear": always null. */
export type DrawStrokePayload = DrawStrokePoint[] | { remove_ids: number[] } | null;

export type DrawStroke = {
  id: number;
  turn_id: string;
  room_id: string;
  user_id: string;
  kind: "stroke" | "clear" | "undo";
  points: DrawStrokePayload;
  color: string | null;
  size: number | null;
  tool: "brush" | "eraser" | null;
  created_at: string;
};

export type DrawMessageResult = {
  correct: boolean;
  points: number;
  room_state: DrawRoomState;
};

export type DrawLeaveResult = {
  room_id: string;
  left: boolean;
  cancelled: boolean;
};

export type DrawRoomSearch = {
  room: string | undefined;
  code: string | undefined;
};
