import { ArrowRight, Shield, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { selectUser, useAuthStore } from "@/stores/authStore";

/** /play/imposter — entry hub with Create / Join cards. */
export function ImposterHubScreen() {
  const user = useAuthStore(selectUser);

  if (!user) {
    return (
      <PageShell>
        <SectionContainer
          size="narrow"
          className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)] text-center"
        >
          <Shield className="mx-auto h-12 w-12 text-bronze/60 mb-4" strokeWidth={1.4} aria-hidden />
          <h1 className="text-2xl font-semibold text-foreground">Sign in to play</h1>
          <p className="mt-3 text-[0.88rem] text-foreground/60">
            Geography Imposter is a live multiplayer game. Please sign in to create or join a
            room.
          </p>
        </SectionContainer>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionContainer
        size="narrow"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <Link
            to="/play"
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
          >
            ← Let's Play
          </Link>

          <MetaChip tone="bronze" className="mt-5">
            Multiplayer · 3–16 players
          </MetaChip>

          <h1 className="mt-4 text-[clamp(1.8rem,4vw,2.7rem)] font-semibold tracking-tight text-foreground">
            Geography Imposter
          </h1>
          <p className="mt-3 max-w-lg text-[0.9rem] leading-relaxed text-foreground/60">
            One player gets a different word. Everyone gives clues. Can you spot the imposter
            before they escape?
          </p>
        </AnimatedSection>

        <AnimatedSection className="mt-10 grid gap-4 sm:grid-cols-2">
          {/* Create */}
          <Link to="/play/imposter/create" className="group block">
            <div className="h-full rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6 transition-all hover:border-bronze/30 hover:bg-bronze/[0.04]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bronze/10">
                <Shield className="h-6 w-6 text-bronze" strokeWidth={1.7} aria-hidden />
              </div>
              <h2 className="text-[1.05rem] font-semibold text-foreground">Create a Room</h2>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-foreground/55">
                Choose the category, difficulty, and player limit. Get a room code to share
                with friends.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[0.78rem] font-semibold text-bronze">
                Create room
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </div>
            </div>
          </Link>

          {/* Join */}
          <Link to="/play/imposter/join" className="group block">
            <div className="h-full rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6 transition-all hover:border-bronze/30 hover:bg-bronze/[0.04]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bronze/10">
                <Users className="h-6 w-6 text-bronze" strokeWidth={1.7} aria-hidden />
              </div>
              <h2 className="text-[1.05rem] font-semibold text-foreground">Join a Room</h2>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-foreground/55">
                Have a 6-character room code? Enter it here to jump straight into the lobby.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[0.78rem] font-semibold text-bronze">
                Enter code
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </div>
            </div>
          </Link>
        </AnimatedSection>

        {/* How-to */}
        <AnimatedSection className="mt-10">
          <div className="rounded-2xl border border-foreground/8 bg-foreground/[0.03] p-5">
            <h3 className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-foreground/50 mb-4">
              How to play
            </h3>
            <ol className="space-y-2.5">
              {[
                "Each player secretly receives a geography word — everyone gets the same one except one player (the imposter) who gets a related but different word.",
                "Over 3 rounds, each player gives one spoken clue hinting at their word without saying it directly.",
                "After each round, discuss who gave suspiciously vague or slightly off clues.",
                "After round 3, everyone votes for who they think is the imposter.",
                "Regular players score points for identifying the imposter; the imposter scores if they escape!",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-[0.82rem] text-foreground/65">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bronze/15 text-[0.65rem] font-bold text-bronze">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
