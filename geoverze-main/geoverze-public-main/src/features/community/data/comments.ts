/**
 * Nested comment threads keyed by post id. Placeholder discussion content.
 */

export type Comment = {
  id: string;
  author: string;
  createdAt: string;
  body: string;
  likes: number;
  /** Emoji reaction tallies. */
  reactions: Readonly<Record<string, number>>;
  replies: readonly Comment[];
};

export const REACTION_EMOJI = ["👍", "🌍", "🔥", "🤯", "👏"] as const;

export const COMMENTS: Readonly<Record<string, readonly Comment[]>> = {
  "p-2": [
    {
      id: "c-1",
      author: "hannawinter",
      createdAt: "2026-08-06T04:22:00Z",
      body: "It depends entirely on whether you count Russia as European. Exclude it and Germany and France lead the table.",
      likes: 64,
      reactions: { "👍": 22, "🌍": 9 },
      replies: [
        {
          id: "c-1-1",
          author: "jonasberg",
          createdAt: "2026-08-06T04:31:00Z",
          body: "@hannawinter that's the crux of it. Most quiz sets seem to include it.",
          likes: 18,
          reactions: { "👍": 6 },
          replies: [
            {
              id: "c-1-1-1",
              author: "hannawinter",
              createdAt: "2026-08-06T04:40:00Z",
              body: "Ours does, but we flag the caveat in the review screen.",
              likes: 11,
              reactions: {},
              replies: [],
            },
          ],
        },
        {
          id: "c-1-2",
          author: "tomasnovak",
          createdAt: "2026-08-06T05:02:00Z",
          body: "Also worth remembering enclaves — they quietly change the count.",
          likes: 9,
          reactions: { "🤯": 4 },
          replies: [],
        },
      ],
    },
    {
      id: "c-2",
      author: "meiling",
      createdAt: "2026-08-06T05:12:00Z",
      body: "I keep a note of the three common answers depending on definition. Saves a lot of arguing.",
      likes: 27,
      reactions: { "👏": 8 },
      replies: [],
    },
  ],
  "p-4": [
    {
      id: "c-3",
      author: "priyanair",
      createdAt: "2026-08-05T21:58:00Z",
      body: "Rivers, comfortably. Flags are memorisation, rivers are memorisation plus geometry.",
      likes: 82,
      reactions: { "🔥": 19, "👍": 30 },
      replies: [
        {
          id: "c-3-1",
          author: "sofiarossi",
          createdAt: "2026-08-05T22:10:00Z",
          body: "This is exactly the argument I lost on Sunday.",
          likes: 21,
          reactions: { "👏": 7 },
          replies: [],
        },
      ],
    },
    {
      id: "c-4",
      author: "noahclarke",
      createdAt: "2026-08-06T01:44:00Z",
      body: "Borders for me. The moment a set includes historical borders it becomes a different sport.",
      likes: 44,
      reactions: { "🌍": 12 },
      replies: [],
    },
  ],
  "p-11": [
    {
      id: "c-5",
      author: "amaraokoye",
      createdAt: "2026-08-04T09:40:00Z",
      body: "Vistula → Gdańsk, Oder → Szczecin. Alphabetical order matches west-to-east if you say Oder first.",
      likes: 53,
      reactions: { "🤯": 15, "👍": 20 },
      replies: [
        {
          id: "c-5-1",
          author: "tomasnovak",
          createdAt: "2026-08-04T09:52:00Z",
          body: "That is annoyingly elegant. Thank you.",
          likes: 14,
          reactions: { "👏": 5 },
          replies: [],
        },
      ],
    },
  ],
};

export function commentsForPost(postId: string): readonly Comment[] {
  return COMMENTS[postId] ?? [];
}

export function countComments(list: readonly Comment[]): number {
  return list.reduce((n, c) => n + 1 + countComments(c.replies), 0);
}
