import { Users, Wifi } from "lucide-react";

import { MetaChip } from "@/features/play/components/Badges";
import { useQuizStore } from "@/stores/quizStore";
import type { MultiplayerParticipant, MultiplayerRoomStatus } from "../types";

type MultiplayerOpponentPanelProps = {
  participants: MultiplayerParticipant[];
  youUserId: string | undefined;
  roomStatus: MultiplayerRoomStatus;
};

/** Live multiplayer roster beside the quiz play screen. */
export function MultiplayerOpponentPanel({
  participants,
  youUserId,
  roomStatus,
}: MultiplayerOpponentPanelProps) {
  const answered = Object.keys(useQuizStore((s) => s.answers)).length;

  return (
    <section className="game-surface rounded-2xl p-5" aria-label="Room roster">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-bronze/30 bg-bronze/10 text-bronze-glow">
          <Users className="h-5 w-5" strokeWidth={1.7} aria-hidden />
        </span>
        <div>
          <p className="text-[0.85rem] font-semibold text-foreground/85">Multiplayer room</p>
          <p className="flex items-center gap-1.5 text-[0.7rem] text-foreground/50">
            <Wifi className="h-3 w-3" strokeWidth={1.8} aria-hidden />
            Live
          </p>
        </div>
      </div>

      <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto">
        {participants.map((participant) => {
          const isYou = participant.user_id === youUserId;
          const submitted = Boolean(participant.submitted_at);
          let statusLabel = "Playing";

          if (roomStatus === "completed") {
            statusLabel = submitted ? "Finished" : "—";
          } else if (submitted) {
            statusLabel = "Submitted";
          } else if (isYou) {
            statusLabel = `${answered} answered`;
          } else {
            statusLabel = "Playing";
          }

          return (
            <li
              key={participant.id}
              className="flex items-center justify-between rounded-xl border border-bronze/12 bg-[oklch(0.185_0.008_62)] px-3 py-2 text-[0.8rem]"
            >
              <div className="min-w-0">
                <span className={isYou ? "font-semibold text-bronze-glow" : "text-foreground/65"}>
                  {participant.username}
                  {isYou ? " (you)" : ""}
                </span>
                <p className="text-[0.68rem] text-foreground/45">Level {participant.level}</p>
              </div>
              <MetaChip>{statusLabel}</MetaChip>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
