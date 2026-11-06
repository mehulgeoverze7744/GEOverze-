import { supabase } from "@/lib/supabase/client";

import { buildAnswerPayload } from "@/features/pvp/lib/buildAnswerPayload";
import type { MultiplayerLeaveResult, MultiplayerRoomState, MultiplayerSubmitResult } from "../types";

// Multiplayer RPCs are not yet reflected in the generated Supabase types.
// When you run `supabase gen types --local` these casts can be removed.
function rpc(fn: string, args: Record<string, unknown> = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc(fn, args) as Promise<{ data: unknown; error: { message: string } | null }>;
}

function parseRoomState(data: unknown): MultiplayerRoomState {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid room state response");
  }
  return data as MultiplayerRoomState;
}

export async function createMultiplayerRoom(
  quizId: string,
  maxPlayers: number,
): Promise<MultiplayerRoomState> {
  const { data, error } = await rpc("create_multiplayer_room", {
    _quiz_id: quizId,
    _max_players: maxPlayers,
  });
  if (error) throw new Error(error.message);
  return parseRoomState(data);
}

export async function joinMultiplayerRoom(roomCode: string): Promise<MultiplayerRoomState> {
  const { data, error } = await rpc("join_multiplayer_room", {
    _room_code: roomCode.toUpperCase(),
  });
  if (error) throw new Error(error.message);
  return parseRoomState(data);
}

export async function fetchMultiplayerRoomState(roomId: string): Promise<MultiplayerRoomState> {
  const { data, error } = await rpc("build_multiplayer_room_state", {
    _room_id: roomId,
  });
  if (error) throw new Error(error.message);
  return parseRoomState(data);
}

export async function setMultiplayerReady(
  roomId: string,
  ready: boolean,
): Promise<MultiplayerRoomState> {
  const { data, error } = await rpc("set_multiplayer_ready", {
    _room_id: roomId,
    _ready: ready,
  });
  if (error) throw new Error(error.message);
  return parseRoomState(data);
}

export async function startMultiplayerMatch(roomId: string): Promise<MultiplayerRoomState> {
  const { data, error } = await rpc("start_multiplayer_match", { _room_id: roomId });
  if (error) throw new Error(error.message);
  return parseRoomState(data);
}

export async function leaveMultiplayerRoom(roomId: string): Promise<MultiplayerLeaveResult> {
  const { data, error } = await rpc("leave_multiplayer_room", { _room_id: roomId });
  if (error) throw new Error(error.message);
  return data as MultiplayerLeaveResult;
}

export async function submitMultiplayerAttempt(
  roomId: string,
  attemptId: string,
  durationMs: number,
  answers: ReturnType<typeof buildAnswerPayload>,
): Promise<MultiplayerSubmitResult> {
  const { data, error } = await rpc("submit_multiplayer_attempt", {
    _room_id: roomId,
    _attempt_id: attemptId,
    _duration_ms: durationMs,
    _answers: answers,
  });
  if (error) throw new Error(error.message);
  if (!data || typeof data !== "object") throw new Error("Invalid multiplayer submit response");
  const payload = data as MultiplayerSubmitResult;
  return {
    ...payload,
    room_state: parseRoomState(payload.room_state),
  };
}
