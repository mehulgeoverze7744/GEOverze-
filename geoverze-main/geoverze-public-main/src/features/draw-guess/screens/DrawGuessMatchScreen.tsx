import { useRef, useState } from "react";

import { selectUser, useAuthStore } from "@/stores/authStore";
import { ChatPanel } from "../components/ChatPanel";
import { DrawingCanvas, type DrawingCanvasHandle } from "../components/DrawingCanvas";
import { DrawToolbar } from "../components/DrawToolbar";
import { GameHeader } from "../components/GameHeader";
import { PlayerScoreList } from "../components/PlayerScoreList";
import { ResultsOverlay } from "../components/ResultsOverlay";
import { WordChoiceModal } from "../components/WordChoiceModal";
import type { DrawRoomState } from "../types";

type DrawGuessMatchScreenProps = {
  state: DrawRoomState;
  startPending: boolean;
  restartGame: () => Promise<void>;
  onStateUpdate: (state: DrawRoomState) => void;
};

export function DrawGuessMatchScreen({
  state,
  startPending,
  restartGame,
  onStateUpdate,
}: DrawGuessMatchScreenProps) {
  const user = useAuthStore(selectUser);
  const { room, participants, current_turn: turn, total_turns: totalTurns } = state;

  const myUserId = user?.id;
  const isDrawer = turn?.drawer_user_id === myUserId;
  const me = participants.find((p) => p.user_id === myUserId);
  const drawerParticipant = participants.find((p) => p.user_id === turn?.drawer_user_id);
  const isHost = me?.is_host ?? false;

  const [color, setColor] = useState("#1a1a1a");
  const [size, setSize] = useState(8);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const canvasHandleRef = useRef<DrawingCanvasHandle | null>(null);

  const showWordChoice = isDrawer && turn?.status === "choosing";
  const showResults = room.status === "completed";

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-x-hidden bg-[oklch(0.09_0.006_60)]">
      <header className="sticky top-0 z-30 border-b border-bronze/20 bg-[oklch(0.09_0.006_60/0.95)] px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto max-w-[1680px]">
          <GameHeader
            room={room}
            turn={turn}
            totalTurns={totalTurns}
            drawerName={drawerParticipant?.display_name || drawerParticipant?.username}
          />
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1680px] flex-1 grid-cols-1 gap-4 p-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-4 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(16.5rem,20%)] lg:items-stretch">
        <section
          className="flex min-h-0 flex-col gap-3 lg:h-[calc(100dvh-6.75rem)]"
          aria-label="Drawing canvas"
        >
          <DrawingCanvas
            key={turn?.id ?? "idle"}
            roomId={room.id}
            turnId={turn?.id}
            isDrawer={isDrawer}
            color={color}
            size={size}
            tool={tool}
            onReady={(handle) => {
              canvasHandleRef.current = handle;
            }}
          />
          {isDrawer ? (
            <DrawToolbar
              color={color}
              size={size}
              tool={tool}
              onColorChange={setColor}
              onSizeChange={setSize}
              onToolChange={setTool}
              onUndo={() => canvasHandleRef.current?.undo()}
              onClear={() => canvasHandleRef.current?.clear()}
            />
          ) : null}
        </section>

        <aside
          className="flex min-h-[20rem] flex-col gap-3 lg:h-[calc(100dvh-6.75rem)] lg:min-h-0"
          aria-label="Chat and scores"
        >
          <div className="min-h-[16rem] flex-1 max-lg:overflow-visible lg:min-h-0 lg:overflow-hidden">
            <ChatPanel state={state} myUserId={myUserId} isDrawer={isDrawer} />
          </div>
          <div className="flex-shrink-0 rounded-2xl border border-bronze/20 bg-[oklch(0.12_0.006_60/0.7)] p-3">
            <p className="mb-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-foreground/40">
              Scores
            </p>
            <PlayerScoreList
              participants={participants}
              currentDrawerId={turn?.drawer_user_id}
              correctUserIds={turn?.correct_user_ids ?? []}
              myUserId={myUserId}
            />
          </div>
        </aside>
      </main>

      {showWordChoice && turn ? <WordChoiceModal turn={turn} onChosen={onStateUpdate} /> : null}

      {showResults ? (
        <ResultsOverlay
          room={room}
          participants={participants}
          myUserId={myUserId}
          isHost={isHost}
          restartPending={startPending}
          onRestart={() => void restartGame()}
        />
      ) : null}
    </div>
  );
}
