/**
 * Special event placeholder data.
 *
 * Seasonal, limited-time and community events. Everything is illustrative copy
 * shaped like a future `events` endpoint.
 */

export type EventKind = "seasonal" | "limited" | "community";

export type GameEvent = {
  id: string;
  title: string;
  kind: EventKind;
  art: string;
  window: string;
  summary: string;
  reward: string;
  participants: number;
  /** Rendered as an inert, clearly-labelled placeholder card. */
  locked?: boolean;
};

export const EVENT_KIND_LABEL: Record<EventKind, string> = {
  seasonal: "Seasonal",
  limited: "Limited time",
  community: "Community",
};

export const EVENTS: readonly GameEvent[] = [
  {
    id: "e-solstice",
    title: "Solstice Expedition",
    kind: "seasonal",
    art: "nature",
    window: "Runs all month",
    summary:
      "A season-long trail of daily sets that walks from the equator to the poles, one climate band at a time.",
    reward: "Solstice crest + bonus credits",
    participants: 24_800,
  },
  {
    id: "e-flag-fortnight",
    title: "Flag Fortnight",
    kind: "limited",
    art: "flags",
    window: "14 days left",
    summary:
      "Double XP on every flag round, plus a rotating bonus continent that changes at midnight.",
    reward: "Double XP + Vexillologist badge",
    participants: 18_120,
  },
  {
    id: "e-river-relay",
    title: "River Relay",
    kind: "limited",
    art: "physical",
    window: "Weekend only",
    summary:
      "Trace the world's great river systems upstream. Finish clean for a streak shield that survives one missed day.",
    reward: "Streak shield",
    participants: 9_460,
  },
  {
    id: "e-community-atlas",
    title: "Community Atlas Build",
    kind: "community",
    art: "countries",
    window: "Open entries",
    summary:
      "Creators submit sets, the community votes, and the top twenty ship as a permanent GEOverze collection.",
    reward: "Creator spotlight",
    participants: 3_240,
  },
  {
    id: "e-club-night",
    title: "Club Night Rooms",
    kind: "community",
    art: "multiplayer",
    window: "Every Friday",
    summary:
      "Open multiplayer rooms hosted by community clubs. Drop in, pick a room, race sixteen players.",
    reward: "Club standing points",
    participants: 6_710,
  },
  {
    id: "e-esports",
    title: "GEOverze Esports Series",
    kind: "seasonal",
    art: "tournament",
    window: "Not scheduled yet",
    summary:
      "A broadcast competitive circuit with qualifiers, team rosters and a permanent season record.",
    reward: "Announced with the first season",
    participants: 0,
    locked: true,
  },
];
