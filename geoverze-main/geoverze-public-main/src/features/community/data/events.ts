/**
 * Upcoming community events. Placeholder scheduling — no calendar backend.
 */

export type CommunityEvent = {
  id: string;
  name: string;
  blurb: string;
  /** Human-readable date label. */
  when: string;
  kind: "live" | "workshop" | "tournament" | "meetup";
  host: string;
  attendees: number;
};

export const EVENTS: readonly CommunityEvent[] = [
  {
    id: "e-1",
    name: "Rivers of the World — live round",
    blurb: "A hosted quiz night across five continents of drainage basins.",
    when: "Fri 7 Aug · 18:00 UTC",
    kind: "live",
    host: "lucasferreira",
    attendees: 1_284,
  },
  {
    id: "e-2",
    name: "Reading a projection: workshop",
    blurb: "Why Mercator lies, and what to use instead when you teach.",
    when: "Sat 8 Aug · 14:00 UTC",
    kind: "workshop",
    host: "hannawinter",
    attendees: 642,
  },
  {
    id: "e-3",
    name: "Weekend Expedition kickoff",
    blurb: "Island nations, timed rounds, community leaderboard.",
    when: "Sat 8 Aug · 09:00 UTC",
    kind: "tournament",
    host: "priyanair",
    attendees: 3_290,
  },
  {
    id: "e-4",
    name: "Explorers meetup — Asia Pacific",
    blurb: "An informal community call for players in APAC time zones.",
    when: "Sun 9 Aug · 11:00 UTC",
    kind: "meetup",
    host: "yukitanaka",
    attendees: 208,
  },
];
