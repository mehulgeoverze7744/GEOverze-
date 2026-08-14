import { Link } from "@tanstack/react-router";
import { CalendarClock, Coins, Trophy, Users } from "lucide-react";

import { GeoButton } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { CoverArt } from "@/features/play/components/CoverArt";
import { GameCard } from "@/features/play/components/GameCard";
import { TOURNAMENT_STATUS_LABEL, type Tournament } from "../data/tournaments";

function when(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const hours = Math.round(abs / 3_600_000);
  const label = hours >= 48 ? `${Math.round(hours / 24)} days` : `${hours} hours`;
  return diff > 0 ? `Starts in ${label}` : `Started ${label} ago`;
}

/** Tournament summary card. */
export function TournamentCard({ tournament }: { tournament: Tournament }) {
  const full = tournament.participants >= tournament.capacity;

  return (
    <GameCard className="flex flex-col">
      <div className="relative">
        <CoverArt art={tournament.art} ratio="wide" />
        <span className="absolute left-3 top-3">
          <MetaChip tone={tournament.status === "live" ? "bronze" : "muted"}>
            {TOURNAMENT_STATUS_LABEL[tournament.status]}
          </MetaChip>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[0.98rem] font-semibold tracking-tight text-foreground">
          {tournament.title}
        </h3>
        <p className="mt-1 text-[0.72rem] text-foreground/50">
          {tournament.format} · {tournament.mode}
        </p>
        <p className="mt-3 flex-1 text-[0.82rem] leading-relaxed text-foreground/55">
          {tournament.summary}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-y-2 text-[0.7rem] text-foreground/50">
          <div className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.8} aria-hidden />
            <dt className="sr-only">Schedule</dt>
            <dd>{tournament.status === "completed" ? "Finished" : when(tournament.startsAt)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.8} aria-hidden />
            <dt className="sr-only">Participants</dt>
            <dd>
              {tournament.participants}/{tournament.capacity}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-bronze" strokeWidth={1.8} aria-hidden />
            <dt className="sr-only">Prize</dt>
            <dd className="truncate">{tournament.prizeLabel}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Coins className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.8} aria-hidden />
            <dt className="sr-only">Entry</dt>
            <dd>
              {tournament.entryCredits === 0 ? "Free entry" : `${tournament.entryCredits} credits`}
            </dd>
          </div>
        </dl>

        <GeoButton asChild variant={full ? "dark" : "solid"} size="md" className="mt-5 w-full">
          <Link to="/play/tournaments/$slug" params={{ slug: tournament.slug }}>
            View bracket
          </Link>
        </GeoButton>
      </div>
    </GameCard>
  );
}
