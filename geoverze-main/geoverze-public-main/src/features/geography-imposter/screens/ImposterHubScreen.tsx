import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Eye,
  Fingerprint,
  KeyRound,
  MapPin,
  MessageSquare,
  Search,
  Shield,
  Trophy,
  Users,
  Vote,
} from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { SessionHero } from "@/features/play/components/SessionHero";
import { thumbnailForGameType } from "@/features/play/data/sessionArtwork";
import { cn } from "@/lib/utils";
import { selectUser, useAuthStore } from "@/stores/authStore";

const HOW_IT_WORKS = [
  {
    title: "Secret Words",
    icon: Eye,
    body: "Each player secretly receives a geography word — everyone gets the same one except one player (the imposter) who gets a related but different word.",
  },
  {
    title: "Give Your Clue",
    icon: MessageSquare,
    body: "Over 3 rounds, each player gives one spoken clue hinting at their word without saying it directly.",
  },
  {
    title: "Read the Room",
    icon: Users,
    body: "After each round, discuss who gave suspiciously vague or slightly off clues.",
  },
  {
    title: "Find the Imposter",
    icon: Vote,
    body: "After round 3, everyone votes for who they think is the imposter.",
  },
  {
    title: "Win or Escape",
    icon: Trophy,
    body: "Regular players score points for identifying the imposter; the imposter scores if they escape!",
  },
] as const;

const STATUS_STRIP = [
  { icon: Fingerprint, label: "3 Rounds" },
  { icon: Shield, label: "Social Deduction" },
  { icon: MapPin, label: "Geography-based" },
  { icon: KeyRound, label: "Room Code Multiplayer" },
] as const;

function lobbyCard(className?: string) {
  return cn(
    "rounded-[1.35rem] border border-bronze/20 bg-[oklch(0.145_0.008_60/0.78)] shadow-[0_12px_40px_oklch(0_0_0/0.28)] backdrop-blur-xl",
    className,
  );
}

function ModeCard({
  to,
  icon: Icon,
  badge,
  title,
  description,
  action,
}: {
  to: "/play/imposter/create" | "/play/imposter/join";
  icon: typeof Shield;
  badge: string;
  title: string;
  description: string;
  action: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group/card block h-full rounded-[1.35rem] border border-bronze/22 bg-[oklch(0.145_0.008_60/0.82)] p-6 shadow-[0_12px_36px_oklch(0_0_0/0.28)] backdrop-blur-xl",
        "transition-[transform,border-color,box-shadow] duration-200 motion-reduce:transition-none",
        "hover:-translate-y-0.5 hover:border-bronze/50 hover:shadow-[0_0_28px_oklch(0.72_0.1_70/0.16)] motion-reduce:hover:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl border border-bronze/30 bg-bronze/12">
          <Icon className="h-6 w-6 text-bronze" strokeWidth={1.7} aria-hidden />
        </div>
        <span className="rounded-full border border-bronze/25 bg-bronze/10 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-bronze">
          {badge}
        </span>
      </div>
      <h2 className="mt-5 text-[1.15rem] font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 text-[0.82rem] leading-relaxed text-foreground/55">{description}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-bronze">
        {action}
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover/card:translate-x-0.5 motion-reduce:group-hover/card:translate-x-0"
          strokeWidth={2.2}
          aria-hidden
        />
      </span>
    </Link>
  );
}

