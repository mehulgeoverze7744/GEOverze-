// ─────────────────────────────────────────────────────────────────────────────
// Geography Imposter — TypeScript types
// These mirror the Supabase schema defined in the GI-1 migration.
// ─────────────────────────────────────────────────────────────────────────────

export type ImpRoomStatus = "waiting" | "ready" | "playing" | "completed" | "cancelled";
export type ImpGamePhase = "clue" | "discussion" | "voting" | "finalizing" | "reveal";
export type ImpWordCategory =
  | "geography_countries"
  | "capitals_flags"
  | "landmarks_monuments"
  | "maps_physical"
  | "space_astronomy"
  | "planets_universe";
export type ImpDifficulty = "easy" | "medium" | "hard";
export type ImpPlayerRole = "regular" | "imposter";

// ── Room ────────────────────────────────────────────────────────────────────

export interface ImpRoom {
  id: string;
  room_code: string;
  host_user_id: string;
  status: ImpRoomStatus;
  phase: ImpGamePhase | null;
  current_round: number;       // 0 = not started; 1-3 = active
  current_clue_index: number;  // index into clue_order_N
  phase_deadline: string | null;
  imposter_caught: boolean | null;
  max_players: number;
  category: ImpWordCategory | null;
  difficulty: ImpDifficulty;
  clue_turn_seconds: number;
  clue_order_1: string[];
  clue_order_2: string[];
  clue_order_3: string[];
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

// ── Participant ──────────────────────────────────────────────────────────────

export interface ImpParticipant {
  user_id: string;
  is_host: boolean;
  is_ready: boolean;
  is_excluded: boolean;
  last_seen_at: string;
  joined_at: string;
  display_name: string;
  avatar_id: string | null;
  avatar_url?: string | null;
}

// ── Clue ────────────────────────────────────────────────────────────────────

export interface ImpClue {
  id: string;
  user_id: string;
  round_number: number;
  clue_text: string | null;
  skipped: boolean;
  submitted_at: string;
}

// ── Chat ────────────────────────────────────────────────────────────────────

export interface ImpChatMessage {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
}

// ── Private info (own role + word only) ──────────────────────────────────────

export interface ImpPrivateInfo {
  role: ImpPlayerRole;
  received_word: string;
}

// ── Vote status ──────────────────────────────────────────────────────────────

/** During voting — counts only, individual votes hidden */
export interface ImpVoteStatusActive {
  voted_count: number;
  eligible_count: number;
  you_have_voted: boolean;
}

/** After reveal — full distribution visible */
export interface ImpVoteStatusReveal {
  voted_count: number;
  eligible_count: number;
  /** target_user_id → vote_count */
  distribution: Record<string, number>;
  you_voted_for: string | null;
}

export type ImpVoteStatus = ImpVoteStatusActive | ImpVoteStatusReveal;

export function isRevealVoteStatus(v: ImpVoteStatus): v is ImpVoteStatusReveal {
  return "distribution" in v;
}

// ── Score (included in reveal) ───────────────────────────────────────────────

export interface ImpScore {
  user_id: string;
  role: ImpPlayerRole | null;
  clues_submitted: number;
  vote_target_id: string | null;
  vote_correct: boolean | null;
  points_for_vote: number;
  imposter_escaped: boolean;
  escape_bonus: number;
  total_points: number;
}

// ── Reveal ──────────────────────────────────────────────────────────────────

export interface ImpReveal {
  imposter_user_id: string;
  actual_word: string;
  imposter_word: string;
  imposter_caught: boolean;
  scores: ImpScore[];
}

// ── Full room state (returned by build_imp_room_state) ───────────────────────

export interface ImpRoomState {
  server_time: string;
  room: ImpRoom;
  participants: ImpParticipant[];
  clues: ImpClue[];
  chat: ImpChatMessage[];
  private_info: ImpPrivateInfo | null;
  vote_status: ImpVoteStatus | null;
  reveal: ImpReveal | null;
}

// ── Category metadata (client-side display only) ─────────────────────────────

export interface ImpCategoryMeta {
  value: ImpWordCategory | null;
  label: string;
  emoji: string;
}

export const IMP_CATEGORIES: ImpCategoryMeta[] = [
  { value: null, label: "Mixed (All Categories)", emoji: "🌐" },
  { value: "geography_countries", label: "Countries & Regions", emoji: "🗺️" },
  { value: "capitals_flags", label: "Capitals & Flags", emoji: "🏛️" },
  { value: "landmarks_monuments", label: "Landmarks & Monuments", emoji: "🗼" },
  { value: "maps_physical", label: "Physical Geography", emoji: "⛰️" },
  { value: "space_astronomy", label: "Space & Astronomy", emoji: "🔭" },
  { value: "planets_universe", label: "Planets & Universe", emoji: "🪐" },
];

export const IMP_DIFFICULTIES: { value: ImpDifficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export const IMP_CAPACITY_OPTIONS = [3, 4, 5, 6, 7, 8, 10, 12, 16] as const;
export type ImpCapacity = (typeof IMP_CAPACITY_OPTIONS)[number];
export const DEFAULT_IMP_CAPACITY: ImpCapacity = 6;
