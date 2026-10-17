import { useSearch } from "@tanstack/react-router";

import { RoomSyncBanner } from "@/features/rooms/components/RoomSyncBanner";
import { useMultiplayerRoom } from "../hooks/useMultiplayerRoom";
import { MultiplayerLobbyScreen } from "./MultiplayerLobbyScreen";
import { MultiplayerMatchScreen } from "./MultiplayerMatchScreen";

/** /play/multiplayer/room — lobby while waiting/ready; match shell once playing. */
export function MultiplayerRoomScreen() {
  const { room, code } = useSearch({ from: "/play/multiplayer/room" });
  const { syncStatus, ...roomState } = useMultiplayerRoom(room);

  const body =
    roomState.state?.room.status === "playing" || roomState.state?.room.status === "completed" ? (
      <MultiplayerMatchScreen roomId={room} code={code} {...roomState} />
    ) : (
      <MultiplayerLobbyScreen roomId={room} code={code} {...roomState} />
    );

  return (
    <>
      <RoomSyncBanner status={syncStatus} />
      {body}
    </>
  );
}
