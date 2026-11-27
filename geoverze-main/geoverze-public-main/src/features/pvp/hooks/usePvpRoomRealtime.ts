import { useRoomRealtime, type RoomSyncStatus } from "@/features/rooms/hooks/useRoomRealtime";

/** Subscribe to room + participant changes for live lobby sync. */
export function usePvpRoomRealtime(
  roomId: string | undefined,
  onChange: () => void,
): RoomSyncStatus {
  return useRoomRealtime({
    channelName: roomId ? `pvp-room:${roomId}` : undefined,
    tables: roomId
      ? (() => {
          const pf = `room_id=eq.${roomId}`;
          return [
            { event: "INSERT" as const, table: "pvp_participants", filter: pf },
            { event: "UPDATE" as const, table: "pvp_participants", filter: pf },
            { event: "DELETE" as const, table: "pvp_participants", filter: pf },
            { event: "UPDATE" as const, table: "pvp_rooms", filter: `id=eq.${roomId}` },
          ];
        })()
      : [],
    onEvent: onChange,
    onReady: onChange,
  });
}
