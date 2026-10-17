import { useRoomRealtime, type RoomSyncStatus } from "@/features/rooms/hooks/useRoomRealtime";

/**
 * Subscribe to imp_rooms + imp_participants + imp_clues postgres_changes
 * for live room state sync. Any change triggers a full-refetch via onChange().
 */
export function useImpRoomRealtime(
  roomId: string | undefined,
  onChange: () => void,
): RoomSyncStatus {
  return useRoomRealtime({
    channelName: roomId ? `imp-room:${roomId}` : undefined,
    tables: roomId
      ? [
          { table: "imp_rooms", filter: `id=eq.${roomId}` },
          { table: "imp_participants", filter: `room_id=eq.${roomId}` },
          { table: "imp_clues", filter: `room_id=eq.${roomId}` },
        ]
      : [],
    onEvent: onChange,
    onReady: onChange,
  });
}
