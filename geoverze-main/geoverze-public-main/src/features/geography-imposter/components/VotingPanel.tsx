import { Check, Loader2, Vote } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { GeoButton } from "@/components/shared";
import { ParticipantAvatar } from "@/features/matchmaking/components/RoomPlayerAvatar";
import { selectUser, useAuthStore } from "@/stores/authStore";
import { submitImpVote } from "../data/impRoomApi";
import type { ImpParticipant, ImpRoom, ImpRoomState, ImpVoteStatusActive } from "../types";
import { useCountdown } from "./ImpGameHeader";

type VotingPanelProps = {
  roomState: ImpRoomState;
  myUserId: string;
  voteStatus: ImpVoteStatusActive;
  onStateUpdate: (s: ImpRoomState) => void;
};

export function VotingPanel({ roomState, myUserId, voteStatus, onStateUpdate }: VotingPanelProps) {
  const user = useAuthStore(selectUser);
  const { room, participants } = roomState;
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const countdown = useCountdown(room.phase_deadline);

  const hasVoted = voteStatus.you_have_voted;

  const submitVote = async () => {
    if (!selected || submitting || hasVoted) return;
    setSubmitting(true);
    try {
      const next = await submitImpVote(room.id, selected);
      onStateUpdate(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit vote");
    } finally {
      setSubmitting(false);
    }
  };

  const eligiblePlayers = participants.filter((p) => !p.is_excluded && p.user_id !== myUserId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-[0.95rem] font-semibold text-foreground">
            <Vote className="h-4 w-4 text-bronze" strokeWidth={1.9} aria-hidden />
            Vote for the Imposter
          </h2>
          <p className="mt-1 text-[0.78rem] text-foreground/50">
            {voteStatus.voted_count} / {voteStatus.eligible_count} players have voted
          </p>
        </div>
        {countdown !== null && (
          <span
            className={`font-mono font-bold tabular-nums text-lg ${
              countdown <= 10 ? "text-red-400" : "text-amber-400"
            }`}
          >
            {countdown}s
          </span>
        )}
      </div>

      {hasVoted ? (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-[0.84rem] text-emerald-400">
          <Check className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          Your vote has been cast. Waiting for others…
        </div>
      ) : (
        <p className="text-[0.82rem] text-foreground/60 leading-relaxed">
          Based on all the clues, who do you think is the <strong>imposter</strong>? They had a
          different but related word and tried to blend in.
        </p>
      )}

      {/* Player cards */}
      <div className="grid gap-2 sm:grid-cols-2">
        {eligiblePlayers.map((p) => {
          const isSelected = selected === p.user_id;
          return (
            <button
              key={p.user_id}
              type="button"
              disabled={hasVoted || submitting}
              onClick={() => setSelected(isSelected ? null : p.user_id)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all disabled:cursor-default ${
                isSelected
                  ? "border-bronze/50 bg-bronze/10 ring-1 ring-bronze/30"
                  : "border-foreground/10 bg-foreground/[0.03] hover:border-foreground/20 hover:bg-foreground/[0.06]"
              } ${hasVoted ? "opacity-50" : ""}`}
            >
              <ParticipantAvatar
                participant={p}
                you={p.user_id === myUserId}
                selfAvatar={{ avatarId: user?.avatarId, avatarUrl: user?.avatarUrl }}
                size={32}
                alt=""
              />
              <span className="text-[0.84rem] font-medium text-foreground">{p.display_name}</span>
              {isSelected && (
                <Check
                  className="ml-auto h-4 w-4 text-bronze shrink-0"
                  strokeWidth={2}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Confirm button */}
      {!hasVoted && (
        <GeoButton
          variant="solid"
          size="lg"
          className="w-full"
          disabled={!selected || submitting}
          onClick={() => void submitVote()}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : selected ? (
            `Vote for ${participants.find((p) => p.user_id === selected)?.display_name}`
          ) : (
            "Select a player to vote"
          )}
        </GeoButton>
      )}
    </div>
  );
}
