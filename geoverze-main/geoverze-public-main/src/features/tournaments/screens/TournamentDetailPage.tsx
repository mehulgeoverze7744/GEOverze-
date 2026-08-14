import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, Coins, Crown, Layers, Trophy, Users } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { CoverArt } from "@/features/play/components/CoverArt";
import { TOURNAMENT_STATUS_LABEL, tournamentBySlug } from "../data/tournaments";

/** /play/tournaments/$slug — bracket overview, roster and prize breakdown. */
export function TournamentDetailPage() {
  const { slug } = useParams({ from: "/play/tournaments/$slug" });
  const tournament = tournamentBySlug(slug);

  if (!tournament) {
    return (
      <PageShell>
        <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)] text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Tournament not found
          </h1>
          <p className="mt-3 text-[0.9rem] text-foreground/55">
            This bracket may have been retired.
          </p>
          <GeoButton asChild variant="solid" size="md" className="mt-6">
            <Link to="/play/tournaments">Back to tournaments</Link>
          </GeoButton>
        </SectionContainer>
      </PageShell>
    );
  }

  const facts = [
    { icon: Layers, label: "Format", value: tournament.format },
    { icon: Users, label: "Field", value: `${tournament.participants}/${tournament.capacity}` },
    { icon: CalendarClock, label: "Rounds", value: `${tournament.rounds} rounds` },
    {
      icon: Coins,
      label: "Entry",
      value: tournament.entryCredits === 0 ? "Free" : `${tournament.entryCredits} credits`,
    },
  ];

  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <Link
            to="/play/tournaments"
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
            All tournaments
          </Link>
        </AnimatedSection>

        <AnimatedSection className="mt-6 overflow-hidden rounded-3xl border border-bronze/20">
          <div className="relative">
            <CoverArt art={tournament.art} ratio="wide" className="h-48 md:h-64" />
            <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.13_0.006_60)] via-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <MetaChip tone={tournament.status === "live" ? "bronze" : "muted"}>
                {TOURNAMENT_STATUS_LABEL[tournament.status]} · {tournament.region}
              </MetaChip>
              <h1 className="mt-3 text-[clamp(1.7rem,4vw,2.6rem)] font-semibold leading-[1.08] tracking-tight text-foreground">
                {tournament.title}
              </h1>
            </div>
          </div>
        </AnimatedSection>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <AnimatedSection>
            <p className="text-[0.95rem] leading-relaxed text-foreground/65">
              {tournament.description}
            </p>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              {facts.map((fact) => (
                <div key={fact.label} className="game-surface rounded-2xl p-4">
                  <dt className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-foreground/50">
                    <fact.icon className="h-3.5 w-3.5 text-bronze" strokeWidth={1.9} aria-hidden />
                    {fact.label}
                  </dt>
                  <dd className="mt-2 text-[0.92rem] font-semibold text-foreground">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>

            <section className="mt-8" aria-label="Bracket rounds">
              <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
                Bracket
              </h2>
              <ol className="mt-4 space-y-2.5">
                {Array.from({ length: tournament.rounds }, (_, i) => (
                  <li
                    key={i}
                    className="game-surface flex items-center justify-between gap-4 rounded-xl px-4 py-3"
                  >
                    <span className="text-[0.85rem] font-semibold text-foreground">
                      {i === tournament.rounds - 1 ? "Final" : `Round ${i + 1}`}
                    </span>
                    <span className="text-[0.72rem] tabular-nums text-foreground/50">
                      {Math.max(2, Math.round(tournament.capacity / 2 ** (i + 1)) * 2)} players
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </AnimatedSection>

          <AnimatedSection>
            <div className="game-surface rounded-2xl p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-[0.95rem] font-semibold tracking-tight text-foreground">
                <Trophy className="h-4 w-4 text-bronze" strokeWidth={1.9} aria-hidden />
                Prize
              </h2>
              <p className="mt-2 text-[0.85rem] text-foreground/60">{tournament.prizeLabel}</p>
              {tournament.winner ? (
                <p className="mt-4 flex items-center gap-2 text-[0.82rem] text-bronze-glow">
                  <Crown className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Won by {tournament.winner}
                </p>
              ) : null}
              <GeoButton
                asChild
                variant={tournament.status === "completed" ? "dark" : "solid"}
                size="lg"
                className="mt-6 w-full"
              >
                <Link to="/play/matchmaking" search={{ mode: "pvp", quiz: undefined }}>
                  {tournament.status === "completed" ? "Play the format" : "Warm up in PvP"}
                </Link>
              </GeoButton>
              <p className="mt-3 text-[0.72rem] text-foreground/50">
                Registration opens with competitive play.
              </p>
            </div>

            <div className="game-surface mt-6 rounded-2xl p-5 sm:p-6">
              <h2 className="text-[0.95rem] font-semibold tracking-tight text-foreground">
                Notable entrants
              </h2>
              <ul className="mt-4 space-y-2.5">
                {tournament.roster.map((handle) => (
                  <li
                    key={handle}
                    className="flex items-center justify-between gap-3 text-[0.84rem] text-foreground/65"
                  >
                    <span className="truncate">{handle}</span>
                    <span className="text-[0.7rem] uppercase tracking-[0.14em] text-foreground/50">
                      Seeded
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </SectionContainer>
    </PageShell>
  );
}
