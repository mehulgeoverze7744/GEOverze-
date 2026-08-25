import { Link } from "@tanstack/react-router";
import { Loader2, Users } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { GeoButton, SectionContainer } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import type { MultiplayerRoomState } from "../types";

type MultiplayerMatchPlaceholderProps = {
  state: MultiplayerRoomState;
  roomCode: string | undefined;
};

/** MP1 placeholder — match started; gameplay arrives in MP2. */
export function MultiplayerMatchPlaceholder({ state, roomCode }: MultiplayerMatchPlaceholderProps) {
  const code = state.room.room_code ?? roomCode ?? "";
  const activeCount = state.room.active_player_count ?? state.participants.length;

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]">
        <div className="game-surface mx-auto max-w-lg rounded-2xl p-8 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-bronze/30 bg-bronze/10 text-bronze-glow">
            <Users className="h-6 w-6" strokeWidth={1.8} aria-hidden />
          </span>
          <MetaChip tone="bronze" className="mt-5">
            Room {code}
          </MetaChip>
          <h1 className="mt-4 text-xl font-semibold text-foreground">
            Multiplayer match started — gameplay coming next.
          </h1>
          <p className="mt-3 text-[0.9rem] leading-relaxed text-foreground/60">
            {activeCount} player{activeCount === 1 ? "" : "s"} locked in. QuizPlay integration and
            server submission arrive in the next phase.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-[0.82rem] text-foreground/50">
            <Loader2 className="h-4 w-4 animate-spin text-bronze" aria-hidden />
            Waiting for MP2 gameplay…
          </div>
          <GeoButton variant="solid" size="md" className="mt-8" asChild>
            <Link to="/play/multiplayer">Back to multiplayer hub</Link>
          </GeoButton>
        </div>
      </SectionContainer>
    </PageShell>
  );
}
