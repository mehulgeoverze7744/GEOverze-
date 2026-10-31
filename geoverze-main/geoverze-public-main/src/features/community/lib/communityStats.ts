import { MEMBERS } from "../data/members";
import { POSTS } from "../data/posts";

/** Live counts from the current community dataset — never invented. */
export function getCommunityStats() {
  const countries = new Set(MEMBERS.map((member) => member.country)).size;

  return {
    explorers: MEMBERS.length,
    discussions: POSTS.length,
    countries,
  } as const;
}
