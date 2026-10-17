import { useSearch } from "@tanstack/react-router";

import { RoomSyncBanner } from "@/features/rooms/components/RoomSyncBanner";
import { usePvpRoom } from "../hooks/usePvpRoom";
import { PvpLobbyScreen } from "./PvpLobbyScreen";
import { PvpMatchScreen } from "./PvpMatchScreen";

/** /play/pvp/room — lobby while waiting/ready; match shell once playing. */
export function PvpRoomScreen() {
  const { room, code } = useSearch({ from: "/play/pvp/room" });
  const { syncStatus, ...roomState } = usePvpRoom(room);

  const body =
    roomState.state?.room.status === "playing" || roomState.state?.room.status === "completed" ? (
      <PvpMatchScreen roomId={room} code={code} {...roomState} />
    ) : (
      <PvpLobbyScreen roomId={room} code={code} {...roomState} />
    );

  return (
    <>
      <RoomSyncBanner status={syncStatus} />
      {body}
    </>
  );
}
