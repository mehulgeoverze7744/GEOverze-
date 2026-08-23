import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, DoorOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { joinPvpRoom } from "../data/pvpRoomApi";

const CODE_LENGTH = 6;

/** /play/pvp/join — enter a private room code. */
export function PvpJoinScreen() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const normalized = code.toUpperCase().replace(/[^A-Z2-9]/g, "").slice(0, CODE_LENGTH);
  const canSubmit = normalized.length === CODE_LENGTH && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const state = await joinPvpRoom(normalized);
      navigate({
        to: "/play/pvp/room",
        search: { room: state.room.id, code: state.room.room_code },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not join room");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]">
        <AnimatedSection className="mx-auto max-w-xl">
          <Link
            to="/play/pvp"
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
            Back
          </Link>
          <MetaChip tone="bronze" className="mt-5">
            <DoorOpen className="h-3 w-3" strokeWidth={2.2} aria-hidden />
            Join room
          </MetaChip>
          <h1 className="mt-4 text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-foreground">
            Enter room code
          </h1>
          <p className="mt-3 text-[0.9rem] leading-relaxed text-foreground/60">
            Ask your opponent for their six-character code. Codes are case-insensitive.
          </p>

          <label className="mt-8 block">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-foreground/50">
              Room code
            </span>
            <input
              value={normalized}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void submit();
              }}
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={CODE_LENGTH}
              placeholder="ABC234"
              className="mt-3 w-full rounded-2xl border border-bronze/25 bg-[oklch(0.185_0.008_62)] px-5 py-4 text-center text-[1.6rem] font-semibold tracking-[0.35em] text-foreground outline-none focus:border-bronze"
            />
          </label>

          <GeoButton
            variant="solid"
            size="lg"
            className="mt-6 w-full"
            disabled={!canSubmit}
            onClick={() => void submit()}
          >
            Join room
          </GeoButton>
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
