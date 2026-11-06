import { supabase } from "@/lib/supabase/client";

import { buildAnswerPayload } from "../lib/buildAnswerPayload";
import type { PvpLeaveResult, PvpRoomState, PvpSubmitResult } from "../types";

// PVP RPCs are not yet reflected in the generated Supabase types.
// When you run `supabase gen types --local` these casts can be removed.
function rpc(fn: string, args: Record<string, unknown> = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc(fn, args) as Promise<{ data: unknown; error: { message: string } | null }>;
}

function parseRoomState(data: unknown): PvpRoomState {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid room state response");
  }
  return data as PvpRoomState;
}

export async function createPvpRoom(quizId: string): Promise<PvpRoomState> {
  const { data, error } = await rpc("create_pvp_room", { _quiz_id: quizId });
  if (error) throw new Error(error.message);
  return parseRoomState(data);
}

export async function joinPvpRoom(roomCode: string): Promise<PvpRoomState> {
  const { data, error } = await rpc("join_pvp_room", { _room_code: roomCode.toUpperCase() });
  if (error) throw new Error(error.message);
  return parseRoomState(data);
}

export async function fetchPvpRoomState(roomId: string): Promise<PvpRoomState> {
  const { data, error } = await rpc("build_pvp_room_state", { _room_id: roomId });
  if (error) throw new Error(error.message);
  return parseRoomState(data);
}

export async function setPvpReady(roomId: string, ready: boolean): Promise<PvpRoomState> {
  const { data, error } = await rpc("set_pvp_ready", {
    _room_id: roomId,
    _ready: ready,
  });
  if (error) throw new Error(error.message);
  return parseRoomState(data);
}

export async function startPvpMatch(roomId: string): Promise<PvpRoomState> {
  const { data, error } = await rpc("start_pvp_match", { _room_id: roomId });
  if (error) throw new Error(error.message);
  return parseRoomState(data);
}

export async function submitPvpAttempt(
  roomId: string,
  attemptId: string,
  durationMs: number,
  answers: ReturnType<typeof buildAnswerPayload>,
): Promise<PvpSubmitResult> {
  const { data, error } = await rpc("submit_pvp_attempt", {
    _room_id: roomId,
    _attempt_id: attemptId,
    _duration_ms: durationMs,
    _answers: answers,
  });
  if (error) throw new Error(error.message);
  if (!data || typeof data !== "object") throw new Error("Invalid PvP submit response");
  const payload = data as PvpSubmitResult;
  return {
    ...payload,
    room_state: parseRoomState(payload.room_state),
  };
}

export async function leavePvpRoom(roomId: string): Promise<PvpLeaveResult> {
  const { data, error } = await rpc("leave_pvp_room", { _room_id: roomId });
  if (error) throw new Error(error.message);
  return data as PvpLeaveResult;
}
