import { Link } from "@tanstack/react-router";
import { Lock, Sparkles, Users } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, PageHeader, SectionContainer } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { CoverArt } from "@/features/play/components/CoverArt";
import { GameCard } from "@/features/play/components/GameCard";
import { EVENTS, EVENT_KIND_LABEL } from "../data/events";

/** /play/events — seasonal, limited-time and community events. */
export function EventsPage() {
  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <PageHeader
          eyebrow="Special events"
          title="Events"
          description="Limited-time trails, seasonal expeditions and community builds. Event copy is illustrative for now."
        />

        <AnimatedSection className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {EVENTS.map((event) => (
            <GameCard key={event.id} className="flex flex-col">
              <div className="relative">
                <CoverArt art={event.art} ratio="wide" />
                <span className="absolute left-3 top-3">
                  <MetaChip tone={event.locked ? "muted" : "bronze"}>
                    {EVENT_KIND_LABEL[event.kind]}
                  </MetaChip>
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-[0.98rem] font-semibold tracking-tight text-foreground">
                  {event.title}
                </h2>
                <p className="mt-1 text-[0.72rem] text-foreground/50">{event.window}</p>
                <p className="mt-3 flex-1 text-[0.82rem] leading-relaxed text-foreground/55">
                  {event.summary}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <MetaChip>
                    <Sparkles className="h-3 w-3 text-bronze" strokeWidth={2} aria-hidden />
                    {event.reward}
                  </MetaChip>
                  {event.participants > 0 ? (
                    <MetaChip>
                      <Users className="h-3 w-3" strokeWidth={2} aria-hidden />
                      {event.participants.toLocaleString()} joined
                    </MetaChip>
                  ) : null}
                </div>
                {event.locked ? (
                  <p
                    aria-disabled
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-bronze/25 px-4 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-foreground/50"
                  >
                    <Lock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    Coming later
                  </p>
                ) : (
                  <GeoButton asChild variant="solid" size="md" className="mt-5 w-full">
                    <Link to="/play/daily-challenges">Join event</Link>
                  </GeoButton>
                )}
              </div>
            </GameCard>
          ))}
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
