import { useSearch } from "@tanstack/react-router";

import { RoomSyncBanner } from "@/features/rooms/components/RoomSyncBanner";
import { useDrawRoom } from "../hooks/useDrawRoom";
import { DrawGuessLobbyScreen } from "./DrawGuessLobbyScreen";
import { DrawGuessMatchScreen } from "./DrawGuessMatchScreen";
import type { DrawRoomState } from "../types";

/** /play/draw-guess/room — lobby while waiting/ready, match UI once playing. */
export function DrawGuessRoomScreen() {
  const { room: roomId, code } = useSearch({ from: "/play/draw-guess/room" });
  const { syncStatus, ...roomState } = useDrawRoom(roomId);

  const status = roomState.state?.room.status;
  const inMatch = status === "playing" || status === "completed";

  return (
    <>
      <RoomSyncBanner status={syncStatus} />
      {inMatch && roomState.state ? (
        <DrawGuessMatchScreen
          state={roomState.state}
          startPending={roomState.startPending}
          restartGame={roomState.restartGame}
          onStateUpdate={(next: DrawRoomState) => roomState.setState(next)}
        />
      ) : (
        <DrawGuessLobbyScreen
          roomId={roomId}
          code={code}
          state={roomState.state}
          loading={roomState.loading}
          error={roomState.error}
          readyPending={roomState.readyPending}
          startPending={roomState.startPending}
          toggleReady={roomState.toggleReady}
          startGame={roomState.startGame}
        />
      )}
    </>
  );
}
