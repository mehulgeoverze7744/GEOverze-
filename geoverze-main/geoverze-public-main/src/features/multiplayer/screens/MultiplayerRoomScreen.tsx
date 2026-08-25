import { useSearch } from "@tanstack/react-router";

import { useMultiplayerRoom } from "../hooks/useMultiplayerRoom";
import { MultiplayerLobbyScreen } from "./MultiplayerLobbyScreen";
import { MultiplayerMatchScreen } from "./MultiplayerMatchScreen";

/** /play/multiplayer/room — lobby while waiting/ready; match shell once playing. */
export function MultiplayerRoomScreen() {
  const { room, code } = useSearch({ from: "/play/multiplayer/room" });
  const roomState = useMultiplayerRoom(room);

  if (roomState.state?.room.status === "playing" || roomState.state?.room.status === "completed") {
    return <MultiplayerMatchScreen roomId={room} code={code} {...roomState} />;
  }

  return <MultiplayerLobbyScreen roomId={room} code={code} {...roomState} />;
}
