/**
 * Community posts.
 *
 * A discriminated union so one card component can render every post type. All
 * content is illustrative placeholder data — no backend exists yet.
 */

export type PostKind =
  "text" | "image" | "quizResult" | "achievement" | "question" | "poll" | "creatorUpdate";

export type PollOption = { id: string; label: string; votes: number };

type PostBase = {
  id: string;
  /** Author handle — resolve through `memberByHandle`. */
  author: string;
  /** ISO timestamp. */
  createdAt: string;
  body: string;
  topics: readonly string[];
  likes: number;
  comments: number;
  shares: number;
};

export type Post = PostBase &
  (
    | { kind: "text" }
    | { kind: "image"; images: readonly string[]; caption?: string }
    | {
        kind: "quizResult";
        quiz: string;
        score: number;
        total: number;
        accuracy: number;
        xp: number;
        durationSeconds: number;
      }
    | { kind: "achievement"; achievement: string; achievementNote: string; rarity: string }
    | { kind: "question"; question: string; answered: boolean }
    | { kind: "poll"; question: string; options: readonly PollOption[]; closesIn: string }
    | { kind: "creatorUpdate"; title: string; readMinutes: number; series: string }
  );

export const POST_KIND_LABEL: Record<PostKind, string> = {
  text: "Post",
  image: "Photo",
  quizResult: "Quiz result",
  achievement: "Achievement",
  question: "Question",
  poll: "Poll",
  creatorUpdate: "Creator update",
};

export const POSTS: readonly Post[] = [
  {
    id: "p-1",
    kind: "quizResult",
    author: "priyanair",
    createdAt: "2026-08-06T05:40:00Z",
    body: "Capital Sprint is brutal at 10 seconds per question. Finally cracked it.",
    topics: ["capitals", "sprint"],
    likes: 214,
    comments: 18,
    shares: 6,
    quiz: "Capital Sprint — Asia",
    score: 24,
    total: 25,
    accuracy: 96,
    xp: 480,
    durationSeconds: 214,
  },
  {
    id: "p-2",
    kind: "question",
    author: "jonasberg",
    createdAt: "2026-08-06T04:05:00Z",
    body: "Genuinely confused by this one — every source I read says something different.",
    topics: ["borders", "europe"],
    likes: 88,
    comments: 34,
    shares: 2,
    question: "Which European country has the most land neighbours, and does Russia count?",
    answered: false,
  },
  {
    id: "p-3",
    kind: "image",
    author: "yukitanaka",
    createdAt: "2026-08-06T02:12:00Z",
    body: "Shot the Sakurajima plume from across the bay this morning. Geography in real time.",
    topics: ["volcanoes", "japan"],
    likes: 632,
    comments: 41,
    shares: 27,
    images: ["sakurajima-plume", "kagoshima-bay", "ash-fall-street"],
    caption: "Kagoshima, southern Kyushu",
  },
  {
    id: "p-4",
    kind: "poll",
    author: "sofiarossi",
    createdAt: "2026-08-05T21:30:00Z",
    body: "Settling a long argument with my study group.",
    topics: ["quizzes", "community"],
    likes: 156,
    comments: 63,
    shares: 4,
    question: "Hardest quiz category in GEOverze?",
    options: [
      { id: "flags", label: "Flags", votes: 412 },
      { id: "capitals", label: "Capitals", votes: 288 },
      { id: "rivers", label: "Rivers & lakes", votes: 631 },
      { id: "borders", label: "Borders", votes: 507 },
    ],
    closesIn: "2 days",
  },
  {
    id: "p-5",
    kind: "achievement",
    author: "lucasferreira",
    createdAt: "2026-08-05T18:44:00Z",
    body: "Eighty-eight consecutive days. The streak is now a personality trait.",
    topics: ["streaks", "progression"],
    likes: 901,
    comments: 72,
    shares: 45,
    achievement: "Century Streak",
    achievementNote: "88 days and counting — 12 days from the century badge.",
    rarity: "Rare · 0.8% of explorers",
  },
  {
    id: "p-6",
    kind: "creatorUpdate",
    author: "hannawinter",
    createdAt: "2026-08-05T15:02:00Z",
    body: "New piece is live: how the Oder–Neisse line was drawn, and why the maps disagreed for a decade.",
    topics: ["cartography", "history", "europe"],
    likes: 478,
    comments: 39,
    shares: 61,
    title: "The lines that moved: drawing the Oder–Neisse",
    readMinutes: 11,
    series: "Border Stories",
  },
  {
    id: "p-7",
    kind: "text",
    author: "meiling",
    createdAt: "2026-08-05T11:20:00Z",
    body: "Underrated study trick: learn capitals by river basin instead of alphabetically. My accuracy jumped nine points in a fortnight.",
    topics: ["study", "capitals", "rivers"],
    likes: 342,
    comments: 28,
    shares: 19,
  },
  {
    id: "p-8",
    kind: "quizResult",
    author: "noahclarke",
    createdAt: "2026-08-05T08:15:00Z",
    body: "Oceania round, no mistakes. Was only a matter of time.",
    topics: ["oceania", "quizzes"],
    likes: 187,
    comments: 12,
    shares: 3,
    quiz: "Oceania — Islands & Atolls",
    score: 20,
    total: 20,
    accuracy: 100,
    xp: 520,
    durationSeconds: 341,
  },
  {
    id: "p-9",
    kind: "text",
    author: "kwamemensah",
    createdAt: "2026-08-04T19:48:00Z",
    body: "Two weeks in and I can finally place every West African capital without hesitating. Small win, big feeling.",
    topics: ["africa", "milestones"],
    likes: 264,
    comments: 31,
    shares: 5,
  },
  {
    id: "p-10",
    kind: "image",
    author: "ainaraiz",
    createdAt: "2026-08-04T14:26:00Z",
    body: "Weekend field trip: the Ebro delta from the observation tower. Textbook sediment fan.",
    topics: ["spain", "rivers", "fieldwork"],
    likes: 398,
    comments: 22,
    shares: 14,
    images: ["ebro-delta", "delta-tower"],
    caption: "Ebro delta, Catalonia",
  },
  {
    id: "p-11",
    kind: "question",
    author: "tomasnovak",
    createdAt: "2026-08-04T09:11:00Z",
    body: "Looking for a decent mnemonic — I keep swapping the two.",
    topics: ["rivers", "europe"],
    likes: 71,
    comments: 25,
    shares: 1,
    question: "How do you remember which of the Vistula and the Oder drains into which bay?",
    answered: true,
  },
  {
    id: "p-12",
    kind: "achievement",
    author: "amaraokoye",
    createdAt: "2026-08-03T20:03:00Z",
    body: "Sahel Specialist unlocked after the toughest set I've played this year.",
    topics: ["africa", "achievements"],
    likes: 556,
    comments: 48,
    shares: 22,
    achievement: "Sahel Specialist",
    achievementNote: "Perfect score across all nine Sahel country sets.",
    rarity: "Epic · 0.3% of explorers",
  },
];

const BY_ID = new Map(POSTS.map((p) => [p.id, p]));

export function postById(id: string): Post | undefined {
  return BY_ID.get(id);
}

/** Trending discussions: question and poll posts with the most conversation. */
export const TRENDING_POSTS: readonly Post[] = [...POSTS]
  .filter((p) => p.kind === "question" || p.kind === "poll")
  .sort((a, b) => b.comments - a.comments)
  .slice(0, 4);

export const RECENT_POSTS: readonly Post[] = [...POSTS].sort((a, b) =>
  a.createdAt < b.createdAt ? 1 : -1,
);
