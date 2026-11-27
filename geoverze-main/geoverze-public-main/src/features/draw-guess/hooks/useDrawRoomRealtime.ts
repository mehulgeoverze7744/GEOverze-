import { useRoomRealtime, type RoomSyncStatus } from "@/features/rooms/hooks/useRoomRealtime";

/** Full-refetch-on-change: nudges `onChange` whenever room/participant/event rows change. */
export function useDrawRoomRealtime(
  roomId: string | undefined,
  onChange: () => void,
): RoomSyncStatus {
  return useRoomRealtime({
    channelName: roomId ? `draw-room:${roomId}` : undefined,
    tables: roomId
      ? (() => {
          const pf = `room_id=eq.${roomId}`;
          return [
            { event: "INSERT" as const, table: "draw_participants", filter: pf },
            { event: "UPDATE" as const, table: "draw_participants", filter: pf },
            { event: "DELETE" as const, table: "draw_participants", filter: pf },
            { event: "UPDATE" as const, table: "draw_rooms", filter: `id=eq.${roomId}` },
            { event: "INSERT" as const, table: "draw_events", filter: pf },
          ];
        })()
      : [],
    onEvent: onChange,
    onReady: onChange,
  });
}
