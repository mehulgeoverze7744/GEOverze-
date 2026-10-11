import { useState } from "react";
import { toast } from "sonner";

import { useImpRoom } from "../hooks/useImpRoom";
import { ImposterGameScreen } from "./ImposterGameScreen";
import { ImposterLobbyScreen } from "./ImposterLobbyScreen";

type ImposterRoomScreenProps = {
  roomId: string | undefined;
  code: string | undefined;
};

export function ImposterRoomScreen({ roomId, code }: ImposterRoomScreenProps) {
  const [readyPending, setReadyPending] = useState(false);
  const [startPending, setStartPending] = useState(false);

  const { state, loading, error, setState, toggleReady, startGame, restartGame } = useImpRoom(
    roomId,
    code,
  );

  const handleToggleReady = async (ready: boolean) => {
    setReadyPending(true);
    try {
      await toggleReady(ready);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update ready status");
    } finally {
      setReadyPending(false);
    }
  };

  const handleStartGame = async () => {
    setStartPending(true);
    try {
      await startGame();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start the game");
    } finally {
      setStartPending(false);
    }
  };

  // Show game screen once status = playing
  if (state?.room.status === "playing" || state?.room.status === "completed") {
    return <ImposterGameScreen state={state} onStateUpdate={setState} onRestart={restartGame} />;
  }

  return (
    <ImposterLobbyScreen
      code={code}
      state={state}
      loading={loading}
      error={error}
      readyPending={readyPending}
      startPending={startPending}
      toggleReady={handleToggleReady}
      startGame={handleStartGame}
    />
  );
}
