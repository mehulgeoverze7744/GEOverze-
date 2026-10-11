import type { DrawCategory, DrawDifficulty } from "../types";

/** Client-facing category labels only — the actual word bank lives server-side. */
export const DRAW_CATEGORY_OPTIONS: readonly { id: DrawCategory; label: string }[] = [
  { id: "geography_countries", label: "Geography & Countries" },
  { id: "capitals_flags", label: "Capitals & Flags" },
  { id: "landmarks_monuments", label: "Landmarks & Monuments" },
  { id: "maps_physical", label: "Maps & Physical Geography" },
  { id: "space_astronomy", label: "Space & Astronomy" },
  { id: "planets_universe", label: "Planets & The Universe" },
] as const;

export const DRAW_DIFFICULTY_OPTIONS: readonly { id: DrawDifficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
] as const;

export const DRAW_ROUND_OPTIONS: readonly (1 | 3 | 5)[] = [1, 3, 5] as const;

export const DRAW_MAX_PLAYER_OPTIONS: readonly number[] = [2, 3, 4, 5, 6, 8] as const;

export const DRAW_DEFAULT_TURN_SECONDS = 80;
export const DRAW_MIN_TURN_SECONDS = 30;
export const DRAW_MAX_TURN_SECONDS = 150;
