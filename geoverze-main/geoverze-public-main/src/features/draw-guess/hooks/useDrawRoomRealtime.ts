import { useRoomRealtime, type RoomSyncStatus } from "@/features/rooms/hooks/useRoomRealtime";

/** Full-refetch-on-change: nudges `onChange` whenever room/participant/event rows change. */
export function useDrawRoomRealtime(
  roomId: string | undefined,
  onChange: () => void,
): RoomSyncStatus {
  return useRoomRealtime({
    channelName: roomId ? `draw-room:${roomId}` : undefined,
    tables: roomId
      ? [
          { table: "draw_participants", filter: `room_id=eq.${roomId}` },
          { event: "UPDATE", table: "draw_rooms", filter: `id=eq.${roomId}` },
          { event: "INSERT", table: "draw_events", filter: `room_id=eq.${roomId}` },
        ]
      : [],
    onEvent: onChange,
    onReady: onChange,
  });
}
