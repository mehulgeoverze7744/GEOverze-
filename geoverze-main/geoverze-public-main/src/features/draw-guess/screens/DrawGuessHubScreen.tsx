import { Link } from "@tanstack/react-router";
import { DoorOpen, Lock, Palette, Plus } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { SessionHero } from "@/features/play/components/SessionHero";
import { thumbnailForGameType } from "@/features/play/data/sessionArtwork";
import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";

export function DrawGuessHubScreen() {
  const signedIn = useAuthStore(selectIsSignedIn);

  if (!signedIn) {
    return (
      <PageShell>
        <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]">
          <AnimatedSection className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-bronze/15">
            <SessionHero thumbnail={thumbnailForGameType("draw-guess")} className="h-36" />
          </AnimatedSection>
          <AnimatedSection className="mx-auto mt-8 max-w-xl text-center">
            <MetaChip tone="bronze">
              <Lock className="h-3 w-3" strokeWidth={2.2} aria-hidden />
              Draw &amp; Guess
            </MetaChip>
            <h1 className="mt-5 text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-foreground">
              Sign in to play
            </h1>
            <p className="mt-4 text-[0.9rem] leading-relaxed text-foreground/60">
              Draw &amp; Guess rooms require an account to keep your room code, roster and score
              tied to you.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <GeoButton variant="solid" size="lg" asChild>
                <Link to="/auth/login">Sign in</Link>
              </GeoButton>
              <GeoButton variant="dark" size="lg" asChild>
                <Link to="/play">Back to Play</Link>
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
        <AnimatedSection className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-bronze/15">
          <SessionHero thumbnail={thumbnailForGameType("draw-guess")} className="h-40 sm:h-52" />
        </AnimatedSection>

        <AnimatedSection className="mx-auto mt-8 max-w-3xl text-center">
          <MetaChip tone="bronze">
            <Palette className="h-3 w-3" strokeWidth={2.2} aria-hidden />
            Draw &amp; Guess
          </MetaChip>
          <h1 className="mt-5 text-[clamp(1.8rem,4vw,2.8rem)] font-semibold leading-[1.08] tracking-tight text-foreground">
            Draw the world together
          </h1>
          <p className="mt-4 text-[0.9rem] leading-relaxed text-foreground/60">
            Take turns drawing geography clues while your friends race to guess. Create a private
            room or join one with a six-character code.
          </p>
        </AnimatedSection>

        <AnimatedSection className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
          <GeoButton variant="solid" size="lg" className="h-auto flex-col gap-3 py-8" asChild>
            <Link to="/play/draw-guess/create">
              <Plus className="h-5 w-5" strokeWidth={2.2} aria-hidden />
              Create room
            </Link>
          </GeoButton>
          <GeoButton variant="dark" size="lg" className="h-auto flex-col gap-3 py-8" asChild>
            <Link to="/play/draw-guess/join">
              <DoorOpen className="h-5 w-5" strokeWidth={2.2} aria-hidden />
              Join with code
            </Link>
          </GeoButton>
        </AnimatedSection>

        <p className="mx-auto mt-8 max-w-xl text-center text-[0.72rem] text-foreground/50">
          Private rooms only. Choose your categories, difficulty and number of rounds before sharing
          the code with friends.
        </p>
      </SectionContainer>
    </PageShell>
  );
}
