import { supabase } from "@/lib/supabase/client";
import type {
  DrawLeaveResult,
  DrawMessageResult,
  DrawRoomState,
  DrawStroke,
  DrawStrokePayload,
} from "../types";

// Game-room RPCs are not yet reflected in the generated Supabase types.
// When you run `supabase gen types --local` these casts can be removed.
function rpc(fn: string, args: Record<string, unknown> = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc(fn, args) as Promise<{ data: unknown; error: { message: string } | null }>;
}

function parseState(data: unknown): DrawRoomState {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid room state response");
  }
  return data as DrawRoomState;
}

export async function createDrawRoom(input: {
  rounds: 1 | 3 | 5;
  maxPlayers: number;
  categories: string[];
  difficulty: string;
  turnSeconds: number;
}): Promise<DrawRoomState> {
  const { data, error } = await rpc("create_draw_room", {
    _rounds: input.rounds,
    _max_players: input.maxPlayers,
    _categories: input.categories,
    _difficulty: input.difficulty,
    _turn_seconds: input.turnSeconds,
  });
  if (error) throw new Error(error.message);
  return parseState(data);
}

export async function joinDrawRoom(roomCode: string): Promise<DrawRoomState> {
  const { data, error } = await rpc("join_draw_room", {
    _room_code: roomCode.toUpperCase(),
  });
  if (error) throw new Error(error.message);
  return parseState(data);
}

export async function fetchDrawRoomState(roomId: string): Promise<DrawRoomState> {
  const { data, error } = await rpc("build_draw_room_state", { _room_id: roomId });
  if (error) throw new Error(error.message);
  return parseState(data);
}

export async function setDrawReady(roomId: string, ready: boolean): Promise<DrawRoomState> {
  const { data, error } = await rpc("set_draw_ready", {
    _room_id: roomId,
    _ready: ready,
  });
  if (error) throw new Error(error.message);
  return parseState(data);
}

export async function startDrawGame(roomId: string): Promise<DrawRoomState> {
  const { data, error } = await rpc("start_draw_game", { _room_id: roomId });
  if (error) throw new Error(error.message);
  return parseState(data);
}

export async function restartDrawGame(roomId: string): Promise<DrawRoomState> {
  const { data, error } = await rpc("restart_draw_game", { _room_id: roomId });
  if (error) throw new Error(error.message);
  return parseState(data);
}

export async function leaveDrawRoom(roomId: string): Promise<DrawLeaveResult> {
  const { data, error } = await rpc("leave_draw_room", { _room_id: roomId });
  if (error) throw new Error(error.message);
  return data as DrawLeaveResult;
}

export async function chooseDrawWord(turnId: string, wordId: string): Promise<DrawRoomState> {
  const { data, error } = await rpc("choose_draw_word", {
    _turn_id: turnId,
    _word_id: wordId,
  });
  if (error) throw new Error(error.message);
  return parseState(data);
}

export async function sendDrawMessage(roomId: string, message: string): Promise<DrawMessageResult> {
  const { data, error } = await rpc("send_draw_message", {
    _room_id: roomId,
    _message: message,
  });
  if (error) throw new Error(error.message);
  const payload = data as { correct: boolean; points: number; room_state: unknown };
  return { ...payload, room_state: parseState(payload.room_state) };
}

export async function advanceDrawTurn(roomId: string): Promise<DrawRoomState> {
  const { data, error } = await rpc("advance_draw_turn", { _room_id: roomId });
  if (error) throw new Error(error.message);
  return parseState(data);
}

export async function touchDrawPresence(roomId: string): Promise<void> {
  const { error } = await rpc("touch_draw_presence", { _room_id: roomId });
  if (error) throw new Error(error.message);
}

export async function submitDrawStroke(input: {
  roomId: string;
  turnId: string;
  kind: "stroke" | "clear" | "undo";
  points?: DrawStrokePayload;
  color?: string;
  size?: number;
  tool?: "brush" | "eraser";
}): Promise<number> {
  const { data, error } = await rpc("submit_draw_stroke", {
    _room_id: input.roomId,
    _turn_id: input.turnId,
    _kind: input.kind,
    _points: input.points ?? null,
    _color: input.color ?? null,
    _size: input.size ?? null,
    _tool: input.tool ?? null,
  });
  if (error) throw new Error(error.message);
  return data as number;
}

export async function fetchDrawStrokesSince(turnId: string, afterId = 0): Promise<DrawStroke[]> {
  const { data, error } = await rpc("fetch_draw_strokes_since", {
    _turn_id: turnId,
    _after_id: afterId,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as DrawStroke[];
}
