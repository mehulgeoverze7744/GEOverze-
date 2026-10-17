import { useRoomRealtime, type RoomSyncStatus } from "@/features/rooms/hooks/useRoomRealtime";

/** Subscribe to room + participant changes for live multiplayer lobby sync. */
export function useMultiplayerRoomRealtime(
  roomId: string | undefined,
  onChange: () => void,
): RoomSyncStatus {
  return useRoomRealtime({
    channelName: roomId ? `multiplayer-room:${roomId}` : undefined,
    tables: roomId
      ? [
          { table: "pvp_participants", filter: `room_id=eq.${roomId}` },
          { event: "UPDATE", table: "pvp_rooms", filter: `id=eq.${roomId}` },
        ]
      : [],
    onEvent: onChange,
    onReady: onChange,
  });
}
