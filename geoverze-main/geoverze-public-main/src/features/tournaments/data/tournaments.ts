/**
 * Tournament placeholder data.
 *
 * Shaped like a future `tournaments` endpoint: status-driven records with a
 * schedule, prize copy and participant previews. No bracket engine attached.
 */

export type TournamentStatus = "live" | "upcoming" | "completed";

export type Tournament = {
  slug: string;
  title: string;
  status: TournamentStatus;
  format: string;
  mode: string;
  art: string;
  summary: string;
  description: string;
  /** ISO timestamp of the first round. */
  startsAt: string;
  rounds: number;
  participants: number;
  capacity: number;
  entryCredits: number;
  prizeLabel: string;
  region: string;
  roster: readonly string[];
  winner?: string;
};

const HOUR = 3_600_000;
const at = (offsetHours: number) => new Date(Date.now() + offsetHours * HOUR).toISOString();

export const TOURNAMENT_STATUS_LABEL: Record<TournamentStatus, string> = {
  live: "Live now",
  upcoming: "Upcoming",
  completed: "Completed",
};

export const TOURNAMENTS: readonly Tournament[] = [
  {
    slug: "atlas-open",
    title: "Atlas Open",
    status: "live",
    format: "Single elimination",
    mode: "PvP duels",
    art: "countries",
    summary: "Sixty-four explorers, six rounds, one seat in the season final.",
    description:
      "The flagship open bracket. Mixed-format rounds escalate from flags into pin-drop finals, with sudden-death tiebreaks on identical scores.",
    startsAt: at(-2),
    rounds: 6,
    participants: 64,
    capacity: 64,
    entryCredits: 0,
    prizeLabel: "Season crest + 500 credits",
    region: "Global",
    roster: ["meridian_kai", "atlas_emma", "noor.maps", "delta_ravi", "summit_lena", "voyager_ana"],
  },
  {
    slug: "capital-clash",
    title: "Capital Clash",
    status: "upcoming",
    format: "Swiss, five rounds",
    mode: "Solo timed",
    art: "capitals",
    summary: "Capitals only. No maps, no mercy.",
    description:
      "A pure recall bracket built from capital-city sets. Swiss pairing means every entrant plays all five rounds regardless of results.",
    startsAt: at(19),
    rounds: 5,
    participants: 148,
    capacity: 256,
    entryCredits: 10,
    prizeLabel: "1,000 credits pool",
    region: "Global",
    roster: ["atlas_emma", "noor.maps", "orbit_tom", "equator_zoe"],
  },
  {
    slug: "map-masters-cup",
    title: "Map Masters Cup",
    status: "upcoming",
    format: "Double elimination",
    mode: "PvP duels",
    art: "maps",
    summary: "Pin-drop precision, decided in metres.",
    description:
      "Every round is map-select. Ties are resolved by average distance from the true point, so accuracy beats speed here.",
    startsAt: at(74),
    rounds: 7,
    participants: 62,
    capacity: 128,
    entryCredits: 25,
    prizeLabel: "Cartographer badge + 1,500 credits",
    region: "Global",
    roster: ["meridian_kai", "delta_ravi", "compass_ivo"],
  },
  {
    slug: "monsoon-invitational",
    title: "Monsoon Invitational",
    status: "completed",
    format: "Group stage + finals",
    mode: "Multiplayer rooms",
    art: "nature",
    summary: "Climate and ecosystems, sixteen rooms deep.",
    description:
      "An invitational built around climate systems, currents and biomes. Group winners advanced into a four-player final room.",
    startsAt: at(-320),
    rounds: 4,
    participants: 96,
    capacity: 96,
    entryCredits: 0,
    prizeLabel: "Terra crest + 750 credits",
    region: "Asia-Pacific",
    roster: ["voyager_ana", "summit_lena", "equator_zoe", "orbit_tom"],
    winner: "summit_lena",
  },
  {
    slug: "winter-borders",
    title: "Winter Borders",
    status: "completed",
    format: "Single elimination",
    mode: "PvP duels",
    art: "landmarks",
    summary: "Border trivia at the edge of the season.",
    description:
      "A short winter bracket focused on enclaves, exclaves and disputed lines. Decided on a sudden-death tiebreak.",
    startsAt: at(-900),
    rounds: 5,
    participants: 32,
    capacity: 32,
    entryCredits: 5,
    prizeLabel: "300 credits",
    region: "Europe",
    roster: ["atlas_emma", "compass_ivo", "meridian_kai"],
    winner: "meridian_kai",
  },
];

const BY_SLUG = new Map(TOURNAMENTS.map((t) => [t.slug, t]));

export const tournamentBySlug = (slug: string): Tournament | undefined => BY_SLUG.get(slug);

export const tournamentsByStatus = (status: TournamentStatus): Tournament[] =>
  TOURNAMENTS.filter((t) => t.status === status);
