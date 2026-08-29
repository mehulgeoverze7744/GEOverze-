import { Link } from "@tanstack/react-router";
import { DoorOpen, Lock, Plus, Swords } from "lucide-react";
import { useEffect } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";
import { resetQuizRun } from "@/stores/quizStore";

/** /play/pvp — private-room entry: create or join by code. */
export function PvpHubScreen() {
  const signedIn = useAuthStore(selectIsSignedIn);

  useEffect(() => {
    resetQuizRun();
  }, []);

  if (!signedIn) {
    return (
      <PageShell>
        <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]">
          <AnimatedSection className="mx-auto max-w-xl text-center">
            <MetaChip tone="bronze">
              <Lock className="h-3 w-3" strokeWidth={2.2} aria-hidden />
              PvP
            </MetaChip>
            <h1 className="mt-5 text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-foreground">
              Sign in to duel
            </h1>
            <p className="mt-4 text-[0.9rem] leading-relaxed text-foreground/60">
              Private PvP rooms require an account so your room code, roster and progression stay
              tied to you.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <GeoButton variant="solid" size="lg" asChild>
                <Link to="/auth/login">Sign in</Link>
              </GeoButton>
              <GeoButton variant="dark" size="lg" asChild>
                <Link to="/play/modes">Back to modes</Link>
              </GeoButton>
            </div>
          </AnimatedSection>
        </SectionContainer>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]">
        <AnimatedSection className="mx-auto max-w-3xl text-center">
          <MetaChip tone="bronze">
            <Swords className="h-3 w-3" strokeWidth={2.2} aria-hidden />
            Private PvP
          </MetaChip>
          <h1 className="mt-5 text-[clamp(1.8rem,4vw,2.8rem)] font-semibold leading-[1.08] tracking-tight text-foreground">
            Duel a friend
          </h1>
          <p className="mt-4 text-[0.9rem] leading-relaxed text-foreground/60">
            Create a private room, share the six-character code, and both players ready up in the
            lobby. Gameplay scoring arrives in the next phase.
          </p>
        </AnimatedSection>

        <AnimatedSection className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
          <GeoButton variant="solid" size="lg" className="h-auto flex-col gap-3 py-8" asChild>
            <Link to="/play/pvp/create">
              <Plus className="h-5 w-5" strokeWidth={2.2} aria-hidden />
              Create room
            </Link>
          </GeoButton>
          <GeoButton variant="dark" size="lg" className="h-auto flex-col gap-3 py-8" asChild>
            <Link to="/play/pvp/join">
              <DoorOpen className="h-5 w-5" strokeWidth={2.2} aria-hidden />
              Join with code
            </Link>
          </GeoButton>
        </AnimatedSection>

        <p className="mx-auto mt-8 max-w-xl text-center text-[0.72rem] text-foreground/50">
          Public matchmaking is not available yet. This phase supports private room codes only.
        </p>
      </SectionContainer>
    </PageShell>
  );
}
