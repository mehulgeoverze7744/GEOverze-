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

type TabId = "canvas" | "chat";

export function DrawGuessMatchScreen({
  state, startPending, restartGame, onStateUpdate,
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
  const [activeTab, setActiveTab] = useState<TabId>("canvas");
  const canvasHandleRef = useRef<DrawingCanvasHandle | null>(null);

  const showWordChoice = isDrawer && turn?.status === "choosing";
  const showResults = room.status === "completed";

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[oklch(0.09_0.006_60)]">
      {/* Game header — full width */}
      <header className="sticky top-0 z-30 border-b border-bronze/20 bg-[oklch(0.09_0.006_60/0.95)] px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto max-w-[1400px]">
          <GameHeader
            room={room}
            turn={turn}
            totalTurns={totalTurns}
            drawerName={drawerParticipant?.display_name || drawerParticipant?.username}
          />
        </div>
      </header>

      {/* Mobile tab switcher */}
      <div className="flex border-b border-bronze/20 bg-[oklch(0.09_0.006_60/0.9)] lg:hidden">
        {(["canvas", "chat"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
              activeTab === tab ? "border-b-2 border-bronze text-bronze" : "text-foreground/50"
            }`}
          >
            {tab === "canvas" ? "🎨 Canvas" : "💬 Chat"}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 gap-4 p-4">
        {/* Desktop: 75/25 layout | Mobile: tab-based */}
        {/* Drawing side */}
        <section
          className={`flex flex-1 flex-col gap-3 ${activeTab !== "canvas" ? "hidden lg:flex" : "flex"}`}
          aria-label="Drawing canvas"
        >
          <DrawingCanvas
            key={turn?.id ?? "idle"}
            roomId={room.id}
            turnId={turn?.id ?? "idle"}
            isDrawer={isDrawer}
            color={color}
            size={size}
            tool={tool}
            onReady={(handle) => { canvasHandleRef.current = handle; }}
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

        {/* Chat + score side */}
        <aside
          className={`flex w-full flex-col gap-3 lg:w-[300px] lg:flex-shrink-0 ${
            activeTab !== "chat" ? "hidden lg:flex" : "flex"
          }`}
          aria-label="Chat and scores"
        >
          <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
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

      {/* Word choice modal — drawer only, blocks interaction */}
      {showWordChoice && turn ? (
        <WordChoiceModal turn={turn} onChosen={onStateUpdate} />
      ) : null}

      {/* Game results overlay */}
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