/** /play/imposter — entry hub with Create / Join cards. */
export function ImposterHubScreen() {
  const user = useAuthStore(selectUser);

  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+1.5rem)] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <Link
            to="/play"
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
          >
            ← Let's Play
          </Link>

          <section className={cn(lobbyCard(), "relative mt-5 overflow-hidden")}>
            <div className="pointer-events-none absolute inset-0 opacity-[0.34]">
              <SessionHero
                thumbnail={thumbnailForGameType("geography-imposter")}
                className="h-full min-h-[18rem] sm:min-h-[20rem]"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.008_60/0.94)] via-[oklch(0.12_0.008_60/0.78)] to-[oklch(0.12_0.008_60/0.42)]" />
            <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(11rem,16rem)] lg:items-end lg:p-10">
              <div className="min-w-0">
                <MetaChip tone="bronze">Social Deduction</MetaChip>
                <h1 className="mt-4 bg-gradient-to-r from-bronze-glow via-foreground to-bronze bg-clip-text text-[clamp(2.4rem,6vw,4.1rem)] font-semibold tracking-tight text-transparent">
                  GEOsus
                </h1>
                <p className="mt-2 text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-bronze">
                  Trust the clues. Question everyone.
                </p>
                <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-foreground/68">
                  One player gets a different word. Everyone gives clues. Can you spot the imposter
                  before they escape?
                </p>
              </div>
              <div
                className="hidden overflow-hidden rounded-2xl border border-bronze/25 lg:block"
                aria-hidden
              >
                <SessionHero
                  thumbnail={thumbnailForGameType("geography-imposter")}
                  className="h-36"
                />
              </div>
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection className="mt-5">
          <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {STATUS_STRIP.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 rounded-xl border border-white/8 bg-[oklch(0.145_0.008_60/0.7)] px-3 py-2.5 backdrop-blur-md"
              >
                <item.icon
                  className="h-3.5 w-3.5 shrink-0 text-bronze"
                  strokeWidth={1.8}
                  aria-hidden
                />
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-foreground/70">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </AnimatedSection>

        <AnimatedSection className="mt-8">
          {user ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <ModeCard
                to="/play/imposter/create"
                icon={Shield}
                badge="Host"
                title="Create a Room"
                description="Choose the category, difficulty, and player limit. Get a room code to share with friends."
                action="Create room"
              />
              <ModeCard
                to="/play/imposter/join"
                icon={Users}
                badge="Join friends"
                title="Join a Room"
                description="Have a 6-character room code? Enter it here to jump straight into the lobby."
                action="Enter code"
              />
            </div>
          ) : (
            <div className={cn(lobbyCard(), "px-6 py-8 text-center sm:px-10")}>
              <Search className="mx-auto h-10 w-10 text-bronze/70" strokeWidth={1.5} aria-hidden />
              <h2 className="mt-4 text-xl font-semibold text-foreground">Sign in to play</h2>
              <p className="mx-auto mt-2 max-w-md text-[0.88rem] text-foreground/60">
                GEOsus is a live multiplayer game. Please sign in to create or join a room.
              </p>
              <GeoButton asChild variant="solid" size="lg" className="mt-6">
                <Link to="/auth/login">Sign in</Link>
              </GeoButton>
            </div>
          )}
        </AnimatedSection>

        <AnimatedSection className="mt-8">
          <section className={cn(lobbyCard(), "p-5 sm:p-7")} aria-labelledby="how-geosus-works">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-bronze">
              Game guide
            </p>
            <h2
              id="how-geosus-works"
              className="mt-2 text-[1.35rem] font-semibold tracking-tight text-foreground"
            >
              How the Game Works
            </h2>
            <ol className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {HOW_IT_WORKS.map((step, i) => (
                <li
                  key={step.title}
                  className="relative rounded-2xl border border-white/8 bg-[oklch(0.17_0.008_62/0.65)] p-4 transition-colors hover:border-bronze/35"
                >
                  {i < HOW_IT_WORKS.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute top-8 right-[-0.4rem] hidden h-px w-3 bg-bronze/35 xl:block"
                    />
                  ) : null}
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-bronze/35 bg-bronze/15 text-[0.7rem] font-bold text-bronze">
                      {i + 1}
                    </span>
                    <step.icon className="h-4 w-4 text-bronze" strokeWidth={1.8} aria-hidden />
                  </div>
                  <h3 className="mt-3 text-[0.92rem] font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-[0.78rem] leading-relaxed text-foreground/58">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
