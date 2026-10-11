import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { SectionContainer } from "@/components/shared";
import { selectUser, useAuthStore } from "@/stores/authStore";
import { CluePhasePanel } from "../components/CluePhasePanel";
import { DiscussionPanel } from "../components/DiscussionPanel";
import { ImpGameHeader } from "../components/ImpGameHeader";
import { ResultsOverlay } from "../components/ResultsOverlay";
import { RoleRevealOverlay } from "../components/RoleRevealOverlay";
import { VotingPanel } from "../components/VotingPanel";
import type {
  ImpRoomState,
  ImpVoteStatusActive,
  ImpVoteStatusReveal,
} from "../types";
import { isRevealVoteStatus } from "../types";

type ImposterGameScreenProps = {
  state: ImpRoomState;
  onStateUpdate: (s: ImpRoomState) => void;
  onRestart: () => Promise<void>;
};

export function ImposterGameScreen({
  state,
  onStateUpdate,
  onRestart,
}: ImposterGameScreenProps) {
  const user = useAuthStore(selectUser);
  const myUserId = user?.id ?? "";
  const [roleAcknowledged, setRoleAcknowledged] = useState(false);

  const { room, participants, private_info, vote_status, reveal } = state;

  const me = useMemo(
    () => participants.find((p) => p.user_id === myUserId),
    [participants, myUserId],
  );

  const isHost = me?.is_host ?? false;

  // ── Role reveal (shown once at game start until dismissed) ──────────────────
  const showRoleReveal =
    room.status === "playing" &&
    room.phase === "clue" &&
    !!private_info &&
    !roleAcknowledged;

  // ── Results overlay ─────────────────────────────────────────────────────────
  const showResults = room.phase === "reveal" && !!reveal;

  // ── Narrow vote_status types ─────────────────────────────────────────────────
  const activeVoteStatus: ImpVoteStatusActive | null =
    vote_status && !isRevealVoteStatus(vote_status) ? vote_status : null;

  const revealVoteStatus: ImpVoteStatusReveal | null =
    vote_status && isRevealVoteStatus(vote_status) ? vote_status : null;

  return (
    <PageShell>
      {/* Role reveal overlay */}
      {showRoleReveal && private_info && (
        <RoleRevealOverlay
          privateInfo={private_info}
          onDismiss={() => setRoleAcknowledged(true)}
        />
      )}

      {/* Results overlay */}
      {showResults && reveal && revealVoteStatus && (
        <ResultsOverlay
          roomState={state}
          reveal={reveal}
          voteStatus={revealVoteStatus}
          myUserId={myUserId}
          isHost={isHost}
          onRestart={onRestart}
        />
      )}

      <SectionContainer
        size="default"
        className="pt-[calc(var(--nav-height)+1rem)] pb-8 space-y-5"
      >
        {/* Header */}
        <ImpGameHeader room={room} participantCount={participants.length} />

        {/* Phase content */}
        {room.phase === "clue" && (
          <CluePhasePanel
            roomState={state}
            myUserId={myUserId}
            onStateUpdate={onStateUpdate}
          />
        )}

        {room.phase === "discussion" && (
          <DiscussionPanel
            room={room}
            participants={participants}
            chat={state.chat}
            myUserId={myUserId}
          />
        )}

        {room.phase === "voting" && activeVoteStatus && (
          <VotingPanel
            roomState={state}
            myUserId={myUserId}
            voteStatus={activeVoteStatus}
            onStateUpdate={onStateUpdate}
          />
        )}

        {(room.phase === "finalizing" || room.phase === "voting") &&
          !activeVoteStatus && (
            <div className="flex flex-col items-center gap-3 py-16 text-foreground/50">
              <Loader2 className="h-7 w-7 animate-spin" aria-hidden />
              <p className="text-[0.88rem]">Calculating results…</p>
            </div>
          )}
      </SectionContainer>
    </PageShell>
  );
}
