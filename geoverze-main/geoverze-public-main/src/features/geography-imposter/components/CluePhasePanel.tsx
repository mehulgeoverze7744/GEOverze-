import { Check, ChevronRight, Loader2, Mic } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { GeoButton } from "@/components/shared";
import { submitImpClue } from "../data/impRoomApi";
import type { ImpClue, ImpParticipant, ImpPrivateInfo, ImpRoom, ImpRoomState } from "../types";
import { useCountdown } from "./ImpGameHeader";

// ─────────────────────────────────────────────
// Player clue row
// ─────────────────────────────────────────────

type ClueRowProps = {
  participant: ImpParticipant;
  clue: ImpClue | undefined;
  isCurrent: boolean;
  isMe: boolean;
};

function ClueRow({ participant, clue, isCurrent, isMe }: ClueRowProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
        isCurrent
          ? "bg-bronze/10 ring-1 ring-bronze/30"
          : "bg-foreground/[0.03]"
      }`}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold ${
          isCurrent ? "bg-bronze/20 text-bronze" : "bg-foreground/10 text-foreground/50"
        }`}
      >
        {isCurrent ? (
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
        ) : clue ? (
          <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2.5} aria-hidden />
        ) : (
          <span className="opacity-40">–</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[0.82rem] font-medium text-foreground truncate">
          {participant.display_name}
          {isMe ? <span className="ml-1 text-foreground/40">(you)</span> : null}
        </p>
        {clue && !clue.skipped ? (
          <p className="mt-0.5 text-[0.88rem] font-semibold text-foreground/90">
            "{clue.clue_text}"
          </p>
        ) : clue?.skipped ? (
          <p className="mt-0.5 text-[0.75rem] italic text-foreground/40">Skipped</p>
        ) : isCurrent ? (
          <p className="mt-0.5 text-[0.75rem] text-bronze/70 animate-pulse">Thinking…</p>
        ) : (
          <p className="mt-0.5 text-[0.75rem] text-foreground/30">Waiting…</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main CluePhasePanel
// ─────────────────────────────────────────────

type CluePhaseProps = {
  roomState: ImpRoomState;
  myUserId: string;
  onStateUpdate: (s: ImpRoomState) => void;
};

export function CluePhasePanel({ roomState, myUserId, onStateUpdate }: CluePhaseProps) {
  const { room, participants, clues, private_info } = roomState;
  const [clueInput, setClueInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const countdown = useCountdown(room.phase_deadline);

  const clueOrder: string[] =
    room.current_round === 1
      ? room.clue_order_1
      : room.current_round === 2
        ? room.clue_order_2
        : room.clue_order_3;

  const currentUserId = clueOrder[room.current_clue_index];
  const isMyTurn = currentUserId === myUserId;

  const roundClues = clues.filter((c) => c.round_number === room.current_round);

  const handleSubmit = async () => {
    if (!clueInput.trim() || submitting) return;
    setSubmitting(true);
    try {
      const next = await submitImpClue(room.id, clueInput.trim());
      setClueInput("");
      onStateUpdate(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit clue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[0.95rem] font-semibold text-foreground">
            Round {room.current_round} · Clue Submission
          </h2>
          <p className="mt-0.5 text-[0.78rem] text-foreground/50">
            Each player gives one clue for their secret word.
          </p>
        </div>
        {countdown !== null && (
          <span
            className={`text-[1.1rem] font-mono font-bold tabular-nums ${
              countdown <= 5
                ? "text-red-400"
                : countdown <= 10
                  ? "text-amber-400"
                  : "text-emerald-400"
            }`}
          >
            {countdown}s
          </span>
        )}
      </div>

      {/* Your word reminder */}
      {private_info && (
        <div className="rounded-xl bg-foreground/[0.04] border border-foreground/10 px-4 py-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.15em] text-foreground/40">
            {private_info.role === "imposter" ? "Your word (imposter)" : "Your word"}
          </p>
          <p className="mt-1 text-[1.05rem] font-bold text-foreground">
            {private_info.received_word}
          </p>
        </div>
      )}

      {/* Clue list */}
      <div className="space-y-2">
        {clueOrder.map((uid) => {
          const participant = participants.find((p) => p.user_id === uid);
          if (!participant) return null;
          const clue = roundClues.find((c) => c.user_id === uid);
          const isCurrent = uid === currentUserId;
          return (
            <ClueRow
              key={uid}
              participant={participant}
              clue={clue}
              isCurrent={isCurrent}
              isMe={uid === myUserId}
            />
          );
        })}
      </div>

      {/* Clue input (only when it's my turn and I haven't submitted) */}
      {isMyTurn && !roundClues.some((c) => c.user_id === myUserId) && (
        <div className="space-y-3 rounded-2xl border border-bronze/30 bg-bronze/[0.04] p-4">
          <div className="flex items-center gap-2 text-[0.78rem] font-semibold text-bronze">
            <Mic className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden />
            Your turn — give a clue!
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl border border-foreground/15 bg-background px-3 py-2 text-sm placeholder:text-foreground/30 focus:border-bronze/50 focus:outline-none"
              placeholder="Enter your one-word or short clue…"
              maxLength={120}
              value={clueInput}
              onChange={(e) => setClueInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSubmit();
              }}
              disabled={submitting}
              autoFocus
            />
            <GeoButton
              variant="solid"
              size="md"
              onClick={() => void handleSubmit()}
              disabled={!clueInput.trim() || submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                "Submit"
              )}
            </GeoButton>
          </div>
          <p className="text-[0.72rem] text-foreground/40">
            Do not say the word itself. Max 120 characters.
          </p>
        </div>
      )}
    </div>
  );
}
