/** Placeholder analytics series. No computation happens anywhere. */
import type { AnalyticsMetric, SeriesPoint } from "./types";

export type RangeId = "7d" | "30d" | "90d" | "12m";

export const RANGES: { id: RangeId; label: string }[] = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "12m", label: "12 months" },
];

/** Deterministic pseudo-series so charts are stable between renders. */
function series(seed: number, points: number, base: number, spread: number): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  let h = seed;
  for (let i = 0; i < points; i += 1) {
    h = (h * 1103515245 + 12345) % 2147483648;
    const wobble = (h / 2147483648) * spread;
    const trend = (i / points) * spread * 0.9;
    out.push({ label: `${i + 1}`, value: Math.round(base + wobble + trend) });
  }
  return out;
}

const POINTS: Record<RangeId, number> = { "7d": 7, "30d": 30, "90d": 26, "12m": 12 };

export function metricsFor(range: RangeId): AnalyticsMetric[] {
  const n = POINTS[range];
  const scale = range === "7d" ? 0.25 : range === "30d" ? 1 : range === "90d" ? 2.6 : 9.4;
  return [
    {
      id: "plays",
      label: "Quiz plays",
      value: Math.round(21_400 * scale),
      format: "number",
      deltaPercent: 12.4,
      series: series(11, n, 480, 320),
    },
    {
      id: "completion",
      label: "Completion rate",
      value: 0.74,
      format: "percent",
      deltaPercent: 3.1,
      series: series(23, n, 68, 14),
    },
    {
      id: "score",
      label: "Average score",
      value: 0.66,
      format: "percent",
      deltaPercent: -1.8,
      series: series(37, n, 62, 11),
    },
    {
      id: "views",
      label: "Article views",
      value: Math.round(38_900 * scale),
      format: "number",
      deltaPercent: 8.7,
      series: series(53, n, 820, 410),
    },
    {
      id: "bookmarks",
      label: "Bookmarks",
      value: Math.round(2_740 * scale),
      format: "number",
      deltaPercent: 15.2,
      series: series(71, n, 62, 44),
    },
    {
      id: "followers",
      label: "New followers",
      value: Math.round(1_180 * scale),
      format: "number",
      deltaPercent: 6.9,
      series: series(97, n, 28, 22),
    },
  ];
}

export type TopContentRow = {
  id: string;
  title: string;
  type: "Quiz" | "Article";
  plays: number;
  completion: number;
  score: number;
  trend: number;
};

export const TOP_CONTENT: TopContentRow[] = [
  {
    id: "confusing-flags",
    title: "Flags That Fool Everyone",
    type: "Quiz",
    plays: 26_130,
    completion: 0.64,
    score: 0.58,
    trend: 18.2,
  },
  {
    id: "rivers-of-the-world",
    title: "Rivers of the World",
    type: "Quiz",
    plays: 18_420,
    completion: 0.78,
    score: 0.71,
    trend: 9.4,
  },
  {
    id: "how-long-is-a-coastline",
    title: "How Long Is a Coastline?",
    type: "Article",
    plays: 48_210,
    completion: 0.81,
    score: 0,
    trend: 22.6,
  },
  {
    id: "monsoon-machine",
    title: "The Monsoon Machine",
    type: "Article",
    plays: 31_875,
    completion: 0.69,
    score: 0,
    trend: -4.1,
  },
  {
    id: "borderlands",
    title: "Borderlands",
    type: "Quiz",
    plays: 9_240,
    completion: 0.52,
    score: 0.49,
    trend: -12.7,
  },
];

export const GROWTH_NOTES: { id: string; label: string; detail: string; delta: number }[] = [
  {
    id: "g1",
    label: "Flags quiz picked up by Community",
    detail: "3,410 plays from a single shared post",
    delta: 34.1,
  },
  {
    id: "g2",
    label: "Coastline article featured in GEOlibrary",
    detail: "Editorial shelf placement for 9 days",
    delta: 21.8,
  },
  {
    id: "g3",
    label: "Bookmark rate above category average",
    detail: "7.1% vs 4.4% for physical geography",
    delta: 12.3,
  },
  {
    id: "g4",
    label: "Monsoon article traffic cooling",
    detail: "Seasonal interest tapering after onset",
    delta: -4.1,
  },
];

/** Channel split for the donut chart. */
export const TRAFFIC_SOURCES: SeriesPoint[] = [
  { label: "Let's Play", value: 42 },
  { label: "GEOlibrary", value: 27 },
  { label: "Community", value: 19 },
  { label: "Direct", value: 12 },
];
