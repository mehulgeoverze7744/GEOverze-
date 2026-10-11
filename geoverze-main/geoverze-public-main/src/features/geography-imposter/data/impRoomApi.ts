import { supabase } from "@/lib/supabase/client";
import type { ImpRoomState } from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseState(data: unknown): ImpRoomState {
  return data as ImpRoomState;
}

// ─── Room lifecycle ───────────────────────────────────────────────────────────

export async function createImpRoom(
  maxPlayers: number,
  category: string | null,
  difficulty: string,
): Promise<ImpRoomState> {
  const { data, error } = await supabase.rpc("create_imp_room", {
    _max_players: maxPlayers,
    _category: category,
    _difficulty: difficulty,
  });
  if (error) throw new Error(error.message);
  return parseState(data);
}

export async function joinImpRoom(roomCode: string): Promise<ImpRoomState> {
  const { data, error } = await supabase.rpc("join_imp_room", {
    _room_code: roomCode.toUpperCase().trim(),
  });
  if (error) throw new Error(error.message);
  return parseState(data);
}

export async function fetchImpRoomState(roomId: string): Promise<ImpRoomState> {
  const { data, error } = await supabase.rpc("build_imp_room_state", {
    _room_id: roomId,
  });
  if (error) throw new Error(error.message);
  return parseState(data);
}

export async function setImpReady(roomId: string, ready: boolean): Promise<ImpRoomState> {
  const { data, error } = await supabase.rpc("set_imp_ready", {
    _room_id: roomId,
    _ready: ready,
  });
  if (error) throw new Error(error.message);
  return parseState(data);
}

export async function startImpGame(roomId: string): Promise<ImpRoomState> {
  const { data, error } = await supabase.rpc("start_imp_game", {
    _room_id: roomId,
  });
  if (error) throw new Error(error.message);
  return parseState(data);
}

export async function restartImpGame(roomId: string): Promise<ImpRoomState> {
  const { data, error } = await supabase.rpc("restart_imp_game", {
    _room_id: roomId,
  });
  if (error) throw new Error(error.message);
  return parseState(data);
}

export async function leaveImpRoom(roomId: string): Promise<void> {
  const { error } = await supabase.rpc("leave_imp_room", {
    _room_id: roomId,
  });
  if (error) throw new Error(error.message);
}

// ─── Gameplay ─────────────────────────────────────────────────────────────────

export async function submitImpClue(roomId: string, clue: string): Promise<ImpRoomState> {
  const { data, error } = await supabase.rpc("submit_imp_clue", {
    _room_id: roomId,
    _clue: clue,
  });
  if (error) throw new Error(error.message);
  return parseState(data);
}

export async function sendImpMessage(roomId: string, body: string): Promise<void> {
  const { error } = await supabase.rpc("send_imp_message", {
    _room_id: roomId,
    _body: body,
  });
  if (error) throw new Error(error.message);
}

export async function submitImpVote(
  roomId: string,
  targetUserId: string,
): Promise<ImpRoomState> {
  const { data, error } = await supabase.rpc("submit_imp_vote", {
    _room_id: roomId,
    _target_user_id: targetUserId,
  });
  if (error) throw new Error(error.message);
  return parseState(data);
}

export async function advanceImpPhase(roomId: string): Promise<ImpRoomState> {
  const { data, error } = await supabase.rpc("advance_imp_phase", {
    _room_id: roomId,
  });
  if (error) throw new Error(error.message);
  return parseState(data);
}

export async function touchImpPresence(roomId: string): Promise<void> {
  await supabase.rpc("touch_imp_presence", { _room_id: roomId });
  // Intentionally swallow errors — presence is best-effort
}
