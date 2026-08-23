import { useSearch } from "@tanstack/react-router";

import { usePvpRoom } from "../hooks/usePvpRoom";
import { PvpLobbyScreen } from "./PvpLobbyScreen";
import { PvpMatchScreen } from "./PvpMatchScreen";

/** /play/pvp/room — lobby while waiting/ready; match shell once playing. */
export function PvpRoomScreen() {
  const { room, code } = useSearch({ from: "/play/pvp/room" });
  const roomState = usePvpRoom(room);

  if (roomState.state?.room.status === "playing" || roomState.state?.room.status === "completed") {
    return <PvpMatchScreen roomId={room} code={code} {...roomState} />;
  }

  return <PvpLobbyScreen roomId={room} code={code} {...roomState} />;
}
