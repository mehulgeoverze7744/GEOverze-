import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { SessionHero } from "@/features/play/components/SessionHero";
import { thumbnailForGameType } from "@/features/play/data/sessionArtwork";
import { joinImpRoom } from "../data/impRoomApi";

export function ImposterJoinScreen() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      toast.error("Room code must be 6 characters");
      return;
    }
    setJoining(true);
    try {
      const state = await joinImpRoom(trimmed);
      void navigate({
        to: "/play/imposter/room",
        search: { room: state.room.id, code: state.room.room_code },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not join room");
    } finally {
      setJoining(false);
    }
  };

  return (
    <PageShell>
      <SectionContainer
        size="narrow"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <Link
            to="/play/imposter"
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
            Back
          </Link>
          <div className="mt-5 overflow-hidden rounded-2xl border border-bronze/15">
            <SessionHero
              thumbnail={thumbnailForGameType("geography-imposter")}
              className="h-36 sm:h-44"
            />
          </div>
          <MetaChip tone="bronze" className="mt-5">
            Join room
          </MetaChip>
          <h1 className="mt-4 text-[clamp(1.6rem,3.5vw,2.4rem)] font-semibold tracking-tight text-foreground">
            Enter Room Code
          </h1>
          <p className="mt-3 text-[0.88rem] leading-relaxed text-foreground/60">
            Ask the room host for their 6-character code and type it below.
          </p>
        </AnimatedSection>

        <AnimatedSection className="mt-10 max-w-sm mx-auto space-y-4">
          <input
            className="w-full rounded-2xl border border-foreground/15 bg-background px-5 py-4 text-center text-2xl font-bold uppercase tracking-[0.3em] placeholder:text-foreground/25 placeholder:tracking-normal focus:border-bronze/50 focus:outline-none"
            placeholder="ABC123"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleJoin();
            }}
            autoFocus
            autoCapitalize="characters"
            spellCheck={false}
          />

          <GeoButton
            variant="solid"
            size="xl"
            className="w-full"
            onClick={() => void handleJoin()}
            disabled={code.trim().length !== 6 || joining}
          >
            {joining ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Joining…
              </>
            ) : (
              "Join Room"
            )}
          </GeoButton>
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
