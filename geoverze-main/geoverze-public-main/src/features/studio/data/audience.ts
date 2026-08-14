/** Placeholder audience data. */
import type { Follower } from "./types";

export const AUDIENCE_SUMMARY = {
  followers: 24_860,
  newThisMonth: 1_180,
  activeReaders: 9_420,
  averageSessionMinutes: 7.4,
  repeatPlayRate: 0.38,
  commentsReceived: 1_965,
};

export const FOLLOWERS: Follower[] = [
  {
    id: "f1",
    name: "Nadia Rahman",
    handle: "nadiar",
    tier: "Cartographer",
    followedAt: "2026-08-05T18:20:00Z",
    quizzesPlayed: 214,
    articlesRead: 88,
    country: "Bangladesh",
  },
  {
    id: "f2",
    name: "Tomas Lindqvist",
    handle: "tomasl",
    tier: "Navigator",
    followedAt: "2026-08-05T11:02:00Z",
    quizzesPlayed: 96,
    articlesRead: 41,
    country: "Sweden",
  },
  {
    id: "f3",
    name: "Priya Venkatesh",
    handle: "priyav",
    tier: "Cartographer",
    followedAt: "2026-08-04T20:44:00Z",
    quizzesPlayed: 340,
    articlesRead: 127,
    country: "India",
  },
  {
    id: "f4",
    name: "Diego Herrera",
    handle: "diegoh",
    tier: "Explorer",
    followedAt: "2026-08-04T09:15:00Z",
    quizzesPlayed: 22,
    articlesRead: 9,
    country: "Chile",
  },
  {
    id: "f5",
    name: "Aiko Tanaka",
    handle: "aikot",
    tier: "Navigator",
    followedAt: "2026-08-03T14:31:00Z",
    quizzesPlayed: 148,
    articlesRead: 63,
    country: "Japan",
  },
  {
    id: "f6",
    name: "Kwame Mensah",
    handle: "kwamem",
    tier: "Navigator",
    followedAt: "2026-08-02T17:08:00Z",
    quizzesPlayed: 112,
    articlesRead: 55,
    country: "Ghana",
  },
  {
    id: "f7",
    name: "Sofia Marchetti",
    handle: "sofiam",
    tier: "Explorer",
    followedAt: "2026-08-01T08:52:00Z",
    quizzesPlayed: 37,
    articlesRead: 18,
    country: "Italy",
  },
  {
    id: "f8",
    name: "Liam O'Sullivan",
    handle: "liamos",
    tier: "Cartographer",
    followedAt: "2026-07-31T21:19:00Z",
    quizzesPlayed: 268,
    articlesRead: 102,
    country: "Ireland",
  },
  {
    id: "f9",
    name: "Zeynep Aydin",
    handle: "zeynepa",
    tier: "Navigator",
    followedAt: "2026-07-30T12:40:00Z",
    quizzesPlayed: 131,
    articlesRead: 47,
    country: "Türkiye",
  },
  {
    id: "f10",
    name: "Ana Beatriz Lima",
    handle: "analima",
    tier: "Explorer",
    followedAt: "2026-07-29T06:05:00Z",
    quizzesPlayed: 44,
    articlesRead: 21,
    country: "Brazil",
  },
  {
    id: "f11",
    name: "Mikhail Volkov",
    handle: "mikhailv",
    tier: "Navigator",
    followedAt: "2026-07-28T15:27:00Z",
    quizzesPlayed: 87,
    articlesRead: 34,
    country: "Kazakhstan",
  },
  {
    id: "f12",
    name: "Fatima Al-Sayed",
    handle: "fatimaas",
    tier: "Cartographer",
    followedAt: "2026-07-27T10:11:00Z",
    quizzesPlayed: 301,
    articlesRead: 140,
    country: "Egypt",
  },
];

/** Highest-engagement followers. Placeholder ordering. */
export const TOP_FANS = FOLLOWERS.slice()
  .sort((a, b) => b.quizzesPlayed + b.articlesRead - (a.quizzesPlayed + a.articlesRead))
  .slice(0, 5);

export const RECENT_SUBSCRIBERS = FOLLOWERS.slice(0, 6);

export const ENGAGEMENT_METRICS = [
  { id: "e1", label: "Repeat play rate", value: "38%", hint: "Players returning to a second quiz" },
  { id: "e2", label: "Avg. session", value: "7m 24s", hint: "Across quizzes and articles" },
  { id: "e3", label: "Comment rate", value: "2.4%", hint: "Comments per 100 plays" },
  { id: "e4", label: "Follow-through", value: "11%", hint: "Readers who follow after an article" },
];
