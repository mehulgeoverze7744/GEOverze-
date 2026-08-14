/** Client-side community search across members, posts, topics and challenges. */
import { MEMBERS, type Member } from "../data/members";
import { POSTS, type Post } from "../data/posts";
import { TOPICS, type Topic } from "../data/topics";
import { COMMUNITY_CHALLENGES, type CommunityChallenge } from "../data/challenges";

export type SearchScope = "all" | "people" | "creators" | "posts" | "topics" | "challenges";

export const SEARCH_SCOPES: readonly { id: SearchScope; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "people", label: "People" },
  { id: "creators", label: "Creators" },
  { id: "posts", label: "Posts" },
  { id: "topics", label: "Topics" },
  { id: "challenges", label: "Challenges" },
];

export type SearchResults = {
  people: readonly Member[];
  creators: readonly Member[];
  posts: readonly Post[];
  topics: readonly Topic[];
  challenges: readonly CommunityChallenge[];
  total: number;
};

const has = (haystack: string, needle: string) => haystack.toLowerCase().includes(needle);

export function searchCommunity(query: string, scope: SearchScope): SearchResults {
  const q = query.trim().toLowerCase();
  const wants = (s: SearchScope) => scope === "all" || scope === s;

  if (q.length === 0) {
    return { people: [], creators: [], posts: [], topics: [], challenges: [], total: 0 };
  }

  const people = wants("people")
    ? MEMBERS.filter(
        (m) => has(m.name, q) || has(m.handle, q) || has(m.country, q) || has(m.bio, q),
      )
    : [];
  const creators = wants("creators")
    ? MEMBERS.filter(
        (m) => m.tier === "creator" && (has(m.name, q) || has(m.handle, q) || has(m.bio, q)),
      )
    : [];
  const posts = wants("posts")
    ? POSTS.filter(
        (p) =>
          has(p.body, q) ||
          p.topics.some((t) => has(t, q)) ||
          (p.kind === "question" && has(p.question, q)) ||
          (p.kind === "poll" && has(p.question, q)) ||
          (p.kind === "creatorUpdate" && has(p.title, q)) ||
          (p.kind === "achievement" && has(p.achievement, q)) ||
          (p.kind === "quizResult" && has(p.quiz, q)),
      )
    : [];
  const topics = wants("topics")
    ? TOPICS.filter((t) => has(t.label, q) || has(t.slug, q) || has(t.blurb, q))
    : [];
  const challenges = wants("challenges")
    ? COMMUNITY_CHALLENGES.filter((c) => has(c.name, q) || has(c.blurb, q) || has(c.category, q))
    : [];

  return {
    people,
    creators,
    posts,
    topics,
    challenges,
    total: people.length + creators.length + posts.length + topics.length + challenges.length,
  };
}

export function filterFeed(kind: string): readonly Post[] {
  if (kind === "all") return POSTS;
  return POSTS.filter((p) => p.kind === kind);
}

export const FEED_FILTERS = [
  { id: "all", label: "All" },
  { id: "text", label: "Posts" },
  { id: "image", label: "Photos" },
  { id: "question", label: "Questions" },
  { id: "poll", label: "Polls" },
  { id: "quizResult", label: "Results" },
  { id: "achievement", label: "Achievements" },
  { id: "creatorUpdate", label: "Creators" },
] as const;

export type FeedFilterId = (typeof FEED_FILTERS)[number]["id"];
